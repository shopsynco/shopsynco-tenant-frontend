interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-gray-700 mb-1">{label}</label>}
      <input
        {...props}
        className="w-full px-4 py-2 rounded-md bg-white/60 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
      />
    </div>
  );
}
