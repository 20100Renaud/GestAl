const selectClasses =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm " +
  "text-gray-900 focus:border-blue-500 focus:outline-none " +
  "focus:ring-2 focus:ring-blue-500";

export default function Select({
  label,
  required = false,
  children,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-semibold text-gray-700"
        >
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <select
        {...props}
        required={required}
        className={`${selectClasses} ${className}`}
      >
        {children}
      </select>
    </div>
  );
}
