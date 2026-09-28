import {
  fieldClasses,
  fieldLabelClasses,
  fieldWrapperClasses,
} from "./fieldStyles";

const checkboxClasses =
  "my-auto peer appearance-none h-4 w-4 " +
  "border border-blue-300 rounded " +
  "checked:bg-blue-500 checked:border-blue-500 " +
  "transition-colors cursor-pointer shadow";

export default function Input({
  label,
  icon,
  required = false,
  error,
  className = "",
  type = "text",
  suffix,
  ...props
}) {
  const icons = icon ? (Array.isArray(icon) ? icon : [icon]) : [];

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

          <span className="pointer-events-none absolute inset-0 mt-0.5 flex justify-center text-xs font-bold text-white">
            ✓
          </span>
        </span>

        {label && (
          <span className={fieldLabelClasses}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </span>
        )}
      </label>
    );
  }

  return (
    <div className={`${fieldWrapperClasses} ${className}`}>
      {label && (
        <label
          htmlFor={props.id}
          className="flex items-center gap-2 text-sm font-semibold text-blue-700"
        >
          <span className="flex">
            {icons.map((Icon, index) => (
              <Icon
                key={index}
                size={18}
                className={index > 0 ? "-ml-1.25" : ""}
              />
            ))}
          </span>

          <span>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={type}
          required={required}
          className={`${fieldClasses} ${suffix ? "pr-10" : ""}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-900">
            {suffix}
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
