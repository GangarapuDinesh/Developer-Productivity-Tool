import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiCode,FiLogIn,FiUserPlus,FiBell,FiCheck,FiCheckCircle,FiAlertCircle,FiClock,FiInfo,FiTrash2,FiSun,FiMoon,FiEye,FiGrid,FiFolder,FiCheckSquare,FiTerminal,FiTarget,FiUsers,FiBarChart2,FiGithub,FiSettings,FiLogOut,FiX,FiMenu,FiHome} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import "./Navbar.css";
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useNotifications();
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicPage = publicRoutes.includes(location.pathname);
  const workspaceLinks = [
    { label: "Dashboard", path: "/dashboard", icon: <FiGrid /> },
    { label: "Projects", path: "/projects", icon: <FiFolder /> },
    { label: "My Tasks", path: "/tasks", icon: <FiCheckSquare /> },
    { label: "Code Snippets", path: "/snippets", icon: <FiTerminal /> },
    { label: "Focus", path: "/focus", icon: <FiClock /> },
    { label: "Activity", path: "/activity", icon: <FiBarChart2 /> },
    { label: "Goals", path: "/goals", icon: <FiTarget /> },
    { label: "Team", path: "/team", icon: <FiUsers /> },
    { label: "Analytics", path: "/analytics", icon: <FiBarChart2 /> },
    { label: "GitHub", path: "/github", icon: <FiGithub /> },
    { label: "Settings", path: "/settings", icon: <FiSettings /> }
  ];
  const closeMenus = () => {
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
  };
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle />;
      case "warning":
        return <FiAlertCircle />;
      case "reminder":
        return <FiClock />;
      default:
        return <FiInfo />;
    }
  };
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };
  const handleLogout = () => {
    closeMenus();
    localStorage.removeItem("devflow-token");
    localStorage.removeItem("devflow-user");
    sessionStorage.removeItem("devflow-token");
    sessionStorage.removeItem("devflow-user");
    navigate("/login", { replace: true });
  };
  const isActiveLink = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };
  return (
    <header className={`navbar ${isPublicPage ? "navbar-public" : "navbar-workspace"}`}>
      <div className="navbar-main">
        <Link to="/" className="navbar-brand" onClick={closeMenus}>
          <span className="navbar-logo">
            <FiCode />
          </span>
          <span>DevFlow</span>
        </Link>
        {isPublicPage ? (
          <nav className="navbar-links" aria-label="Main navigation">
            <Link to="/" onClick={closeMenus}>Home</Link>
            <a href="/#features" onClick={closeMenus}>Features</a>
            <a href="/#how-it-works" onClick={closeMenus}>How It Works</a>
            <a href="/#about" onClick={closeMenus}>About Us</a>
            <a href="/#contact" onClick={closeMenus}>Contact</a>
          </nav>
        ) : (
          <nav
            className={`workspace-nav ${mobileMenuOpen ? "workspace-nav-open" : ""}`}
            aria-label="Workspace navigation"
          >
            {workspaceLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenus}
                className={`workspace-nav-link ${isActiveLink(item.path) ? "active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
        <div className="navbar-actions">
          <label className="navbar-theme-control">
            {theme === "dark" ? (
              <FiMoon />
            ) : theme === "eye" ? (
              <FiEye />
            ) : (
              <FiSun />
            )}
            <select
              aria-label="Choose appearance theme"
              value={theme}
              onChange={handleThemeChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="eye">Eye Comfort</option>
            </select>
          </label>
          {!isPublicPage && (
            <div className="navbar-notification-wrap">
              <button
                type="button"
                className="navbar-notification-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((current) => !current);
                  setMobileMenuOpen(false);
                }}
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="navbar-notification-count">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <section
                  className="navbar-notification-panel"
                  aria-label="Notifications panel"
                >
                  <div className="navbar-notification-heading">
                    <div>
                      <strong>Notifications</strong>
                      <span>
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "All caught up"}
                      </span>
                    </div>
                    <div className="navbar-notification-heading-actions">
                      <button
                        type="button"
                        className="navbar-notification-icon-action"
                        onClick={markAllAsRead}
                        title="Mark all as read"
                        aria-label="Mark all notifications as read"
                        disabled={unreadCount === 0}
                      >
                        <FiCheck />
                      </button>
                      <button
                        type="button"
                        className="navbar-notification-icon-action"
                        onClick={() => setNotificationsOpen(false)}
                        title="Close notifications"
                        aria-label="Close notifications"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="navbar-notification-empty">
                      <FiBell />
                      <strong>No notifications yet</strong>
                      <span>
                        Your reminders and workspace updates will appear here.
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="navbar-notification-list">
                        {notifications.map((item) => (
                          <article
                            key={item.id}
                            className={`navbar-notification-item ${
                              item.read ? "is-read" : "is-unread"
                            }`}
                          >
                            <span
                              className={`navbar-notification-item-icon type-${item.type || "info"}`}
                            >
                              {getNotificationIcon(item.type)}
                            </span>
                            <div className="navbar-notification-item-content">
                              <strong>{item.title || "Notification"}</strong>
                              <p>{item.message || ""}</p>
                              <span>{item.time || ""}</span>
                              {!item.read && (
                                <button
                                  type="button"
                                  className="navbar-mark-read"
                                  onClick={() => markAsRead(item.id)}
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                      <div className="navbar-notification-footer">
                        <button
                          type="button"
                          onClick={clearNotifications}
                        >
                          <FiTrash2 />
                          Clear all
                        </button>
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>
          )}
          {isPublicPage ? (
            <>
              <Link
                to="/login"
                className="navbar-login"
                onClick={closeMenus}
              >
                <FiLogIn />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="navbar-register"
                onClick={closeMenus}
              >
                <FiUserPlus />
                <span>Get Started</span>
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          )}
          {!isPublicPage && (
            <button
              type="button"
              className="navbar-mobile-toggle"
              onClick={() => {
                setMobileMenuOpen((current) => !current);
                setNotificationsOpen(false);
              }}
              aria-label={mobileMenuOpen ? "Close workspace menu" : "Open workspace menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
export default Navbar;
