const inputClasses =
  "w-full rounded-md border border-blue-300 px-3 py-2.5 text-sm " +
  "text-blue-900 placeholder:text-blue-400 shadow " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500";

const checkboxClasses =
  "my-auto peer appearance-none h-4 w-4 " +
  "border border-blue-300 rounded " +
  "checked:bg-blue-500 checked:border-blue-500 " +
  "transition-colors cursor-pointer shadow";

export default function Input({
  label,
  required = false,
  error,
  className = "",
  type = "text",
  ...props
}) {
  if (type === "checkbox") {
    return (
      <label className="flex items-center gap-2">
        <span className="relative">
          <input
            {...props}
            type="checkbox"
            required={required}
            className={`${checkboxClasses} ${className}`}
          />

          <span className="pointer-events-none absolute inset-0 flex justify-center mt-0.5 text-xs font-bold text-white">
            ✓
          </span>
        </span>

        {label && (
          <span className="text-sm font-semibold text-blue-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </span>
        )}
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-semibold text-blue-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <input
        {...props}
        type={type}
        required={required}
        className={`${inputClasses} ${className}`}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
