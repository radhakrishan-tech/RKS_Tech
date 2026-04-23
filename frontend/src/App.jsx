import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import SaleBanner from "./components/SaleBanner";
import StickyCartButton from "./components/StickyCartButton";
import Footer from "./components/Footer";
import { getSeasonalProfile } from "./utils/seasonalTheme";
import IntroSplash from "./components/IntroSplash";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const SuccessPage = lazy(() => import("./pages/SuccessPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const MyAccountPage = lazy(() => import("./pages/MyAccountPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));

function App() {
  const [now, setNow] = useState(() => new Date());
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("rks_intro_seen_session") === "1";
    if (!seen) {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const profile = useMemo(() => getSeasonalProfile(now), [now]);

  useEffect(() => {
    document.documentElement.setAttribute("data-season", profile.season);
    document.documentElement.setAttribute("data-time", profile.timeOfDay);
  }, [profile.season, profile.timeOfDay]);

  const finishSplash = () => {
    localStorage.setItem("rks_intro_seen_session", "1");
    setShowSplash(false);
  };

  if (showSplash) {
    return <IntroSplash onDone={finishSplash} />;
  }

  return (
    <div className={`app-shell season-${profile.season} time-${profile.timeOfDay}`}>
      <Header />
      <SaleBanner />
      <Suspense fallback={<main className="container">Loading...</main>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/account" element={<MyAccountPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <StickyCartButton />
    </div>
  );
}

export default App;
