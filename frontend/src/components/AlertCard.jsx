
import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  CloudLightning,
  Info,
} from "lucide-react";

const AlertCard = ({
  stationId = "AWS_001",
  classification = "Probable Sensor Fault",
  rootCause = "Sudden Sensor Change",
  variable = "Temperature",
  confidence = 80,
  severity = "Critical",
  timestamp = "2026-01-03T01:57:00",
}) => {
  /* -----------------------------
     Safe values
  ----------------------------- */

  const safeConfidence = Math.min(
    Math.max(Number(confidence) || 0, 0),
    100
  );

  const safeSeverity = String(severity || "Medium");
  const normalizedSeverity = safeSeverity.toLowerCase();

  /* -----------------------------
     Severity styling
  ----------------------------- */

  const getSeverityClass = () => {
    switch (normalizedSeverity) {
      case "critical":
        return "alert-critical";

      case "high":
        return "alert-high";

      case "medium":
        return "alert-medium";

      case "low":
        return "alert-low";

      default:
        return "alert-medium";
    }
  };

  /* -----------------------------
     Alert icon
  ----------------------------- */

  const getIcon = () => {
    const type = String(classification || "").toLowerCase();

    if (type.includes("weather")) {
      return <CloudLightning size={20} />;
    }

    if (
      type.includes("fault") ||
      type.includes("sensor")
    ) {
      return <ShieldAlert size={20} />;
    }

    if (
      type.includes("investigation") ||
      type.includes("anomaly")
    ) {
      return <Info size={20} />;
    }

    return <AlertTriangle size={20} />;
  };

  /* -----------------------------
     Timestamp formatting
  ----------------------------- */

  const formatTimestamp = (value) => {
    if (!value) return "Unknown time";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className={`alert-card ${getSeverityClass()}`}>

      {/* Header */}
      <div className="alert-card-header">

        <div className="alert-icon">
          {getIcon()}
        </div>

        <div className="alert-station">
          <strong>{stationId}</strong>

          <span>
            {formatTimestamp(timestamp)}
          </span>
        </div>

        <div className="alert-severity">
          {safeSeverity}
        </div>

      </div>

      {/* Classification */}
      <div className="alert-classification">

        <span>CLASSIFICATION</span>

        <strong>
          {classification}
        </strong>

      </div>

      {/* Alert Details */}
      <div className="alert-details">

        <div>
          <span>ROOT CAUSE</span>

          <strong>
            {rootCause}
          </strong>
        </div>

        <div>
          <span>VARIABLE</span>

          <strong>
            {variable}
          </strong>
        </div>

        <div>
          <span>CONFIDENCE</span>

          <strong>
            {safeConfidence}%
          </strong>
        </div>

      </div>

      {/* AI Confidence */}
      <div className="alert-confidence">

        <div className="alert-confidence-header">

          <span>
            AI CONFIDENCE
          </span>

          <strong>
            {safeConfidence}%
          </strong>

        </div>

        <div
          className="alert-confidence-bar"
          role="progressbar"
          aria-valuenow={safeConfidence}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="AI confidence"
        >
          <div
            className="alert-confidence-fill"
            style={{
              width: `${safeConfidence}%`,
            }}
          ></div>
        </div>

      </div>

    </div>
  );
};

export default AlertCard;

