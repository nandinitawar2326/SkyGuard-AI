
import React from "react";
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const MaintenanceCard = ({
  stationId = "AWS_003",
  healthStatus = "Plan Maintenance",
  healthScore = 65.6,
  anomalyRate = 3.83,
  estimatedDays = 3,
  priority = "HIGH",
  recommendedAction = "Calibrate sensor and inspect drift",
}) => {
  /* -----------------------------
     Safe values
  ----------------------------- */

  const safeHealthScore = Math.min(
    Math.max(Number(healthScore) || 0, 0),
    100
  );

  const safeAnomalyRate = Math.max(
    Number(anomalyRate) || 0,
    0
  );

  const safeEstimatedDays = Math.max(
    Number(estimatedDays) || 0,
    0
  );

  const safePriority = String(priority || "MEDIUM").toUpperCase();

  /* -----------------------------
     Priority styling
  ----------------------------- */

  const getPriorityClass = () => {
    switch (safePriority) {
      case "URGENT":
        return "maintenance-priority-urgent";

      case "HIGH":
        return "maintenance-priority-high";

      case "MEDIUM":
        return "maintenance-priority-medium";

      default:
        return "maintenance-priority-low";
    }
  };

  /* -----------------------------
     Priority icon
  ----------------------------- */

  const getStatusIcon = () => {
    if (
      safePriority === "URGENT" ||
      safePriority === "HIGH"
    ) {
      return <AlertTriangle size={18} />;
    }

    if (safePriority === "MEDIUM") {
      return <Clock size={18} />;
    }

    return <CheckCircle2 size={18} />;
  };

  return (
    <div className="maintenance-card">

      {/* HEADER */}
      <div className="maintenance-card-header">

        <div className="maintenance-station">

          <div className="maintenance-station-icon">
            <Wrench size={20} />
          </div>

          <div>
            <span className="maintenance-label">
              AWS STATION
            </span>

            <h3>{stationId}</h3>
          </div>

        </div>

        <div
          className={`maintenance-priority ${getPriorityClass()}`}
        >
          {getStatusIcon()}

          <span>{safePriority}</span>
        </div>

      </div>

      {/* STATUS */}
      <div className="maintenance-status">

        <span>STATUS</span>

        <strong>{healthStatus}</strong>

      </div>

      {/* AI RECOMMENDATION */}
      <div className="maintenance-recommendation">

        <div className="maintenance-recommendation-icon">
          <Wrench size={18} />
        </div>

        <div>
          <span>AI RECOMMENDATION</span>

          <strong>{recommendedAction}</strong>
        </div>

      </div>

      {/* METRICS */}
      <div className="maintenance-metrics">

        <div className="maintenance-metric">

          <span>SENSOR HEALTH</span>

          <strong>
            {safeHealthScore.toFixed(1)}
            <small> / 100</small>
          </strong>

        </div>

        <div className="maintenance-metric">

          <span>ANOMALY RATE</span>

          <strong>
            {safeAnomalyRate.toFixed(2)}%
          </strong>

        </div>

        <div className="maintenance-metric">

          <span>ESTIMATED MAINTENANCE</span>

          <strong>
            {safeEstimatedDays}
            <small> days</small>
          </strong>

        </div>

      </div>

      {/* HEALTH CONDITION */}
      <div className="maintenance-health">

        <div className="maintenance-health-header">

          <span>HEALTH CONDITION</span>

          <strong>
            {safeHealthScore.toFixed(1)}%
          </strong>

        </div>

        <div
          className="maintenance-health-bar"
          role="progressbar"
          aria-valuenow={safeHealthScore}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`${stationId} health condition`}
        >
          <div
            className="maintenance-health-fill"
            style={{
              width: `${safeHealthScore}%`,
            }}
          ></div>
        </div>

      </div>

    </div>
  );
};

export default MaintenanceCard;

