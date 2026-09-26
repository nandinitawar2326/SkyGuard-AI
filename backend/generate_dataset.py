import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

NUM_STATIONS = 5
READINGS_PER_STATION = 3000

OUTPUT_DIR = Path("../datasets")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# --------------------------------------------------
# GENERATE NORMAL AWS DATA
# --------------------------------------------------

all_data = []

for station_number in range(1, NUM_STATIONS + 1):

    station_id = f"AWS_{station_number:03d}"

    timestamps = pd.date_range(
        start="2026-01-01 00:00:00",
        periods=READINGS_PER_STATION,
        freq="min"
    )

    time = np.arange(READINGS_PER_STATION)

    # Slight station-specific variation
    station_offset = np.random.uniform(-1.5, 1.5)

    # Temperature
    temperature = (
        27
        + station_offset
        + 5 * np.sin(2 * np.pi * time / 1440)
        + np.random.normal(0, 0.4, READINGS_PER_STATION)
    )

    # Atmospheric pressure
    pressure = (
        1008
        + station_offset * 0.5
        + 4 * np.sin(2 * np.pi * time / 2880)
        + np.random.normal(0, 0.8, READINGS_PER_STATION)
    )

    # Relative humidity
    humidity = (
        65
        - 12 * np.sin(2 * np.pi * time / 1440)
        + np.random.normal(0, 2, READINGS_PER_STATION)
    )

    humidity = np.clip(humidity, 20, 100)

    station_df = pd.DataFrame({
        "timestamp": timestamps,
        "station_id": station_id,
        "temperature": temperature.round(2),
        "pressure": pressure.round(2),
        "humidity": humidity.round(2)
    })

    all_data.append(station_df)

# Combine all stations
df = pd.concat(all_data, ignore_index=True)

# Sort chronologically
df = df.sort_values(
    ["station_id", "timestamp"]
).reset_index(drop=True)

# --------------------------------------------------
# SAVE NORMAL DATA
# --------------------------------------------------

output_file = OUTPUT_DIR / "aws_normal_data.csv"

df.to_csv(output_file, index=False)

print("=" * 60)
print("SKYGUARD AI - DATASET GENERATION")
print("=" * 60)

print(f"\nStations: {NUM_STATIONS}")
print(f"Readings per station: {READINGS_PER_STATION}")
print(f"Total readings: {len(df)}")

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 10 records:")
print(df.head(10))

print("\nDataset statistics:")
print(
    df[
        ["temperature", "pressure", "humidity"]
    ].describe()
)

print(f"\nDataset saved to:")
print(output_file)