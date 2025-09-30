import axios from "axios"

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://10.81.1.104:3000"

// Set up axios interceptors for JWT handling
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default axios
