import { useEffect, useState } from "react";
import axios from "axios";
import {
  RefreshCw,
  Activity,
  Wrench,
  Clock,
  AlertTriangle,
} from "lucide-react";

const API_URL = "https://skyguard-ai-api.vercel.app";

function Maintenance() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     NORMALIZE API RESPONSE
     ========================================================= */

  const normalizeStationData = (data) => {
    try {
      // Direct array
      if (Array.isArray(data)) {
        return data;
      }

      // Common FastAPI response structures
      if (Array.isArray(data?.stations)) {
        return data.stations;
      }

      if (Array.isArray(data?.data)) {
        return data.data;
      }

      if (Array.isArray(data?.results)) {
        return data.results;
      }

      if (Array.isArray(data?.sensor_health)) {
        return data.sensor_health;
      }

      // Sometimes API may return JSON as a string
      if (typeof data === "string") {
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        if (Array.isArray(parsed?.stations)) {
          return parsed.stations;
        }

        if (Array.isArray(parsed?.data)) {
          return parsed.data;
        }
      }

      return [];
    } catch (err) {
      console.error("Unable to normalize maintenance data:", err);
      return [];
    }
  };

  /* =========================================================
     FETCH MAINTENANCE DATA
     ========================================================= */

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/sensor-health`
      );

      console.log("Maintenance API response:", response.data);

      const normalizedData = normalizeStationData(response.data);

      // Validate station objects
      const validStations = normalizedData.filter(
        (station) =>
          station &&
          typeof station === "object" &&
          station.station_id
      );

      if (validStations.length === 0) {
        setStations([]);
        setError("Invalid sensor health data received.");
        return;
      }

      setStations(validStations);
    } catch (err) {
      console.error("Maintenance API error:", err);

      setStations([]);
      setError("Unable to load maintenance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  /* =========================================================
     PRIORITY COUNTS
     ========================================================= */

  const highPriority = stations.filter(
    (station) =>
      String(station.maintenance_priority || "").toUpperCase() ===
      "HIGH"
  ).length;

  const mediumPriority = stations.filter(
    (station) =>
      String(station.maintenance_priority || "").toUpperCase() ===
      "MEDIUM"
  ).length;

  const urgentPriority = stations.filter(
    (station) =>
      String(station.maintenance_priority || "").toUpperCase() ===
      "URGENT"
  ).length;

  /* =========================================================
     HELPERS
     ========================================================= */

  const getPriorityClass = (priority) => {
    const value = String(priority || "").toUpperCase();

    if (value === "URGENT") return "sg-priority-urgent";
    if (value === "HIGH") return "sg-priority-high";
    if (value === "MEDIUM") return "sg-priority-medium";

    return "sg-priority-low";
  };

  const getStatusClass = (status) => {
    if (status === "Plan Maintenance") {
      return "sg-status-maintenance";
    }

    if (status === "Watch") {
      return "sg-status-watch";
    }

    if (status === "Urgent") {
      return "sg-status-urgent";
    }

    return "sg-status-healthy";
  };

  /* =========================================================
     JSX
     ========================================================= */

  return (
    <div className="sg-maintenance-page">

      {/* =====================================================
          COMPONENT-SCOPED CSS
          ===================================================== */}

      <style>{`

        /* =====================================================
           MAIN PAGE
           ===================================================== */

        .sg-maintenance-page {
          width: 100%;
          min-width: 0;
          min-height: 100%;
          padding: 28px 32px 50px;
          color: #e8eef7;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .sg-maintenance-page *,
        .sg-maintenance-page *::before,
        .sg-maintenance-page *::after {
          box-sizing: border-box;
        }


        /* =====================================================
           HEADER
           ===================================================== */

        .sg-maintenance-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
          margin-bottom: 28px;
        }

        .sg-maintenance-header-content {
          min-width: 0;
        }

        .sg-section-label {
          color: #6f8199;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          line-height: 1.4;
        }

        .sg-maintenance-header h1 {
          margin: 7px 0 8px;
          color: #f4f8fb;
          font-size: 30px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .sg-maintenance-header p {
          margin: 0;
          max-width: 720px;
          color: #8995a7;
          font-size: 14px;
          line-height: 1.6;
        }

        .sg-engine-status {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 15px;
          border: 1px solid rgba(53, 211, 153, 0.25);
          border-radius: 8px;
          background: rgba(53, 211, 153, 0.06);
          color: #46d7a0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.7px;
          white-space: nowrap;
        }

        .sg-engine-status svg {
          color: #46d7a0;
        }


        /* =====================================================
           SUMMARY CARDS
           ===================================================== */

        .sg-maintenance-summary {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        .sg-summary-card {
          min-width: 0;
          min-height: 92px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px;
          background: #111821;
          border: 1px solid #202b38;
          border-radius: 10px;
          transition:
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .sg-summary-card:hover {
          border-color: #334354;
          transform: translateY(-2px);
        }

        .sg-summary-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #142536;
          color: #72a7ff;
        }

        .sg-summary-content {
          min-width: 0;
        }

        .sg-summary-content span {
          display: block;
          margin-bottom: 3px;
          color: #6f8199;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
        }

        .sg-summary-content strong {
          display: block;
          color: #f4f8fb;
          font-size: 27px;
          font-weight: 700;
          line-height: 1;
        }

        .sg-summary-content small {
          display: block;
          margin-top: 6px;
          color: #6e8196;
          font-size: 11px;
        }


        /* =====================================================
           MAINTENANCE SECTION
           ===================================================== */

        .sg-maintenance-section {
          width: 100%;
          min-width: 0;
          padding: 24px 26px 28px;
          background: #0f1822;
          border: 1px solid #1d2f3e;
          border-radius: 16px;
          box-sizing: border-box;
        }

        .sg-maintenance-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
        }

        .sg-maintenance-section-header h2 {
          margin: 6px 0 0;
          color: #f4f8fb;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.3;
        }

        .sg-refresh-button {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 9px 15px;
          border: 1px solid #294050;
          border-radius: 8px;
          background: #101d29;
          color: #9db2c6;
          font-size: 13px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .sg-refresh-button:hover:not(:disabled) {
          border-color: #3a6679;
          color: #d8e7ef;
          background: #132331;
        }

        .sg-refresh-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .sg-spin {
          animation: sg-spin-animation 1s linear infinite;
        }

        @keyframes sg-spin-animation {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }


        /* =====================================================
           ERROR / LOADING
           ===================================================== */

        .sg-maintenance-error {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 14px 16px;
          border: 1px solid rgba(248, 113, 113, 0.25);
          border-radius: 9px;
          background: rgba(248, 113, 113, 0.06);
          color: #fca5a5;
          font-size: 13px;
        }

        .sg-maintenance-loading {
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #7892a5;
          font-size: 13px;
        }


        /* =====================================================
           STATION LIST
           ===================================================== */

        .sg-maintenance-list {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }


        /* =====================================================
           STATION CARD
           ===================================================== */

        .sg-maintenance-card {
          min-width: 0;
          padding: 24px;
          background: #111b26;
          border: 1px solid #243747;
          border-radius: 14px;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .sg-maintenance-card:hover {
          border-color: #315367;
          background: #13202c;
          transform: translateY(-1px);
        }

        .sg-maintenance-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .sg-station-info {
          min-width: 0;
        }

        .sg-station-info h3 {
          margin: 0 0 9px;
          color: #f5f8fa;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
        }


        /* =====================================================
           STATUS BADGES
           ===================================================== */

        .sg-status-badge {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .sg-status-maintenance {
          color: #f3a84b;
          background: rgba(243, 168, 75, 0.09);
          border: 1px solid rgba(243, 168, 75, 0.28);
        }

        .sg-status-watch {
          color: #68a9ff;
          background: rgba(104, 169, 255, 0.08);
          border: 1px solid rgba(104, 169, 255, 0.28);
        }

        .sg-status-urgent {
          color: #ff7070;
          background: rgba(255, 112, 112, 0.08);
          border: 1px solid rgba(255, 112, 112, 0.28);
        }

        .sg-status-healthy {
          color: #4dd6a1;
          background: rgba(77, 214, 161, 0.08);
          border: 1px solid rgba(77, 214, 161, 0.28);
        }


        /* =====================================================
           PRIORITY BADGE
           ===================================================== */

        .sg-priority-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 36px;
          padding: 8px 12px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }

        .sg-priority-badge span {
          opacity: 0.8;
        }

        .sg-priority-badge strong {
          font-size: 12px;
        }

        .sg-priority-high {
          color: #f3a84b;
          background: rgba(243, 168, 75, 0.08);
          border: 1px solid rgba(243, 168, 75, 0.28);
        }

        .sg-priority-medium {
          color: #68a9ff;
          background: rgba(104, 169, 255, 0.08);
          border: 1px solid rgba(104, 169, 255, 0.28);
        }

        .sg-priority-urgent {
          color: #ff6f6f;
          background: rgba(255, 111, 111, 0.08);
          border: 1px solid rgba(255, 111, 111, 0.28);
        }

        .sg-priority-low {
          color: #62d7a4;
          background: rgba(98, 215, 164, 0.08);
          border: 1px solid rgba(98, 215, 164, 0.28);
        }


        /* =====================================================
           AI RECOMMENDATION
           ===================================================== */

        .sg-recommendation-box {
          width: 100%;
          min-width: 0;
          margin-bottom: 16px;
          padding: 13px 15px;
          background: #0d1721;
          border: 1px solid #203344;
          border-left: 2px solid #4d7fff;
          border-radius: 6px;
        }

        .sg-recommendation-box span {
          display: block;
          margin-bottom: 6px;
          color: #6f849a;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.4px;
        }

        .sg-recommendation-box strong {
          display: block;
          color: #e5edf5;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.45;
          overflow-wrap: break-word;
        }


        /* =====================================================
           METRICS
           ===================================================== */

        .sg-maintenance-metrics {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .sg-metric {
          min-width: 0;
          padding: 13px;
          background: #0e1822;
          border: 1px solid #203140;
          border-radius: 7px;
        }

        .sg-metric span {
          display: block;
          margin-bottom: 5px;
          color: #6e8397;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.1px;
          line-height: 1.3;
        }

        .sg-metric strong {
          display: block;
          color: #f1f6fa;
          font-size: 19px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
        }

        .sg-metric strong small {
          color: #70859a;
          font-size: 10px;
          font-weight: 400;
        }


        /* =====================================================
           AI DECISION PIPELINE
           ===================================================== */

        .sg-decision-pipeline {
          width: 100%;
          min-width: 0;
          margin-top: 32px;
          padding: 28px;
          background: #0f1822;
          border: 1px solid #1d3342;
          border-radius: 16px;
          overflow: visible;
        }

        .sg-decision-pipeline h2 {
          margin: 6px 0 24px;
          color: #f4f8fb;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.3;
        }

        .sg-pipeline-grid {
          width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          align-items: stretch;
        }

        .sg-pipeline-step {
          position: relative;
          min-width: 0;
          min-height: 205px;
          padding: 20px;
          background: #111c27;
          border: 1px solid #203747;
          border-radius: 12px;
          overflow: visible;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          transition:
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .sg-pipeline-step:hover {
          border-color: #2c5968;
          transform: translateY(-2px);
        }

        .sg-pipeline-number {
          width: 44px;
          height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border-radius: 10px;
          background: #103f4b;
          color: #66d9e8;
          font-size: 13px;
          font-weight: 700;
        }

        .sg-pipeline-step h3 {
          margin: 0 0 10px;
          color: #f5f8fa;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.3;
        }

        .sg-pipeline-step p {
          margin: 0;
          color: #7f9bb0;
          font-size: 13px;
          line-height: 1.65;
          overflow-wrap: break-word;
          word-break: normal;
        }

        /* Arrow is attached to the card,
           so it never creates an extra grid column. */

        .sg-pipeline-step:not(:last-child)::after {
          content: "→";
          position: absolute;
          top: 50%;
          right: -27px;
          z-index: 10;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-50%);
          color: #43e8e5;
          background: #09151d;
          border: 1px solid #193744;
          border-radius: 50%;
          font-size: 13px;
          font-weight: 700;
        }


        /* =====================================================
           RESPONSIVE - 1200
           ===================================================== */

        @media (max-width: 1200px) {

          .sg-maintenance-page {
            padding-left: 24px;
            padding-right: 24px;
          }

          .sg-maintenance-list {
            grid-template-columns: 1fr;
          }

          .sg-pipeline-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sg-pipeline-step::after {
            display: none !important;
          }
        }


        /* =====================================================
           RESPONSIVE - 900
           ===================================================== */

        @media (max-width: 900px) {

          .sg-maintenance-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sg-maintenance-header {
            flex-direction: column;
          }

          .sg-engine-status {
            align-self: flex-start;
          }

          .sg-maintenance-card-top {
            flex-wrap: wrap;
          }
        }


        /* =====================================================
           RESPONSIVE - 700
           ===================================================== */

        @media (max-width: 700px) {

          .sg-maintenance-page {
            padding: 20px 16px 35px;
          }

          .sg-maintenance-summary {
            grid-template-columns: 1fr;
          }

          .sg-maintenance-section {
            padding: 20px;
          }

          .sg-maintenance-section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .sg-maintenance-card {
            padding: 20px;
          }

          .sg-maintenance-card-top {
            flex-direction: column;
          }

          .sg-priority-badge {
            align-self: flex-start;
          }

          .sg-maintenance-metrics {
            grid-template-columns: 1fr;
          }

          .sg-decision-pipeline {
            padding: 20px;
          }

          .sg-pipeline-grid {
            grid-template-columns: 1fr;
          }

          .sg-pipeline-step {
            min-height: auto;
          }

          .sg-pipeline-step::after {
            display: none !important;
          }
        }

      `}</style>


      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="sg-maintenance-header">

        <div className="sg-maintenance-header-content">

          <div className="sg-section-label">
            PREDICTIVE MAINTENANCE
          </div>

          <h1>Maintenance Control</h1>

          <p>
            AI-powered maintenance planning based on sensor health,
            anomaly patterns and predicted maintenance timelines.
          </p>

        </div>

        <div className="sg-engine-status">
          <Activity size={18} />
          <span>AI MAINTENANCE ENGINE ACTIVE</span>
        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="sg-maintenance-summary">

        {/* Queue */}

        <div className="sg-summary-card">

          <div className="sg-summary-icon">
            <Wrench size={22} />
          </div>

          <div className="sg-summary-content">
            <span>MAINTENANCE QUEUE</span>
            <strong>{stations.length}</strong>
            <small>AWS stations monitored</small>
          </div>

        </div>


        {/* High */}

        <div className="sg-summary-card">

          <div className="sg-summary-icon">
            <AlertTriangle size={22} />
          </div>

          <div className="sg-summary-content">
            <span>HIGH PRIORITY</span>
            <strong>{highPriority}</strong>
            <small>Requires planned action</small>
          </div>

        </div>


        {/* Medium */}

        <div className="sg-summary-card">

          <div className="sg-summary-icon">
            <Clock size={22} />
          </div>

          <div className="sg-summary-content">
            <span>MEDIUM PRIORITY</span>
            <strong>{mediumPriority}</strong>
            <small>Continue monitoring</small>
          </div>

        </div>


        {/* Urgent */}

        <div className="sg-summary-card">

          <div className="sg-summary-icon">
            <AlertTriangle size={22} />
          </div>

          <div className="sg-summary-content">
            <span>URGENT</span>
            <strong>{urgentPriority}</strong>
            <small>Immediate attention</small>
          </div>

        </div>

      </div>


      {/* =====================================================
          MAINTENANCE QUEUE
          ===================================================== */}

      <div className="sg-maintenance-section">

        <div className="sg-maintenance-section-header">

          <div>

            <div className="sg-section-label">
              AI MAINTENANCE QUEUE
            </div>

            <h2>Station Maintenance Priorities</h2>

          </div>

          <button
            className="sg-refresh-button"
            onClick={fetchMaintenanceData}
            disabled={loading}
          >

            <RefreshCw
              size={17}
              className={loading ? "sg-spin" : ""}
            />

            Refresh

          </button>

        </div>


        {/* Error */}

        {error && (
          <div className="sg-maintenance-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}


        {/* Loading */}

        {loading && stations.length === 0 ? (

          <div className="sg-maintenance-loading">

            <RefreshCw
              className="sg-spin"
              size={24}
            />

            <span>
              Loading AI maintenance analysis...
            </span>

          </div>

        ) : stations.length > 0 ? (

          <div className="sg-maintenance-list">

            {stations.map((station) => {

              const healthScore = Number(
                station.health_score
              );

              const anomalyRate = Number(
                station.anomaly_rate
              );

              return (

                <div
                  className="sg-maintenance-card"
                  key={station.station_id}
                >

                  {/* Station Header */}

                  <div className="sg-maintenance-card-top">

                    <div className="sg-station-info">

                      <h3>
                        {station.station_id}
                      </h3>

                      <span
                        className={`sg-status-badge ${getStatusClass(
                          station.health_status
                        )}`}
                      >
                        {station.health_status}
                      </span>

                    </div>


                    {/* Priority */}

                    <div
                      className={`sg-priority-badge ${getPriorityClass(
                        station.maintenance_priority
                      )}`}
                    >

                      <span>
                        PRIORITY
                      </span>

                      <strong>
                        {station.maintenance_priority || "LOW"}
                      </strong>

                    </div>

                  </div>


                  {/* AI Recommendation */}

                  <div className="sg-recommendation-box">

                    <span>
                      AI RECOMMENDATION
                    </span>

                    <strong>
                      {station.recommended_action ||
                        "Continue monitoring sensor health"}
                    </strong>

                  </div>


                  {/* Metrics */}

                  <div className="sg-maintenance-metrics">

                    {/* Health */}

                    <div className="sg-metric">

                      <span>
                        SENSOR HEALTH
                      </span>

                      <strong>
                        {Number.isFinite(healthScore)
                          ? healthScore.toFixed(1)
                          : "--"}

                        <small>
                          {" "}
                          / 100
                        </small>
                      </strong>

                    </div>


                    {/* Anomaly */}

                    <div className="sg-metric">

                      <span>
                        ANOMALY RATE
                      </span>

                      <strong>
                        {Number.isFinite(anomalyRate)
                          ? anomalyRate.toFixed(2)
                          : "--"}
                        %
                      </strong>

                    </div>


                    {/* Maintenance */}

                    <div className="sg-metric">

                      <span>
                        ESTIMATED MAINTENANCE
                      </span>

                      <strong>
                        {station.estimated_days_to_maintenance ??
                          "--"}

                        <small>
                          {" "}
                          days
                        </small>
                      </strong>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>

        ) : (

          !error && (
            <div className="sg-maintenance-loading">
              No maintenance data available.
            </div>
          )

        )}

      </div>


      {/* =====================================================
          AI DECISION PIPELINE
          ===================================================== */}

      <div className="sg-decision-pipeline">

        <div className="sg-section-label">
          AI DECISION PIPELINE
        </div>

        <h2>
          How Maintenance Priority Is Generated
        </h2>


        <div className="sg-pipeline-grid">

          {/* STEP 1 */}

          <div className="sg-pipeline-step">

            <div className="sg-pipeline-number">
              01
            </div>

            <h3>
              Detect
            </h3>

            <p>
              Anomaly detectors identify unusual
              temperature, pressure and humidity
              behavior.
            </p>

          </div>


          {/* STEP 2 */}

          <div className="sg-pipeline-step">

            <div className="sg-pipeline-number">
              02
            </div>

            <h3>
              Score
            </h3>

            <p>
              Drift, anomalies and sensor consistency
              contribute to the station health score.
            </p>

          </div>


          {/* STEP 3 */}

          <div className="sg-pipeline-step">

            <div className="sg-pipeline-number">
              03
            </div>

            <h3>
              Forecast
            </h3>

            <p>
              SkyGuard estimates the remaining time
              before maintenance is required.
            </p>

          </div>


          {/* STEP 4 */}

          <div className="sg-pipeline-step">

            <div className="sg-pipeline-number">
              04
            </div>

            <h3>
              Prioritize
            </h3>

            <p>
              Operators receive a prioritized
              maintenance queue and recommended action.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Maintenance;
