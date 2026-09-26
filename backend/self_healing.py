import pandas as pd
import numpy as np

from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATA_DIR / "event_vs_sensor_results.csv"

OUTPUT_FILE = DATA_DIR / "self_healing_results.csv"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SKYGUARD AI - SELF-HEALING DATA ENGINE")
print("=" * 70)

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"]
)

df = df.sort_values(
    ["timestamp", "station_id"]
).reset_index(drop=True)

print(f"\nRecords loaded: {len(df)}")


# ============================================================
# PRESERVE ORIGINAL VALUES
# ============================================================

for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    df[
        f"{column}_raw"
    ] = df[column]


# ============================================================
# ESTIMATE VALUE FROM OTHER STATIONS
# ============================================================

print("\nEstimating corrected sensor values...")


def get_other_station_median(
    group,
    column
):

    values = group[column].values

    result = []

    for i in range(len(values)):

        other_values = np.delete(
            values,
            i
        )

        result.append(
            np.median(other_values)
        )

    return pd.Series(
        result,
        index=group.index
    )


for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    df[
        f"{column}_estimated"
    ] = (
        df.groupby(
            "timestamp",
            group_keys=False
        )
        .apply(
            lambda group:
            get_other_station_median(
                group,
                column
            )
        )
        .reset_index(
            level=0,
            drop=True
        )
    )

# ============================================================
# DETERMINE PRIMARY VARIABLE
# ============================================================

def determine_primary_variable(row):

    differences = {
        "Temperature": abs(
            row["temperature_spatial_difference"]
        ),
        "Pressure": abs(
            row["pressure_spatial_difference"]
        ),
        "Humidity": abs(
            row["humidity_spatial_difference"]
        )
    }

    return max(
        differences,
        key=differences.get
    )


df["primary_variable"] = df.apply(
    determine_primary_variable,
    axis=1
)


# ============================================================
# SELF-HEAL ONLY SENSOR FAULTS
# ============================================================

print("\nApplying AI corrections...")


for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    correction_mask = (
        df["event_classification"]
        == "Probable Sensor Fault"
    )

    df[
        f"{column}_corrected"
    ] = np.where(
        correction_mask,
        df[f"{column}_estimated"],
        df[f"{column}_raw"]
    )


# ============================================================
# CALCULATE CORRECTION MAGNITUDE
# ============================================================

for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    df[
        f"{column}_correction_difference"
    ] = (
        df[f"{column}_corrected"]
        -
        df[f"{column}_raw"]
    ).abs()


# ============================================================
# IMPUTATION STATUS
# ============================================================

df["data_status"] = np.where(
    df["event_classification"]
    == "Probable Sensor Fault",
    "AI-IMPUTED",
    "ORIGINAL"
)


# ============================================================
# OVERALL CORRECTED VALUES
# ============================================================

# Keep a single corrected value for each
# sensor record using the most affected variable.

def determine_corrected_value(row):

    if row["data_status"] == "ORIGINAL":

        return np.nan

    variable = row["primary_variable"]

    if variable == "Temperature":

        return row["temperature_corrected"]

    if variable == "Pressure":

        return row["pressure_corrected"]

    if variable == "Humidity":

        return row["humidity_corrected"]

    return np.nan


df["ai_corrected_value"] = df.apply(
    determine_corrected_value,
    axis=1
)


# ============================================================
# CORRECTION VARIABLE
# ============================================================

df["corrected_variable"] = np.where(
    df["data_status"] == "AI-IMPUTED",
    df["primary_variable"],
    "None"
)


# ============================================================
# SAVE
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 70)
print("SELF-HEALING COMPLETE")
print("=" * 70)

corrected_count = (
    df["data_status"]
    == "AI-IMPUTED"
).sum()

original_count = (
    df["data_status"]
    == "ORIGINAL"
).sum()

print(
    f"\nOriginal readings: "
    f"{original_count}"
)

print(
    f"AI-imputed readings: "
    f"{corrected_count}"
)

print("\nCorrected variables:")

print(
    df[
        df["data_status"] == "AI-IMPUTED"
    ]["corrected_variable"]
    .value_counts()
)


# ============================================================
# EXAMPLES
# ============================================================

print("\nExample corrections:\n")

examples = df[
    df["data_status"] == "AI-IMPUTED"
][
    [
        "timestamp",
        "station_id",
        "corrected_variable",
        "ai_corrected_value",
        "data_status"
    ]
].head(10)

print(
    examples.to_string(index=False)
)


print("\nSelf-healing dataset saved to:")

print(OUTPUT_FILE)