
import { useEffect, useMemo, useState } from "react";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import taskService from "../../services/taskService";
import { getAllProjects } from "../../services/projectService";
import focusSessionService from "../../services/focusSessionService";
import "./Analytics.css";

const chartColors = ["#6c5ce7", "#35a7ff", "#f4a340", "#20b486"];

const safeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeStatus = (status) =>
  String(status || "To Do")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

const isCompleted = (status) =>
  ["completed", "complete", "done"].includes(normalizeStatus(status));

const isInProgress = (status) =>
  ["in progress", "inprogress", "in progress task"].includes(
    normalizeStatus(status)
  );

const getDate = (value) => {
  if (!value) return null;

  const date = Array.isArray(value)
    ? new Date(
        value[0],
        (value[1] || 1) - 1,
        value[2] || 1,
        value[3] || 0,
        value[4] || 0,
        value[5] || 0
      )
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getErrorMessage = (error) => {
  const status = error?.response?.status;

  if (status === 401 || status === 403) {
    return "Your session may have expired or you may not have permission to view analytics. Please sign in again and check your backend security configuration.";
  }

  if (!error?.response) {
    return "Cannot connect to the backend. Make sure your Spring Boot server is running on port 8080.";
  }

  return (
    error.response.data?.message ||
    error.response.data?.detail ||
    `The server returned an error (${status || "unknown"}).`
  );
};

function Analytics() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        taskService.getAllTasks(),
        getAllProjects(),
        focusSessionService.getAllSessions(),
      ]);

      const failures = results.filter(
        (result) => result.status === "rejected"
      );

      if (failures.length > 0) {
        throw failures[0].reason;
      }

      setTasks(safeArray(results[0].value));
      setProjects(safeArray(results[1].value));
      setSessions(safeArray(results[2].value));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const completedTasks = tasks.filter((task) =>
    isCompleted(task.status)
  ).length;

  const inProgressTasks = tasks.filter((task) =>
    isInProgress(task.status)
  ).length;

  const remainingTasks = Math.max(
    0,
    tasks.length - completedTasks - inProgressTasks
  );

  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const totalFocusMinutes = sessions.reduce((total, session) => {
    const elapsed = Number(session.elapsedMinutes);

    return total + (Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0);
  }, 0);

  const focusHours = (totalFocusMinutes / 60).toFixed(1);

  const averageProjectProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (total, project) =>
              total +
              Math.max(0, Math.min(100, Number(project.progress) || 0)),
            0
          ) / projects.length
        )
      : 0;

  const taskDistribution = [
    { name: "Completed", value: completedTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "To Do / Other", value: remainingTasks },
  ].filter((item) => item.value > 0);

  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];

    if (period === "weekly") {
      for (let offset = 6; offset >= 0; offset--) {
        const day = new Date(now);

        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - offset);

        data.push({
          key: dateKey(day),
          day: day.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          tasks: 0,
          focus: 0,
        });
      }
    } else {
      for (let offset = 3; offset >= 0; offset--) {
        const endDate = new Date(now);

        endDate.setHours(23, 59, 59, 999);
        endDate.setDate(endDate.getDate() - offset * 7);

        const startDate = new Date(endDate);

        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6);

        data.push({
          key: dateKey(startDate),
          endKey: dateKey(endDate),
          startDate,
          endDate,
          day: `Week ${4 - offset}`,
          tasks: 0,
          focus: 0,
        });
      }
    }

    const findBucket = (date) => {
      if (!date) return null;

      if (period === "weekly") {
        return data.find((item) => item.key === dateKey(date));
      }

      return data.find(
        (item) => date >= item.startDate && date <= item.endDate
      );
    };

    tasks.forEach((task) => {
      const bucket = findBucket(getDate(task.createdAt));

      if (bucket) {
        bucket.tasks += 1;
      }
    });

    sessions.forEach((session) => {
      const bucket = findBucket(getDate(session.startedAt));

      if (bucket) {
        const minutes = Number(session.elapsedMinutes);

        if (Number.isFinite(minutes)) {
          bucket.focus += Math.max(0, minutes) / 60;
        }
      }
    });

    return data.map((item) => ({
      day: item.day,
      tasks: item.tasks,
      focus: Number(item.focus.toFixed(2)),
    }));
  }, [tasks, sessions, period]);

  const exportCSV = () => {
    const rows = [
      ["Developer Productivity Tool - Analytics"],
      ["Generated At", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Total Tasks", tasks.length],
      ["Completed Tasks", completedTasks],
      ["Tasks In Progress", inProgressTasks],
      ["Remaining Tasks", remainingTasks],
      ["Completion Rate", `${completionRate}%`],
      ["Total Recorded Focus Hours", focusHours],
      ["Total Projects", projects.length],
      ["Average Project Progress", `${averageProjectProgress}%`],
      [],
      ["Project", "Status", "Progress", "Deadline"],
      ...projects.map((project) => [
        project.name || "",
        project.status || "",
        `${Number(project.progress) || 0}%`,
        project.deadline || "",
      ]),
      [],
      ["Task", "Status", "Priority", "Project", "Created At"],
      ...tasks.map((task) => [
        task.title || "",
        task.status || "",
        task.priority || "",
        task.project || "",
        task.createdAt || "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "devflow-analytics.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />

      <div className="analytics-layout">
        <Sidebar />

        <main className="analytics-page">
          <header className="analytics-header">
            <div>
              <h1>Analytics</h1>
              <p>
                Track your tasks, focus time, and project progress.
              </p>
            </div>

            <div className="analytics-header-actions">
              <button
                type="button"
                className="analytics-button analytics-refresh"
                onClick={loadAnalytics}
                disabled={loading}
              >
                <FiRefreshCw />
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                type="button"
                className="analytics-button analytics-export"
                onClick={exportCSV}
                disabled={loading || error !== ""}
              >
                <FiDownload />
                Export CSV
              </button>
            </div>
          </header>

          {error && (
            <div className="analytics-error" role="alert">
              <strong>Unable to load analytics.</strong>
              <p>{error}</p>

              <button type="button" onClick={loadAnalytics}>
                Try again
              </button>
            </div>
          )}

          <div className="analytics-period-controls">
            <span>Report period</span>

            <div className="analytics-period-toggle">
              <button
                type="button"
                className={period === "weekly" ? "active" : ""}
                onClick={() => setPeriod("weekly")}
              >
                Weekly
              </button>

              <button
                type="button"
                className={period === "monthly" ? "active" : ""}
                onClick={() => setPeriod("monthly")}
              >
                Monthly
              </button>
            </div>
          </div>

          {loading ? (
            <div className="analytics-loading">
              <div className="analytics-spinner" />
              <p>Loading your real analytics data...</p>
            </div>
          ) : !error ? (
            <>
              <section className="analytics-stats-grid">
                <article className="analytics-stat-card">
                  <div className="analytics-stat-icon purple">
                    <FiTarget />
                  </div>

                  <div>
                    <p>Total Tasks</p>
                    <h2>{tasks.length}</h2>
                    <span>Tasks stored in your database</span>
                  </div>
                </article>

                <article className="analytics-stat-card">
                  <div className="analytics-stat-icon green">
                    <FiCheckCircle />
                  </div>

                  <div>
                    <p>Tasks Completed</p>
                    <h2>{completedTasks}</h2>
                    <span>{completionRate}% completion rate</span>
                  </div>
                </article>

                <article className="analytics-stat-card">
                  <div className="analytics-stat-icon blue">
                    <FiClock />
                  </div>

                  <div>
                    <p>Recorded Focus Time</p>
                    <h2>{focusHours} hrs</h2>
                    <span>{totalFocusMinutes} minutes recorded</span>
                  </div>
                </article>

                <article className="analytics-stat-card">
                  <div className="analytics-stat-icon orange">
                    <FiTrendingUp />
                  </div>

                  <div>
                    <p>Average Project Progress</p>
                    <h2>{averageProjectProgress}%</h2>
                    <span>{projects.length} projects</span>
                  </div>
                </article>
              </section>

              <section className="analytics-charts-grid">
                <article className="analytics-chart-card analytics-wide-chart">
                  <div className="analytics-chart-heading">
                    <div>
                      <h2>Task Activity</h2>
                      <p>Tasks created during the selected period</p>
                    </div>

                    <FiTrendingUp />
                  </div>

                  <div className="analytics-chart">
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="analyticsTaskGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6c5ce7"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6c5ce7"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="tasks"
                          name="Tasks created"
                          stroke="#6c5ce7"
                          fill="url(#analyticsTaskGradient)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="analytics-chart-card">
                  <div className="analytics-chart-heading">
                    <div>
                      <h2>Task Distribution</h2>
                      <p>Current status of your tasks</p>
                    </div>

                    <FiTarget />
                  </div>

                  {taskDistribution.length === 0 ? (
                    <div className="analytics-empty">
                      No tasks available yet.
                    </div>
                  ) : (
                    <div className="analytics-chart">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={taskDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            outerRadius={85}
                            paddingAngle={3}
                            label={({ value }) => value}
                          >
                            {taskDistribution.map((item, index) => (
                              <Cell
                                key={item.name}
                                fill={
                                  chartColors[index % chartColors.length]
                                }
                              />
                            ))}
                          </Pie>

                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </article>

                <article className="analytics-chart-card">
                  <div className="analytics-chart-heading">
                    <div>
                      <h2>Focus Time</h2>
                      <p>Recorded focus hours by day or week</p>
                    </div>

                    <FiClock />
                  </div>

                  <div className="analytics-chart">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis dataKey="day" />
                        <YAxis />

                        <Tooltip
                          formatter={(value) => [
                            `${Number(value).toFixed(2)} hours`,
                            "Focus time",
                          ]}
                        />

                        <Bar
                          dataKey="focus"
                          name="Focus hours"
                          fill="#35a7ff"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="analytics-chart-card">
                  <div className="analytics-chart-heading">
                    <div>
                      <h2>Project Progress</h2>
                      <p>Progress values saved for your projects</p>
                    </div>

                    <FiCalendar />
                  </div>

                  <div className="analytics-project-list">
                    {projects.length === 0 ? (
                      <div className="analytics-empty">
                        No projects available yet.
                      </div>
                    ) : (
                      projects.map((project) => {
                        const progress = Math.max(
                          0,
                          Math.min(100, Number(project.progress) || 0)
                        );

                        return (
                          <div
                            className="analytics-project-item"
                            key={project.id}
                          >
                            <div className="analytics-project-label">
                              <span>
                                {project.name || "Untitled project"}
                              </span>

                              <strong>{progress}%</strong>
                            </div>

                            <div className="analytics-progress-track">
                              <div
                                className="analytics-progress-fill"
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <small>{project.status || "No status"}</small>
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              </section>

              <p className="analytics-footer-note">
                <FiCalendar />
                Reports use the task creation dates and focus session start
                dates recorded by your backend. Focus time uses recorded
                elapsed minutes.
              </p>
            </>
          ) : null}
        </main>
      </div>
    </>
  );
}

export default Analytics;
