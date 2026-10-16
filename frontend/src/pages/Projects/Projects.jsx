import { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlus,FiSearch,FiFolder,FiCalendar,FiTrash2,FiX,FiCode,FiCheckCircle,FiClock} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getAllProjects,createProject as createProjectApi,updateProject as updateProjectApi,deleteProject as deleteProjectApi} from "../../services/projectService";
import "./Projects.css";
const emptyProject = {
  name: "",
  description: "",
  technology: "",
  status: "Planning",
  progress: 0,
  deadline: ""
};
function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Your login session is missing or expired. Please log in again.";
  }
  if (error.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.code === "ERR_NETWORK") {
    return "Cannot connect to the backend. Check that Spring Boot is running.";
  }
  return error.message || "Something went wrong. Please try again.";
}
function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyProject);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();
    return projects.filter((project) => {
      const name = project.name || "";
      const description = project.description || "";
      const technology = project.technology || "";
      const matchesSearch =
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        technology.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);
  const completedCount = projects.filter(
    (project) => project.status === "Completed"
  ).length;
  const activeCount = projects.filter(
    (project) => project.status === "In Progress"
  ).length;
  const averageProgress = projects.length
    ? Math.round(
        projects.reduce(
          (total, project) => total + Number(project.progress || 0),
          0
        ) / projects.length
      )
    : 0;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: name === "progress" ? Number(value) : value
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const progress = Number(formData.progress);
    const projectData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      technology: formData.technology.trim(),
      status:
        progress === 100
          ? "Completed"
          : progress === 0
            ? "Planning"
            : formData.status,
      progress,
      deadline: formData.deadline || null
    };
    setSaving(true);
    try {
      const createdProject = await createProjectApi(projectData);
      setProjects((previous) => [createdProject, ...previous]);
      setFormData({ ...emptyProject });
      setShowForm(false);
      setSearch("");
      setStatusFilter("All");
      setMessage("Project created successfully and saved to the backend.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (!confirmed) return;
    setMessage("");
    setError("");
    setDeletingId(projectId);
    try {
      await deleteProjectApi(projectId);
      setProjects((previous) =>
        previous.filter((project) => project.id !== projectId)
      );
      setMessage("Project deleted successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  };
  const handleProgressChange = async (projectId, progressValue) => {
    const progress = Number(progressValue);
    const existingProject = projects.find(
      (project) => project.id === projectId
    );
    if (!existingProject) return;
    const updatedProject = {
      ...existingProject,
      progress,
      status:
        progress === 100
          ? "Completed"
          : progress === 0
            ? "Planning"
            : "In Progress"
    };
    setMessage("");
    setError("");
    setUpdatingId(projectId);
    try {
      const savedProject = await updateProjectApi(projectId, {
        name: existingProject.name,
        description: existingProject.description || "",
        technology: existingProject.technology || "",
        status: updatedProject.status,
        progress,
        deadline: existingProject.deadline || null
      });
      setProjects((previous) =>
        previous.map((project) =>
          project.id === projectId ? savedProject : project
        )
      );
      setMessage("Project progress updated successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      await loadProjects();
    } finally {
      setUpdatingId(null);
    }
  };
  return (
    <>
      <Navbar />
      <div className="projects-layout">
        <Sidebar />
        <main className="projects-main">
          <header className="projects-header">
            <div>
              <span className="projects-eyebrow">
                WORKSPACE MANAGEMENT
              </span>
              <h1>My Projects</h1>
              <p>Plan, organize, and track your development work.</p>
            </div>
            <button
              type="button"
              className="projects-create-button"
              onClick={() => {
                setMessage("");
                setError("");
                setFormData({ ...emptyProject });
                setShowForm(true);
              }}
            >
              <FiPlus />
              New Project
            </button>
          </header>
          {message && (
            <div className="projects-message" role="status">
              <FiCheckCircle />
              <span>{message}</span>
              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Dismiss message"
              >
                <FiX />
              </button>
            </div>
          )}
          {error && (
            <div className="projects-message" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <FiX />
              </button>
            </div>
          )}
          <section className="projects-stats">
            <article className="projects-stat-card">
              <span className="projects-stat-icon purple">
                <FiFolder />
              </span>
              <div>
                <span>Total projects</span>
                <strong>{projects.length}</strong>
              </div>
            </article>
            <article className="projects-stat-card">
              <span className="projects-stat-icon blue">
                <FiClock />
              </span>
              <div>
                <span>In progress</span>
                <strong>{activeCount}</strong>
              </div>
            </article>
            <article className="projects-stat-card">
              <span className="projects-stat-icon green">
                <FiCheckCircle />
              </span>
              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </article>
            <article className="projects-stat-card">
              <span className="projects-stat-icon orange">
                <FiCode />
              </span>
              <div>
                <span>Average progress</span>
                <strong>{averageProgress}%</strong>
              </div>
            </article>
          </section>
          <section className="projects-toolbar">
            <label className="projects-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search projects..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search projects"
              />
            </label>
            <select
              className="projects-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter projects by status"
            >
              <option value="All">All statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </section>
          {showForm && (
            <section className="projects-form-panel">
              <div className="projects-form-heading">
                <div>
                  <h2>Create a project</h2>
                  <p>Enter the details for your new project.</p>
                </div>
                <button
                  type="button"
                  className="projects-close-button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ ...emptyProject });
                  }}
                  aria-label="Close project form"
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="projects-form">
                <label>
                  Project name
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Technologies
                  <input
                    name="technology"
                    value={formData.technology}
                    onChange={handleChange}
                    placeholder="React, Java, MySQL"
                    maxLength={150}
                    required
                  />
                </label>
                <label className="projects-description-field">
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what you are building..."
                    rows={3}
                    maxLength={500}
                    required
                  />
                </label>
                <label>
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(event) => {
                      const status = event.target.value;
                      setFormData((previous) => ({
                        ...previous,
                        status,
                        progress:
                          status === "Completed"
                            ? 100
                            : status === "Planning"
                              ? 0
                              : Math.max(1, previous.progress)
                      }));
                    }}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
                <label>
                  Progress: {formData.progress}%
                  <input
                    type="range"
                    name="progress"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.progress}
                    onChange={(event) => {
                      const progress = Number(event.target.value);
                      setFormData((previous) => ({
                        ...previous,
                        progress,
                        status:
                          progress === 100
                            ? "Completed"
                            : progress === 0
                              ? "Planning"
                              : "In Progress"
                      }));
                    }}
                  />
                </label>
                <label>
                  Deadline
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </label>
                <div className="projects-form-actions">
                  <button
                    type="button"
                    className="projects-cancel-button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ ...emptyProject });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="projects-submit-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Create Project"}
                  </button>
                </div>
              </form>
            </section>
          )}
          <section className="projects-list-section">
            <div className="projects-list-heading">
              <div>
                <h2>All projects</h2>
                <p>
                  {loading
                    ? "Loading projects..."
                    : `${filteredProjects.length} project(s) found`}
                </p>
              </div>
            </div>
            {loading ? (
              <div className="projects-empty-state">
                <FiClock />
                <h3>Loading projects</h3>
                <p>Fetching your projects from the backend.</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="projects-empty-state">
                <FiFolder />
                <h3>No projects found</h3>
                <p>
                  {error
                    ? "Check the error above and retry after fixing the connection."
                    : "Try another search or create a new project."}
                </p>
                {error ? (
                  <button type="button" onClick={loadProjects}>
                    Retry loading
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setFormData({ ...emptyProject });
                      setShowForm(true);
                    }}
                  >
                    <FiPlus />
                    Create a project
                  </button>
                )}
              </div>
            ) : (
              <div className="projects-grid">
                {filteredProjects.map((project) => (
                  <article className="project-card" key={project.id}>
                    <div className="project-card-top">
                      <span className="project-card-icon">
                        <FiFolder />
                      </span>
                      <button
                        type="button"
                        className="project-delete-button"
                        onClick={() => handleDelete(project.id)}
                        disabled={
                          deletingId === project.id ||
                          updatingId === project.id
                        }
                        title="Delete project"
                        aria-label={`Delete ${project.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="project-card-title-row">
                      <h3>{project.name}</h3>
                      <span
                        className={`project-status status-${(
                          project.status || "Planning"
                        ).toLowerCase().replace(" ", "-")}`}
                      >
                        {project.status || "Planning"}
                      </span>
                    </div>
                    <p className="project-description">
                      {project.description}
                    </p>
                    <div className="project-technology">
                      <FiCode />
                      <span>{project.technology}</span>
                    </div>
                    <div className="project-progress-heading">
                      <span>Project progress</span>
                      <strong>{Number(project.progress || 0)}%</strong>
                    </div>
                    <div
                      className="project-progress-track"
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Number(project.progress || 0)}
                    >
                      <span
                        style={{
                          width: `${Number(project.progress || 0)}%`
                        }}
                      />
                    </div>
                    <label className="project-progress-control">
                      {updatingId === project.id
                        ? "Saving progress..."
                        : "Update progress"}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={Number(project.progress || 0)}
                        disabled={
                          updatingId === project.id ||
                          deletingId === project.id
                        }
                        onChange={(event) =>
                          handleProgressChange(
                            project.id,
                            event.target.value
                          )
                        }
                        aria-label={`Update ${project.name} progress`}
                      />
                    </label>
                    <div className="project-card-footer">
                      <FiCalendar />
                      <span>
                        {project.deadline
                          ? `Deadline: ${String(project.deadline).slice(0, 10)}`
                          : "No deadline set"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
export default Projects;
