import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const verifyOtp = (data) => API.post("/auth/verify-otp", data);
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);


export const createTravelPost = (data) => API.post("/travel", data);
export const searchTravelPosts = (params) => API.get("/travel/search", { params });
export const getMyPosts = () => API.get("/travel/my-posts");
export const deleteTravelPost = (id) => API.delete(`/travel/${id}`);


export const sendRequest = (data) => API.post("/requests", data);
export const acceptRequest = (id) => API.put(`/requests/${id}/accept`);
export const rejectRequest = (id) => API.put(`/requests/${id}/reject`);
export const getReceivedRequests = () => API.get("/requests/received");
export const getSentRequests = () => API.get("/requests/sent");
export const getPartnerDetails = (id) => API.get(`/requests/${id}/partner-details`);