const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer",
  secondary:
    "bg-blue-200 text-blue-800 hover:bg-blue-300 cursor-pointer",
  danger:
    "bg-red-600 text-white hover:bg-red-700 cursor-pointer",
  ghost:
    "bg-transparent text-blue-600 hover:text-blue-900 cursor-pointer",
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
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none  disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`
}
      {...props}
    >
      {children}
    </button>
  );
}
