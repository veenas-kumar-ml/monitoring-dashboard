import { Card,CardContent,CardTitle } from '@/src/components/ui/card'
import { se } from 'date-fns/locale'
import { ConstructionIcon,PackageX } from 'lucide-react'
import React, { useEffect } from 'react'
import { Rectangle, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CardDescription, CardHeader } from './ui/card'
import NoData from './no-data'


type teamData={
  _id: string
  month: string
  team: string
  testcaseAutomated: number
  bugsFiled: number
  scriptIssueFixed: number
  scriptIntegrated: number
    
}

type propsData={
    data:Array<teamData>,
    type:string,
    title:string,
    dataKey?:string
}



export default function TotalTeamChart({data, type, title, dataKey}: propsData) {
    const colors = [
  "#4e79a7", // blue
  "#f28e2b", // orange
  "#e15759", // red
  "#76b7b2", // teal
  "#59a14f", // green
  "#edc949", // yellow
  "#af7aa1", // purple
  "#ff9da7", // pink
  "#9c755f", // brown
  "#bab0ab"  // gray
];

    const [filteredData,setFilteredData]=React.useState<Record<string,Array<teamData>>>({})
    const [transformedData,setTransformedData]=React.useState<Array<Record<string,any>>>([])
    const [teams,setTeams]=React.useState<Set<string>>(new Set())
    console.log("data in total team chart",data)
    useEffect(()=>{ 
        const teamSet=new Set<string>()
        data.forEach(item=>{
            teamSet.add(item.team)
        })
        setTeams(teamSet)
    },[data])
    useEffect(()=>{
        const filter = data.reduce<Record<string,Array<teamData>>>((acc, item) => {
            const month=item.month;
            if(!acc[month]){
                acc[month]=[]
            }
            acc[month].push(item)
            return acc
        },{})
        setFilteredData(filter)
        console.log("Filtered Data:", filter)
    },[data])

useEffect(() => {
  if (Object.keys(filteredData).length === 0) return

  const result = Object.keys(filteredData).map((month) => {
    const row: Record<string, any> = { month }
    filteredData[month].forEach(entry => {
      row[entry.team] =
        entry.testcaseAutomated +
        entry.bugsFiled +
        entry.scriptIssueFixed +
        entry.scriptIntegrated
    })
    return row
  })

  setTransformedData(result)
  console.log("Transformed Data:", result)
}, [filteredData])
  return (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        Total metrics per team per month.
        </CardDescription>
        </CardHeader>
        <CardContent>

   <div style={{ width: "100%", height: 500 }}> 
    {
      data.length>0 ?(
            <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={transformedData}
        margin={{
          top: 30,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {
            teams.size>0 && Array.from(teams).map((team,index)=>(
                <Bar key={index} dataKey={team}  fill={colors[index % colors.length]} />
            ))
        }
      </BarChart>
    </ResponsiveContainer>
      ):<NoData />   }
    </div>
    </CardContent>
    </Card>
  )
}
