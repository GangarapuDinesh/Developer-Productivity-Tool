import api from "./api";
const focusSessionService = {
  getAllSessions: async () => {
    const response = await api.get("/focus-sessions");
    return response.data;
  },
  getSessionById: async (id) => {
    const response = await api.get(`/focus-sessions/${id}`);
    return response.data;
  },
  createSession: async (sessionData) => {
    const response = await api.post("/focus-sessions", sessionData);
    return response.data;
  },
  updateSessionStatus: async (id, status) => {
    const response = await api.patch(
      `/focus-sessions/${id}/status`,
      { status }
    );
    return response.data;
  },
  deleteSession: async (id) => {
    const response = await api.delete(`/focus-sessions/${id}`);
    return response.data;
  },
};
export default focusSessionService;
