import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { MOCK_CONTRACTS, MOCK_MEMBERSHIPS } from "@/features/data/mockData"

// Function to generate membership popularity data including ALL membership types
const generateMembershipData = (timeRange: string) => {
    const today = new Date()
    const membershipMap = new Map()
    
    // Initialize with all membership types from mockMemberships
    MOCK_MEMBERSHIPS.forEach(membership => {
        membershipMap.set(membership.nombre, 0)
    })

    // Filter contracts based on time range
    const contracts = MOCK_CONTRACTS.filter(contract => {
        const startDate = new Date(contract.fecha_inicio)
        const monthsAgo = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        
        switch(timeRange) {
            case "1mes":
                return monthsAgo <= 1
            case "3meses":
                return monthsAgo <= 3
            case "6meses":
                return monthsAgo <= 6
            case "año":
                return monthsAgo <= 12
            default:
                return true
        }
    })

    // Count memberships
    contracts.forEach((contract) => {
        const count = membershipMap.get(contract.membresia_nombre) || 0
        membershipMap.set(contract.membresia_nombre, count + 1)
    })

    // Convert to array and sort alphabetically to maintain consistent order
    return Array.from(membershipMap.entries())
        .map(([name, value]) => ({
            name,
            value,
        }))
}

// Colors for the pie chart - colores para todas las membresías
const COLORS = {
    "Mensualidad": "#4f46e5",    // Azul intenso
    "Tiquetera": "#059669",      // Verde esmeralda
    "Easy": "#0ea5e9",           // Azul cielo
    "Día": "#f97316",            // Naranja
    "Trimestral": "#8b5cf6",     // Púrpura
    "Semestral": "#6366f1",      // Índigo
    "Anual": "#7c3aed"           // Violeta
}

// Función para obtener el color basado en el nombre de la membresía
const getColor = (name: string) => {
    return COLORS[name as keyof typeof COLORS] || "#9ca3af" // Color gris por defecto
}

// Función para renderizar las etiquetas del gráfico
const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
    value
}: any) => {
    // Solo mostrar etiqueta si hay valor
    if (value === 0) return null
    
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    return (
        <text
            x={x}
            y={y}
            fill={getColor(name)}
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="12"
            fontWeight="600"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

export function PopularMembershipsChart() {
    const [timeRange, setTimeRange] = useState<string>("1mes")
    const [membershipData, setMembershipData] = useState(generateMembershipData("1mes"))

    // Function to change time range
    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)
        setMembershipData(generateMembershipData(value))
    }

    // Calculate total memberships with contracts
    const totalContracts = membershipData.reduce((sum, item) => sum + item.value, 0)

    // Format tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const percentage = totalContracts > 0 
                ? ((payload[0].payload.value / totalContracts) * 100).toFixed(1) 
                : "0.0"
            
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold text-sm mb-1">{payload[0].payload.name}</p>
                    <p className="text-sm text-gray-600">
                        {`${payload[0].payload.value} contratos`}
                    </p>
                    <p className="text-sm font-medium text-indigo-600">
                        {`${percentage}% del total`}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-3xl font-bold text-gray-900">{totalContracts} contratos</p>
                    <p className="text-sm text-gray-500">
                        {timeRange === "1mes"
                            ? "en el último mes"
                            : timeRange === "3meses"
                                ? "en los últimos 3 meses"
                                : timeRange === "6meses"
                                    ? "en los últimos 6 meses"
                                    : "en el último año"}
                    </p>
                </div>
                <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1mes">Último mes</SelectItem>
                        <SelectItem value="3meses">Últimos 3 meses</SelectItem>
                        <SelectItem value="6meses">Últimos 6 meses</SelectItem>
                        <SelectItem value="año">Último año</SelectItem>
                    </SelectContent>
                </Select>
            </div>
                
            <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={membershipData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            labelLine={false}
                            label={renderCustomizedLabel}
                            paddingAngle={3}
                        >
                            {membershipData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={getColor(entry.name)}
                                    strokeWidth={2}
                                    stroke="#fff"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                {membershipData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getColor(entry.name) }}
                        />
                        <span className="text-gray-800 font-medium">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
} 