const GITHUB_API = "https://api.github.com";
const TOKEN_KEY = "devflow-github-token";
const getHeaders = () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("Connect your GitHub account first.");
  }
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
};
const githubRequest = async (endpoint) => {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (response.status === 401) {
    throw new Error(
      "GitHub token is invalid or expired. Please reconnect."
    );
  }
  if (response.status === 403) {
    throw new Error(
      "GitHub rate limit reached or permission denied. Check token permissions."
    );
  }
  if (response.status === 404) {
    throw new Error(
      "GitHub resource not found or not accessible."
    );
  }
  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}).`);
  }
  return response.json();
};
const githubService = {
  saveToken(token) {
    const cleanedToken = token.trim();
    if (!cleanedToken) {
      throw new Error("Enter your GitHub token.");
    }
    sessionStorage.setItem(TOKEN_KEY, cleanedToken);
  },
  disconnect() {
    sessionStorage.removeItem(TOKEN_KEY);
  },
  isConnected() {
    return Boolean(sessionStorage.getItem(TOKEN_KEY));
  },
  async getCurrentUser() {
    return githubRequest("/user");
  },
  async getRepositories(page = 1, perPage = 30) {
    return githubRequest(
      `/user/repos?sort=updated&direction=desc&per_page=${perPage}&page=${page}`
    );
  },
  async searchRepositories(query, page = 1) {
    const params = new URLSearchParams({
      q: `${query} user:@me`,
      sort: "updated",
      order: "desc",
      per_page: "30",
      page: String(page),
    });
    return githubRequest(
      `/search/repositories?${params.toString()}`
    );
  },
  async getBranches(owner, repo) {
    return githubRequest(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100`
    );
  },
  async getCommits(owner, repo, page = 1) {
    return githubRequest(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=10&page=${page}`
    );
  },
};
export default githubService;
