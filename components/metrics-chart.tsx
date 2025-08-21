"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface MetricsData {
  _id: string
  month: string
  team: string
  testcaseAutomated: number
  bugsFiled: number
  scriptIssueFixed: number
  scriptIntegrated: number
}

interface MetricsChartProps {
  data: MetricsData[]
  type: "bar" | "line" | "pie"
  title: string
  dataKey?: string
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export default function MetricsChart({ data, type, title, dataKey }: MetricsChartProps) {
  const chartConfig = {
    testcaseAutomated: {
      label: "Testcases Automated",
      color: "hsl(var(--chart-1))",
    },
    bugsFiled: {
      label: "Bugs Filed",
      color: "hsl(var(--chart-2))",
    },
    scriptIssueFixed: {
      label: "Script Issues Fixed",
      color: "hsl(var(--chart-3))",
    },
    scriptIntegrated: {
      label: "Scripts Integrated",
      color: "hsl(var(--chart-4))",
    },
  }

  // Aggregate data by month for bar and line charts
  const aggregatedData = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.month === item.month)
    if (existing) {
      existing.testcaseAutomated += item.testcaseAutomated
      existing.bugsFiled += item.bugsFiled
      existing.scriptIssueFixed += item.scriptIssueFixed
      existing.scriptIntegrated += item.scriptIntegrated
    } else {
      acc.push({
        month: item.month,
        testcaseAutomated: item.testcaseAutomated,
        bugsFiled: item.bugsFiled,
        scriptIssueFixed: item.scriptIssueFixed,
        scriptIntegrated: item.scriptIntegrated,
      })
    }
    return acc
  }, [] as any[])

  // For pie chart, use latest month data
  const latestMonth = data.length > 0 ? data.reduce((max, d) => d.month > max ? d.month : max, data[0].month) : null
  const latestData = latestMonth ? data.filter((d) => d.month === latestMonth) : []

  const pieData =
    latestData.length > 0
      ? [
          { name: "Testcases Automated", value: latestData.reduce((sum, item) => sum + item.testcaseAutomated, 0) },
          { name: "Bugs Filed", value: latestData.reduce((sum, item) => sum + item.bugsFiled, 0) },
          { name: "Script Issues Fixed", value: latestData.reduce((sum, item) => sum + item.scriptIssueFixed, 0) },
          { name: "Scripts Integrated", value: latestData.reduce((sum, item) => sum + item.scriptIntegrated, 0) },
        ]
      : []

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={dataKey} fill={chartConfig[dataKey as keyof typeof chartConfig]?.color || "hsl(var(--chart-1))"} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      case "line":
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey={dataKey} stroke={chartConfig[dataKey as keyof typeof chartConfig]?.color || "hsl(var(--chart-1))"} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      case "pie":
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{type === "pie" ? "Distribution for latest month" : "Monthly trends"}</CardDescription>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
