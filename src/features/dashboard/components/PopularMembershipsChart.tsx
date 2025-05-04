import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { MOCK_CONTRACTS, MOCK_MEMBERSHIPS } from "@/features/data/mockData"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"

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

// Colors for the pie chart - colores para todas las membresías con mejor contraste y accesibilidad
const COLORS = {
    "Mensualidad": "#4f46e5",    // Azul intenso
    "Tiquetera": "#059669",      // Verde esmeralda
    "Easy": "#0ea5e9",           // Azul cielo
    "Día": "#f97316",            // Naranja
    "Trimestral": "#8b5cf6",     // Púrpura
    "Semestral": "#6366f1",      // Índigo
    "Anual": "#7c3aed"           // Violeta
}

// Versión de colores con mayor saturación para hover
const HOVER_COLORS = {
    "Mensualidad": "#3730a3",    // Azul intenso más oscuro
    "Tiquetera": "#047857",      // Verde esmeralda más oscuro
    "Easy": "#0284c7",           // Azul cielo más oscuro
    "Día": "#ea580c",            // Naranja más oscuro
    "Trimestral": "#7c3aed",     // Púrpura más oscuro
    "Semestral": "#4f46e5",      // Índigo más oscuro
    "Anual": "#6d28d9"           // Violeta más oscuro
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
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
    const [animationComplete, setAnimationComplete] = useState(false)
    const isMobile = useMediaQuery('(max-width: 640px)')
    const isTablet = useMediaQuery('(max-width: 768px)')
    
    // Efecto para animar el gráfico cuando se carga
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationComplete(true)
        }, 600)
        
        return () => clearTimeout(timer)
    }, [])

    // Function to change time range with animación
    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)
        setAnimationComplete(false)
        setMembershipData(generateMembershipData(value))
        
        // Reiniciar la animación
        setTimeout(() => {
            setAnimationComplete(true)
        }, 100)
    }
    
    // Manejadores para la interactividad del gráfico
    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index)
    }
    
    const onPieLeave = () => {
        setActiveIndex(undefined)
    }

    // Calculate total memberships with contracts
    const totalContracts = membershipData.reduce((sum, item) => sum + item.value, 0)

    // Format tooltip con mejor diseño y más información
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const percentage = totalContracts > 0 
                ? ((payload[0].payload.value / totalContracts) * 100).toFixed(1) 
                : "0.0"
            const membershipName = payload[0].payload.name
            const membershipColor = getColor(membershipName)
            
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg transition-all duration-200 ease-in-out">
                    <div className="flex items-center gap-2 mb-1">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: membershipColor }}
                        />
                        <p className="font-semibold text-sm">{membershipName}</p>
                    </div>
                    <p className="text-sm text-gray-600 pl-5">
                        {`${payload[0].payload.value} contratos`}
                    </p>
                    <p className="text-sm font-medium pl-5" style={{ color: membershipColor }}>
                        {`${percentage}% del total`}
                    </p>
                </div>
            )
        }
        return null
    }
    
    // Componente para el sector activo (cuando se hace hover)
    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, name } = props
        
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={HOVER_COLORS[name as keyof typeof HOVER_COLORS] || fill}
                    className="drop-shadow-md transition-all duration-300 ease-in-out"
                />
            </g>
        )
    }

    return (
        <div className="w-full transition-all duration-300 ease-in-out">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <div className="w-full sm:w-auto">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 transition-all duration-300">
                        {totalContracts} contratos
                    </p>
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
                    <SelectTrigger className="w-full sm:w-[160px]">
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
                
            <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] transition-all duration-300 ease-in-out">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={membershipData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 40 : 50}
                            outerRadius={isMobile ? 70 : isTablet ? 80 : 90}
                            labelLine={false}
                            label={!isMobile ? renderCustomizedLabel : undefined}
                            paddingAngle={4}
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                        >
                            {membershipData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={getColor(entry.name)}
                                    strokeWidth={2}
                                    stroke="#fff"
                                    className="transition-all duration-300 ease-in-out"
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            content={<CustomTooltip />} 
                            wrapperStyle={{ zIndex: 10 }}
                            animationDuration={300}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 text-sm mt-4 transition-all duration-300 ease-in-out">
                {membershipData.map((entry, index) => {
                    const isActive = activeIndex === index
                    const hasValue = entry.value > 0
                    
                    return (
                        <div 
                            key={`legend-${index}`} 
                            className={`flex items-center space-x-2 p-2 rounded-md transition-all duration-200 ease-in-out ${isActive ? 'bg-gray-100 shadow-sm' : 'bg-gray-50'} ${!hasValue ? 'opacity-60' : 'opacity-100'}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                        >
                            <div
                                className={`w-4 h-4 rounded-full transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
                                style={{ backgroundColor: getColor(entry.name) }}
                            />
                            <div className="flex flex-col">
                                <span className="text-gray-800 font-medium text-xs sm:text-sm">{entry.name}</span>
                                {hasValue && (
                                    <span className="text-xs text-gray-500">{entry.value} {entry.value === 1 ? 'contrato' : 'contratos'}</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}