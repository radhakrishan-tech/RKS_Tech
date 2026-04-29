import React from "react";

export default function GlobalToast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`global-toast global-toast--${toast.type || "info"}`}
      onClick={onClose}
      role="alert"
      aria-live="assertive"
      style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, minWidth: 220 }}
    >
      {toast.message}
    </div>
  );
}
