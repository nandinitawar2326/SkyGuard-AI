import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)

# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"
MODEL_DIR = BASE_DIR / "models"

DATA_FILE = DATA_DIR / "aws_anomaly_data.csv"
MODEL_FILE = MODEL_DIR / "skyguard_isolation_forest.pkl"
SCALER_FILE = MODEL_DIR / "skyguard_scaler.pkl"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SKYGUARD AI - MODEL EVALUATION")
print("=" * 70)

print("\nLoading anomaly dataset...")

df = pd.read_csv(DATA_FILE)

df["timestamp"] = pd.to_datetime(df["timestamp"])

df = df.sort_values(
    ["station_id", "timestamp"]
).reset_index(drop=True)

print(f"Total records: {len(df)}")


# ============================================================
# FEATURE ENGINEERING
# ============================================================

print("\nCreating features...")

df["temperature_change"] = (
    df.groupby("station_id")["temperature"].diff()
)

df["pressure_change"] = (
    df.groupby("station_id")["pressure"].diff()
)

df["humidity_change"] = (
    df.groupby("station_id")["humidity"].diff()
)


df["temperature_rolling_mean"] = (
    df.groupby("station_id")["temperature"]
    .transform(
        lambda x: x.rolling(10, min_periods=1).mean()
    )
)

df["pressure_rolling_mean"] = (
    df.groupby("station_id")["pressure"]
    .transform(
        lambda x: x.rolling(10, min_periods=1).mean()
    )
)

df["humidity_rolling_mean"] = (
    df.groupby("station_id")["humidity"]
    .transform(
        lambda x: x.rolling(10, min_periods=1).mean()
    )
)


df["temperature_rolling_std"] = (
    df.groupby("station_id")["temperature"]
    .transform(
        lambda x: x.rolling(10, min_periods=1).std()
    )
)

df["pressure_rolling_std"] = (
    df.groupby("station_id")["pressure"]
    .transform(
        lambda x: x.rolling(10, min_periods=1).std()
    )
)

df["humidity_rolling_std"] = (
    df.groupby("station_id")["humidity"]
    .transform(
        lambda x: x.rolling(10, min_periods=1).std()
    )
)


# Clean numerical values
df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

df = df.fillna(0)


# ============================================================
# FEATURES
# ============================================================

features = [
    "temperature",
    "pressure",
    "humidity",
    "temperature_change",
    "pressure_change",
    "humidity_change",
    "temperature_rolling_mean",
    "pressure_rolling_mean",
    "humidity_rolling_mean",
    "temperature_rolling_std",
    "pressure_rolling_std",
    "humidity_rolling_std"
]

X = df[features]


# ============================================================
# LOAD MODEL
# ============================================================

print("\nLoading trained model...")

model = joblib.load(MODEL_FILE)

scaler_data = joblib.load(SCALER_FILE)

scaler = scaler_data["scaler"]


# ============================================================
# PREDICTION
# ============================================================

print("\nRunning anomaly detection...")

X_scaled = scaler.transform(X)

predictions = model.predict(X_scaled)

# Isolation Forest:
#  1  = normal
# -1  = anomaly

df["predicted_anomaly"] = np.where(
    predictions == -1,
    1,
    0
)


# ============================================================
# EVALUATION
# ============================================================

actual = df["is_anomaly"]
predicted = df["predicted_anomaly"]


accuracy = accuracy_score(
    actual,
    predicted
)

print("\n" + "=" * 70)
print("RESULTS")
print("=" * 70)

print(f"\nAccuracy: {accuracy:.4f}")

print("\nClassification Report:")

print(
    classification_report(
        actual,
        predicted,
        target_names=[
            "Normal",
            "Anomaly"
        ],
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    actual,
    predicted
)

print("\nConfusion Matrix:")
print(cm)


# ============================================================
# ANOMALY TYPE ANALYSIS
# ============================================================

print("\n" + "=" * 70)
print("ANOMALY TYPE DETECTION")
print("=" * 70)

anomaly_df = df[
    df["is_anomaly"] == 1
]

results = []

for anomaly_type, group in anomaly_df.groupby(
    "anomaly_type"
):

    detected = group["predicted_anomaly"].sum()

    total = len(group)

    detection_rate = detected / total

    results.append({
        "anomaly_type": anomaly_type,
        "total": total,
        "detected": detected,
        "detection_rate": detection_rate
    })


results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    "detection_rate",
    ascending=False
)

print(
    results_df.to_string(index=False)
)


# ============================================================
# SAVE PREDICTIONS
# ============================================================

OUTPUT_FILE = DATA_DIR / "evaluation_results.csv"

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\nEvaluation results saved to:")
print(OUTPUT_FILE)

print("\nSkyGuard AI evaluation complete.")