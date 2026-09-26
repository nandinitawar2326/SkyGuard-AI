
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Radio,
  Database,
  TriangleAlert,
  WandSparkles,
  Activity,
  ShieldCheck,
} from "lucide-react";

import StatCard from "../components/StatCard";
import StationCard from "../components/StationCard";
import AlertCard from "../components/AlertCard";
import MaintenanceCard from "../components/MaintenanceCard";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/summary`);

        setSummary(response.data);
        setApiError(false);
      } catch (error) {
        console.error(
          "Failed to connect to SkyGuard API:",
          error
        );

        setApiError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();

    const interval = setInterval(fetchSummary, 30000);

    return () => clearInterval(interval);
  }, []);

  const data = summary || {
    stations: 0,
    total_readings: 0,
    anomalies: 0,
    sensor_faults: 0,
    weather_events: 0,
    investigations: 0,
    ai_imputed: 0,
    average_sensor_health: 0,
  };

  const stations = [
    {
      stationId: "AWS_001",
      location: "Delhi NCR",
      status: "Online",
      temperature: 28.4,
      pressure: 1012.6,
      humidity: 64.2,
      health: 87.5,
    },
    {
      stationId: "AWS_002",
      location: "Delhi NCR",
      status: "Online",
      temperature: 29.1,
      pressure: 1011.8,
      humidity: 62.8,
      health: 84.2,
    },
    {
      stationId: "AWS_003",
      location: "Delhi NCR",
      status: "Online",
      temperature: 30.2,
      pressure: 1009.4,
      humidity: 61.5,
      health: 65.6,
    },
    {
      stationId: "AWS_004",
      location: "Delhi NCR",
      status: "Online",
      temperature: 29.7,
      pressure: 1010.2,
      humidity: 63.4,
      health: 66.1,
    },
    {
      stationId: "AWS_005",
      location: "Delhi NCR",
      status: "Online",
      temperature: 28.9,
      pressure: 1011.1,
      humidity: 65.1,
      health: 77.5,
    },
  ];

  return (
    <div className="dashboard">

      {/* =====================================================
          DASHBOARD-SPECIFIC STYLES
          These styles only affect Dashboard.
      ====================================================== */}

      <style>
        {`

        /* =====================================================
           STATION OVERVIEW
        ====================================================== */

        .dashboard-station-overview {
          margin-bottom: 18px;
          background: #0b1720;
          border: 1px solid #1b3340;
          border-radius: 13px;
          overflow: hidden;
        }

        .dashboard-station-overview-header {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid #172d37;
        }

        .dashboard-station-overview-header .station-kicker {
          display: block;
          margin-bottom: 6px;
          color: #3dbfc8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .dashboard-station-overview-header h3 {
          margin: 0;
          color: #edf5f7;
          font-size: 16px;
          font-weight: 700;
        }

        .dashboard-station-count {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #1d4b55;
          background: #0d252d;
          color: #5ed9dc;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .dashboard-station-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          padding: 16px;
        }

        /* =====================================================
           STATION CARD RESET
        ====================================================== */

        .dashboard-station-grid .station-card {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 16px;
          background: #0d1c26;
          border: 1px solid #1c3744;
          border-radius: 11px;
          color: #edf5f7;
          overflow: hidden;
        }

        .dashboard-station-grid .station-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .dashboard-station-grid .station-label {
          display: block;
          margin-bottom: 5px;
          color: #4c9aa3;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .dashboard-station-grid .station-card h3 {
          margin: 0;
          color: #f0f6f8;
          font-size: 17px;
          font-weight: 750;
        }

        .dashboard-station-grid .station-card p {
          margin: 5px 0 0;
          color: #718b97;
          font-size: 9px;
        }

        .dashboard-station-grid .station-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 7px;
          border-radius: 5px;
          background: #102a25;
          color: #55d6a0;
          font-size: 8px;
          font-weight: 800;
        }

        .dashboard-station-grid .station-status .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #55d6a0;
          box-shadow: 0 0 7px rgba(85, 214, 160, 0.7);
        }

        .dashboard-station-grid .station-health {
          margin-bottom: 14px;
        }

        .dashboard-station-grid .health-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .dashboard-station-grid .health-header span {
          color: #698692;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .dashboard-station-grid .health-header strong {
          color: #edf5f7;
          font-size: 12px;
        }

        .dashboard-station-grid .health-bar {
          width: 100%;
          height: 5px;
          overflow: hidden;
          border-radius: 10px;
          background: #172d37;
        }

        .dashboard-station-grid .health-bar-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #38bfc1,
            #55d6a0
          );
        }

        .dashboard-station-grid .station-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .dashboard-station-grid .station-metric {
          min-width: 0;
          padding: 9px 7px;
          border: 1px solid #19323e;
          border-radius: 7px;
          background: #0a1720;
        }

        .dashboard-station-grid .station-metric span {
          display: block;
          margin-bottom: 5px;
          color: #5e7a86;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.7px;
        }

        .dashboard-station-grid .station-metric strong {
          display: block;
          color: #eaf2f4;
          font-size: 10px;
          white-space: nowrap;
        }

        /* =====================================================
           HEALTH SECTION
        ====================================================== */

        .dashboard-health-summary {
          padding: 20px;
        }

        .dashboard-health-main {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 5px 0 20px;
        }

        .dashboard-health-ring {
          width: 118px;
          height: 118px;
          min-width: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background:
            conic-gradient(
              #4fd2c8
              0deg
              calc(var(--health) * 3.6deg),
              #19313a
              calc(var(--health) * 3.6deg)
              360deg
            );
        }

        .dashboard-health-ring-inner {
          width: 92px;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border-radius: 50%;
          background: #0b1720;
        }

        .dashboard-health-ring-inner strong {
          color: #f1f6f8;
          font-size: 25px;
          font-weight: 600;
          line-height: 1;
        }

        .dashboard-health-ring-inner span {
          margin-top: 5px;
          color: #607c88;
          font-size: 8px;
        }

        .dashboard-health-info {
          min-width: 0;
        }

        .dashboard-health-info h4 {
          margin: 0;
          color: #edf5f7;
          font-size: 16px;
        }

        .dashboard-health-info p {
          margin: 7px 0 0;
          color: #708995;
          font-size: 10px;
          line-height: 1.5;
        }

        .dashboard-health-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          color: #d8ad68;
          font-size: 8px;
        }

        .dashboard-health-status span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d8ad68;
        }

        .dashboard-health-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid #172d37;
          border-bottom: 1px solid #172d37;
        }

        .dashboard-health-stat {
          padding: 14px 8px;
          text-align: center;
          border-right: 1px solid #172d37;
        }

        .dashboard-health-stat:last-child {
          border-right: 0;
        }

        .dashboard-health-stat span {
          display: block;
          color: #66828d;
          font-size: 7px;
          line-height: 1.4;
        }

        .dashboard-health-stat strong {
          display: block;
          margin-top: 5px;
          color: #edf5f7;
          font-size: 16px;
        }

        .dashboard-health-monitor {
          padding-top: 18px;
        }

        .dashboard-health-monitor-label {
          color: #3dbfc8;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .dashboard-health-monitor h4 {
          margin: 6px 0 0;
          color: #edf5f7;
          font-size: 14px;
        }

        .dashboard-health-monitor p {
          margin: 7px 0 0;
          color: #718995;
          font-size: 9px;
          line-height: 1.5;
        }

        .dashboard-health-progress {
          height: 5px;
          margin-top: 12px;
          overflow: hidden;
          border-radius: 10px;
          background: #172d37;
        }

        .dashboard-health-progress div {
          height: 100%;
          border-radius: inherit;
          background: #74aeb7;
        }

        .dashboard-health-scale {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          color: #58737e;
          font-size: 7px;
        }

        /* =====================================================
           AI DETECTION
        ====================================================== */

        .dashboard .detection-card {
          margin: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          border: 1px solid #493620;
          border-radius: 10px;
          background: #15150f;
        }

        .dashboard .detection-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #302417;
          color: #e8ad61;
        }

        .dashboard .detection-main {
          min-width: 0;
          flex: 1;
        }

        .dashboard .detection-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .dashboard .detection-title strong {
          color: #edf5f7;
          font-size: 12px;
        }

        .dashboard .detection-title span {
          color: #c99758;
          font-size: 8px;
        }

        .dashboard .detection-card p {
          margin: 8px 0 12px;
          color: #7e8e91;
          font-size: 9px;
          line-height: 1.55;
        }

        .dashboard .detection-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .dashboard .detection-meta span {
          color: #68808a;
          font-size: 8px;
        }

        .dashboard .detection-meta strong {
          color: #dcecef;
        }

        /* =====================================================
           ALERT COMPONENT CONTAINER
        ====================================================== */

        .dashboard-alert-wrapper {
          margin: 0 16px 16px;
        }

        .dashboard-alert-wrapper .alert-card {
          width: 100%;
          box-sizing: border-box;
        }

        /* =====================================================
           MAINTENANCE COMPONENT CONTAINER
        ====================================================== */

        .dashboard-maintenance-wrapper {
          padding: 0 16px 16px;
        }

        .dashboard-maintenance-wrapper .maintenance-card {
          width: 100%;
          box-sizing: border-box;
        }

        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1150px) {
          .dashboard-station-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .dashboard-station-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-health-main {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-health-ring {
            width: 105px;
            height: 105px;
            min-width: 105px;
          }

          .dashboard-health-ring-inner {
            width: 82px;
            height: 82px;
          }

          .dashboard-health-stats {
            grid-template-columns: 1fr;
          }

          .dashboard-health-stat {
            border-right: 0;
            border-bottom: 1px solid #172d37;
          }

          .dashboard-health-stat:last-child {
            border-bottom: 0;
          }
        }

        @media (max-width: 480px) {
          .dashboard-station-grid {
            padding: 12px;
          }

          .dashboard-station-overview-header {
            padding: 15px;
          }

          .dashboard-station-overview-header h3 {
            font-size: 14px;
          }

          .dashboard-station-count {
            display: none;
          }
        }

        `}
      </style>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="dashboard-header">
        <div>
          <div className="eyebrow">
            <span></span>
            AI WEATHER INTELLIGENCE PLATFORM
          </div>

          <h2>Network Overview</h2>

          <p>
            Real-time monitoring and intelligent anomaly detection
            for Automatic Weather Stations.
          </p>
        </div>

        <div className="live-badge">
          <div className="pulse"></div>

          {apiError
            ? "API OFFLINE"
            : "LIVE MONITORING"}
        </div>
      </section>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="loading-message">
          Connecting to SkyGuard AI engine...
        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <section className="stats-grid">

        <StatCard
          title="AWS STATIONS"
          value={data.stations}
          subtitle="Stations connected"
          icon={Radio}
        />

        <StatCard
          title="TOTAL READINGS"
          value={data.total_readings.toLocaleString()}
          subtitle="Sensor observations"
          icon={Database}
        />

        <StatCard
          title="ANOMALIES"
          value={data.anomalies}
          subtitle="AI detected events"
          icon={TriangleAlert}
          variant="warning"
        />

        <StatCard
          title="AI CORRECTIONS"
          value={data.ai_imputed}
          subtitle="Readings self-healed"
          icon={WandSparkles}
          variant="success"
        />

      </section>

      {/* =====================================================
          NETWORK + HEALTH
      ====================================================== */}

      <section className="dashboard-grid">

        {/* NETWORK */}

        <div className="panel network-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                NETWORK
              </span>

              <h3>
                AWS Station Network
              </h3>
            </div>

            <span className="panel-live">
              ● LIVE
            </span>

          </div>

          <div className="network-visual">

            <div className="network-grid"></div>

            <div className="station station-1">
              <div className="station-pulse"></div>
              <span>AWS-001</span>
            </div>

            <div className="station station-2">
              <div className="station-pulse"></div>
              <span>AWS-002</span>
            </div>

            <div className="station station-3 warning-station">
              <div className="station-pulse"></div>
              <span>AWS-003</span>
            </div>

            <div className="station station-4">
              <div className="station-pulse"></div>
              <span>AWS-004</span>
            </div>

            <div className="station station-5">
              <div className="station-pulse"></div>
              <span>AWS-005</span>
            </div>

            <div className="network-center">
              <ShieldCheck size={30} />
              <span>AI CORE</span>
            </div>

          </div>

        </div>

        {/* HEALTH */}

        <div className="panel health-overview">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                SYSTEM HEALTH
              </span>

              <h3>
                Sensor Network
              </h3>
            </div>

            <Activity size={20} />

          </div>

          <div className="dashboard-health-summary">

            <div className="dashboard-health-main">

              <div
                className="dashboard-health-ring"
                style={{
                  "--health": Number(
                    data.average_sensor_health
                  ),
                }}
              >

                <div className="dashboard-health-ring-inner">

                  <strong>
                    {Number(
                      data.average_sensor_health
                    ).toFixed(1)}
                  </strong>

                  <span>/ 100</span>

                </div>

              </div>

              <div className="dashboard-health-info">

                <h4>
                  Network Health
                </h4>

                <p>
                  Monitoring {data.stations} AWS
                  stations based on recent readings
                  and anomaly patterns.
                </p>

                <div className="dashboard-health-status">
                  <span></span>
                  Operational with alerts
                </div>

              </div>

            </div>

            <div className="dashboard-health-stats">

              <div className="dashboard-health-stat">

                <span>
                  Weather Events
                </span>

                <strong>
                  {data.weather_events}
                </strong>

              </div>

              <div className="dashboard-health-stat">

                <span>
                  Investigations
                </span>

                <strong>
                  {data.investigations}
                </strong>

              </div>

              <div className="dashboard-health-stat">

                <span>
                  Sensor Faults
                </span>

                <strong>
                  {data.sensor_faults}
                </strong>

              </div>

            </div>

            <div className="dashboard-health-monitor">

              <span className="dashboard-health-monitor-label">
                AI HEALTH MONITOR
              </span>

              <h4>
                Network Health
              </h4>

              <p>
                Overall health of {data.stations}
                AWS stations based on recent
                readings and anomaly patterns.
              </p>

              <div className="dashboard-health-progress">

                <div
                  style={{
                    width: `${Math.min(
                      Math.max(
                        Number(
                          data.average_sensor_health
                        ) || 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                ></div>

              </div>

              <div className="dashboard-health-scale">
                <span>0</span>
                <span>Sensor Health</span>
                <span>100</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          STATION OVERVIEW
      ====================================================== */}

      <section className="dashboard-station-overview">

        <div className="dashboard-station-overview-header">

          <div>

            <span className="station-kicker">
              AWS STATIONS
            </span>

            <h3>
              Station Status Overview
            </h3>

          </div>

          <div className="dashboard-station-count">
            {stations.length} STATIONS
          </div>

        </div>

        <div className="dashboard-station-grid">

          {stations.map((station) => (

            <StationCard
              key={station.stationId}
              stationId={station.stationId}
              location={station.location}
              status={station.status}
              temperature={station.temperature}
              pressure={station.pressure}
              humidity={station.humidity}
              health={station.health}
            />

          ))}

        </div>

      </section>

      {/* =====================================================
          AI INTELLIGENCE + MAINTENANCE
      ====================================================== */}

      <section className="bottom-grid">

        {/* AI INTELLIGENCE */}

        <div className="panel intelligence-panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                AI INTELLIGENCE
              </span>

              <h3>
                Detection Summary
              </h3>

            </div>

            <span className="alert-count">
              {data.anomalies} EVENTS
            </span>

          </div>

          <div className="detection-card">

            <div className="detection-icon">
              <TriangleAlert size={22} />
            </div>

            <div className="detection-main">

              <div className="detection-title">

                <strong>
                  SkyGuard AI
                </strong>

                <span>
                  Multi-model detection active
                </span>

              </div>

              <p>
                The AI engine is continuously
                analyzing AWS readings for
                anomalies, sensor faults,
                weather events and data
                inconsistencies.
              </p>

              <div className="detection-meta">

                <span>
                  Anomalies:{" "}
                  <strong>
                    {data.anomalies}
                  </strong>
                </span>

                <span>
                  Sensor Faults:{" "}
                  <strong>
                    {data.sensor_faults}
                  </strong>
                </span>

                <span>
                  AI Imputed:{" "}
                  <strong>
                    {data.ai_imputed}
                  </strong>
                </span>

              </div>

            </div>

          </div>

          <div className="dashboard-alert-wrapper">

            <AlertCard
              stationId="AWS_003"
              classification="Probable Sensor Fault"
              rootCause="Sensor Drift / Sudden Change"
              variable="Temperature"
              confidence={94}
              severity="High"
              timestamp="Live AI Detection"
            />

          </div>

        </div>

        {/* MAINTENANCE */}

        <div className="panel maintenance-panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                PREDICTIVE MAINTENANCE
              </span>

              <h3>
                Maintenance Overview
              </h3>

            </div>

            <WandSparkles size={20} />

          </div>

          <div className="maintenance-item">

            <div className="maintenance-station">
              AI
            </div>

            <div className="maintenance-info">

              <strong>
                {data.sensor_faults} sensor faults
              </strong>

              <span>
                Generated from anomaly analysis
              </span>

            </div>

            <div className="priority-high">
              CHECK
            </div>

          </div>

          <div className="maintenance-item">

            <div className="maintenance-station">
              AI
            </div>

            <div className="maintenance-info">

              <strong>
                {data.ai_imputed} readings corrected
              </strong>

              <span>
                Self-healing data engine
              </span>

            </div>

            <div className="priority-high">
              AI
            </div>

          </div>

          <div className="dashboard-maintenance-wrapper">

            <MaintenanceCard
              stationId="AWS_003"
              healthStatus="Plan Maintenance"
              healthScore={65.6}
              anomalyRate={3.83}
              estimatedDays={3}
              priority="HIGH"
              recommendedAction="Calibrate sensor and inspect drift"
            />

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;

