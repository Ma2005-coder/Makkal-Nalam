
import React from 'react';
import { Home, Search, MessageSquare, Mic, AlertCircle, Menu, X, MapPin, Languages, ChevronDown, CheckSquare, UserCircle, LogOut, LayoutDashboard, User, ShieldCheck, Bookmark, LayoutGrid, Sparkles } from 'lucide-react';
import { AppView, Language } from '../types';
import { translations } from '../translations';
import AppLogo from './AppLogo';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onLogout: () => void;
  currentUserIdentifier: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, language, setLanguage, onLogout, currentUserIdentifier }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = React.useState(false);
  const t = translations[language];

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
  ];

  const sidebarGroups = [
    {
      label: t.dashboard,
      items: [
        { id: AppView.DASHBOARD, label: t.home, icon: Home },
        { id: AppView.PROFILE, label: t.myProfile, icon: UserCircle },
        { id: AppView.DOCUMENTS, label: t.docReadiness, icon: ShieldCheck },
        { id: AppView.EXPLORER, label: t.schemeFinder, icon: Search },
      ]
    },
    {
      label: t.aiServices,
      items: [
        { id: AppView.ELIGIBILITY_CHECKER, label: t.eligibilityChecker, icon: CheckSquare },
        { id: AppView.ELISIBILITY_BOT, label: t.eligibilityBot, icon: MessageSquare },
        { id: AppView.VOICE_ASSISTANT, label: t.voiceHelp, icon: Mic },
      ]
    },
    {
      label: t.support,
      items: [
        { id: AppView.LOCATIONS, label: t.serviceCenters, icon: MapPin },
        { id: AppView.GRIEVANCE, label: t.grievance, icon: AlertCircle },
      ]
    }
  ];

  const LanguagePicker = ({ dark }: { dark?: boolean }) => (
    <div className="relative">
      <button
        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
          dark 
          ? 'bg-emerald-900/50 hover:bg-emerald-800/50 border-emerald-700/50 text-emerald-100' 
          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <Languages size={14} className={dark ? 'text-emerald-400' : 'text-emerald-600'} />
        <span className="text-[10px] font-black uppercase tracking-widest">{language}</span>
        <ChevronDown size={14} className={dark ? 'text-emerald-400' : 'text-slate-400'} />
      </button>

      {isLangDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsLangDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors ${
                  language === lang.code ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex flex-col w-72 bg-emerald-950 text-white p-6 sticky top-0 h-screen overflow-hidden">
        <div className="flex items-center gap-4 mb-10 px-2 cursor-pointer shrink-0" onClick={() => setActiveView(AppView.DASHBOARD)}>
          <AppLogo className="w-10 h-10" />
          <h1 className="text-xl font-black tracking-tighter leading-none">{t.appName}</h1>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto scrollbar-hide pr-2">
          {sidebarGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-3 px-4">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon as any;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as AppView)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                        isActive 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-bold' 
                        : 'text-emerald-300/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
                      )}
                      <Icon size={20} className={isActive ? 'text-white' : 'text-emerald-500'} />
                      <span className="text-sm truncate">{item.label}</span>
                      {isActive && group.label === t.aiServices && (
                        <Sparkles size={12} className="ml-auto text-emerald-300 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-emerald-900/50 space-y-4 shrink-0">
          <div className="px-4">
            <LanguagePicker dark />
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-emerald-400 hover:text-white hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">{t.signOut}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer absolute left-1/2 -translate-x-1/2" onClick={() => setActiveView(AppView.DASHBOARD)}>
            <AppLogo className="w-8 h-8" />
            <span className="font-black text-slate-900 tracking-tighter">{t.appName}</span>
          </div>
          
          <LanguagePicker />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-6xl mx-auto pb-8">
            {children}
          </div>
        </div>
      </main>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
              <div className="flex items-center gap-3">
                <AppLogo className="w-8 h-8" />
                <span className="font-black text-white uppercase tracking-widest text-sm">{t.appName}</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-emerald-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              {sidebarGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{group.label}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon as any;
                      const isActive = activeView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveView(item.id as AppView);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                            isActive 
                            ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-100' 
                            : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon size={20} className={isActive ? 'text-white' : 'text-emerald-600'} />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 space-y-4">
               <button 
                 onClick={onLogout}
                 className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
               >
                 <LogOut size={16} /> {t.logout}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
