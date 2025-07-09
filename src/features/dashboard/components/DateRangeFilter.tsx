import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { 
  CalendarDays, 
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  Clock,
  History
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  loading?: boolean;
}

export function DateRangeFilter({ selectedRange, onRangeChange, loading }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  // Rangos predefinidos organizados por categoría
  const quickRanges: DateRange[] = [
    {
      from: new Date(),
      to: new Date(),
      label: 'Hoy',
      period: 'daily'
    },
    {
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
      label: 'Ayer',
      period: 'daily'
    },
    {
      from: subDays(new Date(), 7),
      to: new Date(),
      label: 'Últimos 7 días',
      period: 'weekly'
    },
    {
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
      label: 'Esta semana',
      period: 'weekly'
    }
  ];

  const monthlyRanges: DateRange[] = [
    {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
      label: 'Este mes',
      period: 'monthly'
    },
    {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
      label: 'Mes pasado',
      period: 'monthly'
    },
    {
      from: subDays(new Date(), 30),
      to: new Date(),
      label: 'Últimos 30 días',
      period: 'monthly'
    },
    {
      from: subDays(new Date(), 90),
      to: new Date(),
      label: 'Últimos 3 meses',
      period: 'monthly'
    }
  ];

  const yearlyRanges: DateRange[] = [
    {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
      label: 'Este año',
      period: 'yearly'
    },
    {
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1)),
      label: 'Año pasado',
      period: 'yearly'
    }
  ];

  const handlePredefinedRange = (range: DateRange) => {
    onRangeChange(range);
    setShowCustom(false);
  };

  const handleCustomRange = () => {
    if (customFrom && customTo) {
      const customRange: DateRange = {
        from: customFrom,
        to: customTo,
        label: `${format(customFrom, 'dd/MM/yyyy')} - ${format(customTo, 'dd/MM/yyyy')}`,
        period: 'custom'
      };
      onRangeChange(customRange);
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header del filtro */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Filtros de Fecha</span>
        </div>
      </div>

      {/* Período seleccionado */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Período activo</span>
            </div>
            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
              {selectedRange.label}
            </Badge>
          </div>
          <div className="mt-2 text-xs text-blue-700">
            {format(selectedRange.from, 'dd/MM/yyyy')} - {format(selectedRange.to, 'dd/MM/yyyy')}
          </div>
        </CardContent>
      </Card>

      {/* Rangos rápidos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acceso Rápido
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickRanges.map((range, index) => (
            <Button
              key={index}
              variant={selectedRange.label === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => handlePredefinedRange(range)}
              disabled={loading}
              className="justify-start text-xs h-9 transition-all duration-200"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Rangos mensuales */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Períodos Mensuales
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {monthlyRanges.map((range, index) => (
            <Button
              key={index}
              variant={selectedRange.label === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => handlePredefinedRange(range)}
              disabled={loading}
              className="justify-start text-xs h-9 transition-all duration-200"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Rangos anuales */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Períodos Anuales
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {yearlyRanges.map((range, index) => (
            <Button
              key={index}
              variant={selectedRange.label === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => handlePredefinedRange(range)}
              disabled={loading}
              className="justify-start text-xs h-9 transition-all duration-200"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Rango personalizado */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Rango Personalizado
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustom(!showCustom)}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showCustom && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Desde</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-xs h-9"
                      >
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        {customFrom ? format(customFrom, 'dd/MM/yyyy') : 'Seleccionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customFrom}
                        onSelect={setCustomFrom}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Hasta</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-xs h-9"
                      >
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        {customTo ? format(customTo, 'dd/MM/yyyy') : 'Seleccionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customTo}
                        onSelect={setCustomTo}
                        initialFocus
                        locale={es}
                        disabled={(date) => customFrom ? date < customFrom : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <Button
                size="sm"
                onClick={handleCustomRange}
                disabled={!customFrom || !customTo || loading}
                className="w-full h-9"
              >
                Aplicar Rango Personalizado
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Footer informativo */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span>📊 Días en el período: {Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1}</span>
          <span>🔄 {format(new Date(), 'HH:mm')}</span>
        </div>
      </div>
    </div>
  );
} 