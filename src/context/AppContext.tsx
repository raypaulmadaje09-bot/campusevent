
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Event, Theme, UserMessage, FooterSettings } from '../types';

interface AppContextType {
  user: User | null;
  login: (email: string, password?: string, isGoogle?: boolean, name?: string, avatarUrl?: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: string) => Promise<any>;
  requestVerification: (email: string) => Promise<void>;
  updateUserProfile: (updatedUser: Partial<User>) => Promise<void>;
  getPendingAdmins: () => Promise<any[]>;
  getAllUsers: () => Promise<any[]>;
  approveAdmin: (userId: string, action: 'approve' | 'reject') => Promise<void>;
  logout: () => void;
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => Promise<void>;
  theme: Theme;
  toggleTheme: () => void;
  heroImageUrl: string;
  updateHeroImageUrl: (url: string) => void;
  heroTitle: string;
  updateHeroTitle: (title: string) => void;
  heroSubtitle: string;
  updateHeroSubtitle: (subtitle: string) => void;
  systemLogs: string[];
  addLog: (message: string) => void;
  isSystemAvailable: boolean;
  setSystemAvailable: (available: boolean) => void;
  siteLogo: string;
  updateSiteLogo: (url: string) => void;
  footerSettings: FooterSettings;
  updateFooterSettings: (settings: FooterSettings) => void;
  userMessages: UserMessage[];
  sendMessage: (msg: Omit<UserMessage, 'id' | 'timestamp' | 'status'>) => void;
  replyToMessage: (id: string, reply: string) => void;
  sendSupportRequest: (requestType: string, description: string) => Promise<void>;
  getSupportRequests: (email?: string) => Promise<any[]>;
  getUserMessages: (email: string) => Promise<any[]>;
  replyToSupportRequest: (requestId: string, response: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Welcome Freshman Mixer',
    description: 'A social gathering for all new students to meet and greet.',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    location: 'Student Union Hall',
    category: 'Social',
    organizer: 'Student Council',
    imageUrl: '/uploads/mixer.jpg'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campus_scheduler_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('campus_scheduler_theme');
    return (saved as Theme) || 'light';
  });

  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('/uploads/campus-hero.jpg');
  const [heroTitle, setHeroTitle] = useState<string>('Your Gateway to\nCampus Life.');
  const [heroSubtitle, setHeroSubtitle] = useState<string>('Discover, schedule, and join events happening all around your campus.');
  const [siteLogo, setSiteLogo] = useState<string>('');

  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    brandName: 'CampusEvents',
    description: 'The central hub for all student activities, workshops, and sports events.',
    contactEmail: 'support@university.edu',
    contactPhone: '(555) 123-4567'
  });

  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isSystemAvailable, setSystemAvailable] = useState(true);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleString();
    const log = `[${timestamp}] ${message}`;
    setSystemLogs(prev => [log, ...prev].slice(0, 50));
  };

  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || `System Error ${response.status}`);
        return data;
      }
      
      const text = await response.text();
      if (!response.ok) throw new Error(text || `Service Error ${response.status}`);
      return text;
    } catch (err: any) {
      console.error(`API Sync Failure (${url}):`, err.message);
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await safeFetch('/api/events');
        if (Array.isArray(eventsData)) setEvents(eventsData);

        const settings = await safeFetch('/api/settings');
        if (settings && typeof settings === 'object') {
          if (settings.hero_title) setHeroTitle(settings.hero_title);
          if (settings.hero_subtitle) setHeroSubtitle(settings.hero_subtitle);
          if (settings.hero_image_url) setHeroImageUrl(settings.hero_image_url);
          if (settings.site_logo !== undefined) setSiteLogo(settings.site_logo);
          if (settings.brand_name) setFooterSettings(prev => ({ ...prev, brandName: settings.brand_name }));
        }
      } catch (err) { 
        addLog('AVAILABILITY: Backend offline, operating in localized mode.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('campus_scheduler_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('campus_scheduler_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    addLog(`AVAILABILITY: Theme changed to ${theme === 'light' ? 'dark' : 'light'}`);
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const syncSettings = async (updates: any) => {
    try {
      await safeFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) { console.error(err); }
  };

  const updateHeroImageUrl = (url: string) => {
    setHeroImageUrl(url);
    syncSettings({ heroImageUrl: url });
    addLog('INTEGRITY: Hero image updated');
  };

  const updateHeroTitle = (title: string) => {
    setHeroTitle(title);
    syncSettings({ heroTitle: title });
    addLog('INTEGRITY: Hero title updated');
  };

  const updateHeroSubtitle = (subtitle: string) => {
    setHeroSubtitle(subtitle);
    syncSettings({ heroSubtitle: subtitle });
    addLog('INTEGRITY: Hero subtitle updated');
  };

  const updateSiteLogo = (url: string) => {
    setSiteLogo(url);
    syncSettings({ siteLogo: url });
    addLog('INTEGRITY: Site logo updated');
  };

  const updateFooterSettings = (settings: FooterSettings) => {
    setFooterSettings(settings);
    addLog('INTEGRITY: Footer settings updated');
  };

  const sendMessage = (msg: Omit<UserMessage, 'id' | 'timestamp' | 'status'>) => {
    const newMessage: UserMessage = {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };
    setUserMessages([newMessage, ...userMessages]);
    addLog(`AVAILABILITY: New message from ${msg.userEmail}`);
  };

  const replyToMessage = (id: string, reply: string) => {
    setUserMessages(userMessages.map(m => m.id === id ? { ...m, status: 'replied', reply } : m));
    addLog(`INTEGRITY: Admin reply sent to ID ${id}`);
  };

  const login = async (email: string, password?: string, isGoogle = false, name?: string, avatarUrl?: string) => {
    // 1. FAIL-SAFE ACCOUNTS (Ensures access regardless of DB state)
    if (!isGoogle) {
      if (email === 'admin@campus.edu' && password === 'admin123') {
        const masterUser: User = {
          id: 'master-root',
          email: 'admin@campus.edu',
          name: 'Master Admin',
          username: 'root_admin',
          role: 'admin',
          authMethod: 'email',
          bio: 'Global System Controller - Level 10 Access'
        };
        setUser(masterUser);
        addLog('CONFIDENTIALITY: Master Root Authenticated via Fail-safe');
        return true;
      }
      if (email === 'user@campus.edu' && password === 'user123') {
        const standardUser: User = {
          id: 'default-user',
          email: 'user@campus.edu',
          name: 'Standard Student',
          username: 'student_user',
          role: 'user',
          authMethod: 'email',
          bio: 'Campus Member'
        };
        setUser(standardUser);
        addLog('CONFIDENTIALITY: Standard User Authenticated via Fail-safe');
        return true;
      }
    }

    try {
      const userData = await safeFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isGoogle, name, avatarUrl })
      });
      setUser(userData);
      addLog(`CONFIDENTIALITY: ${userData.email} authenticated`);
      return true;
    } catch (err: any) {
      addLog(`CONFIDENTIALITY: Login failed for ${email}`);
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string, role = 'user') => {
    try {
      const data = await safeFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });
      
      // If we got here, it's successful JSON
      addLog(`CONFIDENTIALITY: New account created for ${email}`);
      return data;
    } catch (err: any) {
      // Catching "Not found" or other non-JSON text errors
      const errorMsg = err.message || 'Network error';
      if (errorMsg.includes('Not found')) {
        addLog(`AVAILABILITY: Backend registration endpoint not matched. Check server routing.`);
      }
      throw new Error(`Account Creation Error: ${errorMsg}`);
    }
  };

  const requestVerification = async (email: string) => {
    try {
      await safeFetch('/api/auth/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (err) {}
  };

  const updateUserProfile = async (updatedUser: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updatedUser });
    addLog(`CONFIDENTIALITY: Profile updated for ${user.email}`);
  };

  const getPendingAdmins = async () => {
    try { return await safeFetch('/api/admin/pending'); } catch (err) { return []; }
  };

  const getAllUsers = async () => {
    try { return await safeFetch('/api/admin/users'); } catch (err) { return []; }
  };

  const approveAdmin = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await safeFetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
    } catch (err) {}
  };

  const logout = () => {
    if (user) addLog(`CONFIDENTIALITY: User ${user.email} signed out`);
    setUser(null);
  };

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const savedEvent = await safeFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (savedEvent && typeof savedEvent === 'object') {
        setEvents([...events, savedEvent]);
        addLog(`INTEGRITY: Event created - ${savedEvent.title}`);
      }
    } catch (err) {}
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    addLog(`INTEGRITY: Event updated - ${updatedEvent.title}`);
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      setEvents(events.filter(e => e.id !== id));
      addLog(`INTEGRITY: Event record removed`);
    } catch (err) {}
  };

  const sendSupportRequest = async (requestType: string, description: string) => {
    if (!user) return;
    try {
      await safeFetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, userName: user.name, userEmail: user.email, requestType, description
        })
      });
    } catch (err) {}
  };

  const getSupportRequests = async (email?: string) => {
    try { 
      const url = email ? `/api/support?email=${encodeURIComponent(email)}` : '/api/support';
      return await safeFetch(url); 
    } catch (err) { return []; }
  };

  const getUserMessages = async (email: string) => {
    try {
      return await safeFetch(`/api/messages?email=${encodeURIComponent(email)}`);
    } catch (err) { return []; }
  };

  const replyToSupportRequest = async (requestId: string, responseText: string) => {
    try {
      await safeFetch('/api/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, response: responseText })
      });
    } catch (err) {}
  };

  return (
    <AppContext.Provider value={{ 
      user, login, register, logout, events, addEvent, updateEvent, deleteEvent, 
      theme, toggleTheme, heroImageUrl, updateHeroImageUrl, 
      heroTitle, updateHeroTitle, heroSubtitle, updateHeroSubtitle,
      systemLogs, addLog, isSystemAvailable, setSystemAvailable,
      updateUserProfile, siteLogo, updateSiteLogo,
      footerSettings, updateFooterSettings, userMessages, sendMessage, replyToMessage,
      requestVerification, getPendingAdmins, getAllUsers, approveAdmin,
      sendSupportRequest, getSupportRequests, replyToSupportRequest, getUserMessages
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
