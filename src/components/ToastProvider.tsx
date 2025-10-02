import React, { createContext, useContext, useState, ReactNode } from "react";

type Toast = {
  id: number;
  message: string;
  color: string;
};

const getScoreColor = (score: number) => {
    if (score <= 0.4) return 'success';
    if (score <= 0.6) return 'warning';
    return 'danger';
};

interface ToastContextType {
  addToast: (message: string, score: number ) => number;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, score: number) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, color: getScoreColor(score)}]);

    // auto-remove
    setTimeout(() => removeToast(id), 5000);
    return id;
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{addToast, removeToast}}>
      {children}
      {/* Stack container */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 9999,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.color === "danger" ? "#d9534f" :
                          toast.color === "success" ? "#5cb85c" :
                          toast.color === "warning" ? "#f0ad4e" :
                          "#333",
              color: "white",
              padding: "10px 15px",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              minWidth: "200px"
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
};
