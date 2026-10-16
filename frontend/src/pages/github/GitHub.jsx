import { useCallback, useEffect, useMemo, useState } from "react";
import { FiGithub,FiGitBranch,FiGitCommit,FiExternalLink,FiRefreshCw,FiSearch,FiLock,FiGlobe,FiStar,FiLogOut,FiAlertCircle,FiCheckCircle,FiX,FiLoader,FiCode,} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import githubService from "../../services/githubService";
import "./GitHub.css";
function formatDate(date) {
  if (!date) return "Unknown date";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function GitHub() {
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [activeTab, setActiveTab] = useState("commits");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const loadRepositories = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const [profile, repos] = await Promise.all([
        githubService.getCurrentUser(),
        githubService.getRepositories(),
      ]);
      setUser(profile);
      setRepositories(Array.isArray(repos) ? repos : []);
      setConnected(true);
      setNotice("GitHub connected successfully.");
    } catch (err) {
      setError(err.message || "Unable to load GitHub repositories.");
      setConnected(githubService.isConnected());
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (githubService.isConnected()) {
      loadRepositories();
    }
  }, [loadRepositories]);
  const handleConnect = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!token.trim()) {
      setError("Please enter your GitHub token.");
      return;
    }
    try {
      githubService.saveToken(token);
      setToken("");
      await loadRepositories();
    } catch (err) {
      setError(err.message || "Unable to connect to GitHub.");
    }
  };
  const handleDisconnect = () => {
    githubService.disconnect();
    setConnected(false);
    setUser(null);
    setRepositories([]);
    setSelectedRepo(null);
    setBranches([]);
    setCommits([]);
    setToken("");
    setSearch("");
    setError("");
    setNotice("GitHub has been disconnected.");
  };
  const handleRepositoryClick = async (repo) => {
    setSelectedRepo(repo);
    setActiveTab("commits");
    setBranches([]);
    setCommits([]);
    setDetailsLoading(true);
    setError("");
    try {
      const [branchData, commitData] = await Promise.all([
        githubService.getBranches(repo.owner.login, repo.name),
        githubService.getCommits(repo.owner.login, repo.name),
      ]);
      setBranches(Array.isArray(branchData) ? branchData : []);
      setCommits(Array.isArray(commitData) ? commitData : []);
    } catch (err) {
      setError(err.message || "Unable to load repository details.");
    } finally {
      setDetailsLoading(false);
    }
  };
  const filteredRepositories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return repositories.filter((repo) => {
      const matchesSearch =
        !query ||
        repo.name?.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query);
      const matchesVisibility =
        visibility === "all" ||
        (visibility === "public" && !repo.private) ||
        (visibility === "private" && repo.private);
      return matchesSearch && matchesVisibility;
    });
  }, [repositories, search, visibility]);
  const publicCount = repositories.filter((repo) => !repo.private).length;
  const privateCount = repositories.filter((repo) => repo.private).length;
  const starredCount = repositories.reduce(
    (total, repo) => total + (repo.stargazers_count || 0),
    0
  );
  return (
    <>
      <Navbar />
      <div className="github-page">
        <Sidebar />
        <main className="github-main">
          <header className="github-header">
            <div className="github-heading">
              <span className="github-eyebrow">DEVELOPER WORKSPACE</span>
              <h1>
                <FiGithub /> GitHub Integration
              </h1>
              <p>
                Explore your repositories, branches, and recent commits from
                your DevFlow workspace.
              </p>
            </div>
            {connected && (
              <div className="github-header-actions">
                <button
                  type="button"
                  className="github-button github-secondary-button"
                  onClick={loadRepositories}
                  disabled={loading}
                >
                  <FiRefreshCw
                    className={loading ? "github-spinning" : ""}
                  />
                  Refresh
                </button>
                <button
                  type="button"
                  className="github-button github-disconnect-button"
                  onClick={handleDisconnect}
                >
                  <FiLogOut />
                  Disconnect
                </button>
              </div>
            )}
          </header>
          {error && (
            <div className="github-message github-error" role="alert">
              <FiAlertCircle />
              <span>{error}</span>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <FiX />
              </button>
            </div>
          )}
          {notice && !error && (
            <div className="github-message github-success" role="status">
              <FiCheckCircle />
              <span>{notice}</span>
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <FiX />
              </button>
            </div>
          )}
          {!connected && !loading && (
            <section className="github-connect-card">
              <div className="github-connect-icon">
                <FiGithub />
              </div>
              <h2>Connect your GitHub account</h2>
              <p>
                Use your fine-grained personal access token to retrieve
                repositories that the token is allowed to access.
              </p>
              <form
                onSubmit={handleConnect}
                className="github-connect-form"
              >
                <label htmlFor="github-token">
                  Personal access token
                </label>
                <input
                  id="github-token"
                  type="password"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Paste your GitHub token"
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
                <button
                  type="submit"
                  className="github-button github-primary-button"
                  disabled={loading}
                >
                  {loading ? (
                    <FiLoader className="github-spinning" />
                  ) : (
                    <FiGithub />
                  )}
                  {loading ? "Connecting..." : "Connect GitHub"}
                </button>
              </form>
              <div className="github-security-note">
                <FiLock />
                <span>
                  Your token is kept in this browser session and is not sent
                  to the DevFlow backend. Disconnect before leaving a shared
                  computer.
                </span>
              </div>
              <a
                className="github-help-link"
                href="https://github.com/settings/personal-access-tokens"
                target="_blank"
                rel="noreferrer"
              >
                Manage GitHub tokens <FiExternalLink />
              </a>
            </section>
          )}
          {loading && !connected && (
            <div className="github-loading">
              <FiLoader className="github-spinning" />
              <span>Connecting to GitHub...</span>
            </div>
          )}
          {connected && (
            <>
              <section className="github-profile-card">
                <div className="github-profile-left">
                  {user?.avatar_url ? (
                    <img
                      className="github-avatar"
                      src={user.avatar_url}
                      alt="GitHub profile"
                    />
                  ) : (
                    <div className="github-avatar github-avatar-placeholder">
                      <FiGithub />
                    </div>
                  )}
                  <div className="github-profile-info">
                    <h2>
                      {user?.name || user?.login || "GitHub user"}
                    </h2>
                    <a
                      href={user?.html_url || "https://github.com"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{user?.login || "account"} <FiExternalLink />
                    </a>
                    {user?.bio && <p>{user.bio}</p>}
                  </div>
                </div>
                <div className="github-connected-label">
                  <FiCheckCircle />
                  Connected
                </div>
              </section>
              <section className="github-stats-grid">
                <div className="github-stat-card">
                  <div className="github-stat-icon github-stat-purple">
                    <FiCode />
                  </div>
                  <div>
                    <span>Total repositories</span>
                    <strong>{repositories.length}</strong>
                  </div>
                </div>
                <div className="github-stat-card">
                  <div className="github-stat-icon github-stat-green">
                    <FiGlobe />
                  </div>
                  <div>
                    <span>Public repositories</span>
                    <strong>{publicCount}</strong>
                  </div>
                </div>
                <div className="github-stat-card">
                  <div className="github-stat-icon github-stat-orange">
                    <FiLock />
                  </div>
                  <div>
                    <span>Private repositories</span>
                    <strong>{privateCount}</strong>
                  </div>
                </div>
                <div className="github-stat-card">
                  <div className="github-stat-icon github-stat-blue">
                    <FiStar />
                  </div>
                  <div>
                    <span>Total repository stars</span>
                    <strong>{starredCount}</strong>
                  </div>
                </div>
              </section>
              <section className="github-workspace">
                <div className="github-repository-panel">
                  <div className="github-panel-heading">
                    <div>
                      <h2>
                        <FiGithub /> Repositories
                      </h2>
                      <p>
                        {filteredRepositories.length} repositories shown
                      </p>
                    </div>
                  </div>
                  <div className="github-search-box">
                    <FiSearch />
                    <input
                      type="search"
                      placeholder="Search repositories..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      aria-label="Search repositories"
                    />
                  </div>
                  <div className="github-filter-row">
                    {["all", "public", "private"].map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={
                          visibility === option
                            ? "github-filter active"
                            : "github-filter"
                        }
                        onClick={() => setVisibility(option)}
                      >
                        {option === "all"
                          ? "All"
                          : option === "public"
                            ? "Public"
                            : "Private"}
                      </button>
                    ))}
                  </div>
                  {loading ? (
                    <div className="github-empty-state">
                      <FiLoader className="github-spinning" />
                      <p>Loading repositories...</p>
                    </div>
                  ) : filteredRepositories.length === 0 ? (
                    <div className="github-empty-state">
                      <FiGithub />
                      <h3>No repositories found</h3>
                      <p>
                        Try another search or change the visibility filter.
                      </p>
                    </div>
                  ) : (
                    <div className="github-repository-list">
                      {filteredRepositories.map((repo) => (
                        <article
                          className={`github-repo-card ${
                            selectedRepo?.id === repo.id ? "selected" : ""
                          }`}
                          key={repo.id}
                        >
                          <button
                            type="button"
                            className="github-repo-select"
                            onClick={() => handleRepositoryClick(repo)}
                          >
                            <span className="github-repo-name">
                              <FiGithub />
                              {repo.name}
                            </span>
                            <span className="github-repo-visibility">
                              {repo.private ? <FiLock /> : <FiGlobe />}
                              {repo.private ? "Private" : "Public"}
                            </span>
                          </button>
                          <p className="github-repo-description">
                            {repo.description || "No description provided."}
                          </p>
                          <div className="github-repo-meta">
                            {repo.language && (
                              <span>
                                <i className="github-language-dot" />
                                {repo.language}
                              </span>
                            )}
                            <span>
                              <FiStar /> {repo.stargazers_count || 0}
                            </span>
                            <span>
                              <FiGitBranch /> {repo.forks_count || 0}
                            </span>
                          </div>
                          <div className="github-repo-footer">
                            <span>
                              Updated {formatDate(repo.updated_at)}
                            </span>
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                            >
                              Open <FiExternalLink />
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
                <div className="github-details-panel">
                  {!selectedRepo ? (
                    <div className="github-details-placeholder">
                      <div className="github-details-placeholder-icon">
                        <FiGitBranch />
                      </div>
                      <h2>Select a repository</h2>
                      <p>
                        Choose a repository on the left to inspect its
                        branches and recent commits.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="github-selected-heading">
                        <div>
                          <span className="github-eyebrow">
                            SELECTED REPOSITORY
                          </span>
                          <h2>{selectedRepo.name}</h2>
                          <p>
                            {selectedRepo.owner.login}/{selectedRepo.name}
                          </p>
                        </div>
                        <a
                          href={selectedRepo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open selected repository on GitHub"
                        >
                          <FiExternalLink />
                        </a>
                      </div>
                      <div className="github-detail-tabs">
                        <button
                          type="button"
                          className={
                            activeTab === "commits" ? "active" : ""
                          }
                          onClick={() => setActiveTab("commits")}
                        >
                          <FiGitCommit /> Recent commits
                        </button>
                        <button
                          type="button"
                          className={
                            activeTab === "branches" ? "active" : ""
                          }
                          onClick={() => setActiveTab("branches")}
                        >
                          <FiGitBranch /> Branches
                        </button>
                      </div>
                      {detailsLoading ? (
                        <div className="github-empty-state">
                          <FiLoader className="github-spinning" />
                          <p>Loading repository details...</p>
                        </div>
                      ) : activeTab === "commits" ? (
                        commits.length === 0 ? (
                          <div className="github-empty-state">
                            <FiGitCommit />
                            <p>No commits found for this repository.</p>
                          </div>
                        ) : (
                          <div className="github-commit-list">
                            {commits.map((commit) => (
                              <article
                                className="github-commit-item"
                                key={commit.sha}
                              >
                                <FiGitCommit className="github-timeline-icon" />
                                <div className="github-commit-content">
                                  <a
                                    href={commit.html_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="github-commit-message"
                                  >
                                    {commit.commit?.message?.split("\n")[0] ||
                                      "Commit"}
                                  </a>
                                  <p>
                                    {commit.commit?.author?.name ||
                                      commit.author?.login ||
                                      "Unknown author"}
                                    {" · "}
                                    {formatDate(commit.commit?.author?.date)}
                                  </p>
                                  <code>{commit.sha?.slice(0, 7)}</code>
                                </div>
                                {commit.author?.avatar_url && (
                                  <img
                                    src={commit.author.avatar_url}
                                    alt=""
                                    className="github-commit-avatar"
                                  />
                                )}
                              </article>
                            ))}
                          </div>
                        )
                      ) : branches.length === 0 ? (
                        <div className="github-empty-state">
                          <FiGitBranch />
                          <p>No branches found for this repository.</p>
                        </div>
                      ) : (
                        <div className="github-branch-list">
                          {branches.map((branch) => (
                            <div
                              className="github-branch-item"
                              key={branch.name}
                            >
                              <FiGitBranch />
                              <span>{branch.name}</span>

                              {branch.name ===
                                selectedRepo.default_branch && (
                                <span className="github-default-badge">
                                  Default
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}
export default GitHub;