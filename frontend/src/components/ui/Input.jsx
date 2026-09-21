const inputClasses =
  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm " +
  "text-gray-900 placeholder:text-gray-400 shadow " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Input({
  label,
  required = false,
  error,
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

      <input
        {...props}
        required={required}
        className={`${inputClasses} ${className}`}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
