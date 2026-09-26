import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATA_DIR / "event_vs_sensor_results.csv"

OUTPUT_FILE = DATA_DIR / "explainable_alerts.csv"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SKYGUARD AI - EXPLAINABLE ROOT CAUSE ENGINE")
print("=" * 70)

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"]
)

print(f"\nRecords loaded: {len(df)}")


# ============================================================
# DETECTOR EXPLANATION
# ============================================================

def get_triggered_detectors(row):

    detectors = []

    if row["statistical_anomaly"] == 1:
        detectors.append("Statistical Outlier")

    if row["rate_change_anomaly"] == 1:
        detectors.append("Rate-of-Change")

    if row["frozen_sensor_anomaly"] == 1:
        detectors.append("Frozen Sensor")

    if row["drift_anomaly"] == 1:
        detectors.append("Sensor Drift")

    if row["isolation_anomaly"] == 1:
        detectors.append("Isolation Forest")

    if not detectors:
        detectors.append("None")

    return " + ".join(detectors)


df["triggered_detectors"] = df.apply(
    get_triggered_detectors,
    axis=1
)


# ============================================================
# DETERMINE PRIMARY VARIABLE
# ============================================================

def determine_variable(row):

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
    determine_variable,
    axis=1
)


# ============================================================
# CREATE EXPLANATION
# ============================================================

def create_explanation(row):

    classification = row[
        "event_classification"
    ]

    if classification == "Normal":

        return "No significant anomaly detected."

    variable = row["primary_variable"]

    if variable == "Temperature":

        current = row["temperature"]

        reference = row[
            "temperature_other_station_median"
        ]

    elif variable == "Pressure":

        current = row["pressure"]

        reference = row[
            "pressure_other_station_median"
        ]

    else:

        current = row["humidity"]

        reference = row[
            "humidity_other_station_median"
        ]

    difference = abs(
        current - reference
    )

    if classification == "Probable Sensor Fault":

        return (
            f"{variable} reading differs by "
            f"{difference:.2f} from the median of "
            f"other AWS stations. "
            f"Triggered detectors: "
            f"{row['triggered_detectors']}. "
            f"Likely cause: "
            f"{row['spatial_root_cause']}."
        )

    if classification == "Possible Weather Event":

        return (
            f"{variable} shows a network-wide pattern "
            f"across multiple AWS stations. "
            f"This suggests a possible weather event "
            f"rather than an isolated sensor failure."
        )

    return (
        f"{variable} anomaly requires further "
        f"investigation because spatial evidence "
        f"is insufficient."
    )


df["explanation"] = df.apply(
    create_explanation,
    axis=1
)


# ============================================================
# ALERT TITLE
# ============================================================

def create_alert_title(row):

    if row["event_classification"] == "Normal":
        return "Normal"

    return (
        f"{row['event_classification']} - "
        f"{row['station_id']}"
    )


df["alert_title"] = df.apply(
    create_alert_title,
    axis=1
)


# ============================================================
# SELECT ALERT COLUMNS
# ============================================================

alert_columns = [
    "timestamp",
    "station_id",

    "temperature",
    "pressure",
    "humidity",

    "event_classification",
    "spatial_root_cause",

    "primary_variable",

    "anomaly_confidence",
    "event_confidence",

    "severity",

    "triggered_detectors",

    "network_anomaly_count",

    "explanation"
]


alerts = df[
    df["event_classification"] != "Normal"
][alert_columns]


# ============================================================
# SAVE
# ============================================================

alerts.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 70)
print("EXPLAINABLE ALERT ENGINE COMPLETE")
print("=" * 70)

print(
    f"\nTotal alerts generated: "
    f"{len(alerts)}"
)

print("\nAlert categories:")

print(
    alerts[
        "event_classification"
    ].value_counts()
)


print("\nExample alerts:\n")

print(
    alerts[
        [
            "timestamp",
            "station_id",
            "event_classification",
            "spatial_root_cause",
            "primary_variable",
            "event_confidence"
        ]
    ]
    .head(10)
    .to_string(index=False)
)


print("\nExplainable alerts saved to:")

print(OUTPUT_FILE)