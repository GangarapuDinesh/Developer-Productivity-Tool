import api from "./api";
const saveAuthentication = (responseData) => {
    const { token, user } = responseData;
    if (!token || !user) {
        throw new Error(
            "Authentication response is missing the token or user details."
        );
    }
    sessionStorage.setItem("devflow-token", token);
    sessionStorage.setItem("devflow-user", JSON.stringify(user));
    return user;
};
export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", {
        fullName: userData.fullName.trim(),
        email: userData.email.trim(),
        password: userData.password
    });
    return response.data;
};
export const loginUser = async (credentials) => {
    const response = await api.post("/auth/login", {
        email: credentials.email.trim(),
        password: credentials.password
    });
    if (!response.data?.email) {
        throw new Error("The server did not return the OTP recipient email.");
    }
    return response.data;
};
export const verifyLoginOtp = async (email, otp) => {
    const response = await api.post("/auth/verify-otp", {
        email: email.trim(),
        otp: otp.trim()
    });
    return saveAuthentication(response.data);
};
export const firebaseLogin = async (idToken) => {
    if (!idToken) {
        throw new Error("Firebase ID token is missing.");
    }
    const response = await api.post("/auth/firebase", {
        idToken
    });
    if (!response.data?.email) {
        throw new Error("The server did not return the OTP recipient email.");
    }
    return response.data;
};
export const getCurrentUser = () => {
    const user = sessionStorage.getItem("devflow-user");
    if (!user) {
        return null;
    }
    try {
        return JSON.parse(user);
    } catch {
        sessionStorage.removeItem("devflow-user");
        sessionStorage.removeItem("devflow-token");
        return null;
    }
};
export const getToken = () => {
    return sessionStorage.getItem("devflow-token");
};
export const logoutUser = () => {
    sessionStorage.removeItem("devflow-token");
    sessionStorage.removeItem("devflow-user");
};