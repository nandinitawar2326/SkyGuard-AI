import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = DATA_DIR / "aws_normal_data.csv"

MODEL_FILE = MODEL_DIR / "skyguard_isolation_forest.pkl"
SCALER_FILE = MODEL_DIR / "skyguard_scaler.pkl"


# ============================================================
# LOAD NORMAL DATA
# ============================================================

print("=" * 70)
print("SKYGUARD AI - ANOMALY DETECTION MODEL")
print("=" * 70)

print("\nLoading normal AWS dataset...")

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(df["timestamp"])

df = df.sort_values(
    ["station_id", "timestamp"]
).reset_index(drop=True)

print(f"Total records: {len(df)}")


# ============================================================
# FEATURE ENGINEERING
# ============================================================

print("\nCreating temporal features...")


# Calculate changes for each station
df["temperature_change"] = (
    df.groupby("station_id")["temperature"]
    .diff()
)

df["pressure_change"] = (
    df.groupby("station_id")["pressure"]
    .diff()
)

df["humidity_change"] = (
    df.groupby("station_id")["humidity"]
    .diff()
)


# Rolling statistics
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


# Replace NaN values caused by diff/std
df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

df = df.fillna(0)


# ============================================================
# SELECT FEATURES
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


print("\nFeatures used by AI:")
for feature in features:
    print(" -", feature)


# ============================================================
# SCALE FEATURES
# ============================================================

print("\nScaling features...")

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# ============================================================
# TRAIN ISOLATION FOREST
# ============================================================

print("\nTraining Isolation Forest...")

model = IsolationForest(
    n_estimators=200,
    contamination=0.01,
    random_state=42,
    n_jobs=-1
)

model.fit(X_scaled)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(model, MODEL_FILE)

joblib.dump(
    {
        "scaler": scaler,
        "features": features
    },
    SCALER_FILE
)


# ============================================================
# MODEL INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("MODEL TRAINING COMPLETE")
print("=" * 70)

print(f"\nModel saved to:")
print(MODEL_FILE)

print(f"\nScaler saved to:")
print(SCALER_FILE)

print("\nModel:")
print("Isolation Forest")

print("\nNumber of trees:")
print(200)

print("\nContamination:")
print("1%")


# ============================================================
# TEST NORMAL DATA
# ============================================================

predictions = model.predict(X_scaled)

normal_count = np.sum(predictions == 1)
anomaly_count = np.sum(predictions == -1)

print("\nModel test on training data:")
print(f"Normal:   {normal_count}")
print(f"Anomaly:  {anomaly_count}")

print("\nSkyGuard AI anomaly engine is ready!")