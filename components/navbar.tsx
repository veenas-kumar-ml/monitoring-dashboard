"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface UserInfo {
  role: string
  team?: string
  email: string
}

export default function Navbar() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("jwt")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserInfo({
          role: payload.role,
          team: payload.team,
          email: payload.email,
        })
      } catch (error) {
        console.error("Error parsing JWT:", error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("jwt")
    router.push("/login")
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Regression Metrics Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {userInfo && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{userInfo.email}</span>
              <span className="text-xs bg-secondary px-2 py-1 rounded">
                {userInfo.role === "whole_manager" ? "Whole Manager" : userInfo.role === "team_manager" ? "Team Manager" : userInfo.role}
              </span>
              {userInfo.team && <span className="text-xs bg-primary/10 px-2 py-1 rounded">{userInfo.team}</span>}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
