import { useEffect, useState } from "react";
import { FiUsers,FiUserPlus,FiSearch,FiMail,FiEdit2,FiTrash2,FiX,FiCheckCircle,FiClock,FiShield,FiBriefcase,FiRefreshCw,} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import teamService from "../../services/teamService";
import "./Team.css";
const emptyForm = {
  name: "",
  email: "",
  role: "Developer",
  department: "Development",
  status: "Active",
};
const avatarColors = ["purple", "blue", "green", "orange"];
const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const getAvatarColor = (id) =>
  avatarColors[Math.abs(Number(id) || 0) % avatarColors.length];
const getErrorMessage = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    return "Your login session may be missing or expired. Please sign in again.";
  }
  return (error.response?.data?.detail || error.response?.data?.message || error.response?.data?.title || error.message || "Something went wrong. Please try again.");
};
function Team() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const loadMembers = async () => {
    setIsLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const data = await teamService.getAllMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      setIsError(true);
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadMembers();
  }, []);
  const activeCount = members.filter(
    (member) => member.status === "Active"
  ).length;
  const awayCount = members.filter(
    (member) => member.status === "Away"
  ).length;
  const adminCount = members.filter(
    (member) => member.role === "Admin"
  ).length;
  const filteredMembers = members.filter((member) => {
    const searchText = search.trim().toLowerCase();
    const matchesSearch =
      (member.name || "").toLowerCase().includes(searchText) ||
      (member.email || "").toLowerCase().includes(searchText) ||
      (member.department || "").toLowerCase().includes(searchText);
    const matchesRole = roleFilter === "All" || member.role === roleFilter;
    const matchesStatus = statusFilter === "All" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });
  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
    setIsError(false);
    setShowForm(true);
  };
  const openEditForm = (member) => {
    setEditingId(member.id);
    setForm({
      name: member.name || "",
      email: member.email || "",
      role: member.role || "Developer",
      department: member.department || "Development",
      status: member.status || "Active",
    });
    setMessage("");
    setIsError(false);
    setShowForm(true);
  };
  const closeForm = () => {
    if (isSaving) return;
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
    setIsError(false);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name || !email) {
      setIsError(true);
      setMessage("Please enter the member's name and email.");
      return;
    }
    const duplicateEmail = members.some(
      (member) =>
        (member.email || "").toLowerCase() === email &&
        String(member.id) !== String(editingId)
    );
    if (duplicateEmail) {
      setIsError(true);
      setMessage("A team member with this email already exists.");
      return;
    }
    const memberData = {
      name,
      email,
      role: form.role,
      department: form.department,
      status: form.status,
    };
    setIsSaving(true);
    try {
      if (editingId !== null) {
        const updatedMember = await teamService.updateMember(
          editingId,
          memberData
        );
        setMembers((previous) =>
          previous.map((member) =>
            String(member.id) === String(editingId)
              ? updatedMember
              : member
          )
        );
      } else {
        const createdMember = await teamService.createMember(memberData);
        setMembers((previous) => [...previous, createdMember]);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setMessage("");
    } catch (error) {
      setIsError(true);
      setMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };
  const removeMember = async (id) => {
    const member = members.find(
      (item) => String(item.id) === String(id)
    );
    if (!member || deletingId !== null) return;
    const confirmed = window.confirm(
      `Remove ${member.name} from this team list?`
    );
    if (!confirmed) return;
    setDeletingId(id);
    setMessage("");
    setIsError(false);
    try {
      await teamService.deleteMember(id);
      setMembers((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(id)
        )
      );
    } catch (error) {
      setIsError(true);
      setMessage(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <>
      <Navbar />
      <div className="team-layout">
        <Sidebar />
        <main className="team-main">
          <header className="team-header">
            <div>
              <span className="team-eyebrow">
                <FiUsers /> TEAM WORKSPACE
              </span>
              <h1>Team Collaboration</h1>
              <p>
                Manage your team members, roles, and workspace information.
              </p>
            </div>
            <button
              type="button"
              className="team-primary-btn"
              onClick={openCreateForm}
            >
              <FiUserPlus /> Add Member
            </button>
          </header>
          <section className="team-stats">
            <article className="team-stat-card">
              <div className="team-stat-icon purple">
                <FiUsers />
              </div>
              <div>
                <span>Total Members</span>
                <strong>{members.length}</strong>
                <small>In this workspace</small>
              </div>
            </article>
            <article className="team-stat-card">
              <div className="team-stat-icon green">
                <FiCheckCircle />
              </div>
              <div>
                <span>Active Members</span>
                <strong>{activeCount}</strong>
                <small>Currently active</small>
              </div>
            </article>
            <article className="team-stat-card">
              <div className="team-stat-icon orange">
                <FiClock />
              </div>
              <div>
                <span>Away Members</span>
                <strong>{awayCount}</strong>
                <small>Marked as away</small>
              </div>
            </article>
            <article className="team-stat-card">
              <div className="team-stat-icon blue">
                <FiShield />
              </div>
              <div>
                <span>Administrators</span>
                <strong>{adminCount}</strong>
                <small>Workspace admins</small>
              </div>
            </article>
          </section>
          <section className="team-directory">
            <div className="team-directory-heading">
              <div>
                <h2>Team directory</h2>
                <p>View and manage the people in your workspace.</p>
              </div>
              <span className="team-count">
                {filteredMembers.length} members
              </span>
            </div>
            <div className="team-toolbar">
              <div className="team-search">
                <FiSearch />
                <input
                  type="search"
                  placeholder="Search by name, email, or department..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search team members"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter by role"
              >
                <option value="All">All roles</option>
                <option value="Admin">Admin</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Project Manager">Project Manager</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Away">Away</option>
              </select>
            </div>
            {message && !showForm && (
              <div
                className={`team-form-message ${isError ? "error" : "success"}`}
                role="alert"
              >
                <span>{message}</span>
                {isError && (
                  <button
                    type="button"
                    onClick={loadMembers}
                    disabled={isLoading}
                  >
                    <FiRefreshCw /> Retry
                  </button>
                )}
              </div>
            )}
            {isLoading ? (
              <div className="team-empty">
                <FiRefreshCw />
                <h3>Loading team members...</h3>
                <p>Connecting to your workspace.</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="team-empty">
                <FiUsers />
                <h3>
                  {members.length === 0
                    ? "No team members yet"
                    : "No team members found"}
                </h3>
                <p>
                  {members.length === 0
                    ? "Add your first team member to get started."
                    : "Try another search or change your filters."}
                </p>
                {members.length === 0 && (
                  <button
                    type="button"
                    className="team-primary-btn"
                    onClick={openCreateForm}
                  >
                    <FiUserPlus /> Add Member
                  </button>
                )}
              </div>
            ) : (
              <div className="team-table-wrapper">
                <table className="team-table">
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="team-person">
                            <div
                              className={`team-avatar ${getAvatarColor(member.id)}`}
                            >
                              {getInitials(member.name)}
                            </div>
                            <div className="team-person-details">
                              <strong>{member.name}</strong>
                              <span>
                                <FiMail /> {member.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="team-role">
                            {member.role}
                          </span>
                        </td>
                        <td>
                          <span className="team-department">
                            <FiBriefcase /> {member.department}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`team-status ${
                              member.status === "Active" ? "active" : "away"
                            }`}
                          >
                            <span className="team-status-dot" />
                            {member.status}
                          </span>
                        </td>
                        <td>
                          <div className="team-actions">
                            <button
                              type="button"
                              onClick={() => openEditForm(member)}
                              title="Edit member"
                              aria-label={`Edit ${member.name}`}
                              disabled={deletingId !== null}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMember(member.id)}
                              title="Remove member"
                              aria-label={`Remove ${member.name}`}
                              disabled={deletingId !== null}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <div className="team-note">
            <FiShield />
            <p>
              <strong>Database connected:</strong> Member changes are sent to
              the backend and saved in MySQL when the API request succeeds.
              Adding a member here does not send an email invitation or create
              a login account.
            </p>
          </div>
        </main>
        {showForm && (
          <div
            className="team-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
            <section
              className="team-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="team-modal-title"
            >
              <div className="team-modal-header">
                <div>
                  <span className="team-eyebrow">
                    <FiUsers /> TEAM MANAGEMENT
                  </span>

                  <h2 id="team-modal-title">
                    {editingId !== null ? "Edit Member" : "Add Team Member"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="team-modal-close"
                  onClick={closeForm}
                  aria-label="Close form"
                  disabled={isSaving}
                >
                  <FiX />
                </button>
              </div>
              {message && showForm && (
                <div
                  className={`team-form-message ${isError ? "error" : "success"}`}
                  role="alert"
                >
                  {message}
                </div>
              )}
              <form className="team-form" onSubmit={handleSubmit}>
                <label>
                  Full name
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    maxLength={150}
                    required
                  />
                </label>
                <div className="team-form-row">
                  <label>
                    Role
                    <select
                      value={form.role}
                      onChange={(event) =>
                        setForm({ ...form, role: event.target.value })
                      }
                    >
                      <option value="Admin">Admin</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Project Manager">Project Manager</option>
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({ ...form, status: event.target.value })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Away">Away</option>
                    </select>
                  </label>
                </div>
                <label>
                  Department
                  <select
                    value={form.department}
                    onChange={(event) =>
                      setForm({ ...form, department: event.target.value })
                    }
                  >
                    <option value="Development">Development</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Testing">Testing</option>
                    <option value="Management">Management</option>
                  </select>
                </label>
                <div className="team-form-actions">
                  <button
                    type="button"
                    className="team-secondary-btn"
                    onClick={closeForm}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="team-primary-btn"
                    disabled={isSaving}
                  >
                    <FiCheckCircle />
                    {isSaving
                      ? "Saving..."
                      : editingId !== null
                        ? "Save Changes"
                        : "Add Member"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
export default Team;
