export default function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse bg-white text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr
      className={[
        "border-b border-gray-200",
        "transition-colors hover:bg-gray-50",
        className,
      ].join(" ")}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <th
      className={[
        "px-4 py-3",
        "text-left text-xs font-semibold uppercase tracking-wide",
        "text-gray-600",
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={["px-4 py-3", "text-gray-700", className].join(" ")}>
      {children}
    </td>
  );
}
