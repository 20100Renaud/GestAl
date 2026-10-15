export function CardDashboard({
  title,
  value = "-",
  subtitle,
  secondaryValue,
  secondarySubtitle,
  onValueClick,
  onSecondaryValueClick,
  className = "",
  titleColor = "text-blue-800",
  valueColor = "text-blue-900",
  subtitleColor = "text-blue-500",
  secondaryValueColor = "text-blue-700",
  secondarySubtitleColor = "text-blue-500",
  borderColor = "border-t-blue-600",
  HoverColor = "hover:bg-blue-50",
}) {
  return (
    <section
      className={`
        aspect-square w-48 shrink-0
        flex flex-col justify-between
        rounded-3xl border border-blue-200 border-t-4
        ${borderColor} p-4 shadow-sm
        transition-shadow duration-200 hover:shadow-xl
        p-5 text-center bg-white
        ${className}
      `}
    >
      <span className={`text-sm font-semibold ${titleColor}`}>{title}</span>

      <div className="flex flex-col items-center gap-3">
        {/* Main value + subtitle */}
        <div
          onClick={onValueClick}
          onKeyDown={(event) => {
            if (onValueClick && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              onValueClick();
            }
          }}
          role={onValueClick ? "link" : undefined}
          tabIndex={onValueClick ? 0 : undefined}
          className={`
            min-w-0 flex items-end gap-2
            ${
              onValueClick
                ? `cursor-pointer rounded-lg transition-colors px-4 ${HoverColor}`
                : ""
            }
          `}
        >
          <strong
            className={`font-semibold tracking-tight text-3xl ${valueColor}`}
          >
            {value}
          </strong>

          {subtitle && (
            <span className={`mt-1 block text-xs leading-5 ${subtitleColor}`}>
              {subtitle}
            </span>
          )}
        </div>

        {/* Secondary value + subtitle */}
        {secondaryValue !== undefined && (
          <>
            <div className="w-10 border-t border-blue-200" />

            <div
              onClick={onSecondaryValueClick}
              onKeyDown={(event) => {
                if (
                  onSecondaryValueClick &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  onSecondaryValueClick();
                }
              }}
              role={onSecondaryValueClick ? "link" : undefined}
              tabIndex={onSecondaryValueClick ? 0 : undefined}
              className={`
                min-w-0 flex items-end gap-2
                ${
                  onSecondaryValueClick
                    ? `cursor-pointer rounded-lg transition-colors px-4 ${HoverColor}`
                    : ""
                }
              `}
            >
              <strong
                className={`block break-words text-xl font-semibold  ${secondaryValueColor}`}
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
  Fascia: {
    border: "border-t-rose-600",
    commentBorder: "border-rose-600",
    commentBg: "bg-rose-50",
    badge: "text-rose-600",
    hover: "hover:bg-rose-600/10",
  },
};

export function CardZonage({
  title,
  technique,
  onClick,
  className = "",
  children,
}) {
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

export function CardFilter({
  title,
  value = "-",
  active = false,
  onClick,
  color = "red",
  className = "",
}) {
  const colors = {
    red: {
      text: "text-red-500",
      value: "text-red-600",
      border: "border-red-200 hover:border-red-400",
      active: "border-red-500 bg-red-50 ring-1 ring-red-500",
      hover: "hover:bg-red-50",
    },
    orange: {
      text: "text-orange-500",
      value: "text-orange-600",
      border: "border-orange-200 hover:border-orange-400",
      active: "border-orange-500 bg-orange-50 ring-1 ring-orange-500",
      hover: "hover:bg-orange-50",
    },
    purple: {
      text: "text-purple-500",
      value: "text-purple-600",
      border: "border-purple-200 hover:border-purple-400",
      active: "border-purple-500 bg-purple-100 ring-1 ring-purple-500",
      hover: "hover:bg-purple-100",
    },
    green: {
      text: "text-green-500",
      value: "text-green-600",
      border: "border-green-200 hover:border-green-400",
      active: "border-green-500 bg-green-100 ring-1 ring-green-500",
      hover: "hover:bg-green-100",
    },
    blue: {
      text: "text-blue-500",
      value: "text-blue-600",
      border: "border-blue-200 hover:border-blue-400",
      active: "border-blue-500 bg-blue-100 ring-1 ring-blue-500",
      hover: "hover:bg-blue-100",
    },
  };

  const styles = colors[color] ?? colors.red;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        flex flex-col justify-between
        rounded-lg border bg-white py-3 text-center
        transition-all duration-200
        cursor-pointer hover:-translate-y-1 hover:shadow-xl
        ${styles.hover}
        ${active ? styles.active : styles.border}
        ${className}
      `}
    >
      <p className={`text-sm ${styles.text}`}>{title}</p>

      <p className={`text-lg font-semibold ${styles.value}`}>{value}</p>
    </button>
  );
}
