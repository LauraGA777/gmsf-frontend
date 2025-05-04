import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import type { Locale } from "date-fns"

import { cn } from "@/shared/utils/utils"
import { buttonVariants } from "../components/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showHeader?: boolean
  title?: string
  subtitle?: string
}

// Función para capitalizar la primera letra de una cadena
const capitalizeFirstLetter = (string: string) => {
  if (!string) return ""
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown-buttons",
  fromYear,
  toYear,
  showHeader = false,
  title,
  subtitle,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear()

  // Crear un formatteador personalizado para los meses
  const formatters = {
    formatMonthCaption: (date: Date) => 
      capitalizeFirstLetter(date.toLocaleString("es", { month: "long" })),
    formatCaption: (date: Date, options?: { locale?: Locale }) => 
      capitalizeFirstLetter(date.toLocaleString(options?.locale?.code || "es", { month: "long" })) + " " + date.getFullYear()
  }

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] mx-auto">
      {showHeader && (
        <div className="p-2 border-b border-border">
          <h3 className="text-sm font-medium">{title || "Seleccione fecha"}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-2", className)}
        locale={es}
        captionLayout={captionLayout}
        fromYear={fromYear || currentYear - 100}
        toYear={toYear || currentYear}
        formatters={formatters}
        classNames={{
          months: "flex flex-col space-y-2",
          month: "space-y-2",
          caption: "flex justify-center relative items-center mb-1",
          caption_label: "text-sm font-medium hidden",
          caption_dropdowns: "flex items-center justify-between w-full gap-1",
          dropdown:
            "relative inline-flex h-8 items-center justify-center rounded-md bg-transparent px-2 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          dropdown_month: "flex-1 pl-2 pr-1",
          dropdown_year: "flex-initial pl-1 pr-2",
          dropdown_icon: "ml-1 h-4 w-4 opacity-0 hidden",
          vhidden: "hidden",
          nav: "flex items-center h-7",
          nav_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-7 w-7 bg-gray-100 p-0 rounded-full opacity-75 hover:opacity-100 hover:bg-gray-200 hover:text-gray-700 focus:ring-0 focus:bg-gray-200 transition-colors",
          ),
          nav_button_previous: "",
          nav_button_next: "",
          table: "w-full border-collapse space-y-1",
          head_row: "flex w-full justify-between mb-1",
          head_cell: "text-gray-500 font-medium text-[0.7rem] uppercase text-center w-8",
          row: "flex w-full justify-between mt-0",
          cell: "relative p-0 text-center text-sm aria-selected:opacity-100 focus-within:relative focus-within:z-20 flex items-center justify-center h-8 w-8 mx-auto",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 rounded-full text-xs transition-colors",
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-full font-medium",
          day_today: "text-black font-bold rounded-full bg-gray-100",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
          Dropdown: ({ value, onChange, children, ...props }) => {
            const isMonth = props.name === "months"
            return (
              <div className={`relative w-full flex-1 ${isMonth ? "text-left" : "text-right"}`}>
                <select
                  value={value}
                  onChange={onChange}
                  className="w-full h-9 appearance-none bg-transparent px-2 py-1 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-0"
                  aria-label={props.name === "months" ? "Seleccionar mes" : "Seleccionar año"}
                  tabIndex={0}
                >
                  {children}
                </select>
              </div>
            )
          },
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
