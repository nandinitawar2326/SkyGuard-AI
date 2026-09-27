
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://skyguard-ai-api.vercel.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getHealth = () =>
  api.get("/api/health");

export const getSummary = () =>
  api.get("/api/summary");

export const getStations = () =>
  api.get("/api/stations");

export const getStatistics = () =>
  api.get("/api/statistics");

export const getAlerts = (limit = 20) =>
  api.get("/api/alerts", {
    params: { limit },
  });

export const getSensorHealth = () =>
  api.get("/api/sensor-health");

export const getRecentReadings = (
  stationId = null,
  limit = 50
) =>
  api.get("/api/recent-readings", {
    params: {
      ...(stationId
        ? { station_id: stationId }
        : {}),
      limit,
    },
  });

export const getStationAnomalies = (
  stationId,
  limit = 50
) =>
  api.get(`/api/anomalies/${stationId}`, {
    params: { limit },
  });

export const getSelfHealing = (limit = 20) =>
  api.get("/api/self-healing", {
    params: { limit },
  });

export const getWeatherEvents = () =>
  api.get("/api/weather-events");

export default api;

