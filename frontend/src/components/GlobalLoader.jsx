import React from "react";
import "../index.css";

export default function GlobalLoader({ visible }) {
  if (!visible) return null;
  return (
    <div className="global-loader-overlay">
      <div className="global-loader-spinner" />
    </div>
  );
}
