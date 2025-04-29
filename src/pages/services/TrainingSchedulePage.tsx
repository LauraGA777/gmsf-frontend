import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { mockTrainings } from "@/data/mockData";

export function TrainingSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Agrupar entrenamientos por día
  const trainingsByDay: Record<string, typeof mockTrainings> = {};
  
  mockTrainings.forEach(training => {
    const date = new Date(training.fecha);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!trainingsByDay[dateKey]) {
      trainingsByDay[dateKey] = [];
    }
    
    trainingsByDay[dateKey].push(training);
  });
  
  // Obtener las fechas ordenadas
  const sortedDates = Object.keys(trainingsByDay).sort();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Horario de Entrenamientos</h1>
        <div className="flex gap-2">
          <Link to="/services">
            <Button variant="outline">Ver Servicios</Button>
          </Link>
          <Link to="/services/trainers">
            <Button variant="outline">Ver Entrenadores</Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
        {sortedDates.map(dateKey => (
          <Card key={dateKey} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                {format(new Date(dateKey), 'EEEE d MMMM yyyy', { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingsByDay[dateKey].map(training => (
                  <div key={training.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{training.service?.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Entrenador: {training.trainer?.nombre} {training.trainer?.apellido}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(`${training.fecha}T${training.hora_inicio}`), 'HH:mm')} - 
                        {format(new Date(`${training.fecha}T${training.hora_fin}`), 'HH:mm')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cupos: {training.cupos_ocupados}/{training.cupo_maximo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 