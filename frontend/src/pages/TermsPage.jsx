import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <main className="container legal-page">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / Terms and Conditions
      </nav>
      <h2>Terms and Conditions</h2>
      <p className="legal-updated">Last updated: April 2026</p>

      <section>
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or placing an order on Radha Krishan Studio, you agree to these terms. If you
          do not agree, please do not use our services.
        </p>
      </section>

      <section>
        <h3>2. Products and Pricing</h3>
        <ul>
          <li>All prices are listed in Indian Rupees (₹) and include applicable taxes.</li>
          <li>We reserve the right to update prices without prior notice.</li>
          <li>Product images are for illustration; slight colour variations may occur.</li>
        </ul>
      </section>

      <section>
        <h3>3. Orders and Payment</h3>
        <p>
          We currently accept <strong>Cash on Delivery (COD)</strong> only. An order is confirmed
          once you receive a confirmation message on WhatsApp or SMS. We reserve the right to cancel
          orders due to stock unavailability.
        </p>
      </section>

      <section>
        <h3>4. Delivery</h3>
        <ul>
          <li>Local delivery: free for orders within our service area.</li>
          <li>Non-local delivery: a flat charge of ₹70 applies.</li>
          <li>Estimated delivery time is 2–5 working days after confirmation.</li>
        </ul>
      </section>

      <section>
        <h3>5. Returns and Refunds</h3>
        <p>
          If you receive a damaged or incorrect item, please contact us within 48 hours of delivery
          with photos. We will arrange an exchange or refund at no extra cost.
        </p>
      </section>

      <section>
        <h3>6. Intellectual Property</h3>
        <p>
          All content on this website, including images, text, and branding, is the property of
          Radha Krishan Studio and may not be reproduced without written permission.
        </p>
      </section>

      <section>
        <h3>7. Limitation of Liability</h3>
        <p>
          Radha Krishan Studio is not liable for delays caused by force majeure events, courier
          issues, or factors beyond our reasonable control.
        </p>
      </section>

      <section>
        <h3>8. Contact Us</h3>
        <p>
          Radha Krishan Studio, Gurugram, Haryana<br />
          Email: <a href="mailto:radhakrishanstudio04@gmail.com">radhakrishanstudio04@gmail.com</a><br />
          Phone: <a href="tel:+918901501572">+91 8901501572</a>
        </p>
      </section>
    </main>
  );
}
