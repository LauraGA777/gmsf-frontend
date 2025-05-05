import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { month: "Ene", renewals: 65, target: 70 },
  { month: "Feb", renewals: 59, target: 70 },
  { month: "Mar", renewals: 80, target: 70 },
  { month: "Abr", renewals: 81, target: 70 },
  { month: "May", renewals: 56, target: 70 },
  { month: "Jun", renewals: 55, target: 70 },
  { month: "Jul", renewals: 40, target: 70 },
  { month: "Ago", renewals: 70, target: 70 },
  { month: "Sep", renewals: 90, target: 70 },
  { month: "Oct", renewals: 75, target: 70 },
  { month: "Nov", renewals: 60, target: 70 },
  { month: "Dic", renewals: 85, target: 70 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{`${label}`}</p>
        <p className="text-sm text-gray-600">
          <span className="inline-block w-3 h-3 mr-1 bg-[#4f46e5] rounded-full"></span>
          {`Renovaciones: ${payload[0].value}`}
        </p>
        <p className="text-sm text-gray-600">
          <span className="inline-block w-3 h-3 mr-1 bg-[#e11d48] rounded-full"></span>
          {`Meta: ${payload[1].value}`}
        </p>
      </div>
    )
  }
  return null
}

export const MembershipRenewalChart: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardTitle className="text-lg font-bold">Renovaciones de Membresía</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 5,
              }}
              barGap={0}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="renewalsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" iconSize={8} />
              <Bar
                dataKey="renewals"
                name="Renovaciones"
                fill="url(#renewalsGradient)"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
              <Bar
                dataKey="target"
                name="Meta"
                fill="#e11d48"
                radius={[4, 4, 0, 0]}
                opacity={0.3}
                animationDuration={1500}
                animationBegin={300}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
