function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}) {
  return (
    <div className={`stat-card ${variant}`}>

      <div className="stat-top">

        <span className="stat-title">
          {title}
        </span>

        <div className="stat-icon">
          <Icon size={20} />
        </div>

      </div>


      <div className="stat-value">
        {value}
      </div>


      <div className="stat-subtitle">
        {subtitle}
      </div>

    </div>
  );
}

export default StatCard;