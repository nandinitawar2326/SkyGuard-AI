import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  Thermometer,
  Gauge,
  Droplets,
  RefreshCw,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

function LiveData() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReadings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/recent-readings`
      );

      const data = response.data;

      // Handles either:
      // { readings: [...] }
      // or directly [...]
      const rows = Array.isArray(data)
        ? data
        : data.readings || [];

      setReadings(rows);
    } catch (error) {
      console.error("Failed to load readings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();

    const interval = setInterval(
      fetchReadings,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const chartData = readings
    .slice()
    .reverse()
    .map((row, index) => ({
      index,
      temperature: Number(row.temperature),
      pressure: Number(row.pressure),
      humidity: Number(row.humidity),
    }));

  const latest = readings[0] || {};

  return (
    <div className="dashboard">

      {/* HEADER */}

      <section className="dashboard-header">

        <div>
          <div className="eyebrow">
            <span></span>
            REAL-TIME SENSOR TELEMETRY
          </div>

          <h2>
            Live Data
          </h2>

          <p>
            Monitor incoming Automatic Weather Station
            observations across the SkyGuard network.
          </p>
        </div>

        <div className="live-badge">
          <div className="pulse"></div>
          LIVE DATA
        </div>

      </section>


      {/* CURRENT VALUES */}

      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            <Thermometer size={20} />
          </div>

          <div>
            <span className="stat-label">
              TEMPERATURE
            </span>

            <strong>
              {latest.temperature ?? "--"} °C
            </strong>

            <small>
              Latest reading
            </small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            <Gauge size={20} />
          </div>

          <div>
            <span className="stat-label">
              PRESSURE
            </span>

            <strong>
              {latest.pressure ?? "--"} hPa
            </strong>

            <small>
              Latest reading
            </small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            <Droplets size={20} />
          </div>

          <div>
            <span className="stat-label">
              HUMIDITY
            </span>

            <strong>
              {latest.humidity ?? "--"} %
            </strong>

            <small>
              Latest reading
            </small>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <span className="stat-label">
              READINGS
            </span>

            <strong>
              {readings.length}
            </strong>

            <small>
              Recent observations
            </small>
          </div>
        </div>

      </section>


      {/* CHARTS */}

      <section className="dashboard-grid">

        <div className="panel chart-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                TEMPERATURE
              </span>

              <h3>
                Temperature Trend
              </h3>
            </div>

            <Thermometer size={20} />

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="index"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>


        <div className="panel chart-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                HUMIDITY
              </span>

              <h3>
                Humidity Trend
              </h3>
            </div>

            <Droplets size={20} />

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="index"
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </section>


      {/* READINGS TABLE */}

      <section className="panel">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              SENSOR TELEMETRY
            </span>

            <h3>
              Recent AWS Readings
            </h3>
          </div>

          <button
            className="refresh-button"
            onClick={fetchReadings}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

        </div>


        <div className="table-wrapper">

          <table className="data-table">

            <thead>

              <tr>
                <th>Timestamp</th>
                <th>Station</th>
                <th>Temperature</th>
                <th>Pressure</th>
                <th>Humidity</th>
              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="5">
                    Loading sensor readings...
                  </td>
                </tr>

              ) : readings.length === 0 ? (

                <tr>
                  <td colSpan="5">
                    No readings available.
                  </td>
                </tr>

              ) : (

                readings.map((row, index) => (

                  <tr key={index}>

                    <td>
                      {row.timestamp}
                    </td>

                    <td>
                      <strong>
                        {row.station_id}
                      </strong>
                    </td>

                    <td>
                      {row.temperature} °C
                    </td>

                    <td>
                      {row.pressure} hPa
                    </td>

                    <td>
                      {row.humidity} %
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default LiveData;