"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MOCK_CONTRACTS } from "@/data/mockData"

// Function to generate membership popularity data
const generateMembershipData = (timeRange: string) => {
    const today = new Date()
    const membershipMap = new Map()

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

    // Count memberships and sort by value
    contracts.forEach((contract) => {
        const count = membershipMap.get(contract.membresia_nombre) || 0
        membershipMap.set(contract.membresia_nombre, count + 1)
    })

    // Convert to array and sort by value descending
    return Array.from(membershipMap.entries())
        .map(([name, value]) => ({
            name,
            value,
        }))
        .sort((a, b) => b.value - a.value)
}

// Colors for the pie chart - Utilizando colores más intuitivos y vibrantes
const COLORS = {
    "Mensualidad": "#4f46e5",    // Azul intenso para el plan más común
    "Tiquetera": "#059669",      // Verde esmeralda para opciones económicas
    "Easy": "#0ea5e9",          // Azul cielo para plan básico
    "Día": "#f97316",           // Naranja para plan diario
    "Trimestral": "#8b5cf6",    // Púrpura para planes intermedios
    "Semestral": "#6366f1",     // Índigo para planes premium
    "Anual": "#7c3aed"          // Violeta para el plan más premium
}

// Función para obtener el color basado en el nombre de la membresía
const getColor = (name: string) => {
    return COLORS[name as keyof typeof COLORS] || "#9ca3af" // Color gris por defecto
}

interface PopularMembershipsChartProps {
    title?: string
    description?: string
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
    index,
    payload,
    value,
}: any) => {
    // Aumentar el radio para las etiquetas externas
    const radius = innerRadius + (outerRadius - innerRadius) * 1.7
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    // Calcular la posición de la línea conectora
    const pos = value >= totalValue / 15 ? 'end' : 'start'
    const lineX1 = cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN)
    const lineY1 = cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN)
    const lineX2 = x
    const lineY2 = y

    return (
        <g>
            {/* Línea conectora */}
            <line
                x1={lineX1}
                y1={lineY1}
                x2={lineX2}
                y2={lineY2}
                stroke={getColor(name)}
                strokeWidth={1}
            />
            {/* Punto en el inicio de la línea */}
            <circle
                cx={lineX1}
                cy={lineY1}
                r={2}
                fill={getColor(name)}
            />
            {/* Texto de la etiqueta con fondo */}
            <g>
                <text
                    x={x}
                    y={y}
                    fill="#000000"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize="12"
                    fontWeight="500"
                >
                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                </text>
            </g>
        </g>
    )
}

let totalValue = 0 // Variable global para el total de valores

export function PopularMembershipsChart({
    title = "Membresías Populares",
    description = "Distribución de membresías activas por tipo",
}: PopularMembershipsChartProps) {
    const [timeRange, setTimeRange] = useState<string>("1mes")
    const [membershipData, setMembershipData] = useState(generateMembershipData("1mes"))

    // Function to change time range
    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)
        const newData = generateMembershipData(value)
        totalValue = newData.reduce((sum, item) => sum + item.value, 0)
        setMembershipData(newData)
    }

    // Calculate total memberships
    totalValue = membershipData.reduce((sum, item) => sum + item.value, 0)

    // Format tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const percentage = ((payload[0].payload.value / totalValue) * 100).toFixed(1)
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

    // Custom legend renderer
    const CustomLegend = ({ payload }: any) => {
        if (payload && payload.length) {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-6">
                    {payload.map((entry: any, index: number) => (
                        <div key={`legend-${index}`} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-700">{entry.value}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
                        <CardDescription className="text-gray-500">{description}</CardDescription>
                    </div>
                    <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
                        <SelectTrigger className="w-[180px]">
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
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900">{totalValue} contratos</p>
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
                <div className="w-full h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={membershipData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius={80}
                                outerRadius={120}
                                labelLine={false}
                                label={renderCustomizedLabel}
                                paddingAngle={2}
                            >
                                {membershipData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={getColor(entry.name)}
                                        strokeWidth={1}
                                        stroke="#fff"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
