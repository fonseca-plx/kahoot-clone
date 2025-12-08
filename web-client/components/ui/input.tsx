import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, fullWidth = false, className = "", ...props }, ref) => {
    const baseStyles = "px-4 py-3 rounded-xl bg-white font-sans transition-all duration-200 outline-none";
    
    const stateStyles = error
      ? "shadow-[inset_2px_2px_4px_rgba(220,38,38,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] border-2 border-red-500 focus:border-red-600"
      : "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] border-2 border-transparent focus:border-[#850EF6]";
    
    const widthClass = fullWidth ? "w-full" : "";
    
    return (
      <input
        ref={ref}
        className={`${baseStyles} ${stateStyles} ${widthClass} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;