import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchMyAccount, placeOrder, placeOrderWithToken, previewOrder, requestOtp, verifyOtp } from "../services/api";
import { formatINR } from "../utils/currency";
import { useCustomerAuth } from "../context/CustomerAuthContext";

const initialForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { customer, isLoggedIn } = useCustomerAuth();
  const [form, setForm] = useState(initialForm);
  const [pricing, setPricing] = useState(null);
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const payloadItems = useMemo(
    () => cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })),
    [cartItems]
  );

  useEffect(() => {
    if (!cartItems.length || !form.pincode) {
      setPricing(null);
      return;
    }

    previewOrder({ items: payloadItems, pincode: form.pincode })
      .then((data) => setPricing(data.pricing))
      .catch(() => setPricing(null));
  }, [payloadItems, cartItems.length, form.pincode]);

  useEffect(() => {
    if (!isLoggedIn || !customer?.token) {
      return;
    }

    fetchMyAccount(customer.token)
      .then((data) => {
        const profile = data.profile || {};
        const defaultAddress = (profile.addresses || []).find((addr) => addr.isDefault) || profile.addresses?.[0];

        setForm((prev) => ({
          ...prev,
          customerName: prev.customerName || profile.name || "",
          customerPhone: prev.customerPhone || profile.mobile || customer.mobile || "",
          addressLine: prev.addressLine || defaultAddress?.addressLine || "",
          city: prev.city || defaultAddress?.city || "",
          state: prev.state || defaultAddress?.state || "",
          pincode: prev.pincode || defaultAddress?.pincode || "",
        }));
      })
      .catch(() => null);
  }, [isLoggedIn, customer]);

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!codConfirmed) {
      alert("Please confirm COD order first.");
      return;
    }

    if (!otpVerified) {
      alert("Please verify OTP before placing order.");
      return;
    }

    const orderPayload = {
      ...form,
      codConfirmed,
      items: payloadItems,
    };

    const response = customer?.token
      ? await placeOrderWithToken(orderPayload, customer.token)
      : await placeOrder(orderPayload);

    clearCart();
    navigate(`/success?orderId=${response.orderId}`);
  };

  const handleSendOtp = async () => {
    await requestOtp({ mobile: form.customerPhone });
    setOtpStep(true);
  };

  const handleVerifyOtp = async () => {
    await verifyOtp({ mobile: form.customerPhone, otp });
    setOtpVerified(true);
  };

  return (
    <main className="container checkout-grid">
      <section>
        <h2>Your Cart</h2>
        <p className="delivery-rule-note">
          Delivery Rule: Free delivery only for pincode 123001 on order amount above Rs 499.
        </p>
        {cartItems.length === 0 ? <p>Your cart is empty.</p> : null}
        {cartItems.map((item, idx) => {
          const cartKey = `${item._id}-${item.selectedSize || ''}-${item.selectedColor?.hex || ''}`;
          return (
            <article className="cart-item" key={cartKey}>
              <img src={item.image} alt={item.name} loading="lazy" />
              <div>
                <h4>{item.name}</h4>
                <p>{formatINR(item.price)}</p>
                <div style={{ fontSize: 13, color: '#555' }}>
                  Size: <b>{item.selectedSize}</b> &nbsp;|
                  Color: <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: item.selectedColor?.hex, border: '1px solid #ccc', verticalAlign: 'middle', marginLeft: 2, marginRight: 2 }} title={item.selectedColor?.name}></span> {item.selectedColor?.name}
                </div>
              </div>
              <input
                type="number"
                min="1"
                max={item.stock || 99}
                value={item.quantity}
                onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
              />
              <button onClick={() => removeFromCart(item._id)}>Remove</button>
            </article>
          );
        })}
      </section>

      <form className="checkout-form" onSubmit={submitOrder}>
        <h2>One-page checkout</h2>
        <input placeholder="Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
        <input placeholder="Mobile" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required />
        <button type="button" onClick={handleSendOtp}>Send OTP</button>
        <small className="auth-debug-code">Testing OTP: 12345</small>
        {otpStep ? (
          <div className="otp-box">
            <input
              placeholder="Enter OTP (12345)"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric"
              maxLength={5}
            />
            <button type="button" onClick={handleVerifyOtp}>Verify OTP</button>
            {otpVerified ? <small>OTP verified</small> : null}
          </div>
        ) : null}
        <input placeholder="Email (optional)" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
        <input placeholder="Address" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} required />
        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
        <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />

        <label className="cod-confirm">
          <input type="checkbox" checked={codConfirmed} onChange={(e) => setCodConfirmed(e.target.checked)} />
          I confirm this COD order
        </label>

        {pricing ? (
          <div className="pricing-box">
            <p>Subtotal: {formatINR(pricing.subtotal)}</p>
            <p>Discount: -{formatINR(pricing.discountAmount)}</p>
            <p>Delivery: {pricing.deliveryCharge === 0 ? "FREE" : formatINR(pricing.deliveryCharge)}</p>
            <strong>Total: {formatINR(pricing.total)}</strong>
            <p className="delivery-rule-inline">{pricing.deliveryRuleLabel}</p>
            <p>{pricing.offerAppliedLabel}</p>
            <p>You saved {formatINR(pricing.savedAmount)}</p>
          </div>
        ) : null}

        <button type="submit">Place COD Order</button>
      </form>
    </main>
  );
}
