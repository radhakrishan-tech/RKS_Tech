import { useEffect, useMemo, useState } from "react";
import {
  addMyAddress,
  deleteMyAddress,
  fetchMyAccount,
  updateMyAddress,
  updateMyProfile,
} from "../services/api";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { formatINR } from "../utils/currency";

const initialAddress = {
  label: "Home",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  isDefault: false,
};

export default function MyAccountPage() {
  const { customer, isLoggedIn, openLoginModal, setCustomerSession, logout } = useCustomerAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addressForm, setAddressForm] = useState(initialAddress);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [message, setMessage] = useState("");

  const token = customer?.token || "";

  const clearMessage = () => {
    window.clearTimeout(window.__rksAccountMsgTimer);
    window.__rksAccountMsgTimer = window.setTimeout(() => setMessage(""), 2400);
  };

  const showMessage = (text) => {
    setMessage(text);
    clearMessage();
  };

  const loadAccount = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchMyAccount(token);
      const profile = data.profile || {};
      setProfileName(profile.name || "");
      setAddresses(Array.isArray(profile.addresses) ? profile.addresses : []);
      setOrders(Array.isArray(data.orders) ? data.orders : []);

      setCustomerSession({
        ...(customer || {}),
        token,
        mobile: profile.mobile || customer?.mobile || "",
        role: "customer",
        verifiedAt: customer?.verifiedAt || Date.now(),
        profile: {
          name: profile.name || "",
          addresses: Array.isArray(profile.addresses) ? profile.addresses : [],
        },
      });
    } catch {
      showMessage("Could not load account details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const saveProfile = async () => {
    if (!token) return;
    try {
      const data = await updateMyProfile(token, { name: profileName });
      const profile = data.profile || {};
      setCustomerSession({
        ...(customer || {}),
        token,
        mobile: profile.mobile || customer?.mobile || "",
        role: "customer",
        verifiedAt: customer?.verifiedAt || Date.now(),
        profile: {
          name: profile.name || "",
          addresses: Array.isArray(profile.addresses) ? profile.addresses : addresses,
        },
      });
      showMessage("Profile updated");
    } catch {
      showMessage("Profile update failed");
    }
  };

  const resetAddressForm = () => {
    setAddressForm(initialAddress);
    setEditingAddressId("");
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const data = editingAddressId
        ? await updateMyAddress(token, editingAddressId, addressForm)
        : await addMyAddress(token, addressForm);

      const nextAddresses = data.addresses || [];
      setAddresses(nextAddresses);
      setCustomerSession({
        ...(customer || {}),
        token,
        mobile: customer?.mobile || "",
        role: "customer",
        verifiedAt: customer?.verifiedAt || Date.now(),
        profile: {
          name: customer?.profile?.name || profileName,
          addresses: nextAddresses,
        },
      });
      resetAddressForm();
      showMessage(editingAddressId ? "Address updated" : "Address added");
    } catch {
      showMessage("Could not save address");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || "Home",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      landmark: address.landmark || "",
      isDefault: Boolean(address.isDefault),
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!token) return;
    try {
      const data = await deleteMyAddress(token, addressId);
      const nextAddresses = data.addresses || [];
      setAddresses(nextAddresses);
      setCustomerSession({
        ...(customer || {}),
        token,
        mobile: customer?.mobile || "",
        role: "customer",
        verifiedAt: customer?.verifiedAt || Date.now(),
        profile: {
          name: customer?.profile?.name || profileName,
          addresses: nextAddresses,
        },
      });
      showMessage("Address deleted");
    } catch {
      showMessage("Could not delete address");
    }
  };

  const orderStats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "Pending").length;
    const shipped = orders.filter((order) => order.status === "Shipped").length;
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    return { pending, shipped, delivered };
  }, [orders]);

  if (!isLoggedIn) {
    return (
      <main className="container my-account-page">
        <section className="account-login-card">
          <h2>My Account</h2>
          <p>Login with mobile OTP to manage profile, addresses, and track your orders.</p>
          <button type="button" onClick={openLoginModal}>Login with OTP</button>
        </section>
      </main>
    );
  }

  return (
    <main className="container my-account-page">
      <section className="account-header-card">
        <div>
          <h2>My Account</h2>
          <p>Manage your personal details, addresses, and order tracking in one place.</p>
        </div>
        <div className="account-header-actions">
          <span className="account-mobile">{customer?.mobile}</span>
          <button type="button" className="danger-button" onClick={logout}>Logout</button>
        </div>
      </section>

      {message ? <p className="account-message">{message}</p> : null}

      <section className="account-summary-grid">
        <article><p>Total Orders</p><strong>{orders.length}</strong></article>
        <article><p>Pending</p><strong>{orderStats.pending}</strong></article>
        <article><p>Shipped</p><strong>{orderStats.shipped}</strong></article>
        <article><p>Delivered</p><strong>{orderStats.delivered}</strong></article>
      </section>

      <section className="account-content-grid">
        <article className="account-card">
          <h3>Profile Details</h3>
          <div className="account-form-grid">
            <input
              placeholder="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <input value={customer?.mobile || ""} disabled />
          </div>
          <button type="button" onClick={saveProfile}>Save Profile</button>
        </article>

        <article className="account-card">
          <h3>{editingAddressId ? "Edit Address" : "Add Address"}</h3>
          <form className="account-address-form" onSubmit={saveAddress}>
            <div className="account-form-grid">
              <input placeholder="Label (Home/Office)" value={addressForm.label} onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))} required />
              <input placeholder="Address Line" value={addressForm.addressLine} onChange={(e) => setAddressForm((prev) => ({ ...prev, addressLine: e.target.value }))} required />
              <input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))} required />
              <input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))} required />
              <input placeholder="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))} required />
              <input placeholder="Landmark (optional)" value={addressForm.landmark} onChange={(e) => setAddressForm((prev) => ({ ...prev, landmark: e.target.value }))} />
            </div>
            <label className="account-check">
              <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))} />
              Set as default address
            </label>
            <div className="account-action-row">
              <button type="submit">{editingAddressId ? "Update Address" : "Add Address"}</button>
              {editingAddressId ? <button type="button" className="ghost-button" onClick={resetAddressForm}>Cancel</button> : null}
            </div>
          </form>
        </article>
      </section>

      <section className="account-card">
        <h3>Saved Addresses</h3>
        <div className="saved-addresses-grid">
          {addresses.length ? (
            addresses.map((address) => (
              <article key={address._id} className="saved-address-card">
                <div className="saved-address-head">
                  <strong>{address.label}</strong>
                  {address.isDefault ? <span>Default</span> : null}
                </div>
                <p>{address.addressLine}</p>
                <p>{address.city}, {address.state} - {address.pincode}</p>
                {address.landmark ? <p>{address.landmark}</p> : null}
                <div className="account-action-row">
                  <button type="button" onClick={() => handleEditAddress(address)}>Edit</button>
                  <button type="button" className="danger-button" onClick={() => handleDeleteAddress(address._id)}>Delete</button>
                </div>
              </article>
            ))
          ) : (
            <p>No saved addresses yet.</p>
          )}
        </div>
      </section>

      <section className="account-card">
        <h3>Order History & Tracking</h3>
        <div className="account-orders-wrap">
          {orders.length ? (
            <table className="account-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{String(order._id).slice(-8)}</strong>
                      <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>{(order.items || []).map((item) => `${item.name} x${item.quantity}`).join(", ")}</td>
                    <td>{formatINR(order.pricing?.total || 0)}</td>
                    <td><span className={`status-pill status-${String(order.status).toLowerCase()}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No orders found yet.</p>
          )}
        </div>
      </section>

      {isLoading ? <div className="admin-loading-overlay">Loading account...</div> : null}
    </main>
  );
}
