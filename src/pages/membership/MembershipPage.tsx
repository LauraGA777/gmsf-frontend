import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockMemberships } from "@/data/mockData";

export function MembershipPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Membresías</h1>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Button variant="outline">Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMemberships.map((membership) => (
          <Card key={membership.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{membership.nombre}</CardTitle>
              <CardDescription>{membership.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2"><span className="font-semibold">Duración:</span> {membership.duracion_dias} días</p>
              <p className="text-lg font-bold">${membership.precio.toLocaleString()}</p>
              <div className="mt-4">
                <Button className="w-full">Contratar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 