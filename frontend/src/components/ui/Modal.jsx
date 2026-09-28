import { X } from "lucide-react";
import Button from "./Button";
export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/99 p-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-blue-950 text-blue-300 select-none">
          <h2 className="m-0 text-lg font-semibold">{title}</h2>

          <Button onClick={onClose} variant="ghost">
            <X size={20} />
          </Button>
        </div>

        <div className="overflow-y-auto md:p-6">{children}</div>

        {footer && (
          <div className="border-t border-blue-200 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
