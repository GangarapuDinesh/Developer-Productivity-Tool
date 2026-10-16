import { NavLink, useNavigate } from "react-router-dom";
import { FiActivity,FiBarChart2,FiCalendar,FiCheckSquare,FiChevronLeft,FiChevronRight,FiCode,FiFolder,FiGithub,FiHome,FiLogOut,FiSettings,FiTarget,FiUsers,} from "react-icons/fi";
import { useSidebar } from "../../context/SidebarContext";
import "./Sidebar.css";
function Sidebar() {
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigation = [
   {
      label: "Dashboard",
      path: "/dashboard",
      icon: <FiHome />,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: <FiFolder />,
    },
    {
      label: "My Tasks",
      path: "/tasks",
      icon: <FiCheckSquare />,
    },
    {
      label: "Code Snippets",
      path: "/snippets",
      icon: <FiCode />,
    },
    {
      label: "GitHub",
      path: "/github",
      icon: <FiGithub />,
    },
    {
      label: "Focus Sessions",
      path: "/focus",
      icon: <FiCalendar />,
    },
    {
      label: "Activity Logs",
      path: "/activity",
      icon: <FiActivity />,
    },
    {
      label: "Goals",
      path: "/goals",
      icon: <FiTarget />,
    },
    {
      label: "Team",
      path: "/team",
      icon: <FiUsers />,
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: <FiBarChart2 />,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <FiSettings />,
    },
  ];
  return (
    <aside
      className={`sidebar ${
        isCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <div className="sidebar-header">
        <NavLink
          to="/"
          className="sidebar-brand"
          title="DevFlow Home"
        >
          <span className="sidebar-brand-icon">
            <FiCode />
          </span>
          {!isCollapsed && (
            <span className="sidebar-brand-name">
              DevFlow
            </span>
          )}
        </NavLink>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {isCollapsed ? (
            <FiChevronRight />
          ) : (
            <FiChevronLeft />
          )}
        </button>
      </div>
      <div className="sidebar-section-label">
        {!isCollapsed && "WORKSPACE"}
      </div>
      <nav
        className="sidebar-navigation"
        aria-label="Main navigation"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">
              {item.icon}
            </span>
            {!isCollapsed && (
              <span>{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {!isCollapsed && (
          <div className="sidebar-plan">
            <div className="sidebar-plan-icon">
              <FiCode />
            </div>
            <strong>Your developer space</strong>
            <p>
              Keep your work organized and your progress moving.
            </p>
          </div>
        )}
        <button
          type="button"
          className="sidebar-logout"
          onClick={() => navigate("/")}
          title={isCollapsed ? "Log out" : undefined}
        >
          <FiLogOut />
          {!isCollapsed && (
            <span>LOg out</span>
          )}
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
