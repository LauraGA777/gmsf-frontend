import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Calendar } from '@/shared/components/ui/calendar';
import { Badge } from '@/shared/components/ui/badge';
import { 
  CalendarDays, 
  ChevronDown, 
  Calendar as CalendarIcon,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from '../services/dashboardService';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ selectedRange, onRangeChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customCalendarOpen, setCustomCalendarOpen] = useState(false);

  // Presets tipo Power BI
  const presets = [
    {
      label: 'Hoy',
      value: 'today',
      icon: <Clock className="h-3 w-3" />,
      getValue: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
        label: 'Hoy',
        period: 'daily' as const
      })
    },
    {
      label: 'Ayer',
      value: 'yesterday',
      icon: <Clock className="h-3 w-3" />,
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
          label: 'Ayer',
          period: 'daily' as const
        };
      }
    },
    {
      label: 'Últimos 7 días',
      value: 'last7days',
      icon: <TrendingUp className="h-3 w-3" />,
      getValue: () => ({
        from: subDays(new Date(), 6),
        to: endOfDay(new Date()),
        label: 'Últimos 7 días',
        period: 'weekly' as const
      })
    },
    {
      label: 'Esta semana',
      value: 'thisweek',
      icon: <CalendarIcon className="h-3 w-3" />,
      getValue: () => ({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { weekStartsOn: 1 }),
        label: 'Esta semana',
        period: 'weekly' as const
      })
    },
    {
      label: 'Semana pasada',
      value: 'lastweek',
      icon: <CalendarIcon className="h-3 w-3" />,
      getValue: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
          label: 'Semana pasada',
          period: 'weekly' as const
        };
      }
    },
    {
      label: 'Este mes',
      value: 'thismonth',
      icon: <CalendarDays className="h-3 w-3" />,
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
        label: 'Este mes',
        period: 'monthly' as const
      })
    },
    {
      label: 'Mes pasado',
      value: 'lastmonth',
      icon: <CalendarDays className="h-3 w-3" />,
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
          label: 'Mes pasado',
          period: 'monthly' as const
        };
      }
    },
    {
      label: 'Este año',
      value: 'thisyear',
      icon: <CalendarDays className="h-3 w-3" />,
      getValue: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
        label: 'Este año',
        period: 'yearly' as const
      })
    },
    {
      label: 'Año pasado',
      value: 'lastyear',
      icon: <CalendarDays className="h-3 w-3" />,
      getValue: () => {
        const lastYear = subYears(new Date(), 1);
        return {
          from: startOfYear(lastYear),
          to: endOfYear(lastYear),
          label: 'Año pasado',
          period: 'yearly' as const
        };
      }
    }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    onRangeChange(range);
    setIsOpen(false);
  };

  const handleCustomDateSelect = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      const range: DateRange = {
        from: startOfDay(from),
        to: endOfDay(to),
        label: `${format(from, 'dd/MM/yyyy')} - ${format(to, 'dd/MM/yyyy')}`,
        period: 'custom'
      };
      onRangeChange(range);
      setCustomCalendarOpen(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Filtro principal compacto */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 px-3 text-xs font-medium border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            <CalendarDays className="h-3 w-3 mr-2" />
            {selectedRange.label}
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-700 mb-2 px-2">Períodos rápidos</div>
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:bg-gray-100 rounded-md transition-colors"
                >
                  {preset.icon}
                  {preset.label}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-2 pt-2">
              <Popover open={customCalendarOpen} onOpenChange={setCustomCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:bg-gray-100 rounded-md transition-colors">
                    <CalendarIcon className="h-3 w-3" />
                    Rango personalizado
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="right">
                  <Calendar
                    mode="range"
                    selected={{
                      from: selectedRange.from,
                      to: selectedRange.to
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        handleCustomDateSelect(range.from, range.to);
                      }
                    }}
                    locale={es}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Indicadores de período */}
      <div className="flex items-center gap-1">
        <Badge variant="secondary" className="text-xs px-2 py-0.5">
          {format(selectedRange.from, 'dd MMM', { locale: es })}
        </Badge>
        <span className="text-xs text-gray-400">-</span>
        <Badge variant="secondary" className="text-xs px-2 py-0.5">
          {format(selectedRange.to, 'dd MMM', { locale: es })}
        </Badge>
      </div>
    </div>
  );
} 