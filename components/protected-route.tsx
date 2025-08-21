"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("jwt")
    if (!token) {
      router.push("/login")
      return
    }

    // Verify token is valid (basic check)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("jwt")
        router.push("/login")
        return
      }
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem("jwt")
      router.push("/login")
      return
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}
