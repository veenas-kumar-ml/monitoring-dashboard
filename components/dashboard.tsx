"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import MetricsChart from "@/components/metrics-chart"
import UploadForm from "@/components/upload-form"
import { getAuthHeaders } from "@/lib/auth"
import axios from "@/lib/axios-config"
import TotalTeamChart from "./totalteam-chart"
import { YearPicker } from "./year-picker"
import { set } from "date-fns"

interface MetricsData {
  _id: string
  month: string
  team: string
  testcaseAutomated: number
  bugsFiled: number
  scriptIssueFixed: number
  scriptIntegrated: number
}

interface UserInfo {
  role: string
  team?: string
}

type Years=Array<string>

export default function Dashboard() {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([])
  const [filteredData, setFilteredData] = useState<MetricsData[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [teams, setTeams] = useState<string[]>([])
  const [yearsParam, setYearsParam] = useState<string>(new Date().getFullYear().toString())
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [years, setyears] = useState<Years>([])
  console.log("Selected Year:", yearsParam)

  useEffect(() => {
    // Get user info from JWT
    const token = localStorage.getItem("jwt")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserInfo({
          role: payload.role,
          team: payload.team,
        })
      } catch (error) {
        console.error("Error parsing JWT:", error)
      }
    }
  }, [])
   const getYears = async()=>{
    try{
    const response = await axios.get("/api/metrics/getYears")
    setyears(response.data.years)
    }catch(error){
        console.error("Failed to fetch years", error)
    }
 }
  useEffect(()=>{
    getYears()
},[])
  useEffect(() => {
    fetchMetrics()
  }, [yearsParam])

  useEffect(() => {
    // Filter data based on selected team and user role
    if (userInfo?.role === "team_manager") {
      // Team managers only see their team's data
      setFilteredData(metricsData.filter((item) => item.team === userInfo.team))
    } else if (selectedTeam === "all") {
      setFilteredData(metricsData)
    } else {
      setFilteredData(metricsData.filter((item) => item.team === selectedTeam))
    }
  }, [metricsData, selectedTeam, userInfo])
   TODO:"pass year as parameter while fetching metrics"
  const fetchMetrics = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/metrics", {
        headers: getAuthHeaders(),
        params: { year: yearsParam },
      })

      const metrics = response.data.metrics || response.data
      console.log("Fetched metrics:", metrics)
      setMetricsData(metrics)

      // Extract unique teams for dropdown
      const uniqueTeams = [...new Set(metrics.map((item: MetricsData) => item.team))] as string[]
      setTeams(uniqueTeams)
    } catch (error: any) {
      console.error("Failed to fetch metrics", error)
      // Use dummy data if API is not available
      const dummyData: MetricsData[] = [
        {
          _id: "1",
          month: "2024-01",
          team: "Frontend",
          testcaseAutomated: 45,
          bugsFiled: 12,
          scriptIssueFixed: 8,
          scriptIntegrated: 15,
        },
        {
          _id: "2",
          month: "2024-02",
          team: "Frontend",
          testcaseAutomated: 52,
          bugsFiled: 9,
          scriptIssueFixed: 11,
          scriptIntegrated: 18,
        },
        {
          _id: "3",
          month: "2024-03",
          team: "Frontend",
          testcaseAutomated: 48,
          bugsFiled: 15,
          scriptIssueFixed: 7,
          scriptIntegrated: 20,
        },
        {
          _id: "4",
          month: "2024-01",
          team: "Backend",
          testcaseAutomated: 38,
          bugsFiled: 18,
          scriptIssueFixed: 12,
          scriptIntegrated: 10,
        },
        {
          _id: "5",
          month: "2024-02",
          team: "Backend",
          testcaseAutomated: 42,
          bugsFiled: 14,
          scriptIssueFixed: 15,
          scriptIntegrated: 13,
        },
        {
          _id: "6",
          month: "2024-03",
          team: "Backend",
          testcaseAutomated: 55,
          bugsFiled: 11,
          scriptIssueFixed: 9,
          scriptIntegrated: 16,
        },
        {
          _id: "7",
          month: "2024-01",
          team: "Mobile",
          testcaseAutomated: 32,
          bugsFiled: 22,
          scriptIssueFixed: 6,
          scriptIntegrated: 8,
        },
        {
          _id: "8",
          month: "2024-02",
          team: "Mobile",
          testcaseAutomated: 39,
          bugsFiled: 19,
          scriptIssueFixed: 10,
          scriptIntegrated: 12,
        },
        {
          _id: "9",
          month: "2024-03",
          team: "Mobile",
          testcaseAutomated: 44,
          bugsFiled: 16,
          scriptIssueFixed: 13,
          scriptIntegrated: 14,
        },
      ]

      setMetricsData(dummyData)
      setTeams(["Frontend", "Backend", "Mobile"])

      toast({
        title: "Using demo data",
        description: "API not available, showing sample metrics",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotals = () => {
    return filteredData.reduce(
      (acc, item) => ({
        testcaseAutomated: acc.testcaseAutomated + item.testcaseAutomated,
        bugsFiled: acc.bugsFiled + item.bugsFiled,
        scriptIssueFixed: acc.scriptIssueFixed + item.scriptIssueFixed,
        scriptIntegrated: acc.scriptIntegrated + item.scriptIntegrated,
      }),
      { testcaseAutomated: 0, bugsFiled: 0, scriptIssueFixed: 0, scriptIntegrated: 0 },
    )
  }

  const totals = calculateTotals()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header with team filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                {userInfo?.role === "whole_manager" ? "Overview of all teams" : userInfo?.role === "team_manager" ? `${userInfo?.team} team metrics` : "Metrics dashboard"}
              </p>
            </div>

            <div className="flex items-center gap-4">
                             {userInfo?.role === "whole_manager" && (
                 <Button variant="outline" onClick={() => window.location.href = "/admin"}>
                   Team Manager Management
                 </Button>
               )}
              {userInfo?.role === "whole_manager" && teams.length > 0 && (
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div>
                {
                  yearsParam && <YearPicker years={years} yearParam={yearsParam}  setYearParams={setYearsParam} />
                }
              </div>
              {userInfo?.role === "whole_manager" && teams.length === 0 && (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                  No teams assigned yet. Create team managers to see teams here.
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Testcases Automated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.testcaseAutomated}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bugs Filed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.bugsFiled}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Script Issues Fixed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.scriptIssueFixed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scripts Integrated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.scriptIntegrated}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {
            userInfo?.role === "whole_manager" &&(
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
                            <TotalTeamChart data={metricsData} type="bar" title="Team-wise Monthly Metrics"/>
                </div>
            )
          }
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsChart data={filteredData} type="bar" title="Bugs Filed per Month" dataKey="bugsFiled" />
            <MetricsChart data={filteredData} type="pie" title="Latest Month Distribution" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <MetricsChart
              data={filteredData}
              type="line"
              title="Testcases Automated Trend"
              dataKey="testcaseAutomated"
            />
          </div>


          {/* Upload Form for Team Managers */}
          {userInfo?.role === "team_manager" && (
            <div className="grid grid-cols-1 gap-6">
              <UploadForm onUploadSuccess={fetchMetrics} />
            </div>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  )
}
