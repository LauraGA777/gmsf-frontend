import { membershipData, kpiData } from "../../data/mockDashboardData"
import {
  /* BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid, */
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  /* LineChart,
  Line, */
} from "recharts"


interface MembershipStatsProps {
  className?: string;
}

export function MembershipStats({ className }: MembershipStatsProps) {
  const COLORS = ["#F7C458FF", "#EC503CFF", "#00C49F", "#FF8042", "#0088FE"]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Membresías Activas por Tipo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={membershipData.active}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {membershipData.active.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>




      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">KPIs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Miembros</p>
            <p className="text-2xl font-bold">{kpiData.totalMembers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Miembros Activos</p>
            <p className="text-2xl font-bold">{kpiData.activeMembers}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Ingresos Mensuales</p>
            <p className="text-2xl font-bold">${kpiData.revenue}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Tasa de Retención</p>
            <p className="text-2xl font-bold">{kpiData.retentionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
