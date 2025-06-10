import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"

const data = [
  { month: "Ene", newMembers: 45, lastYear: 38 },
  { month: "Feb", newMembers: 52, lastYear: 42 },
  { month: "Mar", newMembers: 49, lastYear: 45 },
  { month: "Abr", newMembers: 63, lastYear: 48 },
  { month: "May", newMembers: 59, lastYear: 51 },
  { month: "Jun", newMembers: 80, lastYear: 55 },
  { month: "Jul", newMembers: 51, lastYear: 49 },
  { month: "Ago", newMembers: 66, lastYear: 52 },
  { month: "Sep", newMembers: 70, lastYear: 56 },
  { month: "Oct", newMembers: 55, lastYear: 50 },
  { month: "Nov", newMembers: 59, lastYear: 54 },
  { month: "Dic", newMembers: 79, lastYear: 60 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{`${label}`}</p>
        <p className="text-sm text-gray-600">
          <span className="inline-block w-3 h-3 mr-1 bg-[#10b981] rounded-full"></span>
          {`Este año: ${payload[0].value}`}
        </p>
        <p className="text-sm text-gray-600">
          <span className="inline-block w-3 h-3 mr-1 bg-[#94a3b8] rounded-full"></span>
          {`Año anterior: ${payload[1].value}`}
        </p>
      </div>
    )
  }
  return null
}

export const NewMembershipsChart: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="text-lg font-bold">Nuevas Membresías</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorNewMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLastYear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="newMembers"
                name="Este año"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorNewMembers)"
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="lastYear"
                name="Año anterior"
                stroke="#94a3b8"
                fillOpacity={1}
                fill="url(#colorLastYear)"
                strokeWidth={2}
                strokeDasharray="5 5"
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
                animationBegin={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
