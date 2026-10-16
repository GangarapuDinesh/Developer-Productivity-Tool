import { useState } from "react";
import { checkBackendHealth } from "../../services/healthService";
import "./BackendTest.css";
function BackendTest() {
  const [status, setStatus] = useState("Not tested");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const testConnection = async () => {
    setLoading(true);
    setStatus("Connecting...");
    setDetails("");
    try {
      const data = await checkBackendHealth();
      setStatus("Connected successfully");
      setDetails(`${data.application} — ${data.status}`);
    } catch (error) {
      setStatus("Connection failed");
      setDetails(
        error.response?.data?.message ||
        error.message ||
        "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="backend-test-page">
      <section className="backend-test-card">
        <div className="backend-test-icon">↔</div>
        <h1>Backend Connection</h1>
        <p>Test the connection between React.js and Spring Boot.</p>
        <div className="backend-test-status">
          <span>Status</span>
          <strong>{status}</strong>
          {details && <p>{details}</p>}
        </div>
        <button
          type="button"
          onClick={testConnection}
          disabled={loading}
        >
          {loading ? "Testing..." : "Test Connection"}
        </button>
        <p className="backend-test-url">
          API: http://localhost:8080/api/health
        </p>
      </section>
    </main>
  );
}
export default BackendTest;
