import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { contractService } from "@/features/contracts/services/contract.service"
import { membershipService } from "@/features/memberships/services/membership.service"
import type { Contract, Membership } from "@/shared/types"

// Colors for the pie chart - colores para todas las membresías con mejor contraste y accesibilidad
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

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
    const [timeRange, setTimeRange] = useState("month")
    const [data, setData] = useState<Array<{ name: string; value: number }>>([])
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
    const isMobile = useMediaQuery('(max-width: 768px)')
    const isTablet = useMediaQuery('(max-width: 768px)')
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contractsResponse, membershipsResponse] = await Promise.all([
                    contractService.getContracts(),
                    membershipService.getMemberships()
                ])

                // Verificar que las respuestas tienen la estructura esperada
                const contractsData = contractsResponse?.data?.data || contractsResponse?.data || [];
                const membershipsData = membershipsResponse?.data || [];

                // Asegurar que son arrays antes de procesarlos
                const contracts = Array.isArray(contractsData) ? contractsData : [];
                const memberships = Array.isArray(membershipsData) ? membershipsData : [];

                if (contracts.length === 0 || memberships.length === 0) {
                    console.warn('No contracts or memberships data received');
                    setData([]);
                    return;
                }

                // Filter contracts based on time range de forma segura
                const now = new Date()
                const filteredContracts = contracts.filter(contract => {
                    if (!contract || !contract.fecha_registro) return false;
                    
                    const contractDate = new Date(contract.fecha_registro)
                    if (isNaN(contractDate.getTime())) return false;
                    
                    switch (timeRange) {
                        case "week":
                            return contractDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        case "month":
                            return contractDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        case "year":
                            return contractDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        default:
                            return true
                    }
                })

                // Count memberships de forma segura
                const membershipCount = memberships.reduce((acc, membership) => {
                    if (!membership || !membership.id) return acc;
                    
                    const count = filteredContracts.filter(contract => 
                        contract && contract.id_membresia === membership.id
                    ).length;
                    
                    if (count > 0) {
                        acc.push({
                            name: membership.nombre || 'Membresía sin nombre',
                            value: count
                        })
                    }
                    return acc
                }, [] as Array<{ name: string; value: number }>)

                setData(membershipCount)
            } catch (error) {
                console.error("Error fetching data:", error)
                setData([]);
            }
        }

        fetchData()
    }, [timeRange])

    // Manejadores para la interactividad del gráfico
    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index)
    }
    
    const onPieLeave = () => {
        setActiveIndex(undefined)
    }

    // Calculate total memberships with contracts
    const totalContracts = data.reduce((sum, item) => sum + item.value, 0)

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
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
        const sin = Math.sin(-RADIAN * midAngle)
        const cos = Math.cos(-RADIAN * midAngle)
        const mx = cx + (outerRadius + 30) * cos
        const my = cy + (outerRadius + 30) * sin
        const ex = mx + (cos >= 0 ? 1 : -1) * 22
        const ey = my
        const textAnchor = cos >= 0 ? "start" : "end"

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                    {payload.name}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                <path d={`M${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    textAnchor={textAnchor}
                    fill="#333"
                >{`${value} contratos`}</text>
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    dy={18}
                    textAnchor={textAnchor}
                    fill="#999"
                >
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
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
                        {timeRange === "week"
                            ? "en la última semana"
                            : timeRange === "month"
                                ? "en el último mes"
                                : "en el último año"}
                    </p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mes</SelectItem>
                        <SelectItem value="year">Último año</SelectItem>
                    </SelectContent>
                </Select>
            </div>
                
            <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] transition-all duration-300 ease-in-out">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
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
                            {data.map((entry, index) => (
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
                {data.map((entry, index) => {
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