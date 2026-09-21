export default function Card({ title, children, className = "" }) {
  return (
    <section
      className={[
        "rounded-lg",
        "border border-gray-200",
        "bg-white",
        "p-6 my-6",
        "shadow-sm",
        className,
      ].join(" ")}
    >
      {title && (
        <h2 className="mb-5 text-lg font-semibold text-gray-900">{title}</h2>
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
    <div className={`p-6 bg-white border border-gray-200 rounded-lg ${className}`}>
      <span className="block text-gray-500 text-sm">{title}</span>
      <strong className="block mt-3 text-2xl">{value}</strong>
      {subtitle && (
        <span className="block text-gray-400 text-xs mt-1">{subtitle}</span>
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