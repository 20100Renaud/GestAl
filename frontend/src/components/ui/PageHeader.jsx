import { useEffect } from "react";
import { usePageTitle } from "../../context/PageTitleContext";
import { Search, X, Copy, SquarePlus } from "lucide-react";
import Input from "./Input";
import Button from "./Button";

export default function PageHeader({
  title,
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  createLabel,
  onAction,
  secondaryActionIcon: SecondaryActionIcon = Copy,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionDisabled = false,
  className = "",
}) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title || "");
  }, [title, setTitle]);

  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full ${className}`}
    >
      {/* Search */}
      <div className="relative order-2 md:order-1 w-full max-w-[420px]">
        {onSearchChange && (
          <>
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />

            {search?.trim() ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Effacer la recherche"
                title="Effacer la recherche"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-900 cursor-pointer"
              >
                <X size={18} />
              </button>
            ) : (
              <Search
                size={18}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-900 pointer-events-none"
              />
            )}
          </>
        )}
      </div>

      {/* Actions */}
      {(onAction || onSecondaryAction) && (
        <div className="order-1 md:order-2 flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
          {onSecondaryAction && (
            <Button
              type="button"
              variant="clear_blue"
              onClick={onSecondaryAction}
              disabled={secondaryActionDisabled}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {SecondaryActionIcon && <SecondaryActionIcon size={16} />}
              {secondaryActionLabel || "Action secondaire"}
            </Button>
          )}

          {onAction && (
            <Button
              type="button"
              onClick={onAction}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <SquarePlus size={16}/>{createLabel || "Nouveau"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
