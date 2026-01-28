import { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ToastContainer } from "../components/common/Toast";
import type { ToastMessage, ToastType } from "../components/common/Toast";

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast("success", message),
    [showToast],
  );
  const showError = useCallback(
    (message: string) => showToast("error", message),
    [showToast],
  );
  const showInfo = useCallback(
    (message: string) => showToast("info", message),
    [showToast],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
