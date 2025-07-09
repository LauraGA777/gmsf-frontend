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
      {/* Header del filtro con período seleccionado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Filtros de Fecha</h3>
            <p className="text-sm text-gray-600">
              {format(selectedRange.from, 'dd/MM/yyyy')} - {format(selectedRange.to, 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
        <Badge className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-3 py-1">
          {selectedRange.label}
        </Badge>
      </div>

      {/* Layout horizontal compacto de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rangos rápidos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Rápido</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {quickRanges.map((range, index) => (
              <Button
                key={index}
                variant={selectedRange.label === range.label ? "default" : "outline"}
                size="sm"
                onClick={() => handlePredefinedRange(range)}
                disabled={loading}
                className="justify-center text-xs h-8 px-2"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Rangos mensuales */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Mensual</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {monthlyRanges.map((range, index) => (
              <Button
                key={index}
                variant={selectedRange.label === range.label ? "default" : "outline"}
                size="sm"
                onClick={() => handlePredefinedRange(range)}
                disabled={loading}
                className="justify-center text-xs h-8 px-2"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Rangos anuales */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Anual</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {yearlyRanges.map((range, index) => (
              <Button
                key={index}
                variant={selectedRange.label === range.label ? "default" : "outline"}
                size="sm"
                onClick={() => handlePredefinedRange(range)}
                disabled={loading}
                className="justify-center text-xs h-8 px-2"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Rango personalizado */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Personalizado</span>
          </div>
          <div className="space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustom(!showCustom)}
              className="w-full justify-center text-xs h-8 px-2"
            >
              <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
              Rango Custom
            </Button>
            
            {showCustom && (
              <div className="space-y-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-center text-xs h-8 px-2"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {customFrom ? format(customFrom, 'dd/MM') : 'Desde'}
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
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-center text-xs h-8 px-2"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {customTo ? format(customTo, 'dd/MM') : 'Hasta'}
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
                
                <Button
                  size="sm"
                  onClick={handleCustomRange}
                  disabled={!customFrom || !customTo || loading}
                  className="w-full h-8 text-xs"
                >
                  Aplicar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer informativo compacto */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <div className="flex items-center justify-between">
          <span>📊 {Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} días</span>
          <span>🔄 {format(new Date(), 'HH:mm:ss')}</span>
        </div>
      </div>
    </div>
  );
} 