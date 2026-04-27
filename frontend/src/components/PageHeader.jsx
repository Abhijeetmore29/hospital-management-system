export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">Hospital Module</p>
        <h2>{title}</h2>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

