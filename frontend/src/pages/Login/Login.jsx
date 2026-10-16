import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {GoogleAuthProvider,signInWithPopup,} from "firebase/auth";
import { auth } from "../../firebase";
import {loginUser,verifyLoginOtp,firebaseLogin,} from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";
import "./Login.css";
function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const getErrorMessage = (error, fallback) => {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      fallback
    );
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);
    try {
      const response = await loginUser(formData);
      setFormData((previous) => ({
        ...previous,
        email: response.email || previous.email,
      }));
      setOtp("");
      setOtpStep(true);
      setMessage(response.message || "OTP sent to your registered email address.");
    } catch (error) {
      setIsError(true);
      setMessage(getErrorMessage(error, "Unable to sign in. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!/^[0-9]{6}$/.test(otp)) {
      setIsError(true);
      setMessage("Please enter a valid six-digit OTP.");
      return;
    }
    setMessage("");
    setIsError(false);
    setIsLoading(true);
    try {
      await verifyLoginOtp(formData.email, otp);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setIsError(true);
      setMessage(getErrorMessage(error,"OTP verification failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setMessage("");
    setIsError(false);
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await firebaseLogin(idToken);
      setFormData((previous) => ({
        ...previous,
        email: response.email || result.user.email || "",
        password: "",
      }));
      setOtp("");
      setOtpStep(true);
      setMessage(
        response.message || "OTP sent to your Google email address."
      );
    } catch (error) {
      setIsError(true);
      if (error.code === "auth/popup-closed-by-user") {
        setMessage("Google sign-in was cancelled.");
      } else if (error.code === "auth/unauthorized-domain") {
        setMessage("Add your website domain in Firebase Authentication settings.");
      } else {
        setMessage(getErrorMessage(error,"Google sign-in failed. Please try again."));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };
  const handleBackToLogin = () => {
    setOtpStep(false);
    setOtp("");
    setMessage("");
    setIsError(false);
  };
  return (
    <main className={`login-page theme-${theme || "light"}`}>
      <section className="login-card">
        <Link to="/" className="login-brand">
          <span className="login-brand-icon">
            <span>&lt;/&gt;</span>
          </span>
          <span>DevFlow</span>
        </Link>
        <div className="login-heading">
          <span className="login-eyebrow">
            DEVELOPER PRODUCTIVITY TOOL
          </span>
          <h1>
            {otpStep ? "Verify your email" : "Welcome back"}
          </h1>
          <p>
            {otpStep
              ? `Enter the six-digit code sent to ${formData.email}.`
              : "Sign in to your DevFlow workspace and continue your progress."}
          </p>
        </div>
        {!otpStep && (
          <>
            <button
              type="button"
              className="google-login-button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
            >
              <span className="google-g" aria-hidden="true">
                G
              </span>
              {isGoogleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>
            <div className="login-divider">
              <span>OR SIGN IN WITH EMAIL</span>
            </div>
          </>
        )}
        {!otpStep ? (
          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={isLoading || isGoogleLoading}
              required
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isLoading || isGoogleLoading}
              required
            />
            {message && (
              <p
                className={`login-message ${
                  isError ? "error" : "success"
                }`}
                role="alert"
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              className="login-submit-button"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Sending OTP..." : "Sign In"}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <label htmlFor="login-otp">
              Six-digit verification code
            </label>
            <input
              id="login-otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => {
                setOtp(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                );
              }}
              maxLength={6}
              autoFocus
              disabled={isLoading}
              required
            />
            {message && (
              <p
                className={`login-message ${
                  isError ? "error" : "success"
                }`}
                role="alert"
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              className="login-submit-button"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying OTP..." : "Verify & Sign In"}
            </button>
            <button
              type="button"
              className="google-login-button login-back-button"
              onClick={handleBackToLogin}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </form>
        )}
        {!otpStep && (
          <p className="login-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        )}
        <Link className="login-home" to="/">
          ← Back to home
        </Link>
        <div className="login-security-note">
          <span aria-hidden="true">✓</span>
          Your account is protected by secure verification.
        </div>
      </section>
    </main>
  );
}
export default Login;
