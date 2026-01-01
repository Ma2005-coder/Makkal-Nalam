
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle, Clock, LayoutDashboard, MapPin, Bookmark, X, FileText, User, Bell, ShieldCheck, Briefcase, Activity, Zap, FileCheck, ArrowRight } from 'lucide-react';
import { getDashboardStats } from '../services/geminiService';
import { Language, UserEligibilityData, Application, Reminder, AppView } from '../types';
import { translations } from '../translations';

const RoadmapStep = ({ label, status, isLast }: { label: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }) => (
  <div className="flex flex-col items-center relative flex-1">
    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-2 ${
      status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 
      status === 'current' ? 'bg-amber-500 border-amber-500 text-white animate-pulse shadow-lg shadow-amber-200' : 'bg-white border-slate-200 text-slate-300'
    }`}>
      {status === 'completed' ? <CheckCircle size={12} /> : status === 'current' ? <Clock size={12} /> : <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-200 rounded-full" />}
    </div>
    {!isLast && (
      <div className={`absolute left-1/2 top-3.5 md:top-4 w-full h-[2px] -z-0 ${status === 'completed' ? 'bg-emerald-600' : 'bg-slate-100'}`} />
    )}
    <p className={`mt-2 md:mt-3 text-[8px] md:text-[9px] font-black uppercase tracking-tighter text-center px-1 ${status === 'upcoming' ? 'text-slate-300' : 'text-slate-700'}`}>
      {label}
    </p>
  </div>
);

interface DashboardProps {
  language: Language;
  activeView: AppView;
  onTriggerAlert?: (type: 'email' | 'phone', message: string, sub: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ language, activeView, onTriggerAlert }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApps, setActiveApps] = useState<Application[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [profile, setProfile] = useState<UserEligibilityData | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const sessionIdentifier = localStorage.getItem('current_session');
  const t = translations[language];

  const announcements = [
    { id: 1, title: t.specialAadharCamp, date: "Sunday, 10 AM", loc: "Local Govt School", type: 'event', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: 2, title: t.rationTimingUpdate, date: "Effective Tomorrow", loc: "All Ward Shops", type: 'alert', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { id: 3, title: t.mobileHealthUnit, date: "Next Tuesday", loc: "Panchayat Office", type: 'health', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
        
        if (sessionIdentifier) {
          const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
          if (saved) {
            const parsedProfile: UserEligibilityData = JSON.parse(saved);
            setProfile(parsedProfile);
            if (parsedProfile.activeApplications) setActiveApps(parsedProfile.activeApplications);
            if (parsedProfile.reminders) setReminders(parsedProfile.reminders);
            setDisplayName(parsedProfile.name || sessionIdentifier);

            if (onTriggerAlert) {
                const expiringDocs = [
                    { type: 'incomeCert', label: t.uploadIncome },
                ].filter(d => parsedProfile?.documents?.[d.type as any]);

                if (expiringDocs.length > 0) {
                    onTriggerAlert(
                        'phone', 
                        t.notifyDocExpired, 
                        t.notifyDocExpiredDesc.replace('{doc}', expiringDocs[0].label)
                    );
                }
            }
          } else {
            setDisplayName(sessionIdentifier);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sessionIdentifier]);

  const deleteReminder = (id: string) => {
    if (!sessionIdentifier) return;
    const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
    if (!saved) return;
    const currentProfile: UserEligibilityData = JSON.parse(saved);
    const updated = (currentProfile.reminders || []).filter(r => r.id !== id);
    currentProfile.reminders = updated;
    localStorage.setItem(`user_profile_${sessionIdentifier}`, JSON.stringify(currentProfile));
    setReminders(updated);
  };

  const getStatusWeight = (status: Application['status']) => {
    switch (status) {
      case 'applied': return 0;
      case 'vao': return 1;
      case 'ri': return 2;
      case 'tahsildar': return 3;
      case 'disbursed': return 4;
      default: return 0;
    }
  };

  const getStepStatus = (currentWeight: number, stepWeight: number) => {
    if (currentWeight > stepWeight) return 'completed';
    if (currentWeight === stepWeight) return 'current';
    return 'upcoming';
  };

  const checkDocStatus = (docType: keyof NonNullable<UserEligibilityData['documents']>) => {
    const doc = profile?.documents?.[docType];
    if (!doc) return 'missing';
    if (docType === 'incomeCert') return 'expiring'; 
    return 'ready';
  };

  const renderActiveApps = (compact: boolean = false) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <LayoutDashboard className="text-emerald-600" /> {t.activeAppTitle}
        </h3>
        {compact && activeApps.length > 0 && (
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-widest">{activeApps.length} Total</span>
        )}
      </div>
      {activeApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {activeApps.map((app, idx) => {
            const weight = getStatusWeight(app.status);
            return (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:border-emerald-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{app.schemeName}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">Ref: {app.refNumber}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">Applied: {app.dateApplied}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <MapPin size={18} className="text-emerald-600" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-700/60 uppercase leading-none mb-0.5">{t.assignedVAO}</p>
                      <p className="text-xs font-black text-emerald-900">M. Saravanan (Zone 4)</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-start w-full max-w-2xl mx-auto">
                  <RoadmapStep label={t.roadApplied} status={getStepStatus(weight, 0)} />
                  <RoadmapStep label={t.roadVAO} status={getStepStatus(weight, 1)} />
                  <RoadmapStep label={t.roadRI} status={getStepStatus(weight, 2)} />
                  <RoadmapStep label={t.roadTahsildar} status={getStepStatus(weight, 3)} />
                  <RoadmapStep label={t.roadDisbursed} status={getStepStatus(weight, 4)} isLast />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
          <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.noActiveApps}</h3>
          <p className="text-slate-400 mt-1 text-xs">{t.startExploring}</p>
        </div>
      )}
    </div>
  );

  const renderSavedSchemes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <Bookmark className="text-amber-600" /> {t.offlineReminders}
        </h3>
        <div className="bg-amber-100 text-amber-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{t.availableOffline}</div>
      </div>
      {reminders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center">
          <Bookmark size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold text-sm">{t.noReminders}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group transition-all hover:shadow-md hover:border-amber-200">
              <button onClick={() => deleteReminder(reminder.id)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X size={16} />
              </button>
              <div className="mb-6">
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1 block">{t.savedWelfareProgram}</span>
                <h3 className="text-lg font-black text-slate-900 leading-tight pr-8">{reminder.schemeName}</h3>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileCheck size={12} className="text-emerald-500" /> {t.whatToBring}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reminder.documentsNeeded.map((doc, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-700 text-[10px] font-bold rounded-lg">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">{t.archived}: {reminder.savedDate}</span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-tighter">
                  <CheckCircle size={12} /> {t.readyToVisitCSC}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in slide-in-from-bottom-5 duration-700 pb-24">
      <div className="space-y-12">
        
        {activeView === AppView.DASHBOARD && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* 1. Dashboard Header */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex items-center gap-4 md:gap-8 p-8 bg-emerald-600 rounded-[3rem] shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center shrink-0 border border-white/30 shadow-2xl">
                  <User size={48} className="text-emerald-50" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-100/70 mb-2">{t.welcomeCitizen}</p>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">{displayName}</h2>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="bg-emerald-500/50 backdrop-blur-sm text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">Verified Citizen</span>
                  </div>
                </div>
              </div>

              {/* 2. Announcements */}
              <div className="w-full md:w-[35%] bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-xs flex items-center gap-2 uppercase tracking-[0.15em]"><Bell size={14} className="text-emerald-500" /> {t.makkalFeed}</h3>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{profile?.permAddress.district || "TN"}</span>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[160px] scrollbar-hide pr-2">
                  {announcements.map(ann => (
                    <div key={ann.id} className={`p-4 rounded-[1.5rem] border ${ann.color} flex items-start gap-4 transition-all hover:scale-[1.02] cursor-default`}>
                      <Zap size={16} className="shrink-0 mt-1" />
                      <div>
                        <p className="text-xs font-black leading-tight mb-1">{ann.title}</p>
                        <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest">{ann.date} • {ann.loc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. General Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: t.tnSchemes, value: '320+', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: t.beneficiaries, value: '4.2M+', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: t.ekycVerified, value: '2.8M', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                { label: t.avgPayout, value: `9 ${t.days}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-start gap-4 transition-all hover:shadow-md">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Active Applications Section - Integrated on Dashboard */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
               {renderActiveApps(true)}
            </div>

            {/* 5. Saved Schemes Section - Integrated on Dashboard */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
               {renderSavedSchemes()}
            </div>
          </div>
        )}

        {activeView === AppView.DOCUMENTS && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500" size={32} /> {t.docReadiness}
                  </h3>
                  <p className="text-slate-400 text-base font-medium mt-2">{t.statusMandatoryCerts}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { type: 'aadharCard', label: t.aadhar, icon: FileText },
                  { type: 'rationCard', label: t.smartCard, icon: FileText },
                  { type: 'incomeCert', label: t.uploadIncome, icon: TrendingUp },
                  { type: 'communityCert', label: t.uploadCommunity, icon: User },
                  { type: 'eduCert', label: t.uploadEdu, icon: FileText },
                ].map((doc, i) => {
                  const status = checkDocStatus(doc.type as any);
                  return (
                    <div key={i} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col gap-6 ${
                      status === 'ready' ? 'bg-white border-slate-100 shadow-sm' : 
                      status === 'expiring' ? 'bg-amber-50 border-amber-200 shadow-lg shadow-amber-900/5' : 'bg-red-50/20 border-dashed border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 
                          status === 'expiring' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <doc.icon size={28} />
                        </div>
                        {status !== 'ready' && <Activity size={20} className="animate-pulse text-amber-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{doc.label.split('(')[0].trim()}</p>
                        <span className={`text-xl font-black ${
                          status === 'ready' ? 'text-emerald-600' : 
                          status === 'expiring' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {status === 'ready' ? t.ready : status === 'expiring' ? t.renewSoon : t.missingDoc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === AppView.APPLICATIONS && (
          <div className="animate-in fade-in duration-500">
             {renderActiveApps(false)}
          </div>
        )}

        {activeView === AppView.SAVED && (
          <div className="animate-in fade-in duration-500">
             {renderSavedSchemes()}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
