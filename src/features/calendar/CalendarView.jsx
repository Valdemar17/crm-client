import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';

// Mock Data
const MOCK_EVENTS = [
    { id: 1, date: new Date(2026, 0, 15), type: 'tarea', title: 'Llamada con Cliente ABC', status: 'pending', time: '10:00 AM' },
    { id: 2, date: new Date(2026, 0, 15), type: 'disposicion', title: 'Vencimiento Pagaré 001', status: 'urgent', time: '12:00 PM' },
    { id: 3, date: new Date(2026, 0, 18), type: 'tarea', title: 'Enviar reporte mensual', status: 'pending', time: '09:00 AM' },
    { id: 4, date: new Date(2026, 0, 20), type: 'disposicion', title: 'Cobro de intereses', status: 'normal', time: '02:00 PM' },
    { id: 5, date: new Date(2026, 0, 20), type: 'tarea', title: 'Revisión de expediente', status: 'completed', time: '04:00 PM' },
];

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 16)); // Start at current mock date Jan 2026
    const [selectedDay, setSelectedDay] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);

    // Calendar Helpers
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust for Monday start (0=Mon, 6=Sun)
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Navigation
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // Event Filtering
    const getEventsForDay = (day) => {
        return MOCK_EVENTS.filter(e => 
            e.date.getDate() === day && 
            e.date.getMonth() === currentDate.getMonth() && 
            e.date.getFullYear() === currentDate.getFullYear()
        );
    };

    // List Filtering
    const today = new Date(2026, 0, 16); // Mock Today
    const overdueEvents = MOCK_EVENTS.filter(e => e.date < today && e.status !== 'completed');
    const upcomingEvents = MOCK_EVENTS.filter(e => e.date >= today).sort((a,b) => a.date - b.date);

    const renderCalendarGrid = () => {
        const days = [];
        const blanks = Array(firstDay).fill(null);
        
        // Blank cells for previous month
        blanks.forEach((_, i) => days.push(
            <div key={`blank-${i}`} className="h-32 bg-slate-50/50 border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50" />
        ));

        // Day cells
        for (let d = 1; d <= daysInMonth; d++) {
            const events = getEventsForDay(d);
            const isToday = d === 16 && currentDate.getMonth() === 0; // Mock "Today"
            
            days.push(
                <div 
                    key={d}
                    className={`h-32 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 relative group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay({ day: d, events })}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {d}
                        </span>
                        {events.length > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                {events.length}
                            </span>
                        )}
                    </div>
                    
                    {/* Event Dots/Preview in Cell */}
                    <div className="mt-2 space-y-1">
                        {events.slice(0, 2).map((evt, i) => (
                            <div key={i} className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${
                                evt.type === 'disposicion' 
                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                                {evt.time} {evt.title}
                            </div>
                        ))}
                         {events.length > 2 && (
                            <div className="text-[10px] text-slate-400 pl-1">+ {events.length - 2} más</div>
                        )}
                    </div>

                    {/* Hover Tooltip */}
                    {hoveredDay === d && events.length > 0 && (
                        <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                Resumen del día {d}
                            </div>
                            <div className="space-y-2">
                                {events.map(evt => (
                                    <div key={evt.id} className="flex gap-2 items-start">
                                        {evt.type === 'disposicion' ? <AlertCircle size={14} className="text-amber-500 mt-0.5" /> : <CheckCircle size={14} className="text-blue-500 mt-0.5" />}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{evt.title}</p>
                                            <p className="text-[10px] text-slate-500">{evt.type === 'disposicion' ? 'Vencimiento' : 'Tarea'} • {evt.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Arrow */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-slate-800"></div>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-2.5 rounded-xl">
                        <CalendarIcon className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Calendario de Actividades</h1>
                        <p className="text-slate-500 text-sm">Gestiona tus tareas y vencimientos</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm transition-all"><ChevronLeft size={20} className="text-slate-600" /></button>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 w-32 text-center select-none">
                        {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm transition-all"><ChevronRight size={20} className="text-slate-600" /></button>
                </div>
            </div>

            {/* Content Area with Sidebar */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Calendar Grid */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        {DAY_NAMES.map(day => (
                            <div key={day} className="py-3 text-center text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    {/* Days Body */}
                    <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Right Sidebar - Due Tasks */}
                <div className="w-80 flex flex-col gap-6 overflow-y-auto">
                    
                    {/* Overdue Section */}
                    {overdueEvents.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm overflow-hidden">
                            <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
                                <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
                                <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm">Vencidas / Urgentes</h3>
                            </div>
                            <div className="p-2 space-y-2">
                                {overdueEvents.map(evt => (
                                    <div key={evt.id} className="p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:bg-red-100/50 transition-colors cursor-pointer group">
                                         <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                                {evt.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <span className="text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30 text-red-600 group-hover:bg-red-50 transition-colors">
                                                {evt.time}
                                            </span>
                                         </div>
                                         <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{evt.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Section */}
                     <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                            <Clock size={18} className="text-slate-500" />
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Próximos Vencimientos</h3>
                        </div>
                         <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-8">No hay tareas próximas</p>
                            ) : (
                                upcomingEvents.map(evt => (
                                    <div key={evt.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer">
                                         <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-medium ${evt.date.getDate() == today.getDate() ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                {evt.date.getDate() == today.getDate() ? 'Hoy' : evt.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                {evt.time}
                                            </span>
                                         </div>
                                         <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{evt.title}</p>
                                         <div className="mt-2 flex items-center gap-1">
                                             <div className={`w-1.5 h-1.5 rounded-full ${evt.type === 'disposicion' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                             <span className="text-[10px] text-slate-400 uppercase tracking-wide">{evt.type}</span>
                                         </div>
                                    </div>
                                ))
                            )}
                         </div>
                    </div>
                </div>
            </div>

            {/* Daily Detail Modal */}
            {selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDay(null)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in scale-95 duration-200">
                        {/* Header */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {selectedDay.day} de {MONTH_NAMES[currentDate.getMonth()]}
                                </h3>
                                <p className="text-sm text-slate-500">Desglose de actividades del día</p>
                            </div>
                            <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {selectedDay.events.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CalendarIcon className="text-slate-400" size={32} />
                                    </div>
                                    <p className="text-slate-500">No hay actividades programadas para este día.</p>
                                    <button className="mt-4 text-indigo-600 hover:underline font-medium text-sm">
                                        + Agregar Tarea
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedDay.events.map((evt, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                           <div className={`w-1 shrink-0 rounded-full ${evt.type === 'disposicion' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                           <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${evt.type === 'disposicion' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                        {evt.type}
                                                    </span>
                                                    <div className="flex items-center text-slate-400 text-xs">
                                                        <Clock size={12} className="mr-1" /> {evt.time}
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{evt.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {evt.status === 'urgent' && <span className="text-red-500 font-medium">Prioridad Alta • </span>}
                                                    Asignado a Administrativo
                                                </p>
                                           </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
