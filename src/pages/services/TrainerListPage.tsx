import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockTrainers } from "@/data/mockData";

export function TrainerListPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entrenadores</h1>
        <div className="flex gap-2">
          <Link to="/services">
            <Button variant="outline">Ver Servicios</Button>
          </Link>
          <Link to="/services/training-schedule">
            <Button variant="outline">Ver Horario de Entrenamientos</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTrainers.map((trainer) => (
          <Card key={trainer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{trainer.nombre} {trainer.apellido}</CardTitle>
              <CardDescription>{trainer.especialidad || "Entrenador general"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <span className="font-semibold">Estado:</span> {trainer.estado ? "Activo" : "Inactivo"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 