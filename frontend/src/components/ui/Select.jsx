import { forwardRef } from "react";
import {
  fieldClasses,
  fieldLabelClasses,
  fieldWrapperClasses,
} from "./fieldStyles";

const Select = forwardRef(function Select(
  {
    id,
    label,
    icon: Icon,
    required = false,
    children,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div className={fieldWrapperClasses}>
      {label && (
        <label htmlFor={id} className={fieldLabelClasses}>
          {Icon && (
            <Icon size={18} className="inline-block mr-2 align-text-bottom" />
          )}

          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={id}
        required={required}
        className={`${fieldClasses} cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});

export default Select;
