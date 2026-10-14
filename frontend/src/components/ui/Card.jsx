export function CardDashboard({
  title,
  value = "-",
  subtitle,
  secondaryValue,
  secondarySubtitle,
  className = "",
  titleColor = "text-blue-800",
  valueColor = "text-blue-900",
  subtitleColor = "text-blue-500",
  secondaryValueColor = "text-blue-700",
  secondarySubtitleColor = "text-blue-500",
  borderColor = "border-t-blue-600",
}) {
  return (
    <section
      className={`
        aspect-square w-36 sm:w-48 shrink-0
        flex flex-col justify-between
        rounded-3xl border border-blue-200 border-t-4
        ${borderColor} p-3 sm:p-4 shadow-sm
        transition-shadow duration-200 hover:shadow-xl
        sm:p-5 text-center
        ${className}
      `}
    >
      <span className={`text-sm font-semibold ${titleColor}`}>{title}</span>

      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <div className="min-w-0 flex items-end gap-2">
          <strong
            className={`font-semibold tracking-tight text-2xl sm:text-3xl ${valueColor}`}
          >
            {value}
          </strong>

          {subtitle && (
            <span className={`mt-1 block text-xs leading-5 ${subtitleColor}`}>
              {subtitle}
            </span>
          )}
        </div>

        {secondaryValue !== undefined && (
          <>
            <div className="w-10 border-t border-blue-200" />

            <div className="min-w-0 flex items-end gap-2">
              <strong
                className={`block break-words text-xl font-semibold sm:text-2xl ${secondaryValueColor}`}
              >
                {secondaryValue}
              </strong>

              {secondarySubtitle && (
                <span
                  className={`mt-1 block text-xs leading-5 ${secondarySubtitleColor}`}
                >
                  {secondarySubtitle}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export const techniqueCardColors = {
  Articulaire: {
    border: "border-t-green-600",
    commentBorder: "border-green-600",
    commentBg: "bg-green-50",
    badge: "text-green-600",
    hover: "hover:bg-green-600/10",

  },
  Tissulaire: {
    border: "border-t-blue-600",
    commentBorder: "border-blue-600",
    commentBg: "bg-blue-50",
    badge: "text-blue-600",
    hover: "hover:bg-blue-600/10",

  },
  Viscérale: {
    border: "border-t-purple-600",
    commentBorder: "border-purple-600",
    commentBg: "bg-purple-50",
    badge: "text-purple-600",
    hover: "hover:bg-purple-600/10",
  },
};

export function CardZonage({ title, technique, onClick, className = "", children }) {
  const colors = techniqueCardColors[technique] ?? {
    border: "border-t-gray-500",
    commentBorder: "border-gray-500",
    commentBg: "bg-gray-50",
    badge: "bg-gray-300",
    hover: "hover:bg-gray-50",
  };

  return (
    <section
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      className={`
        w-fit min-h-18
        flex flex-col justify-between
        rounded-3xl border border-blue-200 border-t-4
        ${colors.border}
        bg-white p-2 sm:p-3
        text-center shadow-sm
        cursor-pointer
        transition-all duration-200
        ${colors.hover}
        focus:outline-none
        ${className}
      `}
    >
      <h3 className="font-semibold text-blue-900">
        {title || "Zonage sans intitulé"}
      </h3>

      <div className="flex justify-center">
        {technique ? (
          <span
            className={`
              inline-block rounded-full px-3 py-1
              text-xs font-medium
              ${colors.badge}
            `}
          >
            {technique}
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            Technique non renseignée
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
