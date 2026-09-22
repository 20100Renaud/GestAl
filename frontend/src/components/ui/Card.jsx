export default function Card({ title, children, className = "" }) {
  return (
    <section
      className={``}
    >
      {title && (
        <h2 className="m-5 font-semibold text-blue-900">{title}</h2>
      )}

      {children}
    </section>
  );
}

export function CardDashboard({
  title,
  value = "—",
  subtitle,
  className = "",
}) {
  return (
    <div
      className={`p-6 bg-white border border-blue-200 rounded-lg ${className}`}
    >
      <span className="block text-blue-900 text-sm">{title}</span>
      <strong className="block mt-3 text-2xl text-blue-900">{value}</strong>
      {subtitle && (
        <span className="block text-blue-400 text-xs mt-1">{subtitle}</span>
      )}
    </div>
  );
}


export function DashboardCards({ children }) {
  return (
    <div className="grid grid-cols-4 gap-5 mt-8">
      {children}
    </div>
  );
}