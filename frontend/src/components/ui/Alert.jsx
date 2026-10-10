import { CheckCircle2, CircleAlert, Info } from "lucide-react";

export default function Alert({ children, variant = "error" }) {
  const variants = {
    error: {
      styles: "border-red-200 bg-red-50 text-red-800",
      icon: CircleAlert,
    },
    success: {
      styles: "border-green-200 bg-green-50 text-green-800",
      icon: CheckCircle2,
    },
    info: {
      styles: "border-blue-200 bg-blue-50 text-blue-800",
      icon: Info,
    },
  };

  const config = variants[variant] ?? variants.error;
  const Icon = config.icon;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${config.styles}`}
    >
      <Icon size={18} className="shrink-0" aria-hidden="true" />

      <div>{children}</div>
    </div>
  );
}
