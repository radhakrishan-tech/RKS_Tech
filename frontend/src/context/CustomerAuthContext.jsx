import { createContext, useContext, useMemo, useState } from "react";
import CustomerLoginModal from "../components/CustomerLoginModal";

const CustomerAuthContext = createContext(null);

const STORAGE_KEY = "rks_customer_auth";

function getStoredCustomer() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    if (!parsed.mobile || !parsed.token) {
      return null;
    }
    return {
      token: parsed.token,
      mobile: parsed.mobile,
      role: parsed.role || "customer",
      verifiedAt: parsed.verifiedAt || Date.now(),
      profile: {
        name: parsed.profile?.name || "",
        addresses: Array.isArray(parsed.profile?.addresses) ? parsed.profile.addresses : [],
      },
    };
  } catch {
    return null;
  }
}

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => getStoredCustomer());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postLoginAction, setPostLoginAction] = useState(null);

  const isLoggedIn = Boolean(customer?.token);

  const persistCustomer = (nextCustomer) => {
    setCustomer(nextCustomer);
    if (nextCustomer) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCustomer));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const requireLogin = (action) => {
    if (isLoggedIn) {
      if (typeof action === "function") {
        action();
      }
      return true;
    }

    setPostLoginAction(() => (typeof action === "function" ? action : null));
    setIsModalOpen(true);
    return false;
  };

  const logout = () => {
    persistCustomer(null);
  };

  const handleLoginSuccess = (session) => {
    persistCustomer({
      token: session.token,
      mobile: session.mobile,
      role: session.role || "customer",
      verifiedAt: session.verifiedAt || Date.now(),
      profile: {
        name: session.profile?.name || "",
        addresses: Array.isArray(session.profile?.addresses) ? session.profile.addresses : [],
      },
    });
    setIsModalOpen(false);

    if (postLoginAction) {
      postLoginAction();
    }

    setPostLoginAction(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPostLoginAction(null);
  };

  const value = useMemo(
    () => ({
      customer,
      isLoggedIn,
      requireLogin,
      logout,
      setCustomerSession: persistCustomer,
      openLoginModal: () => setIsModalOpen(true),
    }),
    [customer, isLoggedIn]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
      <CustomerLoginModal isOpen={isModalOpen} onClose={closeModal} onLoginSuccess={handleLoginSuccess} />
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  }
  return ctx;
}
