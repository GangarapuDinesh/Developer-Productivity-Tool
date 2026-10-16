import { useState } from "react";
import { FiUser,FiBell,FiShield,FiMonitor,FiMoon,FiSun,FiEye,FiSave,FiLock,FiMail,FiSmartphone,FiCheckCircle,FiAlertCircle,FiLogOut,} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Settings.css";
const DEFAULT_NOTIFICATIONS = {
    taskReminders: true,
    projectUpdates: true,
    teamActivity: false,
    weeklyReport: true,
    emailNotifications: true,
};
const DEFAULT_SECURITY = {
    loginAlerts: true,
    rememberSession: false,
};
const readStorage = (key, fallback = {}) => {
    try {
        const storedValue = localStorage.getItem(key);
        if (!storedValue) {
            return fallback;
        }
        const parsedValue = JSON.parse(storedValue);
        if (
            !parsedValue ||
            typeof parsedValue !== "object" ||
            Array.isArray(parsedValue)
        ) {
            return fallback;
        }
        return parsedValue;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
};
const readCurrentUser = () => {
    try {
        const storedUser = sessionStorage.getItem("devflow-user");

        if (!storedUser) {
            return {};
        }
       const parsedUser = JSON.parse(storedUser);
        return parsedUser &&
            typeof parsedUser === "object" &&
            !Array.isArray(parsedUser)
            ? parsedUser
            : {};
    } catch (error) {
        console.error("Unable to read account details:", error);
        return {};
    }
};
const getInitialProfile = () => {
    const user = readCurrentUser();
    const savedProfile = readStorage(
        "devflow-profile-preferences",
        {}
    );
    return {
        fullName:
            savedProfile.fullName ??
            user.fullName ??
            user.name ??
            "",
        email:
            savedProfile.email ??
            user.email ??
            "",
    };
};
const getInitialNotifications = () => ({
    ...DEFAULT_NOTIFICATIONS,
    ...readStorage("devflow-notification-preferences", {}),
});
const getInitialSecurity = () => ({
    ...DEFAULT_SECURITY,
    ...readStorage("devflow-security-preferences", {}),
});
function Settings() {
    const { theme, setTheme } = useTheme();
    const [profile, setProfile] = useState(getInitialProfile);
    const [notifications, setNotifications] = useState(
        getInitialNotifications
    );
    const [security, setSecurity] = useState(getInitialSecurity);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
   const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };
    const updateProfile = (event) => {
        const { name, value } = event.target;
        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
        setMessage("");
    };
    const toggleNotification = (name) => {
        setNotifications((previous) => ({
            ...previous,
            [name]: !previous[name],
        }));
        setMessage("");
    };
    const toggleSecurity = (name) => {
        setSecurity((previous) => ({
            ...previous,
            [name]: !previous[name],
        }));
        setMessage("");
    };
    const changeTheme = (selectedTheme) => {
        setTheme(selectedTheme);
        setMessage("");
    };
    const saveSettings = (event) => {
        event.preventDefault();
        if (!profile.fullName.trim()) {
            showMessage("Please enter your full name.", "error");
            return;
        }
        if (!profile.email.trim()) {
            showMessage("Please enter your email address.", "error");
            return;
        }
        try {
            const updatedProfile = {
                fullName: profile.fullName.trim(),
                email: profile.email.trim(),
            };
            localStorage.setItem(
                "devflow-profile-preferences",
                JSON.stringify(updatedProfile)
            );
            localStorage.setItem(
                "devflow-notification-preferences",
                JSON.stringify(notifications)
            );
            localStorage.setItem(
                "devflow-security-preferences",
                JSON.stringify(security)
            );
            showMessage(
                "Your settings have been saved successfully."
            );
        } catch (error) {
            console.error("Unable to save settings:", error);
            showMessage(
                "Unable to save settings. Please check your browser storage.",
                "error"
            );
        }
    };
    const resetPreferences = () => {
        try {
            setNotifications({ ...DEFAULT_NOTIFICATIONS });
            setSecurity({ ...DEFAULT_SECURITY });
            localStorage.setItem(
                "devflow-notification-preferences",
                JSON.stringify(DEFAULT_NOTIFICATIONS)
            );
            localStorage.setItem(
                "devflow-security-preferences",
                JSON.stringify(DEFAULT_SECURITY)
            );
            showMessage(
                "Notification and security preferences restored."
            );
        } catch (error) {
            console.error("Unable to reset preferences:", error);
            showMessage(
                "Unable to reset preferences. Please try again.",
                "error"
            );
        }
    };
    const displayName = profile.fullName.trim() || "Your profile";
    const avatarLetter = profile.fullName.trim()
        ? profile.fullName.trim().charAt(0).toUpperCase()
        : "U";
    return (
        <>
            <Navbar />
            <div className={`settings-layout theme-${theme}`}>
                <Sidebar />
                <main className="settings-main">
                    <div className="settings-heading">
                        <div>
                            <span className="settings-eyebrow">
                                PREFERENCES
                            </span>
                            <h1>Settings</h1>
                            <p>
                                Manage your profile, appearance, notifications,
                                and preferences.
                            </p>
                        </div>
                        <div className="settings-heading-icon">
                            <FiMonitor />
                        </div>
                    </div>
                    {message && (
                        <div
                            className={`settings-message ${
                                messageType === "error"
                                    ? "error"
                                    : "success"
                            }`}
                            role={messageType === "error" ? "alert" : "status"}
                        >
                            {messageType === "error" ? (
                                <FiAlertCircle />
                            ) : (
                                <FiCheckCircle />
                            )}
                            <span>{message}</span>
                        </div>
                    )}
                    <form onSubmit={saveSettings}>
                        <section className="settings-card">
                            <div className="settings-section-heading">
                                <div className="settings-section-icon profile-icon">
                                    <FiUser />
                                </div>

                                <div>
                                    <h2>Profile information</h2>
                                    <p>
                                        Review your personal account details.
                                    </p>
                                </div>
                            </div>
                            <div className="settings-profile-avatar">
                                <div className="settings-avatar">
                                    {avatarLetter}
                                </div>
                                <div>
                                    <h3>{displayName}</h3>
                                    <p>
                                        {profile.email || "No email available"}
                                    </p>
                                </div>
                            </div>
                            <div className="settings-form-grid">
                                <label className="settings-field">
                                    <span>Full name</span>
                                    <div className="settings-input-wrap">
                                        <FiUser />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profile.fullName}
                                            onChange={updateProfile}
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            maxLength={100}
                                            required
                                        />
                                    </div>
                                </label>
                                <label className="settings-field">
                                    <span>Email address</span>
                                    <div className="settings-input-wrap">
                                        <FiMail />
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={updateProfile}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            maxLength={150}
                                            required
                                        />
                                    </div>
                                </label>
                            </div>
                            <p className="settings-note">
                                These details are saved as local preferences.
                                They do not change your registered account in
                                the backend database.
                            </p>
                        </section>
                        <section className="settings-card">
                            <div className="settings-section-heading">
                                <div className="settings-section-icon appearance-icon">
                                    <FiMonitor />
                                </div>
                                <div>
                                    <h2>Appearance</h2>
                                    <p>
                                        Choose the interface that feels
                                        comfortable to you.
                                    </p>
                                </div>
                            </div>
                            <div className="settings-theme-grid">
                                <button
                                    type="button"
                                    className={`settings-theme-option ${
                                        theme === "light" ? "selected" : ""
                                    }`}
                                    aria-pressed={theme === "light"}
                                    onClick={() => changeTheme("light")}
                                >
                                    <div className="settings-theme-preview light-preview">
                                        <FiSun />
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className="settings-theme-label">
                                        <span>
                                            <FiSun />
                                            Light
                                        </span>
                                       {theme === "light" && (
                                            <FiCheckCircle />
                                        )}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`settings-theme-option ${
                                        theme === "dark" ? "selected" : ""
                                    }`}
                                    aria-pressed={theme === "dark"}
                                    onClick={() => changeTheme("dark")}
                                >
                                    <div className="settings-theme-preview dark-preview">
                                        <FiMoon />
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className="settings-theme-label">
                                        <span>
                                            <FiMoon />
                                            Dark
                                        </span>
                                        {theme === "dark" && (
                                            <FiCheckCircle />
                                        )}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`settings-theme-option ${
                                        theme === "eye" ? "selected" : ""
                                    }`}
                                    aria-pressed={theme === "eye"}
                                    onClick={() => changeTheme("eye")}
                                >
                                    <div className="settings-theme-preview eye-preview">
                                        <FiEye />
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className="settings-theme-label">
                                        <span>
                                            <FiEye />
                                            Eye Comfort
                                        </span>
                                        {theme === "eye" && (
                                            <FiCheckCircle />
                                        )}
                                    </div>
                                </button>
                            </div>
                            <p className="settings-note">
                                The selected theme is managed by your existing
                                ThemeContext. Theme persistence depends on your
                                ThemeContext implementation.
                            </p>
                        </section>
                        <section className="settings-card">
                            <div className="settings-section-heading">
                                <div className="settings-section-icon notification-icon">
                                    <FiBell />
                                </div>
                                <div>
                                    <h2>Notifications</h2>
                                    <p>
                                        Choose which updates you want to enable.
                                    </p>
                                </div>
                            </div>
                            <div className="settings-options">
                                <div className="settings-option-row">
                                    <div className="settings-option-icon">
                                        <FiCheckCircle />
                                    </div>
                                    <div className="settings-option-content">
                                        <h3>Task reminders</h3>
                                        <p>
                                            Reminders for tasks and upcoming
                                            deadlines.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={notifications.taskReminders}
                                        aria-label="Task reminders"
                                        className={`settings-switch ${
                                            notifications.taskReminders
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleNotification("taskReminders")
                                        }
                                    >
                                        <span />
                                    </button>
                                </div>
                                <div className="settings-option-row">
                                    <div className="settings-option-icon">
                                        <FiMonitor />
                                    </div>
                                    <div className="settings-option-content">
                                        <h3>Project updates</h3>
                                        <p>
                                            Updates related to your project
                                            progress.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={notifications.projectUpdates}
                                        aria-label="Project updates"
                                        className={`settings-switch ${
                                            notifications.projectUpdates
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleNotification("projectUpdates")
                                        }
                                    >
                                        <span />
                                    </button>
                                </div>
                                <div className="settings-option-row">
                                    <div className="settings-option-icon">
                                        <FiUser />
                                    </div>
                                    <div className="settings-option-content">
                                        <h3>Team activity</h3>
                                        <p>
                                            Updates about team members and
                                            collaboration.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={notifications.teamActivity}
                                        aria-label="Team activity"
                                        className={`settings-switch ${
                                            notifications.teamActivity
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleNotification("teamActivity")
                                        }
                                    >
                                        <span />
                                    </button>
                                </div>
                                <div className="settings-option-row">
                                    <div className="settings-option-icon">
                                        <FiMail />
                                    </div>
                                    <div className="settings-option-content">
                                        <h3>Email notifications</h3>
                                        <p>
                                            Enable your email notification
                                            preference.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            notifications.emailNotifications
                                        }
                                        aria-label="Email notifications"
                                        className={`settings-switch ${
                                            notifications.emailNotifications
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleNotification(
                                                "emailNotifications"
                                            )
                                        }
                                    >
                                        <span />
                                    </button>
                               </div>
                                <div className="settings-option-row">
                                    <div className="settings-option-icon">
                                        <FiBell />
                                    </div>
                                    <div className="settings-option-content">
                                        <h3>Weekly productivity report</h3>
                                        <p>
                                            Keep your weekly summary preference
                                            enabled.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={notifications.weeklyReport}
                                        aria-label="Weekly productivity report"
                                        className={`settings-switch ${
                                            notifications.weeklyReport
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleNotification("weeklyReport")
                                        }
                                    >
                                        <span />
                                    </button>
                                </div>
                            </div>
                            <p className="settings-note">
                                These switches save your preferences. Actual
                                email, browser, or server notifications require
                                a separate notification implementation.
                            </p>
                        </section>
                        <section className="settings-card">
                            <div className="settings-section-heading">
                                <div className="settings-section-icon security-icon">
                                    <FiShield />
                                </div>
                                <div>
                                    <h2>Security preferences</h2>
                                    <p>
                                        Manage local security-related preferences.
                                    </p>
                                </div>
                            </div>
                            <div className="settings-options">
                                <div className="settings-option-row">
                                    <div className="settings-option-icon">
                                        <FiAlertCircle />
                                    </div>
                                    <div className="settings-option-content">
                                        <h3>Login alerts preference</h3>
                                        <p>
                                            Choose whether you want login alerts
                                            enabled.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={security.loginAlerts}
                                        aria-label="Login alerts preference"
                                        className={`settings-switch ${
                                            security.loginAlerts ? "active" : ""
                                        }`}
                                        onClick={() =>
                                            toggleSecurity("loginAlerts")
                                        }
                                    >
                                        <span />
                                    </button>
                                </div>

                                <div className="settings-option-row">
                                    <div className="settings-option-icon">
                                        <FiSmartphone />
                                    </div>
                                    <div className="settings-option-content">
                                        <h3>Remember session preference</h3>
                                        <p>
                                            Save your preference for session
                                            convenience.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={security.rememberSession}
                                        aria-label="Remember session preference"
                                        className={`settings-switch ${
                                            security.rememberSession
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleSecurity("rememberSession")
                                        }
                                    >
                                        <span />
                                    </button>
                                </div>
                                <div className="settings-security-info">
                                    <FiLock />
                                    <div>
                                        <h3>Password and authentication</h3>
                                        <p>
                                            Password changes, two-factor
                                            authentication, and actual login
                                            alerts are not connected yet.
                                        </p>
                                    </div>
                                </div>
                                <div className="settings-security-info">
                                    <FiLogOut />
                                    <div>
                                        <h3>Session management</h3>
                                        <p>
                                            Use your existing logout flow to
                                            sign out. The remember-session
                                            switch is a preference only and
                                            does not change authentication.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <div className="settings-save-bar">
                            <button
                                type="button"
                                className="settings-reset-button"
                                onClick={resetPreferences}
                            >
                                Reset preferences
                            </button>
                            <p>
                                Save your preferences to keep them after
                                refreshing the page.
                            </p>
                            <button
                                type="submit"
                                className="settings-save-button"
                            >
                                <FiSave />
                                Save preferences
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}
export default Settings;