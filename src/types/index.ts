
export type UserRole = 'admin' | 'user' | null;

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  emailConfirmed?: boolean;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  password?: string;
  authMethod: 'email' | 'google';
}

export interface UserMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'replied';
  reply?: string;
}

export interface FooterSettings {
  brandName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

export type AdminView = 'overview' | 'events' | 'customization' | 'messages' | 'profile' | 'audit' | 'status' | 'footer' | 'approvals' | 'accounts';

export type Theme = 'light' | 'dark';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  time: string;
  location: string;
  category: 'Academic' | 'Social' | 'Sports' | 'Workshop' | 'Other';
  organizer: string;
  imageUrl?: string;
}
