import {
  Bell,
  Search,
  Wifi,
} from "lucide-react";

function TopBar() {
  return (
    <header className="topbar">

      <div className="topbar-left">

        <div className="breadcrumb">
          Monitoring
          <span>/</span>
          <strong>Overview</strong>
        </div>

      </div>


      <div className="topbar-right">

        <div className="network-status">

          <Wifi size={16} />

          <span>
            AWS NETWORK
          </span>

          <div className="online-dot"></div>

          <strong>ONLINE</strong>

        </div>


        <button className="icon-button">
          <Search size={19} />
        </button>


        <button className="icon-button notification">
          <Bell size={19} />

          <span className="notification-dot"></span>
        </button>


        <div className="user-profile">

          <div className="avatar">
            SG
          </div>

          <div className="user-info">
            <strong>SkyGuard AI</strong>
            <span>Control Center</span>
          </div>

        </div>

      </div>

    </header>
  );
}

export default TopBar;