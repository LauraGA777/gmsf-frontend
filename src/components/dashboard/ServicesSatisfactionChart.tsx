import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Definición de los datos de satisfacción por categoría
export interface SatisfactionData {
    categoria: string
    calificacion: number
    color: string
}

interface ServiceSatisfactionChartProps {
    data: SatisfactionData[]
    title: string
}

export function ServiceSatisfactionChart({ data, title }: ServiceSatisfactionChartProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="categoria" />
                        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calificacion" name="Calificación" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
