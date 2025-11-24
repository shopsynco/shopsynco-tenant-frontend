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
  width = "w-[480px]",
  className = "",
}: ModalWrapperProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className={`bg-white rounded-xl ${width} p-8 relative shadow-xl ${className}`}>
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

