"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/auth"
import axios from "@/lib/axios-config"
import { Baseline } from "lucide-react"

interface UploadFormProps {
  onUploadSuccess: () => void
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [formData, setFormData] = useState({
    month: "",
    testcaseAutomated: "",
    bugsFiled: "",
    scriptIssueFixed: "",
    baseline:"",
    scriptIntegrated: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get user's team from JWT
      const token = localStorage.getItem("jwt")
      let userTeam = ""
      let year = "";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          year = formData.month.split("-")[0].trim();  
          console.log("Extracted year:", year);
          userTeam = payload.team || ""
        } catch (error) {
          console.error("Error parsing JWT:", error)
        }
      }

      const payload = {
        month: formData.month,
        team: userTeam,
        year: year,
        testcaseAutomated: Number.parseInt(formData.testcaseAutomated),
        bugsFiled: Number.parseInt(formData.bugsFiled),
        scriptIssueFixed: Number.parseInt(formData.scriptIssueFixed),
        scriptIntegrated: Number.parseInt(formData.scriptIntegrated),
        Baseline: Number.parseInt(formData.baseline),
      }

      await axios.post("/api/metrics", payload, {
        headers: getAuthHeaders(),
      })

      toast({
        title: "Success",
        description: "Metrics uploaded successfully",
      })

      // Reset form
      setFormData({
        month: "",
        testcaseAutomated: "",
        bugsFiled: "",
        scriptIssueFixed: "",
        scriptIntegrated: "",
        baseline:"",  
      })

      onUploadSuccess()
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload metrics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Metrics</CardTitle>
        <CardDescription>Submit your team's monthly regression metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={formData.month}
                onChange={(e) => handleInputChange("month", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testcaseAutomated">Testcases Automated</Label>
              <Input
                id="testcaseAutomated"
                type="number"
                min="0"
                value={formData.testcaseAutomated}
                onChange={(e) => handleInputChange("testcaseAutomated", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bugsFiled">Bugs Filed</Label>
              <Input
                id="bugsFiled"
                type="number"
                min="0"
                value={formData.bugsFiled}
                onChange={(e) => handleInputChange("bugsFiled", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scriptIssueFixed">Script Issues Fixed</Label>
              <Input
                id="scriptIssueFixed"
                type="number"
                min="0"
                value={formData.scriptIssueFixed}
                onChange={(e) => handleInputChange("scriptIssueFixed", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scriptIntegrated">Scripts Integrated</Label>
              <Input
                id="scriptIntegrated"
                type="number"
                min="0"
                value={formData.scriptIntegrated}
                onChange={(e) => handleInputChange("scriptIntegrated", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseline">Baseline</Label>
              <Input
                id="baseline"
                type="number"
                min="0"
                value={formData.baseline}
                onChange={(e) => handleInputChange("baseline", e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload Metrics"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
