import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockServices } from "@/data/mockData";

export function ServiceListPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <div className="flex gap-2">
          <Link to="/services/training-schedule">
            <Button variant="outline">Ver Horario de Entrenamientos</Button>
          </Link>
          <Link to="/services/trainers">
            <Button variant="outline">Ver Entrenadores</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{service.nombre}</CardTitle>
              <CardDescription>{service.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2"><span className="font-semibold">Duración:</span> {service.duracion_dias} días</p>
              <p className="text-lg font-bold">${service.precio.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 