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
    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-gray-50/50 border border-gray-100"></div>);
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
          className={`h-24 sm:h-32 border border-gray-100 p-1 sm:p-2 relative group hover:bg-gray-50 transition-colors cursor-pointer ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}
        >
          <div className={`text-xs sm:text-sm font-medium mb-1 ${isToday ? 'text-blue-600 bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)] custom-scrollbar">
            {dayEvents.map(event => (
              <button
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                }}
                className={`w-full text-left text-[10px] sm:text-xs px-1.5 py-1 rounded border truncate transition-all hover:shadow-sm
                  ${event.status === 'cancelled' ? 'line-through opacity-60 bg-gray-100 text-gray-500 border-gray-200' :
                    'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                  }`}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-[9px] opacity-80 truncate">
                  {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-md transition-colors text-gray-600">
              <i className="fi fi-rr-angle-left flex items-center"></i>
            </button>
            <button onClick={handleToday} className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-white rounded-md transition-colors">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-md transition-colors text-gray-600">
              <i className="fi fi-rr-angle-right flex items-center"></i>
            </button>
          </div>
        </div>
        {user?.role == "teacher" && (
          <button
            onClick={() => handleAddEventClick()}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fi fi-rr-plus"></i>
            Add Event
          </button>
        )}
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 bg-gray-200 gap-px border-b border-gray-200">
        {renderCalendarDays()}
      </div>

      {/* Selected Day Events Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-xs text-gray-500">{getEventsForSelectedDay().length} events scheduled</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <i className="fi fi-rr-cross text-gray-500 flex"></i>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {getEventsForSelectedDay().length > 0 ? (
                getEventsForSelectedDay().map(event => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setSelectedDay(null);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md
                      ${event.status === 'cancelled' ? 'bg-gray-50 border-gray-200 opacity-70' :
                        'bg-blue-50 border-blue-100 hover:bg-blue-100'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold ${event.status === 'cancelled' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {event.title}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === 'cancelled' ? 'bg-gray-200 text-gray-600' : 'bg-white/50 text-gray-600'
                        }`}>
                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <i className="fi fi-rr-marker"></i>
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.students && (
                        <div className="flex items-center gap-1">
                          <i className="fi fi-rr-users"></i>
                          <span>{event.students.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fi fi-rr-calendar text-2xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-500 font-medium">No classes scheduled</p>
                  <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
                </div>
              )}
            </div>

            {user?.role == "teacher" && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => handleAddEventClick(selectedDay)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-plus"></i>
                  Schedule Class
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddEventModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Add New Event</h3>
              <button onClick={() => setShowAddEventModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <i className="fi fi-rr-cross text-gray-500 flex"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Physics Class"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.start_time}
                    onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.end_time}
                    onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newEvent.subject}
                  onChange={e => setNewEvent({ ...newEvent, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Physics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows={3}
                  placeholder="Add details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Room 301 or Online"
                />
              </div>

              {/* Removed color selection as per new event structure */}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Event Details</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <i className="fi fi-rr-cross text-gray-500 flex"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{selectedEvent.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="fi fi-rr-clock"></i>
                  <span>
                    {new Date(selectedEvent.start_time).toLocaleDateString()} • {' '}
                    {new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                    {new Date(selectedEvent.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  {selectedEvent.description}
                </div>
              )}

              <div className="space-y-3">
                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                      <i className="fi fi-rr-marker text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-sm text-gray-900">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.subject && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                      <i className="fi fi-rr-book-alt text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Subject</p>
                      <p className="text-sm text-gray-900">{selectedEvent.subject}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.students && selectedEvent.students.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                      <i className="fi fi-rr-users text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Students</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEvent.students.map((student, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                            {student}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
