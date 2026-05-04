
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/Admin';
import { Profile } from './pages/Profile';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppContext();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { footerSettings } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{footerSettings.brandName}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{footerSettings.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <ul className="text-gray-500 dark:text-gray-400 text-sm space-y-2">
                <li><Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Calendar</Link></li>
                <li><Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {footerSettings.contactEmail}<br />
                {footerSettings.contactPhone}
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>© 2024 {footerSettings.brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
