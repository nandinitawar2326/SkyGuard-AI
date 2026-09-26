import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATA_DIR / "multimodel_results.csv"

OUTPUT_FILE = DATA_DIR / "sensor_health_results.csv"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SKYGUARD AI - SENSOR HEALTH & PREDICTIVE MAINTENANCE")
print("=" * 70)

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"]
)

print(f"\nRecords loaded: {len(df)}")


# ============================================================
# SENSOR-LEVEL STATISTICS
# ============================================================

print("\nCalculating sensor health indicators...")


sensor_stats = (
    df.groupby("station_id")
    .agg(
        total_readings=("station_id", "size"),

        anomalies=(
            "final_anomaly",
            "sum"
        ),

        statistical_anomalies=(
            "statistical_anomaly",
            "sum"
        ),

        rate_change_anomalies=(
            "rate_change_anomaly",
            "sum"
        ),

        frozen_anomalies=(
            "frozen_sensor_anomaly",
            "sum"
        ),

        drift_anomalies=(
            "drift_anomaly",
            "sum"
        ),

        isolation_anomalies=(
            "isolation_anomaly",
            "sum"
        )
    )
    .reset_index()
)


# ============================================================
# ANOMALY RATE
# ============================================================

sensor_stats["anomaly_rate"] = (
    sensor_stats["anomalies"]
    /
    sensor_stats["total_readings"]
    * 100
)


# ============================================================
# HEALTH PENALTIES
# ============================================================

# Each indicator contributes to a health penalty.
#
# Higher anomaly frequency = lower sensor health.

sensor_stats["anomaly_penalty"] = (
    sensor_stats["anomaly_rate"] * 2
)


sensor_stats["drift_penalty"] = (
    sensor_stats["drift_anomalies"]
    /
    sensor_stats["total_readings"]
    * 100
    * 1.5
)


sensor_stats["frozen_penalty"] = (
    sensor_stats["frozen_anomalies"]
    /
    sensor_stats["total_readings"]
    * 100
    * 2
)


sensor_stats["rate_change_penalty"] = (
    sensor_stats["rate_change_anomalies"]
    /
    sensor_stats["total_readings"]
    * 100
    * 1.5
)


sensor_stats["statistical_penalty"] = (
    sensor_stats["statistical_anomalies"]
    /
    sensor_stats["total_readings"]
    * 100
)


# ============================================================
# HEALTH SCORE
# ============================================================

sensor_stats["health_score"] = (
    100
    - sensor_stats["anomaly_penalty"]
    - sensor_stats["drift_penalty"]
    - sensor_stats["frozen_penalty"]
    - sensor_stats["rate_change_penalty"]
    - sensor_stats["statistical_penalty"]
)


# Keep score between 0 and 100

sensor_stats["health_score"] = (
    sensor_stats["health_score"]
    .clip(0, 100)
    .round(2)
)


# ============================================================
# HEALTH STATUS
# ============================================================

def health_status(score):

    if score >= 90:
        return "Healthy"

    if score >= 75:
        return "Watch"

    if score >= 50:
        return "Plan Maintenance"

    return "Urgent"


sensor_stats["health_status"] = (
    sensor_stats["health_score"]
    .apply(health_status)
)


# ============================================================
# ESTIMATE DAYS TO MAINTENANCE
# ============================================================

print("\nEstimating maintenance timeline...")


def estimate_days(score, anomaly_rate):

    # Healthy sensors
    if score >= 90:
        return 90

    # Avoid division by zero
    if anomaly_rate <= 0:
        return 90

    # Prototype degradation estimate
    days = (
        (score - 40)
        /
        max(anomaly_rate * 2, 0.5)
    )

    return int(
        np.clip(
            days,
            3,
            90
        )
    )


sensor_stats["estimated_days_to_maintenance"] = (
    sensor_stats.apply(
        lambda row:
        estimate_days(
            row["health_score"],
            row["anomaly_rate"]
        ),
        axis=1
    )
)


# ============================================================
# MAINTENANCE PRIORITY
# ============================================================

def maintenance_priority(row):

    score = row["health_score"]

    if score < 50:
        return "URGENT"

    if score < 75:
        return "HIGH"

    if score < 90:
        return "MEDIUM"

    return "LOW"


sensor_stats["maintenance_priority"] = (
    sensor_stats.apply(
        maintenance_priority,
        axis=1
    )
)


# ============================================================
# RECOMMENDED ACTION
# ============================================================

def recommended_action(row):

    if row["health_status"] == "Healthy":

        return (
            "Continue normal monitoring"
        )

    if row["frozen_anomalies"] > 0:

        return (
            "Inspect sensor for frozen readings"
        )

    if row["drift_anomalies"] > 0:

        return (
            "Calibrate sensor and inspect drift"
        )

    if row["rate_change_anomalies"] > 0:

        return (
            "Inspect sensor for sudden fluctuations"
        )

    if row["statistical_anomalies"] > 0:

        return (
            "Inspect sensor measurement accuracy"
        )

    return (
        "Schedule preventive inspection"
    )


sensor_stats["recommended_action"] = (
    sensor_stats.apply(
        recommended_action,
        axis=1
    )
)


# ============================================================
# SORT BY PRIORITY
# ============================================================

sensor_stats = sensor_stats.sort_values(
    "health_score"
)


# ============================================================
# SAVE
# ============================================================

sensor_stats.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 70)
print("SENSOR HEALTH ANALYSIS COMPLETE")
print("=" * 70)

print("\nSensor Health Summary:\n")

print(
    sensor_stats[
        [
            "station_id",
            "health_score",
            "health_status",
            "anomaly_rate",
            "estimated_days_to_maintenance",
            "maintenance_priority"
        ]
    ].to_string(index=False)
)


print("\nHealth status distribution:\n")

print(
    sensor_stats[
        "health_status"
    ].value_counts()
)


print("\nMaintenance recommendations:\n")

print(
    sensor_stats[
        [
            "station_id",
            "maintenance_priority",
            "recommended_action"
        ]
    ].to_string(index=False)
)


print("\nResults saved to:")

print(OUTPUT_FILE)