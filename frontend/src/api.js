import axios from "axios";

const BASE = "http://127.0.0.1:8000";

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${BASE}/upload`, formData);
};

export const analyzeResume = () => axios.post(`${BASE}/analyze`);
export const askQuestion = (q) =>
  axios.post(`${BASE}/chat?question=${q}`);
