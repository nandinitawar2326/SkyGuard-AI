
import React from "react";

const HealthCard = ({
  title = "Station Health",
  health = 87.5,
  status,
  description = "Overall sensor health based on recent readings and anomaly patterns.",
}) => {
  const safeHealth = Math.min(
    Math.max(Number(health) || 0, 0),
    100
  );

  const calculatedStatus =
    status ||
    (safeHealth >= 80
      ? "Healthy"
      : safeHealth >= 60
      ? "Needs Attention"
      : "Critical");

  const statusClass =
    calculatedStatus.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="health-card">
      {/* Header */}
      <div className="health-card-header">
        <div>
          <span className="health-card-label">
            AI HEALTH MONITOR
          </span>

          <h3>{title}</h3>
        </div>

        <span
          className={`health-status health-status-${statusClass}`}
        >
          {calculatedStatus}
        </span>
      </div>

      {/* Health Score */}
      <div className="health-card-content">
        <div className="health-score">
          <strong>{safeHealth.toFixed(1)}</strong>
          <span>/ 100</span>
        </div>

        <div className="health-description">
          <p>{description}</p>
        </div>
      </div>

      {/* Progress */}
      <div
        className="health-progress"
        role="progressbar"
        aria-valuenow={safeHealth}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${title} health`}
      >
        <div
          className="health-progress-fill"
          style={{
            width: `${safeHealth}%`,
          }}
        ></div>
      </div>

      {/* Scale */}
      <div className="health-card-footer">
        <span>0</span>
        <span>Sensor Health</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default HealthCard;

