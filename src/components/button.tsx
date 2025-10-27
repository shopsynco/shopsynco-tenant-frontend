import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export default function Button({ label, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md transition-all"
    >
      {label}
    </button>
  );
}
