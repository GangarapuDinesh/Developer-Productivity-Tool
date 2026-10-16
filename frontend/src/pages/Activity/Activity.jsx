import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiFilter,
  FiFolder,
  FiSearch,
  FiTrash2,
  FiTarget,
  FiXCircle,
} from "react-icons/fi";

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import activityService from "../../services/activityService";
import { useTheme } from "../../context/ThemeContext";
import "./Activity.css";

const activityTypes = ["All", "Project", "Task", "Snippet", "Focus"];

function mapActivityRecord(item) {
  const [date = "", rawTime = ""] = (item.createdAt || "").split("T");

  let time = "";

  if (rawTime) {
    const parsedTime = new Date(`1970-01-01T${rawTime}`);

    if (!Number.isNaN(parsedTime.getTime())) {
      time = parsedTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return {
    ...item,
    date,
    time,
  };
}

function getActivityIcon(type) {
  switch (type) {
    case "Project":
      return <FiFolder />;
    case "Task":
      return <FiCheckCircle />;
    case "Snippet":
      return <FiCode />;
    case "Focus":
      return <FiTarget />;
    default:
      return <FiActivity />;
  }
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (error?.response?.status === 401) {
    return "Your session may have expired. Please log in again.";
  }

  if (error?.response?.status === 403) {
    return "Access denied. Please check your login session and backend security settings.";
  }

  if (!error?.response) {
    return "Cannot connect to the backend. Make sure Spring Boot is running on port 8080.";
  }

  return "Something went wrong while processing your request.";
}

function Activity() {
  const { theme } = useTheme();

  const currentTheme = ["light", "dark", "eye"].includes(theme)
    ? theme
    : "light";

  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await activityService.getAllActivities();

      if (!Array.isArray(data)) {
        throw new Error("The backend returned an unexpected response.");
      }

      setActivities(data.map(mapActivityRecord));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const filteredActivities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return activities
      .filter((activity) => {
        const matchesSearch = [
          activity.title,
          activity.description,
          activity.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

        const matchesType =
          selectedType === "All" || activity.type === selectedType;

        const matchesStartDate =
          !startDate || activity.date >= startDate;

        const matchesEndDate =
          !endDate || activity.date <= endDate;

        return (
          matchesSearch &&
          matchesType &&
          matchesStartDate &&
          matchesEndDate
        );
      })
      .sort((a, b) => {
        const dateComparison = (b.createdAt || "").localeCompare(
          a.createdAt || ""
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return Number(b.id) - Number(a.id);
      });
  }, [activities, searchTerm, selectedType, startDate, endDate]);

  const typeCounts = useMemo(() => {
    return activities.reduce((counts, activity) => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
      return counts;
    }, {});
  }, [activities]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setStartDate("");
    setEndDate("");
  };

  const deleteActivity = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      await activityService.deleteActivity(id);

      setActivities((previous) =>
        previous.filter(
          (activity) => String(activity.id) !== String(id)
        )
      );

      setNotice("Activity deleted successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className={`activity-layout theme-${currentTheme}`}>
        <Sidebar />

        <main className="activity-main">
          <header className="activity-header">
            <div>
              <span className="activity-eyebrow">
                DEVELOPER WORKSPACE
              </span>

              <h1>Activity Logs</h1>

              <p>
                Review your recent work and keep track of your progress.
              </p>
            </div>

            <div className="activity-live-badge">
              <span className="activity-status-dot" />
              Activity history
            </div>
          </header>

          {error && (
            <div
              className="activity-message activity-error-message"
              role="alert"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={loadActivities}
                disabled={loading}
              >
                {loading ? "Loading..." : "Retry"}
              </button>
            </div>
          )}

          {notice && (
            <div
              className="activity-message activity-success-message"
              role="status"
            >
              {notice}
            </div>
          )}

          <section className="activity-stats">
            <article className="activity-stat-card">
              <div className="activity-stat-icon activity-blue">
                <FiActivity />
              </div>

              <div>
                <span>Total Activities</span>
                <strong>{activities.length}</strong>
                <small>Recorded entries</small>
              </div>
            </article>

            <article className="activity-stat-card">
              <div className="activity-stat-icon activity-green">
                <FiCheckCircle />
              </div>

              <div>
                <span>Task Activities</span>
                <strong>{typeCounts.Task || 0}</strong>
                <small>Task updates</small>
              </div>
            </article>

            <article className="activity-stat-card">
              <div className="activity-stat-icon activity-purple">
                <FiCode />
              </div>

              <div>
                <span>Snippet Activities</span>
                <strong>{typeCounts.Snippet || 0}</strong>
                <small>Code library changes</small>
              </div>
            </article>

            <article className="activity-stat-card">
              <div className="activity-stat-icon activity-orange">
                <FiClock />
              </div>

              <div>
                <span>Focus Activities</span>
                <strong>{typeCounts.Focus || 0}</strong>
                <small>Focus session entries</small>
              </div>
            </article>
          </section>

          <section className="activity-filter-card">
            <div className="activity-filter-heading">
              <div>
                <h2>Find an activity</h2>
                <p>Search and filter your activity history.</p>
              </div>

              <FiFilter />
            </div>

            <div className="activity-filter-controls">
              <div className="activity-search">
                <FiSearch />

                <input
                  type="search"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search activity history"
                />
              </div>

              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                aria-label="Filter by activity type"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "All" ? "All Activity Types" : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="activity-date-filters">
              <label>
                <span>From date</span>

                <div className="activity-date-input">
                  <FiCalendar />

                  <input
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </div>
              </label>

              <label>
                <span>To date</span>

                <div className="activity-date-input">
                  <FiCalendar />

                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
              </label>

              <button
                type="button"
                className="activity-clear-btn"
                onClick={clearFilters}
              >
                <FiXCircle />
                Clear Filters
              </button>
            </div>
          </section>

          <section className="activity-timeline-card">
            <div className="activity-timeline-heading">
              <div>
                <h2>Recent Activity</h2>

                <p>
                  Showing {filteredActivities.length} of{" "}
                  {activities.length} activities
                </p>
              </div>
            </div>

            {loading ? (
              <div className="activity-empty">
                <div className="activity-empty-icon">
                  <FiClock />
                </div>

                <h3>Loading activities...</h3>

                <p>
                  Retrieving your activity history from the backend.
                </p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="activity-empty">
                <div className="activity-empty-icon">
                  <FiSearch />
                </div>

                <h3>
                  {activities.length === 0
                    ? "No activities recorded yet"
                    : "No activities found"}
                </h3>

                <p>
                  {activities.length === 0
                    ? "Activities saved through the backend will appear here."
                    : "Try changing your search or clearing the selected filters."}
                </p>

                {(searchTerm ||
                  selectedType !== "All" ||
                  startDate ||
                  endDate) && (
                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="activity-timeline">
                {filteredActivities.map((activity, index) => (
                  <article
                    className="activity-timeline-item"
                    key={activity.id}
                  >
                    <div className="activity-timeline-marker">
                      <div
                        className={`activity-type-icon activity-type-${String(
                          activity.type
                        ).toLowerCase()}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>

                      {index !== filteredActivities.length - 1 && (
                        <span className="activity-timeline-line" />
                      )}
                    </div>

                    <div className="activity-entry">
                      <div className="activity-entry-top">
                        <div>
                          <span
                            className={`activity-type-label activity-label-${String(
                              activity.type
                            ).toLowerCase()}`}
                          >
                            {activity.type}
                          </span>

                          <h3>{activity.title}</h3>
                        </div>

                        <button
                          type="button"
                          className="activity-delete-btn"
                          onClick={() => deleteActivity(activity.id)}
                          title="Delete activity"
                          aria-label={`Delete ${activity.title}`}
                          disabled={deletingId === activity.id}
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <p className="activity-description">
                        {activity.description ||
                          "No description provided."}
                      </p>

                      <div className="activity-entry-meta">
                        <span>
                          <FiCalendar />
                          {formatDate(activity.date)}
                        </span>

                        <span>
                          <FiClock />
                          {activity.time || "Time unavailable"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <p className="activity-footer-note">
            <FiActivity />
            Activity history is loaded from your backend.
          </p>
        </main>
      </div>
    </>
  );
}

export default Activity;