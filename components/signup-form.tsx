"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import axios from "@/lib/axios-config"

// Define the type for whole managers
interface WholeManager {
  _id: string;
  name: string;
}

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "",
    assignedManager: "",
    team: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [wholeManagers, setWholeManagers] = useState<WholeManager[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (formData.role === "team_manager") {
      const fetchWholeManagers = async () => {
        try {
          const response = await axios.get("/api/auth/whole-managers")
          setWholeManagers(response.data)
        } catch (error) {
          console.error("Failed to fetch whole managers", error)
        }
      }
      fetchWholeManagers()
    }
  }, [formData.role])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Clear team field when switching to whole manager
      ...(field === "role" && value === "whole_manager" && { team: "" }),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form data before validation:", formData)

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.role === "team_manager" && !formData.team) {
      toast({
        title: "Team required",
        description: "Please select a team for Team Manager role",
        variant: "destructive",
      })
      return
    }

    // For whole managers, team is not required
    if (formData.role === "whole_manager" && formData.team) {
      toast({
        title: "Team not needed",
        description: "Whole managers don't belong to a specific team",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("/api/auth/register", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        assignedManager: formData.assignedManager,
        team: formData.role === "team_manager" ? formData.team : undefined,
      })
      console.log("Signup response:", response.data)

      toast({
        title: "Account created successfully",
        description: "Please sign in with your credentials",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.response?.data?.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Enter your details to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_manager">Team Manager</SelectItem>
                  <SelectItem value="whole_manager">Whole Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "team_manager" && (
              <div className="space-y-2">
                <Label htmlFor="team">Team Name</Label>
                <Input
                  id="team"
                  type="text"
                  placeholder="Enter your team name (e.g., Frontend Team, Backend Team, QA Team)"
                  value={formData.team}
                  onChange={(e) => handleInputChange("team", e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter the name of your team. If it's a new team, you can create it here.
                </p>
              </div>
            )}

            {formData.role === "whole_manager" && (
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                  Delivery managers don't belong to a specific team. They manage multiple teams.
                </div>
              </div>
            )}

            {formData.role === "team_manager" && (
              <div className="space-y-2">
                <Label htmlFor="assignedManager">Assign Delivery Manager</Label>
                <Select
                  value={formData.assignedManager}
                  onValueChange={(value) => handleInputChange("assignedManager", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Whole Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {wholeManagers.map((manager) => (
                      <SelectItem key={manager._id} value={manager._id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
}
