import axios from "axios";

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8005/api";

const instance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

export default function callAPI(endpoint, method = "POST", data) {
  console.log(endpoint, method, data);
  return instance({
    method: method,
    url: endpoint,
    data: data,
  });
}
