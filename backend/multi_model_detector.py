import pandas as pd
import numpy as np
import joblib

from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"
MODEL_DIR = BASE_DIR / "models"

DATA_FILE = DATA_DIR / "aws_anomaly_data.csv"

MODEL_FILE = MODEL_DIR / "skyguard_isolation_forest.pkl"
SCALER_FILE = MODEL_DIR / "skyguard_scaler.pkl"

OUTPUT_FILE = DATA_DIR / "multimodel_results.csv"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SKYGUARD AI - MULTI-MODEL ANOMALY ENGINE")
print("=" * 70)

df = pd.read_csv(DATA_FILE)

df["timestamp"] = pd.to_datetime(df["timestamp"])

df = df.sort_values(
    ["station_id", "timestamp"]
).reset_index(drop=True)

print(f"\nRecords loaded: {len(df)}")


# ============================================================
# BASIC CLEANING
# ============================================================

# Keep original values for auditability
df["original_temperature"] = df["temperature"]
df["original_pressure"] = df["pressure"]
df["original_humidity"] = df["humidity"]


# ============================================================
# 1. STATISTICAL DETECTION
# ============================================================

print("\n[1/5] Statistical anomaly detection...")

for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    mean = df[column].mean()
    std = df[column].std()

    if std == 0:
        df[f"{column}_zscore"] = 0
    else:
        df[f"{column}_zscore"] = (
            (df[column] - mean) / std
        )

df["statistical_anomaly"] = (
    (
        df["temperature_zscore"].abs() > 3
    )
    |
    (
        df["pressure_zscore"].abs() > 3
    )
    |
    (
        df["humidity_zscore"].abs() > 3
    )
).astype(int)


# ============================================================
# 2. RATE-OF-CHANGE DETECTION
# ============================================================

print("[2/5] Rate-of-change detection...")

for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    df[f"{column}_change"] = (
        df.groupby("station_id")[column]
        .diff()
    )

# Thresholds for sudden changes
temperature_change_limit = 8
pressure_change_limit = 15
humidity_change_limit = 20

df["rate_change_anomaly"] = (
    (
        df["temperature_change"].abs()
        > temperature_change_limit
    )
    |
    (
        df["pressure_change"].abs()
        > pressure_change_limit
    )
    |
    (
        df["humidity_change"].abs()
        > humidity_change_limit
    )
).astype(int)


# ============================================================
# 3. FROZEN SENSOR DETECTION
# ============================================================

print("[3/5] Frozen sensor detection...")

# Difference between consecutive values
for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    df[f"{column}_diff"] = (
        df.groupby("station_id")[column]
        .diff()
    )

# Count consecutive identical values
for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    same_value = (
        df[f"{column}_diff"].abs() < 0.001
    )

    groups = (
        same_value
        != same_value.groupby(
            df["station_id"]
        ).shift()
    ).cumsum()

    df[f"{column}_frozen_count"] = (
        same_value
        .groupby(
            [df["station_id"], groups]
        )
        .transform("sum")
    )

df["frozen_sensor_anomaly"] = (
    (
        df["temperature_frozen_count"] >= 10
    )
    |
    (
        df["pressure_frozen_count"] >= 10
    )
    |
    (
        df["humidity_frozen_count"] >= 10
    )
).astype(int)


# ============================================================
# 4. DRIFT DETECTION
# ============================================================

print("[4/5] Sensor drift detection...")

for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    rolling_mean = (
        df.groupby("station_id")[column]
        .transform(
            lambda x:
            x.rolling(
                window=30,
                min_periods=10
            ).mean()
        )
    )

    baseline = (
        df.groupby("station_id")[column]
        .transform(
            lambda x:
            x.rolling(
                window=120,
                min_periods=30
            ).mean()
        )
    )

    df[f"{column}_drift"] = (
        rolling_mean - baseline
    ).abs()

# Drift thresholds
df["drift_anomaly"] = (
    (
        df["temperature_drift"] > 2
    )
    |
    (
        df["pressure_drift"] > 3
    )
    |
    (
        df["humidity_drift"] > 8
    )
).astype(int)


# ============================================================
# 5. ISOLATION FOREST
# ============================================================

print("[5/5] Isolation Forest detection...")

model = joblib.load(MODEL_FILE)

scaler_data = joblib.load(SCALER_FILE)

scaler = scaler_data["scaler"]

features = scaler_data["features"]


# Create missing rolling features required by model
for column in [
    "temperature",
    "pressure",
    "humidity"
]:

    df[f"{column}_rolling_mean"] = (
        df.groupby("station_id")[column]
        .transform(
            lambda x:
            x.rolling(
                10,
                min_periods=1
            ).mean()
        )
    )

    df[f"{column}_rolling_std"] = (
        df.groupby("station_id")[column]
        .transform(
            lambda x:
            x.rolling(
                10,
                min_periods=1
            ).std()
        )
    )


# Fill missing values
df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

df = df.fillna(0)

X = df[features]

X_scaled = scaler.transform(X)

isolation_prediction = model.predict(X_scaled)

df["isolation_anomaly"] = np.where(
    isolation_prediction == -1,
    1,
    0
)


# ============================================================
# EVIDENCE AGGREGATION
# ============================================================

print("\nCombining detector evidence...")

df["evidence_score"] = (
    df["statistical_anomaly"]
    + df["rate_change_anomaly"]
    + df["frozen_sensor_anomaly"]
    + df["drift_anomaly"]
    + df["isolation_anomaly"]
)


# Maximum evidence = 5
df["anomaly_confidence"] = (
    df["evidence_score"] / 5 * 100
)


# Final decision
df["final_anomaly"] = (
    df["evidence_score"] >= 2
).astype(int)


# ============================================================
# ROOT CAUSE
# ============================================================

def determine_root_cause(row):

    if row["frozen_sensor_anomaly"] == 1:
        return "Frozen Sensor"

    if row["drift_anomaly"] == 1:
        return "Sensor Drift"

    if row["rate_change_anomaly"] == 1:
        return "Sudden Sensor Change"

    if row["statistical_anomaly"] == 1:
        return "Statistical Outlier"

    if row["isolation_anomaly"] == 1:
        return "Multivariate Anomaly"

    return "Normal"


df["detected_root_cause"] = df.apply(
    determine_root_cause,
    axis=1
)


# ============================================================
# SEVERITY
# ============================================================

def determine_severity(score):

    if score >= 4:
        return "Critical"

    if score == 3:
        return "High"

    if score == 2:
        return "Medium"

    if score == 1:
        return "Low"

    return "Normal"


df["severity"] = df[
    "evidence_score"
].apply(determine_severity)


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
print("MULTI-MODEL DETECTION COMPLETE")
print("=" * 70)

print(
    f"\nDetected anomalies: "
    f"{df['final_anomaly'].sum()}"
)

print(
    f"Normal observations: "
    f"{(df['final_anomaly'] == 0).sum()}"
)

print("\nRoot causes detected:")

print(
    df[
        df["final_anomaly"] == 1
    ]["detected_root_cause"]
    .value_counts()
)

print("\nSeverity distribution:")

print(
    df["severity"].value_counts()
)

print("\nAverage anomaly confidence:")

print(
    f"{df.loc[df['final_anomaly'] == 1, 'anomaly_confidence'].mean():.2f}%"
)

print("\nResults saved to:")

print(OUTPUT_FILE)