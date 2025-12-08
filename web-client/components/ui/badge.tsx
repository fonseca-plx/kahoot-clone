import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "error" | "accent";
  mono?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = "default", mono = false, className = "", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-bold shadow-[2px_2px_4px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.7)]";
    
    const variants = {
      default: "bg-gray-200 text-gray-800",
      primary: "bg-[#7FF60E] text-black",
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      accent: "bg-[#850EF6] text-white"
    };
    
    const fontClass = mono ? "font-mono" : "font-sans";
    
    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${fontClass} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;