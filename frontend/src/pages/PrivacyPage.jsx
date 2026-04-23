import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <main className="container legal-page">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / Privacy Policy
      </nav>
      <h2>Privacy Policy</h2>
      <p className="legal-updated">Last updated: April 2026</p>

      <section>
        <h3>1. Information We Collect</h3>
        <p>
          When you place an order or interact with Radha Krishan Studio, we may collect your name,
          phone number, email address, delivery address, and order details. We do not store payment
          card information.
        </p>
      </section>

      <section>
        <h3>2. How We Use Your Information</h3>
        <ul>
          <li>To process and deliver your orders.</li>
          <li>To send order confirmation and delivery updates via WhatsApp or SMS.</li>
          <li>To improve our products and services.</li>
          <li>To respond to customer support inquiries.</li>
        </ul>
      </section>

      <section>
        <h3>3. Data Sharing</h3>
        <p>
          We do not sell or rent your personal information to third parties. Your data may be shared
          only with delivery partners and payment processors strictly for order fulfilment.
        </p>
      </section>

      <section>
        <h3>4. Cookies</h3>
        <p>
          Our website uses local storage to remember your cart items across sessions. No third-party
          tracking cookies are used.
        </p>
      </section>

      <section>
        <h3>5. Data Security</h3>
        <p>
          We use industry-standard transport encryption (HTTPS) and store only the minimum data
          required to fulfil your order. Access to customer data is restricted to authorised
          personnel only.
        </p>
      </section>

      <section>
        <h3>6. Your Rights</h3>
        <p>
          You may request deletion or correction of your personal data at any time by contacting us
          by contacting us at <a href="mailto:radhakrishanstudio04@gmail.com">radhakrishanstudio04@gmail.com</a>.
        </p>
      </section>

      <section>
        <h3>7. Contact Us</h3>
        <p>
          Radha Krishan Studio, Gurugram, Haryana<br />
          Email: <a href="mailto:radhakrishanstudio04@gmail.com">radhakrishanstudio04@gmail.com</a><br />
          Phone: <a href="tel:+918901501572">+91 8901501572</a>
        </p>
      </section>
    </main>
  );
}
