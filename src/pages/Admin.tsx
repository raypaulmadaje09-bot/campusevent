
import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit2, Trash2, Plus, Search, 
  Upload, Shield, Activity, Save,
  LayoutDashboard, User as UserIcon, List, Eye,
  LogOut, MessageSquare, Send, Smartphone,
  HelpCircle, Users
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Event, AdminView, FooterSettings } from '../types';
import { Calendar } from '../components/Calendar';

export const AdminDashboard: React.FC = () => {
  const { 
    user, logout, events, addEvent, updateEvent, deleteEvent, 
    heroImageUrl, updateHeroImageUrl,
    heroTitle, updateHeroTitle,
    heroSubtitle, updateHeroSubtitle,
    systemLogs, isSystemAvailable, setSystemAvailable,
    updateUserProfile, siteLogo, updateSiteLogo,
    footerSettings, updateFooterSettings,
    userMessages, replyToMessage,
    getPendingAdmins, approveAdmin, requestVerification,
    getSupportRequests, replyToSupportRequest, getAllUsers
  } = useAppContext();

  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  
  // Profile state
  const [localName, setLocalName] = useState(user?.name || '');
  const [localUsername, setLocalUsername] = useState(user?.username || '');
  const [localEmail, setLocalEmail] = useState(user?.email || '');
  const [localPassword, setLocalPassword] = useState(user?.password || '');
  const [localAvatar, setLocalAvatar] = useState(user?.avatarUrl || '');
  const [verificationStep, setVerificationStep] = useState<'none' | 'input'>('none');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Customization state
  const [localTitle, setLocalTitle] = useState(heroTitle);
  const [localSubtitle, setLocalSubtitle] = useState(heroSubtitle);
  const [localHeroImage, setLocalHeroImage] = useState(heroImageUrl);
  const [localLogo, setLocalLogo] = useState(siteLogo);
  const [localFooter, setLocalFooter] = useState<FooterSettings>(footerSettings);
  
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [supportReplyId, setSupportReplyId] = useState<string | null>(null);
  const [supportReplyText, setSupportReplyText] = useState('');

  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({
    title: '', description: '', date: '', time: '', location: '',
    category: 'Other', organizer: '', imageUrl: ''
  });

  const heroFileRef = useRef<HTMLInputElement>(null);
  const eventFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeView === 'overview' && user?.email === 'admin@campus.edu') {
      getPendingAdmins().then(setPendingAdmins).catch(() => setPendingAdmins([]));
    }
    if (activeView === 'messages') {
      getSupportRequests().then(setSupportRequests).catch(() => setSupportRequests([]));
    }
    if (activeView === 'accounts' && user?.email === 'admin@campus.edu') {
      getAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
    }
  }, [activeView, user, getPendingAdmins, getSupportRequests, getAllUsers]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      updateHeroTitle(localTitle);
      updateHeroSubtitle(localSubtitle);
      updateHeroImageUrl(localHeroImage);
      updateSiteLogo(localLogo);
      setSaveStatus('Site Updated!');
      setTimeout(() => setSaveStatus(null), 2000);
    }, 600);
  };

  const handleSaveFooter = (e: React.FormEvent) => {
    e.preventDefault();
    updateFooterSettings(localFooter);
    setSaveStatus('Footer Updated!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleRequestUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localEmail !== user?.email) {
      await requestVerification(localEmail);
      setVerificationStep('input');
    } else {
      await updateUserProfile({ 
        name: localName, 
        username: localUsername, 
        password: localPassword, 
        avatarUrl: localAvatar,
        email: localEmail
      });
      setSaveStatus('Profile Secured!');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const handleVerifyAndSave = async () => {
    await updateUserProfile({ 
      email: localEmail, 
      name: localName, 
      password: localPassword, 
      avatarUrl: localAvatar 
    });
    setVerificationStep('none');
    setSaveStatus('Identity Confirmed!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleApproveAction = async (userId: string, action: 'approve' | 'reject') => {
    await approveAdmin(userId, action);
    setPendingAdmins(pendingAdmins.filter(a => a.id !== userId));
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEvent.id) {
      updateEvent(currentEvent as Event);
    } else {
      addEvent(currentEvent as Omit<Event, 'id'>);
    }
    setShowEventForm(false);
    resetEventForm();
  };

  const resetEventForm = () => {
    setIsEditingEvent(false);
    setCurrentEvent({
      title: '', description: '', date: '', time: '', location: '',
      category: 'Other', organizer: '', imageUrl: ''
    });
  };

  const startEditEvent = (event: Event) => {
    setCurrentEvent(event);
    setIsEditingEvent(true);
    setShowEventForm(true);
    setActiveView('events');
  };

  const handleReply = (id: string) => {
    replyToMessage(id, replyText);
    setReplyMessageId(null);
    setReplyText('');
  };

  const handleSupportReply = async (id: string) => {
    await replyToSupportRequest(id, supportReplyText);
    setSupportReplyId(null);
    setSupportReplyText('');
    const updated = await getSupportRequests();
    setSupportRequests(updated);
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Manage Events', icon: List },
    { id: 'messages', label: 'User Requests', icon: MessageSquare, badge: userMessages.filter(m => m.status === 'pending').length },
    ...(user?.email === 'admin@campus.edu' ? [
      { id: 'approvals', label: 'Approval Queue', icon: Shield, badge: pendingAdmins.length },
      { id: 'accounts', label: 'User Accounts', icon: Users }
    ] : []),
    { id: 'customization', label: 'Home Page', icon: Eye },
    { id: 'footer', label: 'Footer Settings', icon: Smartphone },
    { id: 'profile', label: 'Security & Profile', icon: UserIcon },
    { id: 'audit', label: 'Audit Logs', icon: Shield },
    { id: 'status', label: 'System Health', icon: Activity },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            {siteLogo ? (
              <img src={siteLogo} className="h-10 w-10 object-contain" alt="Admin Logo" />
            ) : (
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
            )}
            <div>
              <h2 className="font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tighter text-sm">Campus Admin</h2>
              <p className="text-[9px] text-green-500 font-black tracking-widest uppercase">Secured Instance</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as AdminView)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3 text-xs uppercase tracking-widest">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (activeView !== 'messages') && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={logout} className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all font-black text-[10px] uppercase tracking-widest">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          
          {activeView === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Admin Overview</h1>
                <p className="text-gray-500 font-medium italic underline decoration-indigo-500/30">Monitoring system pulsars and security integrity.</p>
              </header>

              <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-200 dark:border-gray-800 p-8 shadow-sm overflow-hidden transform scale-[0.98] origin-top">
                <Calendar />
              </div>
            </div>
          )}

          {activeView === 'approvals' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <header>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Approval Queue</h1>
                <p className="text-gray-500 font-medium">Verify and grant security clearance to new administrator requests.</p>
              </header>

              {pendingAdmins.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-20 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
                   <Shield className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                   <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Clearance Queue Empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                   {pendingAdmins.map(admin => (
                      <div key={admin.id} className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight">{admin.name}</h4>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase rounded-full">Awaiting Review</span>
                          </div>
                          <p className="text-xs text-gray-400 font-bold tracking-widest">{admin.email} • ID: {admin.id}</p>
                        </div>
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleApproveAction(admin.id, 'approve')} 
                            className="px-6 py-3 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-95"
                          >
                            Grant Access
                          </button>
                          <button 
                            onClick={() => handleApproveAction(admin.id, 'reject')} 
                            className="px-6 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'events' && (
            <div className="space-y-8">
              <header className="flex justify-between items-end">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase tracking-widest">Event Management</h1>
                <button onClick={() => { resetEventForm(); setShowEventForm(true); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-xl">
                  <Plus className="h-5 w-5 mr-2" /> New Event
                </button>
              </header>
              {showEventForm && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-xl">
                  <form onSubmit={handleEventSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <input required placeholder="TITLE" className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none" value={currentEvent.title} onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="date" required className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none" value={currentEvent.date} onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})} />
                        <input type="time" required className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none" value={currentEvent.time} onChange={e => setCurrentEvent({...currentEvent, time: e.target.value})} />
                      </div>
                      <input required placeholder="LOCATION" className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none" value={currentEvent.location} onChange={e => setCurrentEvent({...currentEvent, location: e.target.value})} />
                      <textarea placeholder="DESCRIPTION" rows={4} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none resize-none" value={currentEvent.description} onChange={e => setCurrentEvent({...currentEvent, description: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                       <select className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-bold uppercase tracking-widest text-xs" value={currentEvent.category} onChange={e => setCurrentEvent({...currentEvent, category: e.target.value as any})}>
                        <option value="Academic">Academic</option>
                        <option value="Social">Social</option>
                        <option value="Sports">Sports</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Other">Other</option>
                      </select>
                       <div onClick={() => eventFileRef.current?.click()} className="aspect-video w-full rounded-3xl border-4 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center cursor-pointer overflow-hidden">
                         {currentEvent.imageUrl ? <img src={currentEvent.imageUrl} className="h-full w-full object-cover" alt="" /> : <Upload className="h-10 w-10 text-gray-300" />}
                         <input type="file" ref={eventFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, base64 => setCurrentEvent({...currentEvent, imageUrl: base64}))} />
                       </div>
                       <div className="flex gap-4">
                         <button type="button" onClick={() => setShowEventForm(false)} className="flex-1 py-4 border-2 rounded-2xl">Cancel</button>
                         <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl">{isEditingEvent ? 'Update' : 'Commit'}</button>
                       </div>
                    </div>
                  </form>
                </div>
              )}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b dark:border-gray-800 flex items-center px-8">
                  <Search className="h-4 w-4 text-gray-400 mr-3" />
                  <input placeholder="SEARCH EVENTS..." className="bg-transparent border-none outline-none font-black text-[10px] tracking-widest w-full uppercase" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold uppercase text-[10px]">
                    {filteredEvents.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-6">{e.title}</td>
                        <td className="p-6 text-gray-500">{e.date} @ {e.time}</td>
                        <td className="p-6 text-right space-x-2">
                          <button onClick={() => startEditEvent(e)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-indigo-600"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteEvent(e.id)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'messages' && (
            <div className="space-y-12">
              <section className="space-y-6">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-indigo-600" /> User Concerns
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {userMessages.map(msg => (
                    <div key={msg.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-sm uppercase text-gray-900 dark:text-white">{msg.userName} ({msg.userEmail})</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${msg.status === 'pending' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{msg.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">"{msg.message}"</p>
                      {msg.status === 'pending' ? (
                        <div className="flex space-x-3">
                          <input className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none text-xs font-bold" placeholder="REPLY..." value={replyMessageId === msg.id ? replyText : ''} onFocus={() => setReplyMessageId(msg.id)} onChange={e => setReplyText(e.target.value)} />
                          <button onClick={() => handleReply(msg.id)} className="bg-indigo-600 text-white px-6 rounded-xl shadow-lg active:scale-95 transition-all"><Send className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <div className="p-4 bg-green-50/30 rounded-2xl text-[10px] text-green-600 font-bold uppercase">Replied: "{msg.reply}"</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6 pt-10 border-t dark:border-gray-800">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center">
                   <HelpCircle className="h-6 w-6 mr-3 text-amber-500" /> Support Service Requests
                </h2>
                <div className="grid grid-cols-1 gap-4">
                   {supportRequests.map(req => (
                     <div key={req.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                            <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-1 rounded-md mr-2">{req.request_type}</span>
                            <span className="font-black text-sm uppercase text-gray-900 dark:text-white">{req.user_name}</span>
                         </div>
                         <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${req.status === 'open' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>{req.status}</span>
                       </div>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{req.description}</p>
                       {req.status === 'open' ? (
                         <div className="flex space-x-3">
                           <input className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl outline-none text-xs font-bold" placeholder="SUPPORT ACTION..." value={supportReplyId === req.id ? supportReplyText : ''} onFocus={() => setSupportReplyId(req.id)} onChange={e => setSupportReplyText(e.target.value)} />
                           <button onClick={() => handleSupportReply(req.id)} className="bg-amber-500 text-white px-6 rounded-xl"><Send className="h-4 w-4" /></button>
                         </div>
                       ) : (
                         <div className="p-4 bg-green-50/30 rounded-2xl text-[10px] text-green-600 font-bold uppercase tracking-widest">Resolution: "{req.admin_response}"</div>
                       )}
                     </div>
                   ))}
                </div>
              </section>
            </div>
          )}

          {activeView === 'customization' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <header className="flex justify-between items-center">
                 <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity</h1>
                 <button onClick={handleSaveSettings} className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center hover:bg-indigo-700 transition-all shadow-2xl active:scale-95">
                   <Save className="h-5 w-5 mr-3" /> Commit Assets
                 </button>
               </header>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="bg-white dark:bg-gray-900 rounded-[48px] border border-gray-200 dark:border-gray-800 p-12 shadow-sm space-y-10">
                   <div>
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.3em]">Hero Text</label>
                     <textarea rows={3} className="w-full bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl outline-none font-black text-2xl uppercase tracking-tighter text-gray-900 dark:text-white" value={localTitle} onChange={e => setLocalTitle(e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.3em]">Subtitle</label>
                     <textarea rows={6} className="w-full bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl outline-none font-medium text-sm leading-relaxed" value={localSubtitle} onChange={e => setLocalSubtitle(e.target.value)} />
                   </div>
                 </div>
                 <div className="space-y-12">
                    <div onClick={() => heroFileRef.current?.click()} className="aspect-video w-full rounded-[40px] overflow-hidden cursor-pointer relative group border-4 border-dashed dark:border-gray-800">
                      <img src={localHeroImage} className="h-full w-full object-cover transition-all group-hover:scale-105" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 text-white font-black uppercase tracking-widest text-[10px]">Swap Backdrop</div>
                      <input type="file" ref={heroFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, setLocalHeroImage)} />
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-[48px] border border-gray-200 dark:border-gray-800 p-8 flex items-center justify-between shadow-sm">
                       <div onClick={() => logoFileRef.current?.click()} className="h-16 w-32 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center cursor-pointer border-2 border-dashed dark:border-gray-700 p-2">
                         {localLogo ? <img src={localLogo} className="h-full w-full object-contain" alt="Identity Symbol" /> : <Upload className="h-8 w-8 text-gray-300" />}
                         <input type="file" ref={logoFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, setLocalLogo)} />
                       </div>
                       <button onClick={() => setLocalLogo('')} className="text-[10px] font-black uppercase tracking-widest text-red-500">Reset</button>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeView === 'footer' && (
            <div className="space-y-8 max-w-2xl animate-in slide-in-from-left-4 duration-500">
               <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Footer</h1>
               <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-200 dark:border-gray-800 p-10 shadow-sm space-y-8">
                 <div className="space-y-4">
                    <input className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-black text-sm uppercase" value={localFooter.brandName} onChange={e => setLocalFooter({...localFooter, brandName: e.target.value})} placeholder="BRAND" />
                    <textarea rows={4} className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-medium text-sm" value={localFooter.description} onChange={e => setLocalFooter({...localFooter, description: e.target.value})} placeholder="DESCRIPTION" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-bold text-xs" value={localFooter.contactEmail} onChange={e => setLocalFooter({...localFooter, contactEmail: e.target.value})} placeholder="EMAIL" />
                    <input className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-bold text-xs" value={localFooter.contactPhone} onChange={e => setLocalFooter({...localFooter, contactPhone: e.target.value})} placeholder="PHONE" />
                 </div>
                 <button onClick={handleSaveFooter} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-xl">Apply Branding</button>
               </div>
            </div>
          )}

          {activeView === 'profile' && (
            <div className="space-y-8 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <header className="text-center"><h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Profile Node</h1></header>
              <div className="bg-white dark:bg-gray-900 rounded-[50px] border border-gray-200 dark:border-gray-800 p-12 shadow-sm">
                <form onSubmit={handleRequestUpdate} className="space-y-10 text-xs font-bold uppercase tracking-widest">
                  <div className="flex flex-col items-center">
                    <div onClick={() => avatarFileRef.current?.click()} className="h-32 w-32 rounded-[40px] overflow-hidden cursor-pointer relative group ring-8 ring-indigo-50 dark:ring-indigo-900/20 shadow-2xl mb-4">
                      <img src={localAvatar || `https://ui-avatars.com/api/?name=${localName || 'Admin'}&background=random`} className="h-full w-full object-cover transition-all" alt="" />
                      <input type="file" ref={avatarFileRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, setLocalAvatar)} />
                    </div>
                    <span className="text-indigo-500">{user?.authMethod} node active</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t dark:border-gray-800 pt-10">
                     <div className="space-y-4">
                        <label className="text-gray-400">Identity Alias</label>
                        <input className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-black uppercase text-gray-900 dark:text-white" value={localName} onChange={e => setLocalName(e.target.value)} />
                        <label className="text-gray-400">Account Username</label>
                        <input className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-black uppercase text-gray-900 dark:text-white" value={localUsername} onChange={e => setLocalUsername(e.target.value)} />
                        <label className="text-gray-400">Primary Email Node</label>
                        <input disabled={user?.authMethod === 'google'} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-black uppercase text-gray-900 dark:text-white disabled:opacity-40" value={localEmail} onChange={e => setLocalEmail(e.target.value)} />
                     </div>
                     <div className="space-y-4">
                        {user?.authMethod === 'email' && (
                          <>
                            <label className="text-gray-400">Credential Key</label>
                            <div className="relative">
                               <input type={showPassword ? 'text' : 'password'} className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl outline-none font-black tracking-[0.2em]" value={localPassword} onChange={e => setLocalPassword(e.target.value)} />
                               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400"><Eye className="h-5 w-5" /></button>
                            </div>
                          </>
                        )}
                        {verificationStep === 'input' && (
                          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in">
                            <label className="text-indigo-600 block mb-4">Email Confirmation Token</label>
                            <input className="w-full bg-white dark:bg-gray-900 p-4 rounded-2xl outline-none text-center text-xl tracking-[0.5em] font-black" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} maxLength={6} placeholder="000000" />
                            <button type="button" onClick={handleVerifyAndSave} className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-2xl active:scale-95 transition-all font-black uppercase tracking-widest text-[10px]">Verify Node Access</button>
                          </div>
                        )}
                     </div>
                  </div>
                  <button type="submit" disabled={verificationStep === 'input'} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black shadow-2xl active:scale-[0.98]">
                    {saveStatus || 'Secure Profile Update'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeView === 'audit' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-gray-400">
               <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ledger</h1>
               <div className="bg-gray-950 rounded-[50px] p-8 border-8 border-gray-900 h-[600px] overflow-y-auto font-mono text-[11px] shadow-2xl">
                  {systemLogs.map((log, i) => (
                    <div key={i} className="mb-4 flex border-l border-gray-800 pl-6 group">
                      <span className="text-gray-600 mr-8 w-12 flex-shrink-0 font-bold opacity-30">#{systemLogs.length - i}</span>
                      <span className={log.includes('CONFIDENTIALITY') ? 'text-indigo-400' : log.includes('INTEGRITY') ? 'text-emerald-400' : 'text-orange-400'}>{log}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeView === 'status' && (
            <div className="space-y-10 animate-in zoom-in-95 duration-500">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Health</h1>
              <div className="bg-white dark:bg-gray-900 rounded-[50px] border border-gray-200 dark:border-gray-800 p-16 shadow-sm space-y-12">
                 <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-12 rounded-[40px] border dark:border-gray-800">
                    <div>
                      <h3 className="text-2xl font-black uppercase mb-2">Availability Killswitch</h3>
                      <p className="text-sm text-gray-500 font-medium tracking-tight uppercase tracking-widest text-[9px]">Instantly toggle platform maintenance mode.</p>
                    </div>
                    <button onClick={() => setSystemAvailable(!isSystemAvailable)} className={`px-12 py-8 rounded-[32px] font-black text-xs uppercase tracking-widest transition-all ${isSystemAvailable ? 'bg-green-500 text-white shadow-xl' : 'bg-red-500 text-white shadow-xl'}`}>
                      {isSystemAvailable ? 'Service Live' : 'Service Terminated'}
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px] font-black uppercase text-center tracking-widest text-gray-400">
                   <div className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border dark:border-gray-800">DB: SYNCED</div>
                   <div className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border dark:border-gray-800 text-indigo-500">NODE: ACTIVE</div>
                   <div className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border dark:border-gray-800 text-green-500">VAULT: SECURED</div>
                 </div>
              </div>
            </div>
          )}

          {activeView === 'accounts' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">User Accounts</h1>
                <p className="text-gray-500 font-medium italic">Full visibility of system users and administrators.</p>
              </header>

              <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="p-6">User Identity</th>
                      <th className="p-6">Role</th>
                      <th className="p-6">Method</th>
                      <th className="p-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                             <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-black text-indigo-600 uppercase">
                               {u.name?.[0] || 'U'}
                             </div>
                             <div>
                               <p className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{u.name}</p>
                               <p className="text-[10px] text-gray-400 font-bold">{u.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{u.auth_method}</span>
                        </td>
                        <td className="p-6 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.status === 'approved' ? 'bg-green-100 text-green-600' : u.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
