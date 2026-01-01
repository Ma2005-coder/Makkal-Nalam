
import React, { useState, useEffect, useRef } from 'react';
import { Phone, ShieldCheck, Loader2, ArrowRight, RefreshCw, Mail, User, Lock, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import AppLogo from './AppLogo';

interface LoginProps {
  language: Language;
  onLogin: (identifier: string) => void;
}

type LoginMethod = 'phone' | 'email' | 'userid';

const Login: React.FC<LoginProps> = ({ language, onLogin }) => {
  const t = translations[language];
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  const startOtpTimer = () => {
    setTimer(30);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    setLoading(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      startOtpTimer();
    }, 1500);
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate credential verification
    setTimeout(() => {
      const identifier = method === 'email' ? email : userId;
      onLogin(identifier);
    }, 1200);
  };

  const handleResendOtp = () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtp('');
      startOtpTimer();
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) return;
    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      onLogin(phone);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        <div className="bg-emerald-950 p-10 text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <AppLogo className="w-16 h-16 mb-6" />
            <h1 className="text-3xl font-black tracking-tight mb-2">{t.appName}</h1>
            <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">{t.loginTitle}</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-800 rounded-full opacity-30 blur-3xl"></div>
        </div>

        <div className="p-8 space-y-6">
          {step === 'input' && (
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setMethod('phone')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${method === 'phone' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Smartphone size={14} /> {t.loginMethodPhone}
              </button>
              <button 
                onClick={() => setMethod('email')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${method === 'email' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Mail size={14} /> {t.loginMethodEmail}
              </button>
              <button 
                onClick={() => setMethod('userid')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${method === 'userid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <User size={14} /> {t.loginMethodUser}
              </button>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t.loginSubtitle}</h2>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">{t.mission}</p>
          </div>

          {step === 'input' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {method === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.phoneLabel}</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <Smartphone className="text-slate-300" size={18} />
                        <span className="text-slate-600 font-bold text-lg">+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-20 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-xl tracking-widest transition-all"
                        placeholder="00000 00000"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={phone.length !== 10 || loading}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <>{t.loginButton} <ArrowRight size={20} /></>}
                  </button>
                </form>
              )}

              {method === 'email' && (
                <form onSubmit={handleCredentialSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.emailLabel}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 transition-all"
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.passwordLabel}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!email || !password || loading}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <>{t.loginButton} <ArrowRight size={20} /></>}
                  </button>
                </form>
              )}

              {method === 'userid' && (
                <form onSubmit={handleCredentialSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.userIdLabel}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-slate-700 transition-all uppercase tracking-widest"
                          placeholder="TN-12345"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.passwordLabel}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!userId || !password || loading}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <>{t.loginButton} <ArrowRight size={20} /></>}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">{t.enterOtp}</label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-5 bg-emerald-50/50 border-2 border-emerald-100 rounded-3xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-4xl tracking-[0.8em] text-center text-emerald-900 transition-all placeholder:text-emerald-100"
                  placeholder="0000"
                  required
                  autoFocus
                />
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-center text-xs text-slate-400 font-medium">
                    {t.otpSent} <span className="text-emerald-600 font-bold">{method === 'phone' ? `+91 ${phone}` : email}</span>
                  </p>
                  
                  {timer > 0 ? (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t.codeExpires}: <span className="text-emerald-600">00:{timer < 10 ? `0${timer}` : timer}</span>
                    </span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:text-emerald-700 transition-colors"
                    >
                      <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                      {t.resendOtp}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={otp.length !== 4 || loading}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <>{t.verifyOtp} <ShieldCheck size={24} /></>}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setStep('input')} 
                  disabled={loading}
                  className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-colors"
                >
                  {t.changeNumber}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-4 mt-auto">
           <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_NfNf6Yv9Qp8vC_uXhKqB8iUuFvV_C_8xjg&s" className="h-8 grayscale opacity-50" alt="TN Gov" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital India • Tamil Nadu e-Governance</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
