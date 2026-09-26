
import React from "react";

const SensorChart = ({
  title = "Sensor Trends",
  sensor = "Temperature",
  value = 28.4,
  unit = "°C",
  data = [22, 24, 23, 26, 25, 28, 27, 29, 28, 28.4],
}) => {
  // Make sure chart data is always usable
  const safeData =
    Array.isArray(data) && data.length > 0
      ? data
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item))
      : [0];

  const max = Math.max(...safeData);
  const min = Math.min(...safeData);
  const range = max - min || 1;

  const points = safeData
    .map((item, index) => {
      const x =
        safeData.length === 1
          ? 50
          : (index / (safeData.length - 1)) * 100;

      const y =
        90 - ((item - min) / range) * 70;

      return `${x},${y}`;
    })
    .join(" ");

  const currentValue = Number(value);

  return (
    <div className="sensor-chart-card">

      {/* Header */}
      <div className="sensor-chart-header">

        <div>
          <span className="sensor-chart-label">
            {title}
          </span>

          <h3>{sensor}</h3>
        </div>

        <div className="sensor-chart-current">

          <strong>
            {Number.isFinite(currentValue)
              ? currentValue.toFixed(1)
              : "—"}
            {Number.isFinite(currentValue) && unit}
          </strong>

          <span>Current</span>

        </div>

      </div>

      {/* Chart */}
      <div className="sensor-chart-area">

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="sensor-chart-svg"
          role="img"
          aria-label={`${sensor} sensor trend chart`}
        >

          {/* Grid */}
          <line
            x1="0"
            y1="20"
            x2="100"
            y2="20"
            className="chart-grid"
          />

          <line
            x1="0"
            y1="45"
            x2="100"
            y2="45"
            className="chart-grid"
          />

          <line
            x1="0"
            y1="70"
            x2="100"
            y2="70"
            className="chart-grid"
          />

          <line
            x1="0"
            y1="90"
            x2="100"
            y2="90"
            className="chart-grid"
          />

          {/* Sensor trend */}
          <polyline
            points={points}
            fill="none"
            className="chart-line"
            vectorEffect="non-scaling-stroke"
          />

        </svg>

      </div>

      {/* Footer */}
      <div className="sensor-chart-footer">

        <span>
          MIN {Number.isFinite(min) ? min : "—"}
        </span>

        <span>
          LIVE SENSOR DATA
        </span>

        <span>
          MAX {Number.isFinite(max) ? max : "—"}
        </span>

      </div>

    </div>
  );
};

export default SensorChart;

