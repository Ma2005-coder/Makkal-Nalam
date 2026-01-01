
import React, { useState, useEffect } from 'react';
import { Search, Info, Loader2, Bookmark, Check, ExternalLink } from 'lucide-react';
import { searchSchemes } from '../services/geminiService';
import { Language, UserEligibilityData, Reminder } from '../types';
import { translations } from '../translations';

const Explorer: React.FC<{ language: Language }> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const userPhone = localStorage.getItem('current_session');
  const t = translations[language];

  useEffect(() => {
    if (query && results) {
      handleSearch();
    }
    if (userPhone) {
      const saved = localStorage.getItem(`user_profile_${userPhone}`);
      if (saved) {
        const profile: UserEligibilityData = JSON.parse(saved);
        if (profile.reminders) {
          setSavedIds(new Set(profile.reminders.map(r => r.schemeName)));
        }
      }
    }
  }, [language, userPhone]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchSchemes(query, language);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveToReminders = (name: string) => {
    if (!userPhone) return;
    const saved = localStorage.getItem(`user_profile_${userPhone}`);
    let profile: UserEligibilityData = saved ? JSON.parse(saved) : { reminders: [] };
    
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      schemeName: name,
      documentsNeeded: ["Aadhar Card", "Smart Card", "Income Certificate"],
      savedDate: new Date().toLocaleDateString()
    };

    profile.reminders = [...(profile.reminders || []), newReminder];
    localStorage.setItem(`user_profile_${userPhone}`, JSON.stringify(profile));
    setSavedIds(prev => new Set(prev).add(name));
  };

  const parseSchemesFromText = (text: string) => {
    const lines = text.split('\n');
    const schemes = lines.filter(l => l.match(/^\d\./) || l.includes('**')).slice(0, 5);
    return schemes.map(s => s.replace(/[*\d.]/g, '').trim()).filter(s => s.length > 5);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{t.schemeFinder}</h2>
        <p className="text-slate-500 font-medium">Search the entire Tamil Nadu welfare database.</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-14 pr-4 py-5 bg-white rounded-3xl shadow-xl focus:ring-4 focus:ring-emerald-100 border-none transition-all outline-none text-lg text-slate-700 placeholder-slate-400"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 disabled:bg-slate-300 transition-all flex items-center gap-2 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : t.search}
        </button>
      </form>

      {results && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Info className="text-emerald-600" /> {t.aiResponse}
            </h3>
            
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed mb-10 font-medium">
              {results.text}
            </div>

            {results.sources && results.sources.length > 0 && (
              <div className="mb-10 pt-4 border-t border-slate-50">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t.verificationSources}</h4>
                <div className="flex flex-wrap gap-3">
                  {results.sources.map((source: any, i: number) => {
                    const url = source.web?.uri || source.maps?.uri;
                    const title = source.web?.title || source.maps?.title || "Search Result";
                    if (!url) return null;
                    return (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                      >
                        <ExternalLink size={12} /> {title}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-slate-50">
               <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">{t.identifiedPrograms}</h4>
               <div className="space-y-4">
                  {parseSchemesFromText(results.text).map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                       <span className="font-bold text-slate-800">{name}</span>
                       <button 
                         onClick={() => saveToReminders(name)}
                         disabled={savedIds.has(name)}
                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                           savedIds.has(name) 
                             ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                             : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                         }`}
                       >
                         {savedIds.has(name) ? <Check size={14} /> : <Bookmark size={14} />}
                         {savedIds.has(name) ? t.savedToVault : t.saveOffline}
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorer;
