import api from "./api";
const taskService = {
    getAllTasks: async () => {
    const response = await api.get("/tasks");
    return response.data;
  },
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },
    updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },
    deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
};
export default taskService;
