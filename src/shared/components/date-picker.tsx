import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, AlertCircle } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { Button } from "@/shared/components/button"
import { Calendar } from "@/shared/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/popover"

export interface DatePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    label?: string
    placeholder?: string
    className?: string
    disabled?: boolean
    fromYear?: number
    toYear?: number
    required?: boolean
    error?: string
    subtitle?: string
    size?: "default" | "sm"
    align?: "center" | "start" | "end"
}

export function DatePicker({
    date,
    setDate,
    label,
    placeholder = "Seleccionar fecha",
    className,
    disabled = false,
    fromYear,
    toYear,
    required = false,
    error,
    subtitle,
    size = "default",
    align = "start",
}: DatePickerProps) {
    const currentYear = new Date().getFullYear()

    return (
        <div className={cn("grid gap-2", className)}>
            {label && (
                <label className="text-sm font-medium">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                            error && "border-red-500",
                            disabled && "opacity-50 cursor-not-allowed",
                            size === "sm" ? "h-9 text-sm" : "h-10",
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es }) : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    <div className="p-3 border-b border-border">
                        <h3 className="text-sm font-medium">{label || "Fecha"}</h3>
                        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={fromYear || currentYear - 100}
                        toYear={toYear || currentYear}
                        className="rounded-md border-0"
                    />
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                </p>
            )}
        </div>
    )
}
