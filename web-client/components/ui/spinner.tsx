import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizes = {
    sm: 20,
    md: 40,
    lg: 60
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 
        className="animate-spin text-[#850EF6]" 
        size={sizes[size]} 
        strokeWidth={3}
      />
    </div>
  );
}