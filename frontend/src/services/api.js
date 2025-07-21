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

// Contact API
export const contactAPI = {
  sendMessage: (data) => api.post("/contact/", data),
};

export const downloadAPI = {
  downloadSingle: (data) => api.post("/download/video", data),
  downloadMultiple: (data) => api.post("/download/videos", data),
  downloadSingleAudio: (data) => api.post("/download/audio", data),
  downloadMultipleAudio: (data) => api.post("/download/audios", data),
  getStatus: (taskId) => api.get(`/download/status/${taskId}`),
  downloadDirect: (data) =>
    api.post("/download/video/direct", data, { responseType: "blob" }),
  downloadAudioDirect: (data) =>
    api.post("/download/audio/direct", data, { responseType: "blob" }),
  downloadScriptVideo: (scriptId) =>
    api.post(
      `/download/script/${scriptId}/video`,
      {},
      { responseType: "blob" }
    ),
  downloadScriptVideoWithQuality: (scriptId, quality = "best") =>
    api.post(
      `/download/script/${scriptId}/video`,
      { quality },
      { responseType: "blob" }
    ),
  downloadScriptAudio: (scriptId) =>
    api.post(
      `/download/script/${scriptId}/audio`,
      {},
      { responseType: "blob" }
    ),
};

export default api;
