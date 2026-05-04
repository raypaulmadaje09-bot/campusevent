
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { user, logout, theme, toggleTheme, siteLogo } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
              ) : (
                <>
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                    Campus<span className="text-gray-900 dark:text-white">Events</span>
                  </span>
                </>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:border-indigo-500 transition-colors">
                    <img 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                      className="w-full h-full object-cover" 
                      alt="Avatar"
                    />
                  </div>
                  <span className="hidden md:inline font-bold group-hover:text-indigo-600 transition-colors capitalize">{user.name}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
