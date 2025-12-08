import { AlertCircle, X } from "lucide-react";
import { Button } from "../ui";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  title = "Erro", 
  message, 
  onDismiss, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 shadow-[4px_4px_8px_rgba(220,38,38,0.2),-4px_-4px_8px_rgba(255,255,255,0.7)]">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
        
        <div className="flex-1">
          <h3 className="font-bold text-red-900 mb-1">{title}</h3>
          <p className="text-red-700 text-sm">{message}</p>
          
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button variant="error" size="sm" onClick={onRetry}>
                  Tentar Novamente
                </Button>
              )}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  Dispensar
                </Button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-500 hover:text-red-700">
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}