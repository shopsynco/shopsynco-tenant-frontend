import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalWrapperProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
  width?: string;
  className?: string;
}

export function ModalWrapper({
  children,
  onClose,
  title,
  width = "w-[calc(100%-2rem)] max-w-[480px] mx-4",
  className = "",
}: ModalWrapperProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className={`bg-white rounded-xl ${width} p-4 sm:p-8 relative shadow-xl ${className}`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-[#4A5C74]">{title}</h2>
        {children}
      </div>
    </div>
  );
}

