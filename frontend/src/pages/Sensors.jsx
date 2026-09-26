
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  ShieldCheck,
  Wrench,
  Clock3,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import SensorChart from "../components/SensorChart";

const API_URL = "http://127.0.0.1:8000";

function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStation, setSelectedStation] =
    useState("AWS_003");

  const [readings, setReadings] = useState([]);
  const [readingsLoading, setReadingsLoading] =
    useState(false);

  const fetchSensorHealth = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/sensor-health`
      );

      console.log("Sensor Health:", response.data);

      /*
       * API returns the station health data directly as an array:
       *
       * [
       *   {
       *     station_id: "AWS_003",
       *     health_score: 65.57,
       *     ...
       *   }
       * ]
       *
       * So we use response.data directly.
       *
       * The extra checks below make the frontend safe in case
       * the backend later returns { stations: [...] }.
       */

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.stations)
        ? response.data.stations
        : [];

      setSensors(data);

      if (
        data.length > 0 &&
        !data.some(
          (sensor) =>
            sensor.station_id === selectedStation
        )
      ) {
        setSelectedStation(
          data[0].station_id
        );
      }
    } catch (error) {
      console.error(
        "Failed to load sensor health:",
        error
      );

      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadings = async (stationId) => {
    if (!stationId) return;

    try {
      setReadingsLoading(true);

      const response = await axios.get(
        `${API_URL}/api/recent-readings`,
        {
          params: {
            station_id: stationId,
            limit: 30,
          },
        }
      );

      const data = Array.isArray(
        response.data?.readings
      )
        ? response.data.readings
        : [];

      /*
       * Backend sends newest readings first.
       * Reverse them so the chart moves
       * from older -> newer readings.
       */
      setReadings([...data].reverse());
    } catch (error) {
      console.error(
        "Failed to load sensor readings:",
        error
      );

      setReadings([]);
    } finally {
      setReadingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorHealth();

    const interval = setInterval(
      fetchSensorHealth,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchReadings(selectedStation);
  }, [selectedStation]);

  const getStatusClass = (status) => {
    if (status === "Healthy") return "healthy";
    if (status === "Watch") return "watch";
    if (status === "Plan Maintenance") {
      return "maintenance";
    }

    return "urgent";
  };

  const getPriorityClass = (priority) => {
    if (priority === "HIGH") return "high";
    if (priority === "MEDIUM") return "medium";
    if (priority === "URGENT") return "urgent";

    return "low";
  };

  const averageHealth =
    sensors.length > 0
      ? (
          sensors.reduce(
            (sum, sensor) =>
              sum + Number(sensor.health_score || 0),
            0
          ) / sensors.length
        ).toFixed(1)
      : "—";

  const maintenanceCount = sensors.filter(
    (sensor) =>
      sensor.health_status ===
      "Plan Maintenance"
  ).length;

  const watchCount = sensors.filter(
    (sensor) =>
      sensor.health_status === "Watch"
  ).length;

  const urgentCount = sensors.filter(
    (sensor) =>
      sensor.health_status === "Urgent"
  ).length;

  /*
   * ----------------------------------------------------------
   * SENSOR CHART DATA
   * ----------------------------------------------------------
   */

  const getValue = (reading, keys) => {
    for (const key of keys) {
      if (
        reading?.[key] !== undefined &&
        reading?.[key] !== null &&
        reading?.[key] !== ""
      ) {
        const value = Number(reading[key]);

        if (Number.isFinite(value)) {
          return value;
        }
      }
    }

    return null;
  };

  const temperatureData = readings
    .map((reading) =>
      getValue(reading, [
        "temperature",
        "Temperature",
        "temp",
        "temp_c",
      ])
    )
    .filter(
      (value) => value !== null
    );

  const pressureData = readings
    .map((reading) =>
      getValue(reading, [
        "pressure",
        "Pressure",
        "pressure_hpa",
      ])
    )
    .filter(
      (value) => value !== null
    );

  const humidityData = readings
    .map((reading) =>
      getValue(reading, [
        "humidity",
        "Humidity",
        "relative_humidity",
        "humidity_percent",
      ])
    )
    .filter(
      (value) => value !== null
    );

  const latestReading =
    readings.length > 0
      ? readings[readings.length - 1]
      : null;

  const currentTemperature = getValue(
    latestReading,
    [
      "temperature",
      "Temperature",
      "temp",
      "temp_c",
    ]
  );

  const currentPressure = getValue(
    latestReading,
    [
      "pressure",
      "Pressure",
      "pressure_hpa",
    ]
  );

  const currentHumidity = getValue(
    latestReading,
    [
      "humidity",
      "Humidity",
      "relative_humidity",
      "humidity_percent",
    ]
  );

  return (
    <div className="dashboard">

      {/* HEADER */}

      <section className="dashboard-header">

        <div>

          <div className="eyebrow">
            <span></span>
            SENSOR INTELLIGENCE
          </div>

          <h2>
            Sensor Health
          </h2>

          <p>
            Monitor AWS sensor reliability and
            predict upcoming maintenance requirements.
          </p>

        </div>

        <div className="live-badge">

          <div className="pulse"></div>

          PREDICTIVE ENGINE ACTIVE

        </div>

      </section>


      {/* SUMMARY CARDS */}

      <section className="stats-grid">

        {/* NETWORK HEALTH */}

        <div className="stat-card">

          <div className="stat-icon">
            <Activity size={20} />
          </div>

          <div>

            <span className="stat-label">
              NETWORK HEALTH
            </span>

            <strong>
              {averageHealth}
              <small> / 100</small>
            </strong>

            <small>
              Average sensor health
            </small>

          </div>

        </div>


        {/* MAINTENANCE */}

        <div className="stat-card">

          <div className="stat-icon">
            <Wrench size={20} />
          </div>

          <div>

            <span className="stat-label">
              MAINTENANCE
            </span>

            <strong>
              {maintenanceCount}
            </strong>

            <small>
              Stations requiring planning
            </small>

          </div>

        </div>


        {/* WATCH */}

        <div className="stat-card">

          <div className="stat-icon">
            <Clock3 size={20} />
          </div>

          <div>

            <span className="stat-label">
              WATCH
            </span>

            <strong>
              {watchCount}
            </strong>

            <small>
              Stations under observation
            </small>

          </div>

        </div>


        {/* URGENT */}

        <div className="stat-card">

          <div className="stat-icon">
            <AlertTriangle size={20} />
          </div>

          <div>

            <span className="stat-label">
              URGENT
            </span>

            <strong>
              {urgentCount}
            </strong>

            <small>
              Immediate attention
            </small>

          </div>

        </div>

      </section>


      {/* SENSOR NETWORK */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              AWS NETWORK
            </span>

            <h3>
              Sensor Health Monitor
            </h3>

          </div>

          <button
            className="refresh-button"
            onClick={fetchSensorHealth}
            disabled={loading}
          >

            <RefreshCw
              size={15}
              className={
                loading ? "spin" : ""
              }
            />

            Refresh

          </button>

        </div>


        {loading ? (

          <div className="loading-state">

            <RefreshCw
              className="spin"
              size={22}
            />

            Calculating sensor health...

          </div>

        ) : sensors.length === 0 ? (

          <div className="loading-state">

            <AlertTriangle size={20} />

            No sensor health data available.

          </div>

        ) : (

          <div className="sensor-grid">

            {sensors.map((sensor) => {

              const score = Number(
                sensor.health_score || 0
              );

              return (

                <div
                  className="sensor-card"
                  key={sensor.station_id}
                >

                  {/* HEADER */}

                  <div className="sensor-card-header">

                    <div>

                      <span className="sensor-id">
                        {sensor.station_id}
                      </span>

                      <span
                        className={`sensor-status ${getStatusClass(
                          sensor.health_status
                        )}`}
                      >
                        {sensor.health_status}
                      </span>

                    </div>

                    <Activity size={18} />

                  </div>


                  {/* HEALTH SCORE */}

                  <div className="health-score-section">

                    <div className="health-score">

                      <strong>
                        {score.toFixed(1)}
                      </strong>

                      <span>
                        /100
                      </span>

                    </div>

                    <span className="health-label">
                      SENSOR HEALTH
                    </span>

                  </div>


                  {/* HEALTH BAR */}

                  <div className="health-progress">

                    <div
                      style={{
                        width: `${Math.min(
                          Math.max(score, 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>


                  {/* METRICS */}

                  <div className="sensor-metrics">

                    <div>

                      <span>
                        ANOMALY RATE
                      </span>

                      <strong>
                        {Number(
                          sensor.anomaly_rate || 0
                        ).toFixed(2)}
                        %
                      </strong>

                    </div>


                    <div>

                      <span>
                        MAINTENANCE
                      </span>

                      <strong>
                        {
                          sensor.estimated_days_to_maintenance ??
                          "—"
                        }{" "}
                        days
                      </strong>

                    </div>

                  </div>


                  {/* PRIORITY */}

                  <div className="maintenance-row">

                    <span>
                      PRIORITY
                    </span>

                    <span
                      className={`priority-badge ${getPriorityClass(
                        sensor.maintenance_priority
                      )}`}
                    >
                      {
                        sensor.maintenance_priority ||
                        "LOW"
                      }
                    </span>

                  </div>


                  {/* RECOMMENDATION */}

                  <div className="recommendation">

                    <Wrench size={14} />

                    <span>
                      {
                        sensor.recommended_action ||
                        "Continue monitoring sensor"
                      }
                    </span>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </section>


      {/* LIVE SENSOR DATA */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              LIVE SENSOR DATA
            </span>

            <h3>
              Sensor Trends
            </h3>

            <p>
              Historical sensor readings from
              the selected AWS station.
            </p>

          </div>

          <select
            value={selectedStation}
            onChange={(event) =>
              setSelectedStation(
                event.target.value
              )
            }
          >

            {sensors.map((sensor) => (

              <option
                key={sensor.station_id}
                value={sensor.station_id}
              >
                {sensor.station_id}
              </option>

            ))}

          </select>

        </div>


        {readingsLoading ? (

          <div className="loading-state">

            <RefreshCw
              className="spin"
              size={22}
            />

            Loading sensor trends...

          </div>

        ) : (

          <>

            <div className="sensor-chart-current-grid">

              <div className="stat-card">

                <div className="stat-icon">
                  <Activity size={20} />
                </div>

                <div>

                  <span className="stat-label">
                    TEMPERATURE
                  </span>

                  <strong>
                    {Number.isFinite(
                      currentTemperature
                    )
                      ? currentTemperature.toFixed(1)
                      : "—"}
                    {Number.isFinite(
                      currentTemperature
                    ) && "°C"}
                  </strong>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">
                  <Activity size={20} />
                </div>

                <div>

                  <span className="stat-label">
                    PRESSURE
                  </span>

                  <strong>
                    {Number.isFinite(
                      currentPressure
                    )
                      ? currentPressure.toFixed(1)
                      : "—"}
                    {Number.isFinite(
                      currentPressure
                    ) && " hPa"}
                  </strong>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">
                  <Activity size={20} />
                </div>

                <div>

                  <span className="stat-label">
                    HUMIDITY
                  </span>

                  <strong>
                    {Number.isFinite(
                      currentHumidity
                    )
                      ? currentHumidity.toFixed(1)
                      : "—"}
                    {Number.isFinite(
                      currentHumidity
                    ) && "%"}
                  </strong>

                </div>

              </div>

            </div>


            <div className="sensor-chart-grid">

              <SensorChart
                title="LIVE SENSOR TREND"
                sensor="Temperature"
                value={
                  Number.isFinite(
                    currentTemperature
                  )
                    ? currentTemperature
                    : 0
                }
                unit="°C"
                data={
                  temperatureData.length > 0
                    ? temperatureData
                    : [0]
                }
              />


              <SensorChart
                title="LIVE SENSOR TREND"
                sensor="Pressure"
                value={
                  Number.isFinite(
                    currentPressure
                  )
                    ? currentPressure
                    : 0
                }
                unit=" hPa"
                data={
                  pressureData.length > 0
                    ? pressureData
                    : [0]
                }
              />


              <SensorChart
                title="LIVE SENSOR TREND"
                sensor="Humidity"
                value={
                  Number.isFinite(
                    currentHumidity
                  )
                    ? currentHumidity
                    : 0
                }
                unit="%"
                data={
                  humidityData.length > 0
                    ? humidityData
                    : [0]
                }
              />

            </div>

          </>

        )}

      </section>


      {/* PREDICTIVE MAINTENANCE */}

      <section className="panel predictive-panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              PREDICTIVE MAINTENANCE
            </span>

            <h3>
              AI Maintenance Forecast
            </h3>

          </div>

          <ShieldCheck size={20} />

        </div>


        <div className="prediction-flow">

          <div className="prediction-step">

            <div className="prediction-number">
              01
            </div>

            <strong>
              Monitor
            </strong>

            <p>
              SkyGuard continuously evaluates
              anomaly rate, drift and sensor
              consistency.
            </p>

          </div>


          <div className="prediction-arrow">
            →
          </div>


          <div className="prediction-step">

            <div className="prediction-number">
              02
            </div>

            <strong>
              Calculate Health
            </strong>

            <p>
              Every AWS station receives a
              dynamic 0–100 health score.
            </p>

          </div>


          <div className="prediction-arrow">
            →
          </div>


          <div className="prediction-step">

            <div className="prediction-number">
              03
            </div>

            <strong>
              Forecast Failure
            </strong>

            <p>
              The system estimates how many days
              remain before maintenance is required.
            </p>

          </div>


          <div className="prediction-arrow">
            →
          </div>


          <div className="prediction-step">

            <div className="prediction-number">
              04
            </div>

            <strong>
              Prioritize
            </strong>

            <p>
              Maintenance actions are prioritized
              automatically for operators.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Sensors;

