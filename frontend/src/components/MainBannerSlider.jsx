import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: "summer-sale",
    tag: "Mega Sale",
    title: "Summer Collection Live",
    subtitle: "Up to 35% OFF on trending and affordable products",
    bullets: [
      "Best Deals on daily essentials",
      "Fast delivery on priority orders",
      "Trusted quality at fair pricing",
    ],
    cta: "Shop Now",
    theme: "warm",
  },
  {
    id: "delivery",
    tag: "Smart Delivery",
    title: "Free Delivery Benefits",
    subtitle: "Free delivery for pincode 123001 above Rs 499",
    bullets: [
      "Secure COD checkout",
      "Address and order tracking support",
      "Quick dispatch experience",
    ],
    cta: "Explore Products",
    theme: "cool",
  },
  {
    id: "trusted",
    tag: "Trusted Quality",
    title: "One-stop Destination for Smart Shopping",
    subtitle: "Carefully curated products for daily lifestyle needs",
    bullets: [
      "Premium but affordable range",
      "Simple returns support",
      "Reliable customer experience",
    ],
    cta: "Browse Collection",
    theme: "neutral",
  },
];

export default function MainBannerSlider({ onCtaClick }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const activeSlide = SLIDES[activeIndex];

  return (
    <section className={`main-slider main-slider-${activeSlide.theme}`} aria-label="Main banner slider">
      <button type="button" className="slider-arrow slider-arrow-left" onClick={goPrev} aria-label="Previous slide">
        {"<"}
      </button>

      <div className="main-slider-stage">
        <AnimatePresence mode="wait">
          <motion.article
            key={activeSlide.id}
            className="main-slide"
            initial={{ opacity: 0, x: 34 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <p className="main-slide-tag">{activeSlide.tag}</p>
            <h2>{activeSlide.title}</h2>
            <p className="main-slide-subtitle">{activeSlide.subtitle}</p>
            <ul>
              {activeSlide.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button type="button" onClick={onCtaClick}>{activeSlide.cta}</button>
          </motion.article>
        </AnimatePresence>
      </div>

      <button type="button" className="slider-arrow slider-arrow-right" onClick={goNext} aria-label="Next slide">
        {">"}
      </button>

      <div className="main-slider-dots" role="tablist" aria-label="Slider indicators">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`main-slider-dot${index === activeIndex ? " active" : ""}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === activeIndex}
          />
        ))}
      </div>
    </section>
  );
}
