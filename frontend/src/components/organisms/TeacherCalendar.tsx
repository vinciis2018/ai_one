import React, { useState } from 'react';
import { useAppSelector } from '../../store';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  students: string[];
  subject?: string;
  location?: string;
  recurrence?: string;
  status: string;
}

interface TeacherCalendarProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
}

export const TeacherCalendar: React.FC<TeacherCalendarProps> = ({ events = [], onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'vertical'>('grid');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    subject: '',
    recurrence: '',
    students: [] as string[]
  });

  const { user } = useAppSelector((state) => state.auth);

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  // Helper to get day of week for first day of month
  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(date);
  };

  const handleAddEventClick = (date?: Date) => {
    const startDate = date || new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    // Format for datetime-local input: YYYY-MM-DDThh:mm
    const formatDateTime = (d: Date) => {
      const pad = (n: number) => n < 10 ? '0' + n : n;
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setNewEvent({
      title: '',
      description: '',
      start_time: formatDateTime(startDate),
      end_time: formatDateTime(endDate),
      location: '',
      subject: '',
      recurrence: '',
      students: []
    });
    setShowAddEventModal(true);
    if (selectedDay) setSelectedDay(null); // Close day modal if open
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddEvent) {
      onAddEvent({
        title: newEvent.title,
        description: newEvent.description,
        start_time: new Date(newEvent.start_time).toISOString(),
        end_time: new Date(newEvent.end_time).toISOString(),
        location: newEvent.location,
        subject: newEvent.subject,
        recurrence: newEvent.recurrence,
        students: newEvent.students,
        status: 'scheduled'
      });
      setShowAddEventModal(false);
    }
  };

  // Generate calendar grid
  const renderCalendarDays = () => {
    const days = [];

    // Grid View Logic
    if (viewMode === 'grid') {
      // Empty cells for days before start of month
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-slate-50/30 dark:bg-white border border-slate-100 dark:border-white backdrop-blur-sm"></div>);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDay(day);
        const isToday = new Date().getDate() === day &&
          new Date().getMonth() === currentDate.getMonth() &&
          new Date().getFullYear() === currentDate.getFullYear();

        days.push(
          <div
            key={`day-${day}`}
            onClick={() => handleDayClick(day)}
            className={`h-24 sm:h-32 border border-slate-100 dark:border-white p-1 sm:p-2 relative group transition-all cursor-pointer 
                ${isToday ? 'bg-sky-50' : 'bg-white hover:bg-slate-50 dark:hover:bg-white'} backdrop-blur-sm`}
          >
            <div className={`text-xs sm:text-sm font-bold mb-1 transition-all
                ${isToday
                ? 'text-white bg-logoViolet w-7 h-7 flex items-center justify-center rounded-lg shadow-lg shadow-logoBlue'
                : 'text-slate-700 dark:text-slate-300 group-hover:text-logoBlue'}`}>
              {day}
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-2rem)] custom-scrollbar pr-1">
              {dayEvents.map(event => (
                <button
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                  className={`w-full text-left text-xs lg:px-2 py-1.5 rounded-lg border border-white truncate transition-all hover:scale-[1.02] hover:shadow-md
                    ${event.status === 'cancelled'
                      ? 'line-through opacity-60 bg-slate-100 text-slate-500 dark:bg-white dark:border-white dark:text-slate-500'
                      : 'bg-logoSky dark:bg-white text-slate-700 dark:text-slate-200 hover:border-logoBlue hover:bg-gradient-to-r hover:from-white hover:to-slate-50 dark:hover:from-white dark:hover:to-white'
                    }`}
                >
                  <div className="font-bold truncate flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${event.status === 'cancelled' ? 'bg-slate-400' : 'bg-logoBlue'}`}></div>
                    {event.title}
                  </div>
                  <div className="hidden lg:block text-xs opacity-70 truncate mt-0.5 ml-2.5 font-medium">
                    {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }
    } else {
      // Vertical List View Logic
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDay(day);
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isToday = new Date().getDate() === day &&
          new Date().getMonth() === currentDate.getMonth() &&
          new Date().getFullYear() === currentDate.getFullYear();
        const dayName = weekDays[date.getDay()];

        days.push(
          <div
            key={`day-list-${day}`}
            onClick={() => handleDayClick(day)}
            className={`flex flex-col sm:flex-row gap-4 p-4 border-b border-slate-100 dark:border-white hover:bg-slate-50 dark:hover:bg-white transition-colors cursor-pointer group ${isToday ? 'bg-sky-50' : ''}`}
          >
            <div className="flex sm:flex-col items-center sm:items-center gap-2 w-full sm:w-20 flex-shrink-0">
              <span className={`text-sm font-bold uppercase tracking-wider ${isToday ? 'text-logoBlue' : 'text-slate-400'}`}>{dayName}</span>
              <span className={`text-2xl font-bold flex items-center justify-center w-10 h-10 rounded-xl ${isToday ? 'bg-logoViolet text-white shadow-lg shadow-logoBlue' : 'text-slate-700 dark:text-white'}`}>
                {day}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {dayEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-md
                                          ${event.status === 'cancelled'
                          ? 'opacity-70 bg-slate-50 border-slate-200'
                          : 'bg-white dark:bg-white border-slate-200 dark:border-white hover:border-logoBlue'}`}
                    >
                      <div className={`w-1 self-stretch rounded-full ${event.status === 'cancelled' ? 'bg-slate-400' : 'bg-gradient-to-b from-logoBlue to-logoViolet'}`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm truncate ${event.status === 'cancelled' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-white px-2 py-0.5 rounded-md">
                            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {event.location && <span className="text-xs text-slate-400 truncate flex items-center gap-1"><i className="fi fi-rr-marker"></i> {event.location}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center text-slate-400 text-sm italic py-2 sm:py-0">
                  No classes scheduled
                </div>
              )}
            </div>
          </div>
        );
      }
    }
    return days;
  };

  const getEventsForSelectedDay = () => {
    if (!selectedDay) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === selectedDay.getDate() &&
        eventDate.getMonth() === selectedDay.getMonth() &&
        eventDate.getFullYear() === selectedDay.getFullYear();
    });
  };

  return (
    <div className="bg-white dark:bg-black backdrop-blur-xl rounded-3xl shadow-md border border-white overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="p-3 lg:p-6 flex flex-col items-center justify-between border-b border-slate-100 dark:border-white gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-logoPink to-logoPurple flex items-center justify-center text-white shadow-lg shadow-logoBlue/20">
              <i className="fi fi-rr-calendar flex items-center justify-center text-base lg:text-lg"></i>
            </div>
            <h2 className="text-base lg:text-xl font-bold text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} <span className="text-slate-400 font-medium">{currentDate.getFullYear()}</span>
            </h2>
          </div>
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/10 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-black text-logoBlue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid View"
            >
              <i className="fi fi-rr-apps flex items-center justify-center"></i>
            </button>
            <button
              onClick={() => setViewMode('vertical')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'vertical' ? 'bg-white dark:bg-black text-logoBlue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <i className="fi fi-rr-list flex items-center justify-center"></i>
            </button>
          </div>
        </div>
 

        <div className="flex items-center w-full gap-3">
          <div className="w-full flex items-center justify-between bg-white dark:bg-white rounded-xl p-1 border border-slate-100 dark:border-white shadow-sm">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 dark:hover:bg-white rounded-lg transition-colors text-slate-500">
              <i className="fi fi-rr-angle-left flex items-center"></i>
            </button>
            <button onClick={handleToday} className="px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white rounded-lg transition-colors">
              Today <span className="hidden sm:inline-block">({new Date().toDateString()})</span>
            </button>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-50 dark:hover:bg-white rounded-lg transition-colors text-slate-500">
              <i className="fi fi-rr-angle-right flex items-center"></i>
            </button>
          </div>

          {user?.role === "teacher" && (
            <button
              onClick={() => handleAddEventClick()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl text-sm font-bold shadow-lg shadow-logoBlue/20 hover:shadow-xl hover:shadow-logoBlue/30 hover:scale-105 transition-all"
            >
              <i className="fi fi-rr-plus flex items-center justify-center"></i>
              <span className="hidden sm:inline-block">Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Week days header (Only for Grid) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid / List */}
      <div className={`
        ${viewMode === 'grid'
          ? 'grid grid-cols-7 bg-slate-100/50 dark:bg-black/20 gap-px border-b border-slate-100 dark:border-white/10'
          : 'flex flex-col max-h-[600px] overflow-y-auto custom-scrollbar'}
      `}>
        {renderCalendarDays()}
      </div>

      {/* Selected Day Events Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-md animate-fade-in" onClick={() => setSelectedDay(null)}>
          <div
            className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-3xl shadow-2xl border border-white w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col transform transition-all scale-100 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-white flex items-center justify-between bg-slate-50 dark:bg-white">
              <div>
                <h3 className="font-bold text-base lg:text-xl text-slate-900 dark:text-white">
                  {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-xs lg:text-sm text-slate-500 font-medium mt-1">{getEventsForSelectedDay().length} events scheduled</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-white rounded-full transition-colors">
                <i className="fi fi-rr-cross text-slate-500 flex"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              {getEventsForSelectedDay().length > 0 ? (
                getEventsForSelectedDay().map(event => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setSelectedDay(null);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg group
                      ${event.status === 'cancelled' ? 'bg-slate-50 border-slate-200 opacity-70' :
                        'bg-white dark:bg-white border-slate-100 dark:border-white hover:border-logoBlue hover:bg-gradient-to-br hover:from-white hover:to-logoBlue'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-base ${event.status === 'cancelled' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white group-hover:text-logoBlue transition-colors'}`}>
                        {event.title}
                      </h4>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${event.status === 'cancelled' ? 'bg-slate-200 text-slate-600' : 'bg-logoBlue text-white'
                        }`}>
                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{event.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <i className="fi fi-rr-marker text-logoViolet"></i>
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.students && (
                        <div className="flex items-center gap-1.5">
                          <i className="fi fi-rr-users text-logoBlue"></i>
                          <span>{event.students.length} Students</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-white">
                    <i className="fi fi-rr-calendar text-3xl text-slate-300"></i>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">No classes scheduled</p>
                  <p className="text-sm text-slate-400 mt-1">Enjoy your free time!</p>
                </div>
              )}
            </div>

            {user?.role === "teacher" && (
              <div className="p-6 border-t border-slate-100 dark:border-white bg-slate-50 dark:bg-white">
                <button
                  onClick={() => handleAddEventClick(selectedDay)}
                  className="w-full py-3.5 bg-gradient-to-r from-logoBlue to-logoViolet text-white text-sm lg:text-lg rounded-xl font-bold hover:shadow-lg hover:shadow-logoBlue hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-plus flex items-center justify-center"></i>
                  Schedule New Class
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-md animate-fade-in" onClick={() => setShowAddEventModal(false)}>
          <div
            className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-3xl shadow-2xl border border-white w-full max-w-md overflow-y-auto transform transition-all scale-100 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-white flex items-center justify-between bg-slate-50 dark:bg-white">
              <h3 className="font-bold text-base lg:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-logoBlue flex items-center justify-center text-white">
                  <i className="fi fi-rr-calendar-plus flex items-center justify-center "></i>
                </span>
                Add New Event
              </h3>
              <button onClick={() => setShowAddEventModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-white rounded-full transition-colors">
                <i className="fi fi-rr-cross text-slate-500 flex items-center justify-center"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitEvent} className="p-3 lg:p-6 space-y-3 lg:space-y-5">
              <div>
                <label className="block text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white focus:border-logoBlue focus:ring-4 focus:ring-logoBlue outline-none transition-all bg-slate-50 dark:bg-black font-medium"
                  placeholder="e.g., Physics Class"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Start</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.start_time}
                    onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white focus:border-logoBlue focus:ring-4 focus:ring-logoBlue outline-none transition-all text-sm font-medium bg-slate-50 dark:bg-black"
                  />
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">End</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.end_time}
                    onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white focus:border-logoBlue focus:ring-4 focus:ring-logoBlue outline-none transition-all text-sm font-medium bg-slate-50 dark:bg-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Subject</label>
                <input
                  type="text"
                  value={newEvent.subject}
                  onChange={e => setNewEvent({ ...newEvent, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white focus:border-logoBlue focus:ring-4 focus:ring-logoBlue outline-none transition-all bg-slate-50 dark:bg-black font-medium"
                  placeholder="e.g., Physics"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white focus:border-logoBlue focus:ring-4 focus:ring-logoBlue outline-none transition-all bg-slate-50 dark:bg-black font-medium resize-none"
                  rows={3}
                  placeholder="Add details..."
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white focus:border-logoBlue focus:ring-4 focus:ring-logoBlue outline-none transition-all bg-slate-50 dark:bg-black font-medium"
                  placeholder="e.g., Room 301 or Online"
                />
              </div>

              <div className="lg:pt-4 flex gap-3 text-xs lg:text-base">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-white text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl font-bold shadow-lg shadow-logoBlue hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm animate-fade-in" onClick={() => setSelectedEvent(null)}>
          <div
            className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-3xl shadow-2xl border border-white w-full max-w-md overflow-hidden transform transition-all scale-100 animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 lg:p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <h3 className="font-bold text-base lg:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-logoViolet/10 flex items-center justify-center text-logoViolet">
                  <i className="fi fi-rr-info text-sm flex items-center justify-center"></i>
                </span>
                Event Details
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                <i className="fi fi-rr-cross text-slate-500 flex items-center justify-center"></i>
              </button>
            </div>
            <div className="p-4 lg:p-8 space-y-6">
              <div>
                <h4 className="text-lg lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedEvent.title}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <i className="fi fi-rr-clock text-logoBlue"></i>
                  <span>
                    {new Date(selectedEvent.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {' '}
                    {new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                    {new Date(selectedEvent.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="bg-slate-50 dark:bg-white p-4 rounded-2xl text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white font-medium leading-relaxed">
                  {selectedEvent.description}
                </div>
              )}

              <div className="space-y-2 lg:space-y-4">
                {selectedEvent.location && (
                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-logoPink dark:bg-logoPink flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <i className="fi fi-rr-marker flex items-center justify-center text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Location</p>
                      <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.subject && (
                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-logoPurple dark:bg-logoPurple flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <i className="fi fi-rr-book-alt flex items-center justify-center text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Subject</p>
                      <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white">{selectedEvent.subject}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.students && selectedEvent.students.length > 0 && (
                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-logoSky dark:bg-logoSky flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <i className="fi fi-rr-users flex items-center justify-center text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Students ({selectedEvent.students.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.students.map((student, idx) => (
                          <span key={idx} className="text-xs px-3 py-1 bg-white dark:bg-black border border-slate-200 dark:border-white text-slate-600 dark:text-slate-300 rounded-full font-bold shadow-sm">
                            {student}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:pt-4 flex gap-3 border-t border-slate-100 dark:border-white">
                <button className="flex-1 py-3 bg-gradient-to-r from-logoBlue to-logoViolet dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg">
                  Add Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
