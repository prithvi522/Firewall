import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

export async function scanFile(file, mode = "standard", engine = "auto", onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  // Pass `dual_intent` from the UI toggle to enable context-aware analysis.
  formData.append("mode", mode);
  // Optional engine hint: 'auto' | 'heuristic' | 'ml'
  formData.append("engine", engine || "auto");

  const response = await api.post("/scan/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (!onProgress) return;
      try {
        const percent = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
        onProgress(percent);
      } catch (e) {
        onProgress(0);
      }
    },
  });

  return response.data;
}

export async function approveReview(reviewToken) {
  const formData = new FormData();
  formData.append("review_token", reviewToken);

  const response = await api.post("/scan/review/approve", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function mlStatus() {
  const response = await api.get("/scan/ml_status");
  return response.data;
}

export default api;
