import { motion } from "framer-motion";

export default function SeasonalAmbient({ season, timeOfDay }) {
  return (
    <div className="seasonal-ambient" aria-hidden="true">
      <motion.div
        className={`ambient-layer ambient-layer-a season-${season} time-${timeOfDay}`}
        animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`ambient-layer ambient-layer-b season-${season} time-${timeOfDay}`}
        animate={{ opacity: [0.18, 0.32, 0.18], y: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {season === "summer" ? <div className="heat-wave" /> : null}
      {season === "monsoon" ? <div className="rain-drift" /> : null}
      {season === "winter" ? <div className="snow-drift" /> : null}
      {season === "autumn" ? <div className="autumn-dust" /> : null}
    </div>
  );
}
