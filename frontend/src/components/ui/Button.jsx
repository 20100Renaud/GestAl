const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 cursor-pointer",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 cursor-pointer",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400 cursor-pointer",
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
      className={[
        "inline-flex items-center justify-center",
        "rounded-md px-4 py-2",
        "text-sm font-medium",
        "transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
