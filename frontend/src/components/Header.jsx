import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";

function CartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function Header() {
  const { cartCount } = useCart();
  const { isLoggedIn, openLoginModal, customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : "/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header-shell">
      <div className="site-header">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src="/rks-logo-mark.svg" alt="RKS logo" className="brand-logo-img" width="46" height="46" />
          <div className="brand-text">
            <span className="brand-name">Radha Krishan Studio</span>
            <span className="brand-tagline">Premium Everyday Essentials</span>
          </div>
        </Link>

        <nav className={`header-nav${menuOpen ? " header-nav--open" : ""}`} aria-label="Main navigation" style={{ justifyContent: "center", gap: "2.5rem" }}>
          <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? "nav-active" : undefined}>Home</NavLink>
          <a href="/#categories-section" onClick={closeMenu}>Shop</a>
          <a href="/#contact" onClick={closeMenu}>Contact</a>
        </nav>

        <form className="header-search" onSubmit={submitSearch} style={{ marginLeft: "auto" }}>
          <input
            aria-label="Search products"
            placeholder="Search kurti, dupatta, towels..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <div className="header-actions">
          {!isLoggedIn ? (
            <button type="button" className="header-login-btn" onClick={openLoginModal}>Login</button>
          ) : (
            <Link to="/account" className="icon-button" aria-label="My account" title={customer?.profile?.name || "My Account"}>
              <ProfileIcon />
            </Link>
          )}
          <Link to="/checkout" className="icon-button" aria-label="Cart">
            <CartIcon />
            {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
          </Link>
          <button
            className="icon-button hamburger-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
