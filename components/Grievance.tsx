
import React, { useState } from 'react';
import { AlertTriangle, Send, Sparkles, Loader2, CheckCircle, ArrowRight, ShieldAlert, Clock, Building2, UserCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { analyzeGrievance } from '../services/geminiService';

const RoadmapStep = ({ label, status, isLast }: { label: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }) => (
  <div className="flex flex-col items-center relative flex-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors border-2 ${
      status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white' : 
      status === 'current' ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-400'
    }`}>
      {status === 'completed' ? <CheckCircle size={16} /> : status === 'current' ? <Clock size={16} /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />}
    </div>
    {!isLast && (
      <div className={`absolute left-1/2 top-4 w-full h-[2px] -z-0 ${status === 'completed' ? 'bg-emerald-600' : 'bg-slate-100'}`} />
    )}
    <p className={`mt-3 text-[10px] font-bold uppercase tracking-wider text-center px-2 ${status === 'upcoming' ? 'text-slate-400' : 'text-slate-800'}`}>
      {label}
    </p>
  </div>
);

const Grievance: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [refId, setRefId] = useState('');

  const handleAiAssist = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeGrievance(description, language);
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const generatedId = `GRV-TN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setRefId(generatedId);
      setSubmitting(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto animate-in zoom-in duration-500 space-y-8 pb-20">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle size={48} /></div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">{t.grievanceSubmitted}</h2>
            <div className="bg-emerald-50 p-4 px-8 rounded-2xl border border-emerald-100 inline-block">
              <p className="text-emerald-700 font-bold text-xs uppercase tracking-widest mb-1">{t.trackingId}</p>
              <p className="text-2xl font-mono text-emerald-900">{refId}</p>
            </div>
          </div>

          <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-10 text-center uppercase tracking-widest">{t.grievanceRoadmap}</h3>
            <div className="flex justify-between items-start">
              <RoadmapStep label={t.registered} status="completed" />
              <RoadmapStep label={t.assigned} status="current" />
              <RoadmapStep label={t.hearing} status="upcoming" />
              <RoadmapStep label={t.resolved} status="upcoming" isLast />
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => window.location.reload()} className="py-4 px-12 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-xl transition-all uppercase tracking-widest">{t.returnToDashboard}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20">
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.grievanceTitle}</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">{t.grievanceInstructions}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.describeExclusion}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="..."
                className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-emerald-100 outline-none resize-none transition-all text-slate-700 font-medium"
              />
            </div>
            
            <button
              onClick={handleAiAssist}
              disabled={loading || !description.trim()}
              className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-200 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? t.aiDrafting : t.aiHelp}
            </button>
          </div>

          {aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2.5rem] shadow-lg border border-indigo-100 space-y-6 animate-in slide-in-from-left-8 duration-500">
               <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Categorization Result</span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-indigo-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.suggestedDept}</p>
                     <p className="text-sm font-black text-slate-900 flex items-center gap-2"><Building2 size={14} className="text-indigo-500"/> {aiAnalysis.department}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-indigo-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.urgency}</p>
                     <p className="text-sm font-black text-slate-900 flex items-center gap-2"><ShieldAlert size={14} className={aiAnalysis.urgency === 'High' ? 'text-red-500' : 'text-amber-500'}/> {aiAnalysis.urgency}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.formalSummary}</p>
                    <p className="text-sm text-slate-700 font-medium italic">"{aiAnalysis.formalSummary}"</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.requestedAction}</p>
                    <p className="text-sm text-slate-700 font-medium">{aiAnalysis.requestedAction}</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl sticky top-8 space-y-8">
              <div className="space-y-2">
                 <h3 className="text-white font-black text-xl tracking-tight">{t.officialRecord}</h3>
                 <p className="text-slate-400 text-xs leading-relaxed font-medium">{t.recordDisclaimer}</p>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-emerald-400">
                    <UserCheck size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{t.ekycLinked}</span>
                 </div>
                 <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{t.masterProfileSynced}</span>
                 </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!aiAnalysis || submitting}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-900 transition-all flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95"
              >
                {submitting ? <Loader2 size={24} className="animate-spin" /> : <><Send size={24} /> {t.submitGrievance}</>}
              </button>

              <div className="pt-6 border-t border-slate-800">
                 <p className="text-[10px] text-slate-500 font-bold uppercase text-center tracking-widest">{t.cmCellTracking}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Grievance;
