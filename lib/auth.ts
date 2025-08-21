export const getAuthHeaders = () => {
  const token = localStorage.getItem("jwt")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getUserFromToken = () => {
  const token = localStorage.getItem("jwt")
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      role: payload.role,
      team: payload.team,
      email: payload.email,
    }
  } catch (error) {
    return null
  }
}
