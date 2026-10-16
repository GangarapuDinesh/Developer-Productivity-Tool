import api from "./api";
const snippetService = {
  getAllSnippets: async () => {
    const response = await api.get("/snippets");
    return response.data;
  },
  getSnippetById: async (id) => {
    const response = await api.get(`/snippets/${id}`);
    return response.data;
  },
  createSnippet: async (snippetData) => {
    const response = await api.post("/snippets", snippetData);
    return response.data;
  },
  updateSnippet: async (id, snippetData) => {
    const response = await api.put(`/snippets/${id}`, snippetData);
    return response.data;
  },
  deleteSnippet: async (id) => {
    const response = await api.delete(`/snippets/${id}`);
    return response.data;
  },
};
export default snippetService;
