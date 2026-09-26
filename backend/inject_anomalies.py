import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "datasets"

INPUT_FILE = DATA_DIR / "aws_normal_data.csv"
OUTPUT_FILE = DATA_DIR / "aws_anomaly_data.csv"

# --------------------------------------------------
# LOAD NORMAL DATA
# --------------------------------------------------

df = pd.read_csv(INPUT_FILE)

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Labels
df["is_anomaly"] = 0
df["anomaly_type"] = "normal"

# --------------------------------------------------
# HELPER FUNCTION
# --------------------------------------------------

def inject_anomaly(index, anomaly_type, temperature=None,
                   pressure=None, humidity=None):

    global df

    if temperature is not None:
        df.loc[index, "temperature"] = temperature

    if pressure is not None:
        df.loc[index, "pressure"] = pressure

    if humidity is not None:
        df.loc[index, "humidity"] = humidity

    df.loc[index, "is_anomaly"] = 1
    df.loc[index, "anomaly_type"] = anomaly_type


# ==================================================
# 1. TEMPERATURE SPIKES
# ==================================================

indices = np.random.choice(
    df.index[100:-100],
    size=30,
    replace=False
)

for index in indices:
    normal_temp = df.loc[index, "temperature"]

    inject_anomaly(
        index,
        "temperature_spike",
        temperature=normal_temp + np.random.uniform(20, 30)
    )


# ==================================================
# 2. TEMPERATURE DROPS
# ==================================================

indices = np.random.choice(
    df.index[100:-100],
    size=30,
    replace=False
)

for index in indices:
    normal_temp = df.loc[index, "temperature"]

    inject_anomaly(
        index,
        "temperature_drop",
        temperature=normal_temp - np.random.uniform(15, 25)
    )


# ==================================================
# 3. HUMIDITY SPIKES
# ==================================================

indices = np.random.choice(
    df.index[100:-100],
    size=30,
    replace=False
)

for index in indices:
    inject_anomaly(
        index,
        "humidity_spike",
        humidity=np.random.uniform(95, 100)
    )


# ==================================================
# 4. PRESSURE ANOMALIES
# ==================================================

indices = np.random.choice(
    df.index[100:-100],
    size=30,
    replace=False
)

for index in indices:
    normal_pressure = df.loc[index, "pressure"]

    inject_anomaly(
        index,
        "pressure_anomaly",
        pressure=normal_pressure + np.random.choice([
            np.random.uniform(30, 50),
            -np.random.uniform(30, 50)
        ])
    )


# ==================================================
# 5. FROZEN TEMPERATURE SENSOR
# ==================================================

for station in ["AWS_001", "AWS_002"]:

    station_indices = df[
        df["station_id"] == station
    ].index

    start_index = np.random.choice(
        station_indices[:-30]
    )

    frozen_value = df.loc[start_index, "temperature"]

    selected_indices = list(
        station_indices[
            list(station_indices).index(start_index):
            list(station_indices).index(start_index) + 20
        ]
    )

    for index in selected_indices:

        df.loc[index, "temperature"] = frozen_value
        df.loc[index, "is_anomaly"] = 1
        df.loc[index, "anomaly_type"] = "frozen_temperature_sensor"


# ==================================================
# 6. HUMIDITY SENSOR DRIFT
# ==================================================

station = "AWS_003"

station_indices = df[
    df["station_id"] == station
].index

start_position = 500

selected_indices = station_indices[
    start_position:start_position + 50
]

for i, index in enumerate(selected_indices):

    original_value = df.loc[index, "humidity"]

    drift = i * 0.5

    df.loc[index, "humidity"] = min(
        100,
        original_value + drift
    )

    df.loc[index, "is_anomaly"] = 1
    df.loc[index, "anomaly_type"] = "humidity_sensor_drift"


# ==================================================
# 7. MULTIVARIATE INCONSISTENCY
# ==================================================

indices = np.random.choice(
    df.index[100:-100],
    size=30,
    replace=False
)

for index in indices:

    # Create a physically suspicious combination
    inject_anomaly(
        index,
        "multivariate_inconsistency",
        temperature=np.random.uniform(48, 58),
        pressure=np.random.uniform(1005, 1012),
        humidity=np.random.uniform(60, 75)
    )


# ==================================================
# 8. SENSOR COMMUNICATION / CORRUPTED DATA
# ==================================================

indices = np.random.choice(
    df.index[100:-100],
    size=20,
    replace=False
)

for index in indices:

    inject_anomaly(
        index,
        "corrupted_reading",
        temperature=np.random.choice([
            -999,
            999,
            np.nan
        ]),
        pressure=np.random.choice([
            -999,
            99999,
            np.nan
        ]),
        humidity=np.random.choice([
            -1,
            150,
            np.nan
        ])
    )


# ==================================================
# SAVE DATASET
# ==================================================

df = df.sort_values(
    ["station_id", "timestamp"]
).reset_index(drop=True)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

# ==================================================
# REPORT
# ==================================================

print("=" * 65)
print("SKYGUARD AI - ANOMALY DATASET")
print("=" * 65)

print(f"\nTotal records: {len(df)}")

print(
    f"Normal records: {(df['is_anomaly'] == 0).sum()}"
)

print(
    f"Anomaly records: {(df['is_anomaly'] == 1).sum()}"
)

print("\nAnomaly distribution:")
print(
    df[df["is_anomaly"] == 1]["anomaly_type"]
    .value_counts()
)

print("\nSaved to:")
print(OUTPUT_FILE)

print("\nFirst anomaly records:")
print(
    df[df["is_anomaly"] == 1].head(10)
)