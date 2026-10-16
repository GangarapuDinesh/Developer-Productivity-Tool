import axios from "axios";
const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 30000
});
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("devflow-token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
export default api;
