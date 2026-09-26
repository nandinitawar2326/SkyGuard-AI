
import React from "react";

const StationCard = ({
  stationId = "AWS_001",
  location = "Delhi NCR",
  status = "Online",
  temperature = 28.4,
  pressure = 1012.6,
  humidity = 64.2,
  health = 87.5,
}) => {
  const normalizedStatus = String(status).toLowerCase();
  const isOnline = normalizedStatus === "online";

  const safeHealth = Math.min(Math.max(Number(health) || 0, 0), 100);

  return (
    <div className="station-card">
      {/* Header */}
      <div className="station-card-header">
        <div className="station-info">
          <span className="station-label">AWS STATION</span>

          <h3>{stationId}</h3>

          <p>{location}</p>
        </div>

        <div
          className={`station-status ${
            isOnline
              ? "station-status-online"
              : "station-status-offline"
          }`}
        >
          <span className="status-dot"></span>
          <span>{status}</span>
        </div>
      </div>

      {/* Station Health */}
      <div className="station-health">
        <div className="health-header">
          <span>STATION HEALTH</span>

          <strong>{safeHealth.toFixed(1)}%</strong>
        </div>

        <div
          className="health-bar"
          role="progressbar"
          aria-valuenow={safeHealth}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`${stationId} station health`}
        >
          <div
            className="health-bar-fill"
            style={{
              width: `${safeHealth}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="station-metrics">
        <div className="station-metric">
          <span>TEMPERATURE</span>
          <strong>{Number(temperature).toFixed(1)}°C</strong>
        </div>

        <div className="station-metric">
          <span>PRESSURE</span>
          <strong>{Number(pressure).toFixed(1)} hPa</strong>
        </div>

        <div className="station-metric">
          <span>HUMIDITY</span>
          <strong>{Number(humidity).toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
};

export default StationCard;

