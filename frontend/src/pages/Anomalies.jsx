import { useEffect, useState } from "react";
import axios from "axios";
import {
  TriangleAlert,
  ShieldAlert,
  CloudLightning,
  Search,
  RefreshCw,
} from "lucide-react";

const API_URL = "https://skyguard-ai-api.vercel.app";

function Anomalies() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/alerts`
      );

      const data = response.data;

      const rows = Array.isArray(data)
        ? data
        : data.alerts || [];

      setAlerts(rows);
    } catch (error) {
      console.error("Failed to load anomaly alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(
      fetchAlerts,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter(
          (alert) =>
            alert.event_classification === filter
        );

  const getSeverity = (alert) => {
    const confidence = Number(
      alert.event_confidence || 0
    );

    if (confidence >= 80) return "Critical";
    if (confidence >= 65) return "High";
    if (confidence >= 50) return "Medium";

    return "Low";
  };

  const getSeverityClass = (severity) => {
    return severity.toLowerCase();
  };

  const weatherEvents = alerts.filter(
    (a) =>
      a.event_classification ===
      "Possible Weather Event"
  ).length;

  const sensorFaults = alerts.filter(
    (a) =>
      a.event_classification ===
      "Probable Sensor Fault"
  ).length;

  const investigations = alerts.filter(
    (a) =>
      a.event_classification ===
      "Needs Investigation"
  ).length;

  return (
    <div className="dashboard">

      {/* HEADER */}

      <section className="dashboard-header">

        <div>

          <div className="eyebrow">
            <span></span>
            AI ANOMALY INTELLIGENCE
          </div>

          <h2>
            Anomaly Detection
          </h2>

          <p>
            AI-powered detection and root-cause
            analysis across the AWS network.
          </p>

        </div>

        <div className="live-badge">
          <div className="pulse"></div>
          AI ENGINE ACTIVE
        </div>

      </section>


      {/* SUMMARY */}

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            <TriangleAlert size={20} />
          </div>

          <div>

            <span className="stat-label">
              TOTAL ANOMALIES
            </span>

            <strong>
              {alerts.length}
            </strong>

            <small>
              AI detected
            </small>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <ShieldAlert size={20} />
          </div>

          <div>

            <span className="stat-label">
              SENSOR FAULTS
            </span>

            <strong>
              {sensorFaults}
            </strong>

            <small>
              Probable faults
            </small>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <CloudLightning size={20} />
          </div>

          <div>

            <span className="stat-label">
              WEATHER EVENTS
            </span>

            <strong>
              {weatherEvents}
            </strong>

            <small>
              Network-wide patterns
            </small>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <Search size={20} />
          </div>

          <div>

            <span className="stat-label">
              INVESTIGATIONS
            </span>

            <strong>
              {investigations}
            </strong>

            <small>
              Needs investigation
            </small>

          </div>

        </div>

      </section>


      {/* FILTER */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              INTELLIGENT ALERTS
            </span>

            <h3>
              Root Cause Detection
            </h3>

          </div>

          <button
            className="refresh-button"
            onClick={fetchAlerts}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

        </div>


        <div className="anomaly-filters">

          <button
            className={
              filter === "All"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setFilter("All")}
          >
            All
          </button>


          <button
            className={
              filter ===
              "Probable Sensor Fault"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("Probable Sensor Fault")
            }
          >
            Sensor Faults
          </button>


          <button
            className={
              filter ===
              "Possible Weather Event"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("Possible Weather Event")
            }
          >
            Weather Events
          </button>


          <button
            className={
              filter ===
              "Needs Investigation"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setFilter("Needs Investigation")
            }
          >
            Investigation
          </button>

        </div>


        {/* ALERT TABLE */}

        <div className="table-wrapper">

          <table className="data-table">

            <thead>

              <tr>
                <th>TIME</th>
                <th>STATION</th>
                <th>CLASSIFICATION</th>
                <th>ROOT CAUSE</th>
                <th>VARIABLE</th>
                <th>CONFIDENCE</th>
                <th>SEVERITY</th>
              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="7">
                    Running AI anomaly engine...
                  </td>
                </tr>

              ) : filteredAlerts.length === 0 ? (

                <tr>
                  <td colSpan="7">
                    No anomaly records found.
                  </td>
                </tr>

              ) : (

                filteredAlerts.map(
                  (alert, index) => {

                    const severity =
                      getSeverity(alert);

                    return (

                      <tr key={index}>

                        <td>
                          {alert.timestamp}
                        </td>

                        <td>
                          <strong>
                            {alert.station_id}
                          </strong>
                        </td>

                        <td>

                          <span
                            className={
                              `classification-badge ${
                                alert.event_classification
                                  ?.toLowerCase()
                                  .replaceAll(" ", "-")
                              }`
                            }
                          >
                            {
                              alert.event_classification
                            }
                          </span>

                        </td>

                        <td>
                          {
                            alert.spatial_root_cause ||
                            "—"
                          }
                        </td>

                        <td>
                          {
                            alert.primary_variable ||
                            "—"
                          }
                        </td>

                        <td>

                          <div className="confidence">

                            <div className="confidence-bar">

                              <div
                                style={{
                                  width: `${Math.min(
                                    Number(
                                      alert.event_confidence ||
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <span>
                              {
                                alert.event_confidence ??
                                0
                              }%
                            </span>

                          </div>

                        </td>

                        <td>

                          <span
                            className={
                              `severity-badge ${getSeverityClass(
                                severity
                              )}`
                            }
                          >
                            {severity}
                          </span>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* AI EXPLANATION */}

      <section className="panel explanation-panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              EXPLAINABLE AI
            </span>

            <h3>
              How SkyGuard Explains Anomalies
            </h3>

          </div>

          <ShieldAlert size={20} />

        </div>


        <div className="explanation-flow">

          <div className="explanation-step">

            <span>01</span>

            <strong>
              Detect
            </strong>

            <p>
              Statistical, temporal and
              machine-learning detectors identify
              unusual sensor behavior.
            </p>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="explanation-step">

            <span>02</span>

            <strong>
              Compare
            </strong>

            <p>
              SkyGuard compares the station with
              nearby AWS stations and historical
              patterns.
            </p>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="explanation-step">

            <span>03</span>

            <strong>
              Explain
            </strong>

            <p>
              The system identifies the likely
              root cause and confidence level.
            </p>

          </div>


          <div className="flow-arrow">
            →
          </div>


          <div className="explanation-step">

            <span>04</span>

            <strong>
              Act
            </strong>

            <p>
              The alert can trigger investigation,
              correction or predictive maintenance.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Anomalies;
