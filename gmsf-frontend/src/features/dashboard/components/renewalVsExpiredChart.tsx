import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// This is a placeholder - your actual data will be passed as props
const defaultData = [
  { month: "Ene", renewed: 65, expired: 25 },
  { month: "Feb", renewed: 59, expired: 30 },
  { month: "Mar", renewed: 80, expired: 15 },
  { month: "Abr", renewed: 81, expired: 20 },
  { month: "May", renewed: 56, expired: 35 },
  { month: "Jun", renewed: 55, expired: 40 },
  { month: "Jul", renewed: 40, expired: 30 },
  { month: "Ago", renewed: 70, expired: 25 },
  { month: "Sep", renewed: 90, expired: 10 },
  { month: "Oct", renewed: 75, expired: 20 },
  { month: "Nov", renewed: 60, expired: 30 },
  { month: "Dic", renewed: 85, expired: 15 },
]

interface RenewalVsExpiredChartProps {
  data?: typeof defaultData
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-800">{`${label}`}</p>
        <div className="mt-2">
          <p className="text-sm flex items-center">
            <span className="inline-block w-3 h-3 mr-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"></span>
            <span className="text-gray-700">Renovadas: </span>
            <span className="ml-1 font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm flex items-center mt-1">
            <span className="inline-block w-3 h-3 mr-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"></span>
            <span className="text-gray-700">Expiradas: </span>
            <span className="ml-1 font-medium">{payload[1].value}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export const RenewalVsExpiredChart: React.FC<RenewalVsExpiredChartProps> = ({ data = defaultData }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Renovaciones vs. Expiradas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barGap={8}
          barSize={20}
        >
          <defs>
            <linearGradient id="renewedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="expiredGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
          <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" iconSize={8} />
          <Bar
            dataKey="renewed"
            name="Renovadas"
            fill="url(#renewedGradient)"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
          <Bar
            dataKey="expired"
            name="Expiradas"
            fill="url(#expiredGradient)"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationBegin={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
