import { useEffect } from "react";
import { motion } from "framer-motion";

export default function IntroSplash({ onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDone();
    }, 4600);

    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.section
      className="intro-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      aria-label="Welcome intro"
    >
      <button type="button" className="intro-skip" onClick={onDone}>Skip</button>

      <motion.div
        className="intro-splash-content"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="intro-logo" aria-hidden="true">RKS</div>
        <h1>Welcome to Radha Krishan Studio</h1>
        <p>Your one-stop destination for trending and affordable products</p>
        <ul>
          <li>Best Deals</li>
          <li>Fast Delivery</li>
          <li>Trusted Quality</li>
        </ul>
      </motion.div>
    </motion.section>
  );
}
