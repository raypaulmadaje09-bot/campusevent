
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle, HelpCircle, ShieldQuestion, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const UserConcernModal: React.FC = () => {
  const { user, sendMessage, sendSupportRequest, getUserMessages, getSupportRequests } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'choice' | 'concern' | 'support' | 'history'>('choice');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '', type: 'Technical' });
  const [history, setHistory] = useState<{ concerns: any[], tickets: any[] }>({ concerns: [], tickets: [] });

  const fetchHistory = async () => {
    if (!user) return;
    const [messages, tickets] = await Promise.all([
      getUserMessages(user.email),
      getSupportRequests(user.email)
    ]);
    setHistory({ concerns: messages, tickets });
  };

  const openModal = () => {
    setIsOpen(true);
    fetchHistory();
  };

  const handleSubmitConcern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    sendMessage({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject: formData.subject,
      message: formData.message
    });
    finishSubmission();
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    sendSupportRequest(formData.type, formData.message);
    finishSubmission();
  };

  const finishSubmission = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
      setMode('choice');
      setFormData({ subject: '', message: '', type: 'Technical' });
    }, 3000);
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={openModal}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-5 rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 z-40 group flex items-center space-x-3"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="font-black uppercase tracking-widest text-[10px]">Help & Support</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white dark:bg-gray-950 w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 p-10 max-h-[85vh] flex flex-col"
            >
              {isSubmitted ? (
                <div className="py-20 text-center space-y-8">
                  <div className="h-24 w-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-500/5">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Transmission Successful</h3>
                    <p className="text-gray-500 mt-4 font-medium max-w-xs mx-auto">Your request has been routed to the administration node.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-950 pb-4 z-10">
                    <div className="flex items-center space-x-3">
                       {mode !== 'choice' && <button onClick={() => setMode('choice')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-all"><ArrowLeft className="h-5 w-5" /></button>}
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                         {mode === 'choice' ? 'How can we help?' : mode === 'concern' ? 'General Concern' : mode === 'support' ? 'Support Service' : 'Request History'}
                       </h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="h-6 w-6" /></button>
                  </div>

                  {mode === 'choice' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                          onClick={() => setMode('concern')}
                          className="p-8 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-[32px] text-center space-y-4 hover:border-indigo-500 transition-all group"
                        >
                          <MessageSquare className="h-10 w-10 text-indigo-600 mx-auto group-hover:scale-110 transition-transform" />
                          <div className="font-black uppercase tracking-widest text-xs text-indigo-600">Send Concern</div>
                          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Report issues or share feedback.</p>
                        </button>
                        <button 
                          onClick={() => setMode('support')}
                          className="p-8 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 rounded-[32px] text-center space-y-4 hover:border-amber-500 transition-all group"
                        >
                          <HelpCircle className="h-10 w-10 text-amber-600 mx-auto group-hover:scale-110 transition-transform" />
                          <div className="font-black uppercase tracking-widest text-xs text-amber-600">Service Request</div>
                          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Request technical or facilities help.</p>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => { setMode('history'); fetchHistory(); }}
                        className="w-full p-6 border border-gray-200 dark:border-gray-800 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                      >
                        View My Request History & Replies
                      </button>
                    </div>
                  )}

                  {mode === 'history' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 border-b dark:border-gray-800 pb-2">Support Tickets</h4>
                        {history.tickets.length === 0 ? <p className="text-[10px] text-gray-400 italic">No tickets found.</p> : history.tickets.map(t => (
                          <div key={t.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border dark:border-gray-800">
                             <div className="flex justify-between items-start mb-2">
                               <span className="text-[10px] font-black uppercase text-indigo-600">{t.request_type}</span>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                             </div>
                             <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{t.description}</p>
                             {t.admin_response && (
                               <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                 <p className="text-[9px] font-black uppercase text-indigo-500 mb-1">Admin Reply:</p>
                                 <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{t.admin_response}"</p>
                               </div>
                             )}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 pt-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 border-b dark:border-gray-800 pb-2">General Concerns</h4>
                        {history.concerns.length === 0 ? <p className="text-[10px] text-gray-400 italic">No concerns found.</p> : history.concerns.map(c => (
                          <div key={c.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border dark:border-gray-800">
                             <div className="flex justify-between items-start mb-2">
                               <span className="text-[10px] font-black uppercase text-emerald-600">{c.subject}</span>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${c.status === 'pending' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{c.status}</span>
                             </div>
                             <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{c.message}</p>
                             {c.reply && (
                               <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                 <p className="text-[9px] font-black uppercase text-emerald-500 mb-1">Admin Reply:</p>
                                 <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{c.reply}"</p>
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'concern' && (
                    <form onSubmit={handleSubmitConcern} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Subject</label>
                        <input required className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="What is this about?" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Message Detail</label>
                        <textarea required rows={4} className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-sm" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Type your message..." />
                      </div>
                      <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
                        <Send className="h-4 w-4" /> <span>Dispatch Transmission</span>
                      </button>
                    </form>
                  )}

                  {mode === 'support' && (
                    <form onSubmit={handleSubmitSupport} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Service Type</label>
                        <select className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl outline-none font-black text-xs uppercase" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option value="Technical">Technical Support</option>
                          <option value="Facilities">Facilities / Maintenance</option>
                          <option value="Account">Account Security</option>
                          <option value="Event">Event Logistic Help</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Support Detail</label>
                        <textarea required rows={4} className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium text-sm" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Describe the assistance you need..." />
                      </div>
                      <button type="submit" className="w-full py-6 bg-amber-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 shadow-2xl shadow-amber-100 dark:shadow-none hover:bg-amber-600 transition-all">
                        <ShieldQuestion className="h-4 w-4" /> <span>Submit Ticket</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
