import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";

const INSTAGRAM_URL = "https://www.instagram.com/radhakrishanstudio04?igsh=MTRta29rcWpyMGdqZA==";
const FACEBOOK_URL = "https://www.facebook.com/share/18Dsvq2AR4/";
const WHATSAPP_URL = "https://wa.me/918901501572?text=Namaste%2C%20I%20am%20interested%20in%20placing%20an%20order%20from%20Radha%20Krishan%20Studio.";
const PHONE = "+91 8901501572";
const EMAIL = "radhakrishanstudio04@gmail.com";
const ADDRESS = "Gurugram, Haryana";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid container" id="about">

        <section className="footer-brand-section">
          <Link to="/" className="footer-brand-link">
            <img src="/rks-logo-mark.svg" alt="RKS" width="54" height="54" />
            <div>
              <h3>Radha Krishan Studio</h3>
              <p>Premium ethnic wear and everyday essentials curated with love from Gurugram.</p>
            </div>
          </Link>
        </section>

        <section>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/#categories-section">Shop</a></li>
            <li><a href="/#about">About Us</a></li>
            <li><a href="/#contact">Contact Us</a></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            <li><Link to="/admin">Admin Login</Link></li>
          </ul>
        </section>

        <section id="contact">
          <h4>Contact Info</h4>
          <ul className="contact-list">
            <li>
              <FaPhone className="contact-icon" aria-hidden="true" />
              <a href="tel:+918901501572">{PHONE}</a>
            </li>
            <li>
              <FaEnvelope className="contact-icon" aria-hidden="true" />
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <FaMapMarkerAlt className="contact-icon" aria-hidden="true" />
              <span>{ADDRESS}</span>
            </li>
          </ul>
        </section>

        <section>
          <h4>Follow Us</h4>
          <div className="social-list">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Visit Instagram" className="social-link">
              <span className="social-icon-wrap social-icon-ig" aria-hidden="true"><FaInstagram size={14} /></span>
              <span>Instagram</span>
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Visit Facebook" className="social-link">
              <span className="social-icon-wrap social-icon-fb" aria-hidden="true"><FaFacebook size={14} /></span>
              <span>Facebook</span>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Open WhatsApp" className="social-link">
              <span className="social-icon-wrap social-icon-wa" aria-hidden="true"><FaWhatsapp size={14} /></span>
              <span>WhatsApp</span>
            </a>
          </div>
        </section>

      </div>

      <div className="footer-bottom">
        <p>(c) 2026 Radha Krishan Studio | All Rights Reserved | Made in India</p>
      </div>
    </footer>
  );
}
