import { useCallback, useEffect, useMemo, useState } from "react";
import { FiTarget,FiPlus,FiEdit2,FiTrash2,FiCalendar,FiCheckCircle,FiX,FiTrendingUp,FiFlag,FiClock,} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useTheme } from "../../context/ThemeContext";
import goalService from "../../services/goalService";
import "./Goals.css";
const emptyForm = {
  title: "",
  category: "Productivity",
  target: "10",
  progress: "0",
  deadline: "",
};
const categories = [
  "Productivity",
  "Project",
  "Learning",
  "Personal",
];
function Goals() {
  const { theme } = useTheme();
  const currentTheme = ["light", "dark", "eye"].includes(theme)
    ? theme
    : "light";
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await goalService.getAllGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load goals:", err);
      setError(err.response?.data?.message || "Unable to load goals. Check your backend and login session.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);
  const completedGoals = goals.filter(
    (goal) => Number(goal.progress) >= Number(goal.target)
  ).length;
  const activeGoals = goals.length - completedGoals;
  const overallProgress = goals.length
    ? Math.round(
        (goals.reduce((total, goal) => {
          const target = Number(goal.target) || 1;
          const progress = Number(goal.progress) || 0;
          return total + Math.min(progress / target, 1);
        }, 0) /
          goals.length) *
          100
      )
    : 0;
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch = (goal.title || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || goal.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [goals, search, categoryFilter]);
  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setShowForm(true);
  };
  const openEditForm = (goal) => {
    setEditingId(goal.id);
    setForm({
      title: goal.title || "",
      category: goal.category || "Productivity",
      target: String(goal.target ?? 10),
      progress: String(goal.progress ?? 0),
      deadline: goal.deadline || "",
    });
    setFormError("");
    setShowForm(true);
  };
  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const title = form.title.trim();
    const category = form.category;
    const target = Number(form.target);
    const progress = Number(form.progress);
    if (!title) {
      setFormError("Please enter a goal title.");
      return;
    }
    if (!categories.includes(category)) {
      setFormError("Please select a valid category.");
      return;
    }
    if (!Number.isInteger(target) || target < 1) {
      setFormError("Target must be a whole number greater than zero.");
      return;
    }
    if (!Number.isInteger(progress) || progress < 0 || progress > target) {
      setFormError("Progress must be between zero and the target.");
      return;
    }
    const goalData = {
      title,
      category,
      target,
      progress,
      deadline: form.deadline || null,
    };
    setSaving(true);
    try {
      if (editingId !== null) {
        await goalService.updateGoal(editingId, goalData);
      } else {
        await goalService.createGoal(goalData);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadGoals();
    } catch (err) {
      console.error("Failed to save goal:", err);
      setFormError(err.response?.data?.message || "Unable to save the goal. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const updateProgress = async (goal, value) => {
    const progress = Number(value);
    if (!Number.isInteger(progress) || progress < 0 || progress > Number(goal.target)) {
      return;
    }
    const previousProgress = Number(goal.progress);
    if (progress === previousProgress) return;
    setGoals((previous) =>
      previous.map((item) =>
        item.id === goal.id ? { ...item, progress } : item
      )
    );
    try {
      await goalService.updateGoal(goal.id, {
        title: goal.title,
        category: goal.category,
        target: Number(goal.target),
        progress,
        deadline: goal.deadline || null,
      });
    } catch (err) {
      console.error("Failed to update goal progress:", err);
      setGoals((previous) =>
        previous.map((item) =>
          item.id === goal.id
            ? { ...item, progress: previousProgress }
            : item
        )
      );
      setError(err.response?.data?.message || "Unable to update progress. Please try again.");
    }
  };
  const deleteGoal = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmed) return;
    setDeletingId(id);
    setError("");
    try {
      await goalService.deleteGoal(id);
      setGoals((previous) =>
        previous.filter((goal) => goal.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete goal:", err);
      setError(err.response?.data?.message || "Unable to delete the goal. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };
  const getProgress = (goal) => {
    const target = Number(goal.target) || 1;
    const progress = Number(goal.progress) || 0;
    return Math.min(Math.round((progress / target) * 100), 100);
  };
  const getStatus = (goal) =>
    Number(goal.progress) >= Number(goal.target)
      ? "Completed"
      : "In Progress";
  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline set";
    const parts = deadline.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return "No deadline set";
    }
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return `Deadline: ${date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };
  return (
    <>
      <Navbar />
      <div
        className={`goals-layout theme-${currentTheme}`}
        data-theme={currentTheme}
      >
        <Sidebar />
        <main className="goals-main">
          <header className="goals-header">
            <div>
              <span className="goals-eyebrow">
                <FiTarget /> PRODUCTIVITY PLANNER
              </span>
              <h1>My Goals</h1>
              <p>
                Set meaningful targets, track your progress, and
                celebrate your wins.
              </p>
            </div>
            <button
              type="button"
              className="goals-primary-btn"
              onClick={openCreateForm}
            >
              <FiPlus /> Create Goal
            </button>
          </header>
          {error && (
            <div className="goals-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={loadGoals}>
                Retry
              </button>
            </div>
          )}
          <section className="goals-stats">
            <article className="goal-stat-card">
              <div className="goal-stat-icon purple">
                <FiTarget />
              </div>
              <div>
                <span>Total Goals</span>
                <strong>{goals.length}</strong>
                <small>All your targets</small>
              </div>
            </article>
            <article className="goal-stat-card">
              <div className="goal-stat-icon blue">
                <FiTrendingUp />
              </div>
              <div>
                <span>Overall Progress</span>
                <strong>{overallProgress}%</strong>
                <small>Average completion</small>
              </div>
            </article>
            <article className="goal-stat-card">
              <div className="goal-stat-icon green">
                <FiCheckCircle />
              </div>
              <div>
                <span>Completed</span>
                <strong>{completedGoals}</strong>
                <small>Goals achieved</small>
              </div>
            </article>
            <article className="goal-stat-card">
              <div className="goal-stat-icon orange">
                <FiClock />
              </div>
              <div>
                <span>In Progress</span>
                <strong>{activeGoals}</strong>
                <small>Keep moving forward</small>
              </div>
            </article>
          </section>
          <section className="goals-list-section">
            <div className="goals-list-heading">
              <div>
                <h2>Your targets</h2>
                <p>Update progress as you complete each milestone.</p>
              </div>
              <span className="goals-count">
                {filteredGoals.length} goals
              </span>
            </div>
            <div className="goals-toolbar">
              <input
                type="search"
                placeholder="Search goals..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search goals"
              />
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                aria-label="Filter by category"
              >
                <option value="All">All categories</option>
                <option value="Productivity">Productivity</option>
                <option value="Project">Project</option>
                <option value="Learning">Learning</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            {loading ? (
              <div className="goals-empty">
                <FiClock />
                <h3>Loading goals...</h3>
                <p>Getting your goals from the backend.</p>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="goals-empty">
                <FiTarget />
                <h3>No goals found</h3>
                <p>
                  Create a new goal or change your search filters.
                </p>
                <button
                  type="button"
                  className="goals-primary-btn"
                  onClick={openCreateForm}
                >
                  <FiPlus /> Create your first goal
                </button>
              </div>
            ) : (
              <div className="goals-grid">
                {filteredGoals.map((goal) => {
                  const progress = getProgress(goal);
                  const isCompleted = progress >= 100;
                  return (
                    <article className="goal-card" key={goal.id}>
                      <div className="goal-card-top">
                        <div className="goal-category-icon">
                          <FiFlag />
                        </div>
                        <div className="goal-card-actions">
                          <button
                            type="button"
                            onClick={() => openEditForm(goal)}
                            aria-label={`Edit ${goal.title}`}
                            title="Edit goal"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGoal(goal.id)}
                            disabled={deletingId === goal.id}
                            aria-label={`Delete ${goal.title}`}
                            title="Delete goal"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <div className="goal-card-title-row">
                        <h3>{goal.title}</h3>
                        <span
                          className={`goal-status ${
                            isCompleted ? "completed" : "in-progress"
                          }`}
                        >
                          {getStatus(goal)}
                        </span>
                      </div>
                      <span className="goal-category-label">
                        {goal.category}
                      </span>
                      <div className="goal-progress-info">
                        <span>Progress</span>
                        <strong>{progress}%</strong>
                      </div>
                      <div
                        className="goal-progress-track"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${goal.title} progress`}
                      >
                        <div
                          className={`goal-progress-fill ${
                            isCompleted ? "is-complete" : ""
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="goal-progress-numbers">
                        <span>{goal.progress} completed</span>
                        <span>Target: {goal.target}</span>
                      </div>
                      <label
                        className="goal-slider-label"
                        htmlFor={`goal-progress-${goal.id}`}
                      >
                        Update progress
                      </label>
                      <input
                        id={`goal-progress-${goal.id}`}
                        className="goal-slider"
                        type="range"
                        min="0"
                        max={goal.target}
                        value={goal.progress}
                        disabled={deletingId === goal.id}
                        onChange={(event) =>
                          updateProgress(goal, event.target.value)
                        }
                      />
                      <div className="goal-deadline">
                        <FiCalendar />
                        <span>{formatDeadline(goal.deadline)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
        {showForm && (
          <div
            className="goals-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
            <section
              className="goals-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="goal-form-title"
            >
              <div className="goals-modal-header">
                <div>
                  <span className="goals-eyebrow">
                    <FiTarget /> GOAL MANAGEMENT
                  </span>
                  <h2 id="goal-form-title">
                    {editingId !== null ? "Edit Goal" : "Create a Goal"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="goals-modal-close"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close form"
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="goals-form">
                <label>
                  Goal title
                  <input
                    type="text"
                    placeholder="e.g. Complete React course"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                    required
                    maxLength={100}
                  />
                </label>
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="goals-form-row">
                  <label>
                    Target
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.target}
                      onChange={(event) =>
                        setForm({ ...form, target: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Current progress
                    <input
                      type="number"
                      min="0"
                      max={form.target || undefined}
                      step="1"
                      value={form.progress}
                      onChange={(event) =>
                        setForm({ ...form, progress: event.target.value })
                      }
                      required
                    />
                  </label>
                </div>
                <label>
                  Deadline
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(event) =>
                      setForm({ ...form, deadline: event.target.value })
                    }
                  />
                </label>
                {formError && (
                  <p className="goals-error" role="alert">
                    {formError}
                  </p>
                )}
                <div className="goals-form-actions">
                  <button
                    type="button"
                    className="goals-secondary-btn"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="goals-primary-btn"
                    disabled={saving}
                  >
                    <FiCheckCircle />
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Save Changes"
                        : "Create Goal"}
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
export default Goals;
