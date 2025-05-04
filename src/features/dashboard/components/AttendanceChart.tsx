import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { addDays, format, subDays, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"

// Datos de ejemplo para la asistencia diaria
// En un caso real, estos datos vendrían del módulo de ingreso de clientes
const generateMockAttendanceData = () => {
    const today = new Date()
    const startDate = startOfWeek(today, { weekStartsOn: 1 }) // Lunes como inicio de semana

    return Array.from({ length: 7 }).map((_, index) => {
        const date = addDays(startDate, index)
        // Generar un número aleatorio entre 15 y 45 para simular asistencias
        const attendance = Math.floor(Math.random() * 30) + 15
        return {
            date: format(date, "yyyy-MM-dd"),
            dayName: format(date, "EEEE", { locale: es }),
            shortDay: format(date, "EEE", { locale: es }),
            attendance,
        }
    })
}

interface AttendanceChartProps {
    title?: string
    description?: string
}

export function AttendanceChart({
    title = "Asistencia Diaria",
    description = "Registro de ingresos de clientes al gimnasio",
}: AttendanceChartProps) {
    const [timeRange, setTimeRange] = useState<string>("semana")
    const [attendanceData, setAttendanceData] = useState(generateMockAttendanceData())

    // Función para cambiar el rango de tiempo
    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)

        const today = new Date()
        let startDate: Date

        switch (value) {
            case "semana":
                startDate = startOfWeek(today, { weekStartsOn: 1 })
                break
            case "2semanas":
                startDate = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7)
                break
            case "mes":
                startDate = subDays(today, 30)
                break
            default:
                startDate = startOfWeek(today, { weekStartsOn: 1 })
        }

        // Generar datos según el rango seleccionado
        const days = value === "semana" ? 7 : value === "2semanas" ? 14 : 30
        const newData = Array.from({ length: days }).map((_, index) => {
            const date = addDays(startDate, index)
            // Generar un número aleatorio entre 15 y 45 para simular asistencias
            const attendance = Math.floor(Math.random() * 30) + 15
            return {
                date: format(date, "yyyy-MM-dd"),
                dayName: format(date, "EEEE", { locale: es }),
                shortDay: format(date, "EEE", { locale: es }),
                attendance,
            }
        })

        setAttendanceData(newData)
    }

    // Calcular el total de asistencias en el período seleccionado
    const totalAttendance = attendanceData.reduce((sum, day) => sum + day.attendance, 0)

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold text-sm mb-1">
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                    </p>
                    <p className="text-sm text-indigo-600 font-medium">
                        {`${payload[0].value} asistencias`}
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
                    <p className="text-3xl font-bold text-gray-900">{totalAttendance} asistencias</p>
                    <p className="text-sm text-gray-500">
                        {timeRange === "semana"
                            ? "en la última semana"
                            : timeRange === "2semanas"
                                ? "en las últimas 2 semanas"
                                : "en el último mes"}
                    </p>
                </div>
                <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semana">Última semana</SelectItem>
                        <SelectItem value="2semanas">Últimas 2 semanas</SelectItem>
                        <SelectItem value="mes">Último mes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full h-[280px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={attendanceData}
                        margin={{
                            top: 20,
                            right: 10,
                            left: 0,
                            bottom: 30,
                        }}
                        barSize={timeRange === "mes" ? 10 : timeRange === "2semanas" ? 15 : 30}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey={attendanceData.length <= 7 ? "dayName" : "shortDay"}
                            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1, 3)}
                            stroke="#6b7280"
                            fontSize={12}
                            tickMargin={10}
                            angle={-0}
                            textAnchor="middle"
                        />
                        <YAxis 
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) => `${value}`}
                            tickMargin={10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} />
                        <Legend 
                            wrapperStyle={{ 
                                paddingTop: "20px",
                                fontSize: "14px"
                            }}
                        />
                        <Bar 
                            dataKey="attendance" 
                            name="Asistencia" 
                            fill="#4f46e5"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
