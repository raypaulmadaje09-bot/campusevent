import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAppContext } from '../context/AppContext';

interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        await register(email, password, name, role);
        setIsRegistering(false);
        setError(role === 'admin' ? 'Application submitted! Awaiting Master Admin approval.' : 'Account created! Please log in.');
      } else {
        await login(email, password);
        const isAdmin = email === 'admin@campus.edu' || email.includes('admin');
        navigate(isAdmin ? '/admin' : '/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication Failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="w-full max-w-md mb-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-4">
            <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isRegistering ? 'Create Account' : 'Campus Sign In'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isRegistering ? 'Join the campus community today' : 'Access your events and dashboard'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-bold uppercase tracking-widest text-[10px]">Account Role</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setRole('user')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${role === 'user' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                    >
                      Student
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${role === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                    >
                      Administrator
                    </button>
                  </div>
                  {role === 'admin' && (
                    <p className="mt-2 text-[10px] text-orange-500 font-bold italic animate-pulse">
                      * Admin accounts require Master Admin approval before access is granted.
                    </p>
                  )}
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              ux_mode="popup"
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
                  try {
                    await login(decoded.email, undefined, true, decoded.name, decoded.picture);
                    const isAdmin = decoded.email.includes('admin') || decoded.email === 'admin@campus.edu';
                    navigate(isAdmin ? '/admin' : '/');
                  } catch (err) {
                    setError('Google Sync Failed. Using local profile.');
                  }
                }
              }}
              onError={() => {
                setError('Google Authentication Blocked by Browser. Please use Email login.');
              }}
              theme="filled_blue"
              shape="pill"
            />
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hint: use "admin" in email to login as administrator
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
