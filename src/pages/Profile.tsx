
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, Upload, Smartphone, CheckCircle2, Shield, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Profile: React.FC = () => {
  const { user, updateUserProfile, requestVerification } = useAppContext();
  const navigate = useNavigate();

  const [localName, setLocalName] = useState(user?.name || '');
  const [localUsername, setLocalUsername] = useState(user?.username || '');
  const [localEmail, setLocalEmail] = useState(user?.email || '');
  const [localPassword, setLocalPassword] = useState(user?.password || '');
  const [localAvatar, setLocalAvatar] = useState(user?.avatarUrl || '');
  const [verificationStep, setVerificationStep] = useState<'none' | 'input'>('none');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLocalAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRequestUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localEmail !== user?.email) {
      await requestVerification(localEmail);
      setVerificationStep('input');
    } else {
      await updateUserProfile({ name: localName, username: localUsername, password: localPassword, avatarUrl: localAvatar });
      setSaveStatus('Profile Updated!');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const handleVerifyAndSave = async () => {
    await updateUserProfile({ email: localEmail, name: localName, password: localPassword, avatarUrl: localAvatar });
    setVerificationStep('none');
    setSaveStatus('Identity Confirmed!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-12">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-bold uppercase tracking-widest text-xs">Return</span>
        </button>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Profile Node</h1>
        <div className="w-20"></div>
      </header>

      <div className="bg-white dark:bg-gray-900 rounded-[50px] border border-gray-200 dark:border-gray-800 p-12 shadow-sm">
        <form onSubmit={handleRequestUpdate} className="space-y-12">
          <div className="flex flex-col items-center">
            <div className="h-40 w-40 rounded-[48px] overflow-hidden relative group ring-8 ring-indigo-50 dark:ring-indigo-900/20 shadow-2xl mb-6">
              <img src={localAvatar || `https://ui-avatars.com/api/?name=${localName || 'User'}&background=random`} className="h-full w-full object-cover" alt="" />
              <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity text-white cursor-pointer uppercase font-black text-[10px] tracking-widest">
                <Upload className="h-6 w-6 mr-2" />
                Update
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
            <div className="text-center">
               <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-1">{localUsername || user.username}</h4>
               <div className="flex justify-center space-x-2">
                 <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">{user.authMethod} mode</span>
                 <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center"><CheckCircle2 className="h-3 w-3 mr-1.5" /> Verified</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t dark:border-gray-800 pt-12">
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Account Identity</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Display Alias</label>
                  <input className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-bold text-sm tracking-tight" value={localName} onChange={e => setLocalName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Account ID / Username</label>
                  <input className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-bold text-sm tracking-tight" value={localUsername} onChange={e => setLocalUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Email Node</label>
                  <div className="relative">
                    <input disabled={user.authMethod === 'google'} className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-bold text-sm tracking-tight disabled:opacity-40" value={localEmail} onChange={e => setLocalEmail(e.target.value)} />
                    <Mail className="absolute right-5 top-5 h-5 w-5 text-gray-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Security Credentials</h3>
              <div className="space-y-4">
                {user.authMethod === 'email' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Security Key (Password)</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} className="w-full bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl outline-none font-bold text-sm tracking-tight" value={localPassword} onChange={e => setLocalPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-gray-400 hover:text-indigo-600">
                        {showPassword ? <Eye className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/30">
                    <Smartphone className="h-10 w-10 text-blue-600 mb-4" />
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Your account is secured via Google Authentication. Password management is handled by your Google Account settings.</p>
                  </div>
                )}

                {verificationStep === 'input' && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in">
                    <label className="text-[10px] font-black uppercase text-indigo-600 mb-4 block tracking-widest text-center">Confirmation Code</label>
                    <input className="w-full bg-white dark:bg-gray-950 p-5 rounded-2xl outline-none font-black text-2xl tracking-[0.5em] text-center" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} maxLength={6} placeholder="000000" />
                    <button type="button" onClick={handleVerifyAndSave} className="w-full mt-4 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Verify & Commit</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" disabled={verificationStep === 'input'} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-50">
            {saveStatus || 'Secure Global Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
