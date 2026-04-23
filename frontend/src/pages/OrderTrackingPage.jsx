import React, { useState } from "react";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/order/${orderId}/status`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message || "Error fetching order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Track Your Order</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
          required
        />
        <button type="submit" style={{ width: "100%", padding: 10 }} disabled={loading}>
          {loading ? "Checking..." : "Track Order"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      {order && (
        <div style={{ background: "#f6f6f6", padding: 16, borderRadius: 6 }}>
          <div><b>Status:</b> {order.status}</div>
          <div><b>Placed At:</b> {new Date(order.placedAt).toLocaleString()}</div>
          <div><b>Last Updated:</b> {new Date(order.lastUpdated).toLocaleString()}</div>
          <div><b>Name:</b> {order.customerName}</div>
          <div><b>Delivery Address:</b> {order.deliveryAddress}</div>
          <div><b>Total:</b> ₹{order.total}</div>
          <div style={{ marginTop: 8 }}><b>Items:</b>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.name} × {item.quantity}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
