"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Users, Calendar, Award, CreditCard, Activity, TrendingUp } from "lucide-react"
import { MembershipRenewalChart } from "./membershipRenewalChart"
import { NewMembershipsChart } from "./newMembershipsChart"
import { MembershipStats } from "./membershipStats"
import { RenewalVsExpiredChart } from "./renewalVsExpiredChart"

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

export function Dashboard() {
    return (
        <div className="container mx-auto px-4 py-6">

            <MembershipStats className="mb-6" />


            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,050</div>
                            <p className="text-xs text-muted-foreground">+5.2% desde el mes pasado</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,231.89</div>
                            <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasa de Retención</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">85.3%</div>
                            <p className="text-xs text-muted-foreground">+1.2% desde el mes pasado</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nuevas Inscripciones</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">79</div>
                            <p className="text-xs text-muted-foreground">+18.7% desde el mes pasado</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <MembershipRenewalChart />
                    <NewMembershipsChart />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    <RenewalVsExpiredChart />
                </div>

            </div>
        </div>
    )
}
