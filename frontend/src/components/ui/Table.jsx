export default function Table({ children, layout = "auto" }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-blue-200 border-t-6 shadow-sm">
      <table
        className={`w-full border-collapse bg-white text-sm ${
          layout === "fixed" ? "table-fixed" : "table-auto"
        }`}
      >
        {children}
      </table>
    </div>
  );
}

export function Vide({search}) {
  return (
    <div className="rounded-lg border border-blue-200 border-t-6 shadow-sm  text-blue-800 text-sm bg-blue-50 px-4 py-3">
      {search
        ? "Aucun résultat ne correspond à la recherche."
        : "Aucun enreristrement présent."}
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="bg-blue-50">{children}</thead>;
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr
      className="border-b border-blue-200 transition-colors hover:bg-blue-50 cursor-pointer"
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-blue-900 text-center ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-2 md:px-4 py-2 md:py-3 text-blue-900 text-center ${className}`}>
      {children}
    </td>
  );
}
