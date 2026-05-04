
import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils/cn';
export const Calendar: React.FC = () => {
  const { events } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Academic', 'Social', 'Sports', 'Workshop', 'Other'];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const matchesDay = isSameDay(new Date(event.date), day);
      const matchesCategory = filterCategory === 'All' || event.category === filterCategory;
      return matchesDay && matchesCategory;
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              filterCategory === cat 
                ? "bg-indigo-600 text-white shadow-md" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-indigo-600 dark:bg-indigo-900 text-white">
        <div>
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <p className="text-indigo-100 text-sm mt-1">{getEventsForDay(currentDate).length} events this month</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-bold backdrop-blur-md"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "min-h-[110px] sm:min-h-[130px] border-b border-r border-gray-100 dark:border-gray-700 p-2 transition-all cursor-pointer",
                !isCurrentMonth ? "bg-gray-50/50 dark:bg-gray-900/20 text-gray-400" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                isSelected ? "bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-inset ring-indigo-500 z-10" : "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full transition-colors",
                  isToday ? "bg-indigo-600 text-white" : isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                )}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "px-2 py-1 text-[10px] sm:text-xs rounded-md border font-medium truncate transition-transform hover:scale-105",
                      event.category === 'Academic' && "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800",
                      event.category === 'Social' && "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-100 dark:border-pink-800",
                      event.category === 'Sports' && "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800",
                      event.category === 'Workshop' && "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800",
                      event.category === 'Other' && "bg-gray-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-600"
                    )}
                  >
                    {event.time} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 pl-1 font-medium">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div 
            key={selectedDay.toString()}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Events for {format(selectedDay, 'EEEE, MMMM d')}
                </h3>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getEventsForDay(selectedDay).length > 0 ? (
                  getEventsForDay(selectedDay).map(event => (
                    <motion.div 
                      layout
                      key={event.id} 
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-all"
                    >
                      {event.imageUrl && (
                        <div className="h-40 w-full overflow-hidden">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg",
                            event.category === 'Academic' && "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
                            event.category === 'Social' && "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
                            event.category === 'Sports' && "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
                            event.category === 'Workshop' && "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
                            event.category === 'Other' && "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          )}>
                            {event.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center font-medium">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {event.time}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {event.title}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                            {event.location}
                          </div>
                          <span className="text-[10px] text-gray-400 italic">By {event.organizer}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium italic">No events scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
