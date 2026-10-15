const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer",
  secondary: "bg-blue-200 text-blue-800 hover:bg-blue-300 cursor-pointer",
  clear_blue:
    "bg-white border border-blue-300 text-blue-700 transition hover:bg-blue-50 cursor-pointer",
  clear_green:
    "bg-white border border-green-300 text-green-700 transition hover:bg-green-50 cursor-pointer",
  clear_purple:
    "bg-white border border-purple-300 text-purple-700 transition hover:bg-purple-50 cursor-pointer",
  danger: "bg-red-600 text-white hover:bg-red-700 cursor-pointer",
  ghost: "bg-transparent text-blue-300 hover:text-blue-100 cursor-pointer",
  zonage:
    "bg-green-100 px-2 py-1 text-green-700 hover:bg-green-200 cursor-pointer",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none  disabled:cursor-not-allowed disabled:opacity-60 shadow-lg ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabButton ({
  number,
  label,
  tab,
  activeTab,
  setActiveTab,
  disabled = false,
}) {
  const isActive = activeTab === tab;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setActiveTab(tab)}
      className={`
        whitespace-nowrap border-b-2 px-2 md:px-4 py-3 text-sm font-medium rounded-t-xl
        ${
          isActive
            ? "border-blue-600 text-blue-700 bg-blue-50 "
            : "border-transparent text-blue-500"
        }
        ${
          disabled
            ? "cursor-not-allowed opacity-40"
            : "hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
        }
      `}
    >
      {number}. {label}
    </button>
  );
};

