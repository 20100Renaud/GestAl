import { useEffect } from "react";
import { usePageTitle } from "../../context/PageTitleContext";
import { Search } from "lucide-react";
import Input from "./Input";
import Button from "./Button";

export default function PageHeader({
  title,
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  createLabel,
  onAction,
}) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title || "");
  }, [title, setTitle]);

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
      <div className="relative w-full max-w-[420px]">
        {onSearchChange && (
          <>
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />

            <Search
              size={20}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-blue-700"
            />
          </>
        )}
      </div>

      {onAction && (
        <Button onClick={onAction}>+ {createLabel || "Nouveau"}</Button>
      )}
    </div>
  );
}
