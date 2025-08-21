"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios-config"
import { useToast } from "@/hooks/use-toast"
import { getUserFromToken, getAuthHeaders } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Users, Mail, Calendar, ArrowLeft, UserPlus, Building2 } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: string
  team?: string
  assignedManager?: string
  createdAt: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    team: "",
  })
  const [teams, setTeams] = useState<string[]>([])
  const [showTeams, setShowTeams] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/auth/users", {
        headers: getAuthHeaders(),
      })
      setUsers(response.data.users)
      
      // Extract unique teams from users
      const uniqueTeams = [...new Set(response.data.users.map((user: User) => user.team).filter(Boolean))] as string[]
      setTeams(uniqueTeams)
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("jwt")
    if (!token) {
      router.push("/login")
      return
    }

    const user = getUserFromToken()
    if (user?.role !== "whole_manager") {
      router.push("/dashboard")
      return
    }

    fetchUsers()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.team) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await axios.post("/api/auth/admin/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "team_manager", // Whole managers can only create team managers
        team: formData.team,
      })
      console.log(response) 

      // Refresh the users list instead of just adding to local state
      await fetchUsers()
      setFormData({ name: "", email: "", password: "", team: "" })
      setShowForm(false)

      toast({
        title: "Success",
        description: "User created successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user.",
        variant: "destructive",
      })
    }
  }

  const handleAssign = async (userId: string) => {
    try {
      await axios.put(`/api/auth/users/${userId}/assign`, {}, {
        headers: getAuthHeaders(),
      })
      
      // Refresh the users list
      await fetchUsers()
      
      toast({
        title: "Success",
        description: "Team manager assigned successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign team manager.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete(`/api/auth/users/${userId}`, {
        headers: getAuthHeaders(),
      })
      
      // Refresh the users list
      await fetchUsers()
      
      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
                           <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Manager Management</h1>
            <p className="text-gray-600 mt-2">Create new team managers or assign existing unassigned team managers to your teams</p>
          </div>

                 <div className="mb-6 flex justify-between items-center">
           <Button onClick={() => router.push("/dashboard")} variant="outline">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Dashboard
           </Button>
           <div className="flex gap-2">
             <Button onClick={() => setShowTeams(!showTeams)} variant="outline">
               <Building2 className="w-4 h-4 mr-2" />
               {showTeams ? "Hide Teams" : "View Teams"}
             </Button>
             <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
               <Plus className="w-4 h-4 mr-2" />
               {showForm ? "Cancel" : "Add Team Manager"}
             </Button>
           </div>
         </div>

                 {showTeams && (
           <Card className="mb-8">
             <CardHeader>
               <CardTitle>Teams Overview</CardTitle>
               <CardDescription>All teams managed by your team managers</CardDescription>
             </CardHeader>
             <CardContent>
               {teams.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {teams.map((team) => (
                     <div key={team} className="p-4 border rounded-lg bg-gray-50">
                       <div className="flex items-center gap-2">
                         <Building2 className="w-4 h-4 text-blue-600" />
                         <span className="font-medium">{team}</span>
                       </div>
                       <p className="text-sm text-gray-600 mt-1">
                         {users.filter(user => user.team === team).length} team manager(s)
                       </p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
                   <p className="text-gray-600">
                     Teams will appear here when you create team managers.
                   </p>
                 </div>
               )}
             </CardContent>
           </Card>
         )}

         {showForm && (
           <Card className="mb-8">
                          <CardHeader>
                <CardTitle>Create New Team Manager</CardTitle>
                <CardDescription>Add a new team manager for your teams</CardDescription>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                                                   <div>
                    <Label htmlFor="team">Team Name</Label>
                    <Input
                      id="team"
                      type="text"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      placeholder="Enter team name (e.g., Frontend Team, Backend Team, QA Team)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the name of the team. You can create new teams or use existing ones.
                    </p>
                  </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="flex gap-2">
                                     <Button type="submit" className="bg-green-600 hover:bg-green-700">
                     Create Team Manager
                   </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
                             <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                   <CardTitle className="text-lg">{user.name}</CardTitle>
                   <div className="flex gap-2">
                     {!user.assignedManager && (
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleAssign(user._id)}
                         className="text-green-600 hover:text-green-700 hover:bg-green-50"
                       >
                         <UserPlus className="w-4 h-4" />
                       </Button>
                     )}
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleDelete(user._id)}
                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                     >
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
               </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {user.role === "whole_manager" ? "Whole Manager" : "Team Manager"}
                </div>
                                 {user.team && (
                   <div className="flex items-center text-sm text-gray-600">
                     <Calendar className="w-4 h-4 mr-2" />
                     Team: {user.team}
                   </div>
                 )}
                 <div className="flex items-center text-sm text-gray-600">
                   <Calendar className="w-4 h-4 mr-2" />
                   Created {new Date(user.createdAt).toLocaleDateString()}
                 </div>
                 <div className="flex items-center text-sm">
                   <Badge variant={user.assignedManager ? "default" : "secondary"}>
                     {user.assignedManager ? "Assigned" : "Unassigned"}
                   </Badge>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>

                 {users.length === 0 && (
           <Card className="text-center py-12">
             <CardContent>
               <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Managers</h3>
               <p className="text-gray-600 mb-4">
                 Get started by creating your first team manager.
               </p>
               <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                 <Plus className="w-4 h-4 mr-2" />
                 Add First Team Manager
               </Button>
             </CardContent>
           </Card>
         )}
      </div>
    </div>
  )
}
