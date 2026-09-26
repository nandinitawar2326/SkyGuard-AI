import {
  LayoutDashboard,
  Activity,
  TriangleAlert,
  Radio,
  Wrench,
  CloudSun,
  ShieldCheck,
} from "lucide-react";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Live Data",
      icon: Activity,
    },
    {
      name: "Anomalies",
      icon: TriangleAlert,
    },
    {
      name: "Sensors",
      icon: Radio,
    },
    {
      name: "Maintenance",
      icon: Wrench,
    },
  ];

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          <ShieldCheck size={24} />
        </div>

        <div>
          <h1>SkyGuard</h1>
          <span>AI INTELLIGENCE</span>
        </div>

      </div>


      <div className="nav-section">

        <p className="nav-label">
          MONITORING
        </p>

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(item.name)
              }
            >
              <Icon size={19} />

              <span>
                {item.name}
              </span>
            </button>
          );

        })}

      </div>


      <div className="sidebar-bottom">

        <div className="weather-mini">

          <CloudSun size={20} />

          <div>
            <strong>Delhi NCR</strong>
            <span>Weather Intelligence</span>
          </div>

        </div>


        <div className="system-status">

          <span className="status-dot"></span>

          <div>
            <strong>System Online</strong>
            <span>AI Engine Active</span>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;