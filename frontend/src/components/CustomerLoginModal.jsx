import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { requestOtp, verifyOtp } from "../services/api";

function normalizeMobile(value) {
  return value.replace(/\D/g, "").slice(-10);
}

export default function CustomerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const canSendOtp = useMemo(() => normalizeMobile(mobile).length === 10 && !isLoading, [mobile, isLoading]);
  const canVerify = useMemo(() => otpStep && otp.trim().length === 5 && !isLoading, [otpStep, otp, isLoading]);

  const resetState = () => {
    setMobile("");
    setOtp("");
    setOtpStep(false);
    setIsLoading(false);
    setError("");
    setDebugCode("");
  };

  const close = () => {
    resetState();
    onClose();
  };

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");
      const cleanMobile = normalizeMobile(mobile);
      const response = await requestOtp({ mobile: cleanMobile });
      setOtpStep(true);
      if (response?.debugCode) {
        setDebugCode(response.debugCode);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      setError("");
      const cleanMobile = normalizeMobile(mobile);
      const response = await verifyOtp({ mobile: cleanMobile, otp: otp.trim() });
      onLoginSuccess({
        mobile: cleanMobile,
        token: response.token,
        role: response.role,
        verifiedAt: Date.now(),
        profile: response.profile,
      });
      resetState();
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="auth-modal"
            initial={{ y: 14, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="auth-modal-close" type="button" onClick={close} aria-label="Close login popup">
              x
            </button>
            <h3>Login to Continue</h3>
            <p>Verify mobile with OTP to add products to cart instantly.</p>

            <label htmlFor="customer-mobile">Mobile Number</label>
            <input
              id="customer-mobile"
              value={mobile}
              placeholder="Enter 10-digit mobile"
              onChange={(e) => setMobile(normalizeMobile(e.target.value))}
              inputMode="numeric"
              maxLength={10}
            />

            {otpStep ? (
              <>
                <label htmlFor="customer-otp">OTP</label>
                <input
                  id="customer-otp"
                  value={otp}
                  placeholder="Enter 5-digit OTP"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  inputMode="numeric"
                  maxLength={5}
                />
                {debugCode ? <small className="auth-debug-code">Demo OTP: {debugCode}</small> : null}
                <button type="button" onClick={handleVerifyOtp} disabled={!canVerify}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            ) : (
              <button type="button" onClick={handleSendOtp} disabled={!canSendOtp}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}

            {error ? <p className="auth-modal-error">{error}</p> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
