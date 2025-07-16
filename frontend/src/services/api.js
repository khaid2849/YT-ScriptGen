import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Transcription API
export const transcriptionAPI = {
  create: (data) => api.post("/transcribe/", data),
  getStatus: (taskId) => api.get(`/transcribe/status/${taskId}`),
};

// Scripts API
export const scriptsAPI = {
  // Get all scripts
  getAll: () => api.get("/scripts/"),

  // Get single script
  getById: (id) => api.get(`/scripts/${id}`),

  // Download single script
  download: (id, format = "txt") =>
    api.get(`/scripts/${id}/download`, {
      params: { format },
      responseType: "blob",
    }),
};

export default api;