import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, WifiOff } from 'lucide-react';
import { Calendar } from '../components/Calendar';
import { UserConcernModal } from '../components/UserConcernModal';
import { useAppContext } from '../context/AppContext';

export const Home: React.FC = () => {
  const { heroImageUrl, heroTitle, heroSubtitle, isSystemAvailable } = useAppContext();
  const navigate = useNavigate();

  if (!isSystemAvailable) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8">
        <div className="bg-red-50 dark:bg-red-900/10 p-12 rounded-3xl border border-red-100 dark:border-red-900/30 max-w-md">
          <WifiOff className="h-16 w-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">System Unavailable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The Campus Event Scheduler is currently undergoing scheduled maintenance to ensure data integrity and security.
          </p>
          <div className="flex items-center justify-center text-sm font-bold text-red-600 bg-red-100 dark:bg-red-900/20 py-2 px-4 rounded-full">
            <AlertTriangle className="h-4 w-4 mr-2" />
            AVAILABILITY: OFFLINE
          </div>
        </div>
      </div>
    );
  }

  const formattedTitle = heroTitle.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < heroTitle.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-gray-900 text-white p-8 md:p-16 shadow-2xl min-h-[500px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImageUrl} 
            alt="Campus Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight whitespace-pre-line"
          >
            {formattedTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-100 text-lg md:text-xl mb-10 leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20"
            >
              Explore Events
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
              About Scheduling
            </button>
          </motion.div>
        </div>
      </div>

      <div id="calendar-section" className="scroll-mt-24 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Campus Calendar</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Stay updated with everything happening on campus.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></span>
            Academic
          </span>
          <span className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
            Social
          </span>
          <span className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
            Workshop
          </span>
          <span className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
            Sports
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mb-16">
        <Calendar />
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">Don't miss out on campus life!</h2>
          <p className="text-indigo-700 dark:text-indigo-400 mt-4 text-lg">Log in to register for events, get personalized notifications, and sync with your favorite calendar apps.</p>
        </div>
        <div className="mt-8 md:mt-0">
          <button 
            onClick={() => navigate('/login')}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none whitespace-nowrap"
          >
            Get Started Now
          </button>
        </div>
      </div>

      <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-6 text-center">
        <p className="text-amber-800 dark:text-amber-400 text-sm font-medium">
          <span className="font-bold uppercase tracking-widest mr-2">Service Note:</span>
          Need help? Log in and use the floating "Help & Support" button to send concerns or service requests directly to the campus administrator.
        </p>
      </div>
      
      {/* Floating Concern Button/Modal */}
      <UserConcernModal />
    </div>
  );
};
