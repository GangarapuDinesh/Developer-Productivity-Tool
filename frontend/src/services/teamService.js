import api from "./api";
const teamService = {
  getAllMembers: async () => {
    const response = await api.get("/team");
    return response.data;
  },
  getMemberById: async (id) => {
    const response = await api.get(`/team/${id}`);
    return response.data;
  },
  createMember: async (memberData) => {
    const response = await api.post("/team", memberData);
    return response.data;
  },
  updateMember: async (id, memberData) => {
    const response = await api.put(`/team/${id}`, memberData);
    return response.data;
  },
  deleteMember: async (id) => {
    await api.delete(`/team/${id}`);
  },
};
export default teamService;
