import { motion } from "framer-motion";

const SALE_TEXT = "Summer Collection Live | Up to 35% OFF | Free Delivery for pincode 123001 above Rs 499";

export default function SaleBanner() {
  return (
    <section className="sale-banner-wrap" aria-label="Sale highlights">
      <motion.div
        className="sale-banner container"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <span className="sale-banner-chip">Mega Sale</span>
        <div className="sale-banner-track" role="marquee" aria-label={SALE_TEXT}>
          <div className="sale-banner-marquee">
            <span>{SALE_TEXT}</span>
            <span aria-hidden="true" className="sale-banner-sep">|</span>
            <span aria-hidden="true">{SALE_TEXT}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
