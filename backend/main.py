from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
from typing import Optional

import pandas as pd


# ============================================================
# SKYGUARD AI - FASTAPI BACKEND
# ============================================================

app = FastAPI(
    title="SkyGuard AI",
    description="AI-Based Anomaly Detection and Sensor Intelligence Platform",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "datasets"


MULTIMODEL_FILE = (
    DATA_DIR / "multimodel_results.csv"
)

EVENT_FILE = (
    DATA_DIR / "event_vs_sensor_results.csv"
)

EXPLAINABLE_FILE = (
    DATA_DIR / "explainable_alerts.csv"
)

HEALTH_FILE = (
    DATA_DIR / "sensor_health_results.csv"
)

SELF_HEALING_FILE = (
    DATA_DIR / "self_healing_results.csv"
)


# ============================================================
# HELPER
# ============================================================

def load_csv(file_path: Path):

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail=f"Dataset not found: {file_path.name}"
        )

    return pd.read_csv(file_path)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "system": "SkyGuard AI",
        "status": "running",
        "version": "1.0.0",
        "message": "SkyGuard AI backend is operational"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def api_health():

    return {
        "status": "healthy",
        "service": "SkyGuard AI API"
    }


# ============================================================
# STATIONS
# ============================================================

@app.get("/api/stations")
def get_stations():

    df = load_csv(MULTIMODEL_FILE)

    stations = sorted(
        df["station_id"]
        .dropna()
        .unique()
        .tolist()
    )

    return {
        "total_stations": len(stations),
        "stations": stations
    }


# ============================================================
# STATISTICS
# ============================================================

@app.get("/api/statistics")
def get_statistics():

    df = load_csv(MULTIMODEL_FILE)

    total = len(df)

    anomalies = int(
        df["final_anomaly"].sum()
    )

    normal = total - anomalies

    anomaly_rate = (
        anomalies / total * 100
        if total > 0
        else 0
    )

    return {
        "total_readings": total,
        "normal_readings": normal,
        "anomalies": anomalies,
        "anomaly_rate": round(
            anomaly_rate,
            2
        )
    }


# ============================================================
# ALERTS
# ============================================================

@app.get("/api/alerts")
def get_alerts(limit: int = 20):

    df = load_csv(
        EXPLAINABLE_FILE
    )

    df["timestamp"] = pd.to_datetime(
        df["timestamp"]
    )

    df = df.sort_values(
        "timestamp",
        ascending=False
    )

    alerts = df.head(limit)

    alerts = alerts.fillna("")

    return {
        "total_alerts": len(df),
        "alerts": alerts.to_dict(
            orient="records"
        )
    }


# ============================================================
# SENSOR HEALTH
# ============================================================

@app.get("/api/sensor-health")
def get_sensor_health():

    df = load_csv(
        HEALTH_FILE
    )

    df = df.fillna("")

    return {
        "stations": df.to_dict(
            orient="records"
        )
    }


# ============================================================
# RECENT READINGS
# ============================================================

@app.get("/api/recent-readings")
def get_recent_readings(
    station_id: Optional[str] = None,
    limit: int = 50
):

    df = load_csv(
        MULTIMODEL_FILE
    )

    df["timestamp"] = pd.to_datetime(
        df["timestamp"]
    )

    if station_id:

        if station_id not in (
            df["station_id"]
            .unique()
        ):

            raise HTTPException(
                status_code=404,
                detail="Station not found"
            )

        df = df[
            df["station_id"] == station_id
        ]

    df = df.sort_values(
        "timestamp",
        ascending=False
    )

    df = df.head(limit)

    df = df.fillna("")

    return {
        "station_id": station_id,
        "count": len(df),
        "readings": df.to_dict(
            orient="records"
        )
    }


# ============================================================
# STATION-SPECIFIC ANOMALIES
# ============================================================

@app.get("/api/anomalies/{station_id}")
def get_station_anomalies(
    station_id: str,
    limit: int = 50
):

    df = load_csv(
        EXPLAINABLE_FILE
    )

    if station_id not in (
        df["station_id"]
        .unique()
    ):

        raise HTTPException(
            status_code=404,
            detail="Station not found"
        )

    df = df[
        df["station_id"] == station_id
    ].copy()

    df["timestamp"] = pd.to_datetime(
        df["timestamp"]
    )

    df = df.sort_values(
        "timestamp",
        ascending=False
    )

    df = df.head(limit)

    df = df.fillna("")

    return {
        "station_id": station_id,
        "total_anomalies": len(df),
        "anomalies": df.to_dict(
            orient="records"
        )
    }


# ============================================================
# SELF-HEALING
# ============================================================

@app.get("/api/self-healing")
def get_self_healing(
    limit: int = 20
):

    df = load_csv(
        SELF_HEALING_FILE
    )

    ai_imputed = df[
        df["data_status"] == "AI-IMPUTED"
    ].copy()

    ai_imputed["timestamp"] = pd.to_datetime(
        ai_imputed["timestamp"]
    )

    ai_imputed = ai_imputed.sort_values(
        "timestamp",
        ascending=False
    )

    corrections = ai_imputed.head(limit)

    corrections = corrections.fillna("")

    total_ai_imputed = int(
        (
            df["data_status"] == "AI-IMPUTED"
        ).sum()
    )

    return {
        "total_ai_imputed": total_ai_imputed,
        "corrections": corrections.to_dict(
            orient="records"
        )
    }


# ============================================================
# WEATHER EVENTS
# ============================================================

@app.get("/api/weather-events")
def get_weather_events():

    df = load_csv(
        EVENT_FILE
    )

    weather_events = df[
        df["event_classification"]
        == "Possible Weather Event"
    ].copy()

    if "timestamp" in weather_events.columns:

        weather_events["timestamp"] = pd.to_datetime(
            weather_events["timestamp"]
        )

        weather_events = weather_events.sort_values(
            "timestamp",
            ascending=False
        )

    weather_events = weather_events.fillna("")

    return {
        "total_weather_events": len(
            weather_events
        ),
        "weather_events": weather_events.to_dict(
            orient="records"
        )
    }


# ============================================================
# SYSTEM SUMMARY
# ============================================================

@app.get("/api/summary")
def get_summary():

    multi = load_csv(
        MULTIMODEL_FILE
    )

    event = load_csv(
        EVENT_FILE
    )

    health = load_csv(
        HEALTH_FILE
    )

    self_healing = load_csv(
        SELF_HEALING_FILE
    )

    return {

        "stations": int(
            multi["station_id"]
            .nunique()
        ),

        "total_readings": len(
            multi
        ),

        "anomalies": int(
            multi["final_anomaly"]
            .sum()
        ),

        "sensor_faults": int(
            (
                event["event_classification"]
                == "Probable Sensor Fault"
            ).sum()
        ),

        "weather_events": int(
            (
                event["event_classification"]
                == "Possible Weather Event"
            ).sum()
        ),

        "investigations": int(
            (
                event["event_classification"]
                == "Needs Investigation"
            ).sum()
        ),

        "ai_imputed": int(
            (
                self_healing["data_status"]
                == "AI-IMPUTED"
            ).sum()
        ),

        "average_sensor_health": round(
            health["health_score"].mean(),
            2
        )
    }