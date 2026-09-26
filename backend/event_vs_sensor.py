import pandas as pd
import numpy as np

from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATA_DIR / "multimodel_results.csv"

OUTPUT_FILE = DATA_DIR / "event_vs_sensor_results.csv"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SKYGUARD AI - WEATHER EVENT VS SENSOR FAULT")
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
# NETWORK MEDIAN
# ============================================================

print("\nComparing each station with the other AWS stations...")


def calculate_other_station_median(group, column):

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
        f"{column}_other_station_median"
    ] = (
        df.groupby("timestamp", group_keys=False)
        .apply(
            lambda group:
            calculate_other_station_median(
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
# DIFFERENCE FROM OTHER STATIONS
# ============================================================

df["temperature_spatial_difference"] = (
    df["temperature"]
    -
    df["temperature_other_station_median"]
).abs()

df["pressure_spatial_difference"] = (
    df["pressure"]
    -
    df["pressure_other_station_median"]
).abs()

df["humidity_spatial_difference"] = (
    df["humidity"]
    -
    df["humidity_other_station_median"]
).abs()


# ============================================================
# SPATIAL OUTLIER RULES
# ============================================================

df["temperature_spatial_outlier"] = (
    df["temperature_spatial_difference"] > 3
).astype(int)

df["pressure_spatial_outlier"] = (
    df["pressure_spatial_difference"] > 5
).astype(int)

df["humidity_spatial_outlier"] = (
    df["humidity_spatial_difference"] > 12
).astype(int)


# ============================================================
# NETWORK ABNORMALITY
# ============================================================

# Number of stations that are already flagged
# as anomalies at the same timestamp.

anomaly_count = (
    df.groupby("timestamp")["final_anomaly"]
    .transform("sum")
)

df["network_anomaly_count"] = anomaly_count


# ============================================================
# CLASSIFICATION
# ============================================================

def classify_event(row):

    # Not anomalous
    if row["final_anomaly"] == 0:
        return "Normal"

    spatial_outlier = (
        row["temperature_spatial_outlier"]
        +
        row["pressure_spatial_outlier"]
        +
        row["humidity_spatial_outlier"]
    )

    # --------------------------------------------------------
    # SENSOR FAULT
    # --------------------------------------------------------
    # Station differs significantly from other stations
    # and other stations are mostly normal.

    if (
        spatial_outlier >= 1
        and row["network_anomaly_count"] <= 2
    ):
        return "Probable Sensor Fault"

    # --------------------------------------------------------
    # WEATHER EVENT
    # --------------------------------------------------------
    # Multiple stations show anomalies together.

    if row["network_anomaly_count"] >= 3:
        return "Possible Weather Event"

    # --------------------------------------------------------
    # UNCERTAIN
    # --------------------------------------------------------

    return "Needs Investigation"


df["event_classification"] = df.apply(
    classify_event,
    axis=1
)


# ============================================================
# CONFIDENCE
# ============================================================

def calculate_confidence(row):

    if row["event_classification"] == "Normal":
        return 0

    if row["event_classification"] == "Probable Sensor Fault":

        confidence = (
            70
            + row["anomaly_confidence"] * 0.25
        )

        return min(
            99,
            confidence
        )

    if row["event_classification"] == "Possible Weather Event":

        confidence = (
            60
            + row["anomaly_confidence"] * 0.25
        )

        return min(
            95,
            confidence
        )

    return 50


df["event_confidence"] = df.apply(
    calculate_confidence,
    axis=1
).round(2)


# ============================================================
# ROOT CAUSE
# ============================================================

def determine_root_cause(row):

    if row["event_classification"] == "Probable Sensor Fault":

        if row["frozen_sensor_anomaly"] == 1:
            return "Frozen Sensor"

        if row["drift_anomaly"] == 1:
            return "Sensor Drift"

        if row["rate_change_anomaly"] == 1:
            return "Sudden Sensor Change"

        return "Isolated Sensor Reading"

    if row["event_classification"] == "Possible Weather Event":
        return "Network-Wide Weather Pattern"

    if row["event_classification"] == "Needs Investigation":
        return "Insufficient Spatial Evidence"

    return "Normal"


df["spatial_root_cause"] = df.apply(
    determine_root_cause,
    axis=1
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
print("EVENT VS SENSOR ANALYSIS COMPLETE")
print("=" * 70)

print("\nClassification:")

print(
    df["event_classification"]
    .value_counts()
)


print("\nAverage confidence:")

non_normal = df[
    df["event_classification"] != "Normal"
]

if len(non_normal) > 0:

    print(
        f"{non_normal['event_confidence'].mean():.2f}%"
    )

else:

    print("No anomalies classified.")


print("\nRoot causes:")

print(
    df[
        df["event_classification"]
        != "Normal"
    ]["spatial_root_cause"]
    .value_counts()
)


print("\nResults saved to:")

print(OUTPUT_FILE)