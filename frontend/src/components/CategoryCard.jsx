import { motion } from "framer-motion";

export default function CategoryCard({ icon: Icon, label, active, onClick }) {
  return (
    <motion.button
      type="button"
      className={`category-card${active ? " category-card--active" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.07, boxShadow: "0 6px 24px rgba(245,158,11,0.13)" }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <span className="category-card__icon">
        <Icon />
      </span>
      <span className="category-card__label">{label}</span>
    </motion.button>
  );
}
