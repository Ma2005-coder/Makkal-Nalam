
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Explorer from './components/Explorer';
import EligibilityBot from './components/EligibilityBot';
import EligibilityChecker from './components/EligibilityChecker';
import VoiceAssistant from './components/VoiceAssistant';
import ServiceCenters from './components/ServiceCenters';
import MyProfile from './components/MyProfile';
import Grievance from './components/Grievance';
import Login from './components/Login';
import { AppView, Language } from './types';
import { translations } from './translations';
import { Mail, Smartphone, Bell, X } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserIdentifier, setCurrentUserIdentifier] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  const [systemAlert, setSystemAlert] = useState<{ type: 'email' | 'phone'; message: string; sub: string } | null>(null);

  const t = translations[language];

  useEffect(() => {
    const savedSession = localStorage.getItem('current_session');
    if (savedSession) {
      setCurrentUserIdentifier(savedSession);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (identifier: string) => {
    setCurrentUserIdentifier(identifier);
    setIsLoggedIn(true);
    localStorage.setItem('current_session', identifier);
    
    // Request notification permissions
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserIdentifier(null);
    localStorage.removeItem('current_session');
    setActiveView(AppView.DASHBOARD);
  };

  const triggerDispatchSimulation = (type: 'email' | 'phone', message: string, sub: string) => {
    setSystemAlert({ type, message, sub });
    
    // Trigger real browser notification if allowed
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(message, {
        body: sub,
        icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_NfNf6Yv9Qp8vC_uXhKqB8iUuFvV_C_8xjg&s'
      });
    }

    setTimeout(() => setSystemAlert(null), 6000);
  };

  const renderView = () => {
    if (!isLoggedIn) return <Login language={language} onLogin={handleLogin} />;

    switch (activeView) {
      case AppView.DASHBOARD:
      case AppView.DOCUMENTS:
      case AppView.APPLICATIONS:
      case AppView.SAVED:
        return <Dashboard language={language} activeView={activeView} onTriggerAlert={triggerDispatchSimulation} />;
      case AppView.EXPLORER:
        return <Explorer language={language} />;
      case AppView.ELISIBILITY_BOT:
        return <EligibilityBot language={language} />;
      case AppView.ELIGIBILITY_CHECKER:
        return <EligibilityChecker language={language} />;
      case AppView.VOICE_ASSISTANT:
        return <VoiceAssistant language={language} />;
      case AppView.LOCATIONS:
        return <ServiceCenters language={language} />;
      case AppView.GRIEVANCE:
        return <Grievance language={language} />;
      case AppView.PROFILE:
        return <MyProfile language={language} onTriggerAlert={triggerDispatchSimulation} />;
      default:
        return <Dashboard language={language} activeView={AppView.DASHBOARD} onTriggerAlert={triggerDispatchSimulation} />;
    }
  };

  if (!isLoggedIn) {
    return <Login language={language} onLogin={handleLogin} />;
  }

  return (
    <>
      {systemAlert && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right duration-500 max-w-sm w-full">
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-slate-700 flex items-start gap-4 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
             <div className={`p-3 rounded-2xl shrink-0 ${systemAlert.type === 'email' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {systemAlert.type === 'email' ? <Mail size={24}/> : <Smartphone size={24}/>}
             </div>
             <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-2">
                   <Bell size={10} className="animate-bounce" /> {systemAlert.type === 'email' ? t.notifyEmailSent : t.notifyActionNeeded}
                </p>
                <h4 className="font-bold text-sm leading-tight truncate">{systemAlert.message}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{systemAlert.sub}</p>
             </div>
             <button onClick={() => setSystemAlert(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
             </button>
          </div>
        </div>
      )}
      
      <Layout 
        activeView={activeView} 
        setActiveView={setActiveView} 
        language={language} 
        setLanguage={setLanguage}
        onLogout={handleLogout}
        currentUserIdentifier={currentUserIdentifier}
      >
        {renderView()}
      </Layout>
    </>
  );
};

export default App;
