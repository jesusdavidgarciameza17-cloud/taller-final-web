export default function Card({ title, subtitle, image, badge, stats = [], children }) {
  return (
    <article className="card">
      {image && (
        <img
          className="card-img"
          src={image}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <div className="card-body">
        <div className="card-head">
          <h3>{title}</h3>
          {badge && <span className="badge">{badge}</span>}
        </div>
        {subtitle && <p className="card-sub">{subtitle}</p>}
        {stats.length > 0 && (
          <ul className="stats">
            {stats.map((s) => (
              <li key={s.label}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </article>
  )
}