"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Award, TrendingUp } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    description: string
    icon: React.ReactNode
    trend?: number
    trendLabel?: string
}

function StatsCard({ title, value, description, icon, trend, trendLabel }: StatsCardProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
                {trend !== undefined && (
                    <div className={`flex items-center mt-2 text-xs ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        <TrendingUp 
                            className={`h-3 w-3 mr-1 transition-transform ${trend < 0 ? "transform rotate-180" : ""}`}
                        />
                        <span className="font-medium">
                            {trend >= 0 ? "+" : ""}
                            {trend}% {trendLabel}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function DashboardStats() {
    // En un caso real, estos datos vendrían de la API o del contexto
    const stats = {
        activeMembers: 245,
        classesCompleted: 128,
        averageSatisfaction: 4.7,
        newMembers: 18,
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="Miembros Activos"
                value={stats.activeMembers}
                description="Total de miembros con membresía activa"
                icon={<Users className="h-4 w-4" />}
                trend={5.2}
                trendLabel="vs mes anterior"
            />
            <StatsCard
                title="Clases Completadas"
                value={stats.classesCompleted}
                description="Total de clases impartidas este mes"
                icon={<Calendar className="h-4 w-4" />}
                trend={12.5}
                trendLabel="vs mes anterior"
            />
            <StatsCard
                title="Satisfacción"
                value={stats.averageSatisfaction}
                description="Calificación promedio de servicios"
                icon={<Award className="h-4 w-4" />}
                trend={0.3}
                trendLabel="vs mes anterior"
            />
            <StatsCard
                title="Nuevos Miembros"
                value={stats.newMembers}
                description="Miembros registrados este mes"
                icon={<Users className="h-4 w-4" />}
                trend={-2.5}
                trendLabel="vs mes anterior"
            />
        </div>
    )
}
