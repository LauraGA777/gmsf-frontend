import { useCallback, useState, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin, { DateClickArg, EventResizeDoneArg } from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { EventDropArg, EventClickArg, EventContentArg, SlotLabelContentArg, MoreLinkArg, DateSelectArg } from "@fullcalendar/core"
import type { Training } from "@/shared/types/training"
import { cn } from "@/shared/lib/utils"
import { isPast } from "date-fns"

interface ScheduleComponentProps {
  onTrainingClick: (training: Training) => void
  trainings: Training[]
  onAddTraining: (selection: { start: Date, end: Date }) => void
  onUpdateTrainingDate: (trainingId: number, newStartDate: Date, newEndDate: Date) => void
}

export function ScheduleComponent({
  onTrainingClick,
  trainings,
  onAddTraining,
  onUpdateTrainingDate
}: ScheduleComponentProps) {
  const [_popoverState, setPopoverState] = useState<{
    isOpen: boolean
    target: HTMLElement | null
    date: Date | null
    events: Training[]
  }>({ isOpen: false, target: null, date: null, events: [] })

  const calendarRef = useRef<FullCalendar>(null);

  const mapTrainingsToEvents = useCallback((trainings: Training[]) => {
    return trainings.map(training => ({
      id: training.id.toString(),
      title: training.titulo,
      start: new Date(training.fecha_inicio),
      end: new Date(training.fecha_fin),
      extendedProps: { ...training },
    }))
  }, [])

  const getEventStatusClass = (status: Training["estado"]) => {
    switch (status) {
      case "Programado": return "bg-blue-500 border-blue-600 hover:bg-blue-600"
      case "En proceso": return "bg-yellow-500 border-yellow-600 hover:bg-yellow-600"
      case "Completado": return "bg-green-500 border-green-600 hover:bg-green-600"
      case "Cancelado": return "bg-red-500 border-red-600 hover:bg-red-600"
      default: return "bg-gray-500 border-gray-600 hover:bg-gray-600"
    }
  }
  
  const handleEventDrop = (arg: EventDropArg) => {
    const { event } = arg
    if (event.start && event.end) {
      onUpdateTrainingDate(Number(event.id), event.start, event.end)
    }
  }

  const handleEventResize = (resizeInfo: EventResizeDoneArg) => {
    const { event } = resizeInfo;
    if (event.start && event.end) {
        onUpdateTrainingDate(Number(event.id), event.start, event.end);
    }
  }

  const handleSelect = (selectionInfo: DateSelectArg) => {
    onAddTraining({ start: selectionInfo.start, end: selectionInfo.end });
  }

  const handleNavLinkDayClick = (date: Date) => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
          calendarApi.changeView('timeGridDay', date);
      }
  }

  const handleEventClick = (arg: EventClickArg) => {
    onTrainingClick(arg.event.extendedProps as Training)
  }

  const handleDateClick = (arg: DateClickArg) => {
    onAddTraining({ start: arg.date, end: arg.date })
  }
  
  const handleMoreLinkClick = (arg: MoreLinkArg) => {
    setPopoverState({
        isOpen: true,
        target: arg.jsEvent.target as HTMLElement,
        date: arg.date,
        events: arg.allSegs.map(seg => seg.event.extendedProps as Training)
    });
    return "popover"; // Prevents default navigation
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const training = eventInfo.event.extendedProps as Training;
    const statusClass = getEventStatusClass(training.estado);
    const isEventPast = isPast(new Date(training.fecha_fin));

    return (
      <div className={cn(
          "p-1.5 w-full h-full text-white rounded-md text-xs overflow-hidden cursor-pointer",
          statusClass,
          { "opacity-75": isEventPast }
      )}>
        <b className="font-semibold">{eventInfo.timeText}</b>
        <p className="truncate">{eventInfo.event.title}</p>
        <p className="truncate italic opacity-80">{training.cliente?.usuario?.nombre}</p>
      </div>
    );
  };
  
  const renderSlotLabel = (arg: SlotLabelContentArg) => {
    return (
        <div className="text-xs text-muted-foreground pr-2">
            {arg.text}
        </div>
    )
  }


  return (
    <div className="h-full w-full bg-card text-card-foreground relative">
        <style>{`
            :root {
                --fc-border-color: hsl(var(--border));
                --fc-today-bg-color: hsla(var(--primary), 0.05);
            }
            /* General Toolbar */
            .fc .fc-toolbar.fc-header-toolbar {
                margin-bottom: 1.5em;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 1rem;
            }
            .fc .fc-toolbar-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: hsl(var(--foreground));
                white-space: normal;
            }
            
            /* General Button Styles */
            .fc .fc-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background-color: transparent;
                border: 1px solid hsl(var(--border));
                color: hsl(var(--foreground));
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                border-radius: var(--radius);
                transition: all 0.2s;
            }
             .fc .fc-button:hover {
                 background-color: hsl(var(--accent));
                 color: hsl(var(--accent-foreground));
             }
            .fc .fc-button:focus, .fc .fc-button:active {
                outline: none;
                box-shadow: 0 0 0 2px hsl(var(--ring));
            }

            /* Today Button Style */
            .fc .fc-today-button {
                background-color: hsl(var(--secondary));
                color: hsl(var(--secondary-foreground));
            }
            .fc .fc-today-button:disabled {
                opacity: 0.7;
            }
             .fc .fc-today-button:hover {
                background-color: hsl(var(--secondary) / 0.8) !important;
             }


            /* Prev/Next and View Switcher buttons */
            .fc .fc-button-group {
                display: inline-flex;
                border-radius: var(--radius);
                overflow: hidden;
            }
            .fc .fc-button-group > .fc-button {
                 background-color: hsl(var(--primary));
                 color: hsl(var(--primary-foreground));
                 border: none;
                 border-radius: 0;
            }
            .fc .fc-button-group > .fc-button:not(:first-child) {
                 border-left: 1px solid hsl(var(--primary) / 0.5);
            }
             .fc .fc-button-group > .fc-button:hover {
                background-color: hsl(var(--primary) / 0.9) !important;
             }
             .fc .fc-button-group > .fc-button.fc-button-active {
                 background-color: hsl(var(--primary) / 0.8) !important;
                 box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
             }
            
            /* Calendar Grid Styles */
            .fc .fc-daygrid-day.fc-day-today {
                background-color: var(--fc-today-bg-color);
            }
             .fc .fc-timegrid-slot-lane {
                border-bottom: 1px solid var(--fc-border-color) !important;
             }
             .fc .fc-timegrid-slot-label-cushion {
                 text-align: right;
                 padding-right: 1em;
                 font-size: 0.8em;
                 color: hsl(var(--muted-foreground));
             }
             .fc .fc-timegrid-slot-label {
                 border-bottom: 0 !important;
             }
            .fc .fc-timegrid-now-indicator-line {
                border-color: hsl(var(--primary));
                border-width: 2px;
            }
            .fc .fc-scroller {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
            }
            .fc .fc-scroller::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
            }
            .fc .fc-event-dragging {
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                opacity: 0.75;
            }

        `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
            today:    'Hoy',
            month:    'Mes',
            week:     'Semana',
            day:      'Día',
        }}
        initialView="dayGridMonth"
        dayMaxEvents={1}
        moreLinkClick={handleMoreLinkClick}
        moreLinkContent={(arg) => `+ ${arg.num} más`}
        locale={esLocale}
        events={mapTrainingsToEvents(trainings)}
        editable={true}
        droppable={true}
        selectable={true}
        select={handleSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        navLinkDayClick={handleNavLinkDayClick}
        eventContent={renderEventContent}
        slotLabelContent={renderSlotLabel}
        slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        height="100%"
        contentHeight="auto"
      />
    </div>
  )
}

