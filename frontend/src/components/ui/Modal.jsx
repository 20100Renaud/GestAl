import { X } from "lucide-react";
import Button from "./Button";
export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/99 p-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-200 px-6 py-4">
          <h2 className="m-0 text-lg font-semibold text-blue-900">{title}</h2>

          <Button onClick={onClose} variant="ghost">
            <X size={20} />
          </Button>
        </div>

        <div className="overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="border-t border-blue-200 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
