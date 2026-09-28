import {
  fieldClasses,
  fieldLabelClasses,
  fieldWrapperClasses,
} from "./fieldStyles";

export default function Textarea({
  label,
  icon: Icon,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={fieldWrapperClasses}>
      {label && (
        <label
          htmlFor={props.id}
          className="flex items-center gap-2 text-sm font-semibold text-blue-700"
        >
          {Icon && <Icon size={18} />}

          <span>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </span>
        </label>
      )}

      <textarea
        {...props}
        required={required}
        className={`${fieldClasses} resize-none ${className}`}
      />
    </div>
  );
}
