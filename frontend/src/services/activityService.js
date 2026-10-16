import api from "./api";
const activityService = {
    getAllActivities: async () => {
        const response = await api.get("/activities");
        return response.data;
    },
    getActivityById: async (id) => {
        const response = await api.get(`/activities/${id}`);
        return response.data;
    },
    createActivity: async (activityData) => {
        const response = await api.post(
            "/activities",
            activityData
        );
        return response.data;
    },
    deleteActivity: async (id) => {
        await api.delete(`/activities/${id}`);
    }
};
export default activityService;
