import { FaWhatsapp } from "react-icons/fa";

const whatsappHref = "https://wa.me/918901501572?text=Namaste%2C%20I%20am%20interested%20in%20placing%20an%20order%20from%20Radha%20Krishan%20Studio.";

export default function WhatsAppFloatButton() {
  return (
    <a
      className="floating-whatsapp"
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Open WhatsApp chat"
    >
      <FaWhatsapp size={22} aria-hidden="true" />
      <span>Chat with us</span>
    </a>
  );
}
