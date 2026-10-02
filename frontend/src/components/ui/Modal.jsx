import { X } from "lucide-react";
import Button from "./Button";
export default function Modal({ open, title, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-blue-950 text-blue-300 select-none">
          <h2 className="m-0 text-lg font-semibold">{title}</h2>

          <Button onClick={onClose} variant="ghost">
            <X size={20} />
          </Button>
        </div>

        <div className="overflow-y-auto md:p-6">{children}</div>
      </div>
    </div>
  );
}

export function WorkflowModal({ open, title, onClose, tabs, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div
        className="
          flex
          h-[calc(100vh-2rem)]
          max-h-[900px]
          min-h-0
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-xl
          bg-white
          shadow-2xl
          md:h-[85vh]
          md:min-h-[500px]
        "
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between bg-blue-950 px-6 py-4 text-blue-300 select-none">
          <h2 className="m-0 text-lg font-semibold">{title}</h2>

          <Button onClick={onClose} variant="ghost">
            <X size={20} />
          </Button>
        </div>

        {/* TABS */}
        <div className="shrink-0 px-4 md:px-6 border-b border-blue-200 shadow-[0_4px_8px_-4px_rgba(30,64,175,0.25)]">
          {tabs}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 md:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

