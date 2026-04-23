import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchInvoiceSummary, getInvoiceDownloadUrl } from "../services/api";
import { formatINR } from "../utils/currency";

export default function SuccessPage() {
  const params = new URLSearchParams(useLocation().search);
  const orderId = params.get("orderId");
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    fetchInvoiceSummary(orderId)
      .then(setInvoice)
      .catch(() => setInvoice(null));
  }, [orderId]);

  return (
    <main className="container success-page">
      <h2>Order placed successfully</h2>
      <p>Dhanyavaad! Your order is confirmed.</p>
      {orderId ? <p>Order ID: {orderId}</p> : null}
      {invoice ? (
        <div className="pricing-box" style={{ marginBottom: "0.8rem", textAlign: "left" }}>
          <p>Invoice: {invoice.invoiceNumber}</p>
          <p>Items: {invoice.items.length}</p>
          <p>Total: {formatINR(invoice.pricing.total)}</p>
        </div>
      ) : null}
      {orderId ? (
        <a href={getInvoiceDownloadUrl(orderId)} target="_blank" rel="noreferrer">
          Download Invoice PDF
        </a>
      ) : null}
      <Link to="/">Continue shopping</Link>
    </main>
  );
}
