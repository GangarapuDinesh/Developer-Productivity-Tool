import { useEffect, useMemo, useState } from "react";
import { FiPlus,FiSearch,FiCheckCircle,FiClock,FiList,FiTrash2,FiX,FiCalendar,FiCheckSquare,} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import taskService from "../../services/taskService";
import "./Tasks.css";
const emptyTask = {
  title: "",
  description: "",
  project: "DevFlow",
  priority: "Medium",
  status: "To Do",
  dueDate: "",
};
const normalizeTask = (task) => ({
  ...task,
  id: task.id ?? task.taskId,
  title: task.title ?? "",
  description: task.description ?? "",
  project: task.project ?? task.projectName ?? "DevFlow",
  priority: task.priority ?? "Medium",
  status: task.status ?? "To Do",
  dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : "",
});
const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  if (data?.message) {
    return data.message;
  }
  if (error.response?.status === 404) {
    return "Tasks API not found. Check your TaskController endpoint.";
  }
  if (error.response?.status === 401) {
    return "Your session may have expired. Please log in again.";
  }
  if (error.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (!error.response) {
    return "Cannot connect to the backend. Make sure Spring Boot is running.";
  }
  return fallback;
};
function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyTask);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await taskService.getAllTasks();
      const taskList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.data)
            ? data.data
            : null;
      if (!taskList) {
        throw new Error("The Tasks API did not return a task list.");
      }
      setTasks(taskList.map(normalizeTask));
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(
        getErrorMessage(err, "Unable to load tasks from the backend.")
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadTasks();
  }, []);
  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const activeCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;
  const pendingCount = tasks.filter(
    (task) => task.status === "To Do"
  ).length;
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.project.toLowerCase().includes(query);
     const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);
 const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.project.trim()) {
      setError("Please enter a task title and project name.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
      };
      const createdTask = await taskService.createTask(payload);
      if (createdTask && typeof createdTask === "object") {
        const savedTask = normalizeTask(createdTask);
        if (savedTask.id != null) {
          setTasks((previous) => [
            savedTask,
            ...previous.filter((task) => task.id !== savedTask.id),
          ]);
        } else {
          await loadTasks();
        }
      } else {
        await loadTasks();
      }
      setFormData(emptyTask);
      setShowForm(false);
      setSearch("");
      setStatusFilter("All");
      setPriorityFilter("All");
      setMessage("Task created successfully.");
    } catch (err) {
      console.error("Error creating task:", err);
      setError(getErrorMessage(err, "Unable to create the task."));
    } finally {
      setSaving(false);
    }
  };
  const updateTaskStatus = async (task, status) => {
    const previousStatus = task.status;
    if (previousStatus === status) return;
    setError("");
    setMessage("");
    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id ? { ...item, status } : item
      )
    );
    try {
      const payload = {
        title: task.title,
        description: task.description,
        project: task.project,
        priority: task.priority,
        status,
        dueDate: task.dueDate || null,
      };
      const updatedTask = await taskService.updateTask(task.id, payload);
      if (updatedTask && typeof updatedTask === "object") {
        const normalized = normalizeTask(updatedTask);
        setTasks((previous) =>
          previous.map((item) =>
            item.id === task.id ? normalized : item
          )
        );
      }
      setMessage("Task status updated successfully.");
    } catch (err) {
      console.error("Error updating task:", err);
      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id
            ? { ...item, status: previousStatus }
            : item
        )
      );
      setError(getErrorMessage(err, "Unable to update task status."));
    }
  };
  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) return;
    setError("");
    setMessage("");
    try {
      await taskService.deleteTask(taskId);
      setTasks((previous) =>
        previous.filter((task) => task.id !== taskId)
      );
      setMessage("Task deleted successfully.");
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(getErrorMessage(err, "Unable to delete the task."));
    }
  };
  const openCreateForm = () => {
    setError("");
    setMessage("");
    setFormData(emptyTask);
    setShowForm(true);
  };
  return (
    <>
      <Navbar />
      <div className="tasks-layout">
        <Sidebar />
        <main className="tasks-main">
          <header className="tasks-header">
            <div>
              <span className="tasks-eyebrow">TASK MANAGEMENT</span>
              <h1>My Tasks</h1>
              <p>
                Plan your day, track your progress, and finish strong.
              </p>
            </div>
            <button
              type="button"
              className="tasks-create-button"
              onClick={openCreateForm}
            >
              <FiPlus />
              Add Task
            </button>
          </header>
          {message && (
            <div className="tasks-message" role="status">
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
            <div className="tasks-message tasks-error" role="alert">
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
          <section className="tasks-stats">
            <article className="tasks-stat-card">
              <span className="tasks-stat-icon purple">
                <FiList />
              </span>
              <div>
                <span>Total tasks</span>
                <strong>{tasks.length}</strong>
              </div>
            </article>
            <article className="tasks-stat-card">
              <span className="tasks-stat-icon orange">
                <FiClock />
              </span>
              <div>
                <span>To do</span>
                <strong>{pendingCount}</strong>
              </div>
            </article>
            <article className="tasks-stat-card">
              <span className="tasks-stat-icon blue">
                <FiCheckSquare />
              </span>
              <div>
                <span>In progress</span>
                <strong>{activeCount}</strong>
              </div>
            </article>
            <article className="tasks-stat-card">
              <span className="tasks-stat-icon green">
                <FiCheckCircle />
              </span>
              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </article>
          </section>
          {showForm && (
            <section className="tasks-form-panel">
              <div className="tasks-form-heading">
                <div>
                  <h2>Create a task</h2>
                  <p>Add the details you need to get started.</p>
                </div>
                <button
                  type="button"
                  className="tasks-close-button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(emptyTask);
                  }}
                  aria-label="Close task form"
                >
                  <FiX />
                </button>
              </div>
              <form className="tasks-form" onSubmit={handleSubmit}>
                <label>
                  Task title
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="What needs to be done?"
                    maxLength={150}
                    required
                  />
                </label>
                <label>
                  Project
                  <input
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    placeholder="Project name"
                    maxLength={100}
                    required
                  />
                </label>
                <label className="tasks-description-field">
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add task details..."
                    rows={3}
                    maxLength={500}
                  />
                </label>
                <label>
                  Priority
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
                <label>
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
                <label>
                  Due date
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </label>
                <div className="tasks-form-actions">
                  <button
                    type="button"
                    className="tasks-cancel-button"
                    disabled={saving}
                    onClick={() => {
                      setShowForm(false);
                      setFormData(emptyTask);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="tasks-submit-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Create Task"}
                  </button>
                </div>
              </form>
            </section>
          )}
          <section className="tasks-list-section">
            <div className="tasks-list-heading">
              <div>
                <h2>All tasks</h2>
                <p>{filteredTasks.length} task(s) found</p>
              </div>
              {!loading && (
                <button
                  type="button"
                  className="tasks-cancel-button"
                  onClick={loadTasks}
                >
                  Refresh
                </button>
              )}
            </div>
            <div className="tasks-toolbar">
              <label className="tasks-search">
                <FiSearch />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks or projects..."
                  aria-label="Search tasks"
                />
              </label>
              <select
                className="tasks-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                className="tasks-filter"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                aria-label="Filter by priority"
              >
                <option value="All">All priorities</option>
                <option value="High">High priority</option>
                <option value="Medium">Medium priority</option>
                <option value="Low">Low priority</option>
              </select>
            </div>
            {loading ? (
              <div className="tasks-empty-state">
                <FiClock />
                <h3>Loading tasks...</h3>
                <p>Fetching your tasks from the backend.</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="tasks-empty-state">
                <FiCheckSquare />
                <h3>No tasks found</h3>
                <p>
                  Try changing your filters or create a new task.
                </p>
                <button type="button" onClick={openCreateForm}>
                  <FiPlus />
                  Add a task
                </button>
              </div>
            ) : (
              <div className="tasks-list">
                {filteredTasks.map((task) => (
                  <article
                    className={`task-card ${
                      task.status === "Completed"
                        ? "task-card-completed"
                        : ""
                    }`}
                    key={task.id}
                  >
                    <div className="task-card-main">
                      <span
                        className={`task-status-icon ${
                          task.status === "Completed" ? "is-complete" : ""
                        }`}
                      >
                        {task.status === "Completed" ? (
                          <FiCheckCircle />
                        ) : (
                          <FiClock />
                        )}
                      </span>
                      <div className="task-card-information">
                        <h3>{task.title}</h3>
                        <p>
                          {task.description || "No description provided."}
                        </p>
                        <span className="task-project-label">
                          <FiList />
                          {task.project}
                        </span>
                      </div>
                   </div>
                    <div className="task-card-meta">
                      <span
                        className={`task-priority priority-${String(
                          task.priority
                        ).toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                      <label className="task-status-select">
                        <span className="visually-hidden">
                          Task status
                        </span>
                        <select
                          value={task.status}
                          onChange={(event) =>
                            updateTaskStatus(task, event.target.value)
                          }
                          aria-label={`Status for ${task.title}`}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </label>
                      <span className="task-due-date">
                        <FiCalendar />
                        {task.dueDate || "No due date"}
                      </span>
                      <button
                        type="button"
                        className="task-delete-button"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        <FiTrash2 />
                      </button>
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
export default Tasks;