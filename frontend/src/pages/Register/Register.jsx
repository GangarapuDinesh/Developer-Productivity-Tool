import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiEye, FiUserPlus } from "react-icons/fi";
import { registerUser } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";
import "./Register.css";
function Register() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);
    try {
      const result = await registerUser(formData);
      setMessage(result.message || "Account created successfully. Redirecting to sign in...");
      navigate("/login", {
        state: {
          message:
            result.message ||
            "Account created successfully. Please sign in."
        }
      });
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const currentTheme = ["light", "dark", "eye"].includes(theme)
    ? theme
    : "light";
  return (
    <main className={`register-page theme-${currentTheme}`}>
       <div className="register-theme-switcher">
        <span className="register-theme-icon" aria-hidden="true">
          {currentTheme === "dark" ? (
            <FiMoon />
          ) : currentTheme === "eye" ? (
            <FiEye />
          ) : (
            <FiSun />
          )}
        </span>
        <label htmlFor="register-theme">Theme</label>
        <select
          id="register-theme"
          value={currentTheme}
          onChange={handleThemeChange}
          aria-label="Choose registration page theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="eye">Eye Comfort</option>
        </select>
      </div>
      <section className="register-card">
        <div className="register-brand-icon" aria-hidden="true">
          <FiUserPlus />
        </div>
        <h1>Create your account</h1>
        <p className="register-description">
          Start organizing your development workflow.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            name="fullName"
            type="text"
            placeholder="Enter your name"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            maxLength={100}
            required
          />
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            maxLength={150}
            required
          />
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
          {message && (
            <p
              className={
                isError
                  ? "register-message error"
                  : "register-message success"
              }
              role="alert"
            >
              {message}
            </p>
          )}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="register-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <Link className="register-home" to="/">
          Back to home
        </Link>
      </section>
    </main>
  );
}
export default Register;
