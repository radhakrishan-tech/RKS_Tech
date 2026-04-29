import React, { createContext, useContext, useState, useCallback } from "react";

const GlobalUIContext = createContext();

export function GlobalUIProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [toast, setToast] = useState(null);

  const showLoader = useCallback(() => setLoadingCount((c) => c + 1), []);
  const hideLoader = useCallback(() => setLoadingCount((c) => Math.max(0, c - 1)), []);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Listen for loader and toast events from api.js
  React.useEffect(() => {
    const loaderHandler = (e) => {
      if (e.detail) showLoader();
      else hideLoader();
    };
    const toastHandler = (e) => {
      if (e.detail) showToast(e.detail.type, e.detail.message);
    };
    window.addEventListener("global-loader", loaderHandler);
    window.addEventListener("global-toast", toastHandler);
    return () => {
      window.removeEventListener("global-loader", loaderHandler);
      window.removeEventListener("global-toast", toastHandler);
    };
  }, [showLoader, hideLoader, showToast]);

  const value = {
    loading: loadingCount > 0,
    showLoader,
    hideLoader,
    toast,
    showToast,
  };

  return (
    <GlobalUIContext.Provider value={value}>
      {children}
    </GlobalUIContext.Provider>
  );
}

export function useGlobalUI() {
  return useContext(GlobalUIContext);
}
