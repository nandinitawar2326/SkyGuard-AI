import { useState } from "react";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

import Dashboard from "./pages/Dashboard";
import LiveData from "./pages/LiveData";
import Anomalies from "./pages/Anomalies";
import Sensors from "./pages/Sensors";
import Maintenance from "./pages/Maintenance";
import "./App.css";

function App() {

  const [activePage, setActivePage] =
    useState("Dashboard");

  return (

    <div className="app-shell">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-area">

        <TopBar />

        <div className="page-content">

          {activePage === "Dashboard" && (
            <Dashboard />
          )}

          {activePage === "Maintenance" && <Maintenance />}

          {activePage === "Live Data" && (
            <LiveData />
          )}

          {activePage === "Anomalies" && (
            <Anomalies />
          )}

          {activePage === "Sensors" && (
            <Sensors />
          )}

        </div>

      </main>

    </div>

  );
}

export default App;