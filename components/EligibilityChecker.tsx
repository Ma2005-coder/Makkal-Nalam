
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, CheckCircle, FileText, User, Search, ShieldAlert, MapPin, Sparkles, GraduationCap, Phone, Heart, Users, Landmark, Briefcase, ChevronRight, Upload, X, FileCheck, Info, Banknote, Tag, AlertTriangle, CreditCard, BookOpen, AlertCircle, Clock, Home, Bookmark, Locate, Hash, Calendar } from 'lucide-react';
import { verifyDetailedEligibility, searchSchemes, verifyDocumentQuality, reverseGeocodeToTN } from '../services/geminiService';
import { UserEligibilityData, Language, Application, Reminder } from '../types';
import { translations } from '../translations';
import { TN_DISTRICTS, TN_TALUKS, TN_VILLAGES, TN_DISTRICTS_TA, TN_TALUKS_TA, TN_VILLAGES_TA } from '../data/tnData';

const TN_PRESET_SCHEMES = [
  { name: 'Magalir Urimai Thogai', category: 'Financial', icon: Heart },
  { name: 'Pudhumai Penn Scheme', category: 'Education', icon: GraduationCap },
  { name: 'Kalaignar Kanavu Illam', category: 'Housing', icon: Landmark },
  { name: 'Chief Minister’s Comprehensive Health Insurance', category: 'Health', icon: Heart },
  { name: 'TN Free Laptop Scheme', category: 'Education', icon: Sparkles },
];

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

interface FileUploadProps {
  label: string;
  docType: keyof UserEligibilityData['documents'];
  icon: any;
  value?: string;
  t: any;
  isVerifying: boolean;
  feedback?: { isValid: boolean; feedback: string };
  onUpload: (docType: keyof UserEligibilityData['documents'], file: File | null) => void;
  onClear: (docType: keyof UserEligibilityData['documents']) => void;
  selectedCategory?: string;
  badgeText?: string;
}

const FileUploadArea: React.FC<FileUploadProps> = ({ label, docType, icon: Icon, value, t, isVerifying, feedback, onUpload, onClear, selectedCategory, badgeText }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <div className="flex gap-1 items-center">
          {docType === 'communityCert' && (
            <div className="flex gap-1">
              {['FC', 'BC', 'MBC/DNC', 'SC', 'ST'].map(cat => (
                <span 
                  key={cat} 
                  className={`text-[8px] px-1.5 py-0.5 rounded-full font-black border transition-all ${
                    selectedCategory === cat 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-110' 
                    : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
          {badgeText && (
            <span className="text-[8px] px-2 py-0.5 rounded-full font-black bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300">
              {badgeText}
            </span>
          )}
        </div>
      </div>
      <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
        value ? (feedback?.isValid ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50') : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30'
      }`}>
        {isVerifying ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t.verifying}</span>
          </div>
        ) : value ? (
          <>
            <div className={`flex items-center gap-2 ${feedback?.isValid ? 'text-emerald-600' : 'text-red-600'}`}>
              {feedback?.isValid ? <FileCheck size={24} /> : <AlertCircle size={24} />}
              <span className="text-xs font-bold">{feedback?.isValid ? t.verified : t.docInvalid}</span>
            </div>
            {feedback && !feedback.isValid && (
              <p className="text-[10px] text-red-700 text-center font-medium leading-tight px-2">{feedback.feedback}</p>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); onClear(docType); }} className="absolute top-2 right-2 p-1 bg-white text-slate-400 rounded-full hover:text-red-500 shadow-sm transition-colors"><X size={12}/></button>
          </>
        ) : (
          <>
            <Icon size={24} className="text-slate-400" />
            <p className="text-[10px] text-slate-500 text-center">{t.dropFiles}</p>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={(e) => onUpload(docType, e.target.files ? e.target.files[0] : null)}/>
          </>
        )}
      </div>
    </div>
  );
};

interface AddressBlockProps {
  title: string;
  type: 'perm' | 'temp';
  data: any;
  disabled?: boolean;
  t: any;
  language: Language;
  onChange: (type: 'perm' | 'temp', field: string, value: string) => void;
  onBulkUpdate: (type: 'perm' | 'temp', updates: Partial<any>) => void;
}

const AddressBlock: React.FC<AddressBlockProps> = ({ title, type, data, disabled, t, language, onChange, onBulkUpdate }) => {
  const isTa = language === 'ta';
  const districts = isTa ? TN_DISTRICTS_TA : TN_DISTRICTS;
  const talukMap = isTa ? TN_TALUKS_TA : TN_TALUKS;
  const villageMap = isTa ? TN_VILLAGES_TA : TN_VILLAGES;

  const taluks = data.district ? talukMap[data.district] || [] : [];
  const predefinedVillages = data.taluk ? (villageMap[data.taluk] || villageMap["default"]) : [];
  
  const [isManualTaluk, setIsManualTaluk] = useState(false);
  const [isManualVillage, setIsManualVillage] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (data.taluk && !taluks.includes(data.taluk) && data.taluk !== "") {
      setIsManualTaluk(true);
    }
    if (data.village && !predefinedVillages.includes(data.village) && data.village !== "") {
      setIsManualVillage(true);
    }
  }, [data.district, data.taluk]);

  const handleTalukSelect = (val: string) => {
    if (val === t.other) {
      setIsManualTaluk(true);
      onChange(type, 'taluk', '');
    } else {
      setIsManualTaluk(false);
      onChange(type, 'taluk', val);
    }
  };

  const handleVillageSelect = (val: string) => {
    if (val === t.other) {
      setIsManualVillage(true);
      onChange(type, 'village', '');
    } else {
      setIsManualVillage(false);
      onChange(type, 'village', val);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await reverseGeocodeToTN(pos.coords.latitude, pos.coords.longitude, language);
          if (res.district && res.taluk) {
            onBulkUpdate(type, {
              district: res.district,
              taluk: res.taluk,
              village: res.village,
              pincode: res.pincode
            });
            if (!taluks.includes(res.taluk)) setIsManualTaluk(true);
            if (!predefinedVillages.includes(res.village)) setIsManualVillage(true);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false)
    );
  };
  
  return (
    <div className={`space-y-4 p-5 rounded-2xl border ${disabled ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs"><MapPin size={14} className="text-emerald-600" /> {title}</h4>
        {!disabled && (
          <button 
            type="button" 
            onClick={detectLocation} 
            disabled={isDetecting}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            {isDetecting ? <Loader2 size={10} className="animate-spin" /> : <Locate size={10} />}
            {isDetecting ? t.detecting : t.detectLocation}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.doorNo}</label>
          <input 
            type="text" 
            value={data.doorNo} 
            onChange={(e) => onChange(type, 'doorNo', e.target.value)} 
            disabled={disabled} 
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs" 
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.district}</label>
          <select 
            value={data.district} 
            onChange={(e) => onChange(type, 'district', e.target.value)} 
            disabled={disabled} 
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.8rem] bg-[right_0.4rem_center] bg-no-repeat"
          >
            <option value="">{t.district}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.taluk}</label>
          {!isManualTaluk ? (
            <select 
              value={data.taluk} 
              onChange={(e) => handleTalukSelect(e.target.value)} 
              disabled={disabled || !data.district} 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.8rem] bg-[right_0.4rem_center] bg-no-repeat"
            >
              <option value="">{t.selectTaluk}</option>
              {taluks.map(tk => <option key={tk} value={tk}>{tk}</option>)}
              <option value={t.other} className="font-bold text-emerald-600 italic">+ {t.other}</option>
            </select>
          ) : (
            <div className="relative">
              <input 
                type="text" 
                value={data.taluk} 
                onChange={(e) => onChange(type, 'taluk', e.target.value)} 
                disabled={disabled} 
                placeholder={t.typeTalukName}
                className="w-full pl-3 pr-8 py-2 bg-emerald-50 border border-emerald-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs" 
                autoFocus
              />
              <button type="button" onClick={() => { setIsManualTaluk(false); onChange(type, 'taluk', ''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={12} /></button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.village}</label>
          {!isManualVillage ? (
            <select 
              value={data.village} 
              onChange={(e) => handleVillageSelect(e.target.value)} 
              disabled={disabled || !data.taluk} 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.8rem] bg-[right_0.4rem_center] bg-no-repeat"
            >
              <option value="">{t.selectVillage}</option>
              {predefinedVillages.map(v => <option key={v} value={v}>{v}</option>)}
              <option value={t.other} className="font-bold text-emerald-600 italic">+ {t.other}</option>
            </select>
          ) : (
            <div className="relative">
              <input 
                type="text" 
                value={data.village} 
                onChange={(e) => onChange(type, 'village', e.target.value)} 
                disabled={disabled} 
                placeholder={t.typeVillageName}
                className="w-full px-3 pr-8 py-2 bg-emerald-50 border border-emerald-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs" 
                autoFocus
              />
              <button type="button" onClick={() => { setIsManualVillage(false); onChange(type, 'village', ''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={12} /></button>
            </div>
          )}
        </div>
        <div className="col-span-1">
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.pincode}</label>
          <input type="text" value={data.pincode} onChange={(e) => onChange(type, 'pincode', e.target.value)} disabled={disabled} maxLength={6} placeholder="600001" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs" />
        </div>
      </div>
    </div>
  );
};

const EligibilityChecker: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const isTa = language === 'ta';
  const sessionIdentifier = localStorage.getItem('current_session') || '';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discoveredSchemes, setDiscoveredSchemes] = useState<any[]>(TN_PRESET_SCHEMES);
  const [isSearching, setIsSearching] = useState(false);
  const [targetScheme, setTargetScheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [applicationStep, setApplicationStep] = useState<'select' | 'form' | 'results' | 'applying' | 'success'>('select');
  const [verifyingDocs, setVerifyingDocs] = useState<Record<string, boolean>>({});
  const [docFeedback, setDocFeedback] = useState<Record<string, { isValid: boolean; feedback: string }>>({});
  const [newRefNumber, setNewRefNumber] = useState('');
  const [isReminded, setIsReminded] = useState(false);
  const [isManualAge, setIsManualAge] = useState(false);

  const isPhone = /^\d{10}$/.test(sessionIdentifier);
  const isEmail = sessionIdentifier.includes('@');

  const [formData, setFormData] = useState<UserEligibilityData>({
    name: '', 
    phone: isPhone ? sessionIdentifier : '', 
    email: isEmail ? sessionIdentifier : '', 
    dob: '', aadhar: '', smartCard: '', income: 0, incomePeriod: 'annual', familyAssets: '', location: 'Tamil Nadu', category: 'FC', gender: 'Male', age: 18, occupation: '', education: '', employmentStatus: 'Unemployed', familySize: 1, isDisabled: false,
    permAddress: { doorNo: '', village: '', taluk: '', district: '', pincode: '' },
    tempAddress: { doorNo: '', village: '', taluk: '', district: '', pincode: '' },
    isSameAddress: false,
    documents: {}
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  useEffect(() => {
    if (sessionIdentifier) {
      const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    }
  }, [sessionIdentifier]);

  const handleSearchSchemes = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSearching(true);
    try {
      const searchResult = await searchSchemes(`${searchQuery} schemes in Tamil Nadu`, language);
      const lines = searchResult.text.split('\n').filter(l => l.includes('**') || l.match(/^\d\./)).slice(0, 6);
      const newSchemes = lines.map(line => ({
        name: line.replace(/[*\d.]/g, '').trim(),
        category: 'TN State Scheme',
        icon: Sparkles
      })).filter(s => s.name.length > 5);
      setDiscoveredSchemes(newSchemes.length > 0 ? newSchemes : TN_PRESET_SCHEMES);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const saveReminder = () => {
    if (!targetScheme || !sessionIdentifier) return;
    const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
    let profile: UserEligibilityData = saved ? JSON.parse(saved) : { ...formData };
    
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      schemeName: targetScheme,
      documentsNeeded: result?.documentsVerified || ["Aadhar Card", "Smart Card"],
      savedDate: new Date().toLocaleDateString()
    };

    profile.reminders = [...(profile.reminders || []), newReminder];
    localStorage.setItem(`user_profile_${sessionIdentifier}`, JSON.stringify(profile));
    setIsReminded(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name === 'isSameAddress') {
        setFormData(prev => ({
          ...prev,
          isSameAddress: checked,
          tempAddress: checked ? { ...prev.permAddress } : prev.tempAddress
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'dob') {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({ ...prev, dob: value, age: calculatedAge }));
    } else if (name === 'aadhar' || name === 'smartCard') {
      const cleaned = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: (name === 'income' || name === 'age' || name === 'familySize') ? (name === 'familySize' && value === 'More than 5' ? 6 : parseInt(value) || 0) : value 
      }));
    }
  };

  const handleAddressChange = (type: 'perm' | 'temp', field: string, value: string) => {
    setFormData(prev => {
      const currentAddr = type === 'perm' ? { ...prev.permAddress } : { ...prev.tempAddress };
      currentAddr[field] = value;
      if (field === 'district') { currentAddr.taluk = ''; currentAddr.village = ''; }
      else if (field === 'taluk') { currentAddr.village = ''; }

      const updatedPerm = type === 'perm' ? currentAddr : prev.permAddress;
      const updatedTemp = type === 'temp' ? currentAddr : (prev.isSameAddress ? { ...updatedPerm } : prev.tempAddress);
      return { ...prev, permAddress: updatedPerm, tempAddress: updatedTemp };
    });
  };

  const handleBulkAddressUpdate = (type: 'perm' | 'temp', updates: Partial<any>) => {
    setFormData(prev => {
      const currentAddr = type === 'perm' ? { ...prev.permAddress } : { ...prev.tempAddress };
      const newAddr = { ...currentAddr, ...updates };
      const updatedPerm = type === 'perm' ? newAddr : prev.permAddress;
      const updatedTemp = type === 'temp' ? newAddr : (prev.isSameAddress ? { ...updatedPerm } : prev.tempAddress);
      return { ...prev, permAddress: updatedPerm, tempAddress: updatedTemp };
    });
  };

  const handleFileUpload = async (docType: keyof UserEligibilityData['documents'], file: File | null) => {
    if (!file) return;
    setVerifyingDocs(prev => ({ ...prev, [docType]: true }));
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [docType]: base64 }
      }));
      
      try {
        const check = await verifyDocumentQuality(base64, docType, language);
        setDocFeedback(prev => ({ ...prev, [docType]: check }));
      } catch (err) {
        setDocFeedback(prev => ({ ...prev, [docType]: { isValid: false, feedback: "Verification failed." } }));
      } finally {
        setVerifyingDocs(prev => ({ ...prev, [docType]: false }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearDoc = (docType: keyof UserEligibilityData['documents']) => {
    setFormData(p => ({ ...p, documents: { ...p.documents, [docType]: undefined } }));
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetScheme) return;
    setLoading(true);
    try {
      const res = await verifyDetailedEligibility(formData, targetScheme, language);
      setResult(res);
      setApplicationStep('results');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startApplying = () => {
    setApplicationStep('applying');
    const ref = `TN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setNewRefNumber(ref);

    setTimeout(() => {
      if (!sessionIdentifier) return;
      const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
      let profile: UserEligibilityData = saved ? JSON.parse(saved) : { ...formData };
      
      const newApp: Application = {
        id: Date.now().toString(),
        schemeName: targetScheme || 'TN Welfare',
        status: 'vao',
        dateApplied: new Date().toLocaleDateString(),
        refNumber: ref
      };

      profile.activeApplications = [...(profile.activeApplications || []), newApp];
      localStorage.setItem(`user_profile_${sessionIdentifier}`, JSON.stringify(profile));
      setApplicationStep('success');
    }, 4000); 
  };

  if (applicationStep === 'select') {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.eligibilityChecker}</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">{t.automatedCheckerDesc}</p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
          <form onSubmit={handleSearchSchemes} className="flex gap-2">
            <div className="relative flex-1">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700" />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <button type="submit" disabled={isSearching} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:bg-slate-200">
              {isSearching ? <Loader2 className="animate-spin" size={18} /> : t.search}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-50">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter"><Sparkles className="text-emerald-600" size={18} /> {t.activeTNSchemes}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoveredSchemes.map((scheme, idx) => (
                <button key={idx} onClick={() => { setTargetScheme(scheme.name); setApplicationStep('form'); }} className="p-6 rounded-3xl border border-slate-100 bg-white text-left transition-all flex items-start gap-4 group hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-emerald-50 transition-colors"><scheme.icon size={20} className="text-emerald-600" /></div>
                  <div><h4 className="font-bold text-slate-900 group-hover:text-emerald-700 leading-tight mb-1">{scheme.name}</h4><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.appName} {t.other}</span></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStep === 'success') {
    return (
      <div className="max-w-4xl mx-auto animate-in zoom-in duration-500 space-y-8 pb-20">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle size={48} /></div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">{t.applicationSubmitted}</h2>
            <div className="bg-emerald-50 p-4 px-8 rounded-2xl border border-emerald-100 inline-block">
              <p className="text-emerald-700 font-bold text-xs uppercase tracking-widest mb-1">{t.refNumber}</p>
              <p className="text-2xl font-mono text-emerald-900">{newRefNumber}</p>
            </div>
          </div>

          <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-10 text-center uppercase tracking-widest">{t.applicationRoadmap}</h3>
            <div className="flex justify-between items-start">
              <RoadmapStep label={t.roadApplied} status="completed" />
              <RoadmapStep label={t.roadVAO} status="current" />
              <RoadmapStep label={t.roadRI} status="upcoming" />
              <RoadmapStep label={t.roadTahsildar} status="upcoming" />
              <RoadmapStep label={t.roadDisbursed} status="upcoming" isLast />
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => setApplicationStep('select')} className="py-4 px-12 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-xl transition-all uppercase tracking-widest">{t.done}</button>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStep === 'applying') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-pulse">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <Loader2 size={128} className="animate-spin text-emerald-600 absolute inset-0 opacity-20" />
          <Landmark size={64} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-700" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{t.tnGovGateway}</h2>
        <p className="text-slate-500 italic font-medium">{t.submittingProfile}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setApplicationStep('select')} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 rotate-180 transition-transform active:scale-95"><ChevronRight size={20} /></button>
          <div><p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">{t.checkingFor}</p><h2 className="text-3xl font-black text-slate-900 tracking-tight">{targetScheme}</h2></div>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-10">
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20} /></div>{t.identificationDetails}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.fullName}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" required />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.phoneNumber}</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 pointer-events-none">
                        <Phone className="text-slate-400" size={14} />
                        <span className="text-slate-600 font-bold text-sm">+91</span>
                      </div>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="00000 00000" className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" required />
                    </div>
                  </div>

                  {/* Redesigned DOB Section for Better Visibility */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dateOfBirth}</label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input type="checkbox" checked={isManualAge} onChange={(e) => setIsManualAge(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-600 uppercase tracking-tighter transition-colors">{t.dontKnowDob}</span>
                        </label>
                      </div>
                      {!isManualAge ? (
                        <div className="relative">
                          <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" required />
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                      ) : (
                        <div className="p-3.5 bg-white rounded-xl border border-slate-100 flex items-center gap-2.5 text-[10px] font-bold text-slate-500 leading-tight">
                          <Info size={14} className="text-amber-500 shrink-0" /> {t.enterAgeManual}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t.age}</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="number" 
                          name="age" 
                          value={formData.age || ''} 
                          onChange={handleInputChange} 
                          className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none transition-all font-black text-lg ${!isManualAge ? 'bg-slate-100 text-slate-400' : 'bg-white text-emerald-700 focus:ring-2 focus:ring-emerald-500'}`} 
                          disabled={!isManualAge}
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.gender}</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
                        <option value="Male">{t.male}</option>
                        <option value="Female">{t.female}</option>
                        <option value="Other">{t.otherGender}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.aadhar}</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" name="aadhar" value={formData.aadhar} onChange={handleInputChange} maxLength={12} placeholder="1234 5678 9012" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-black text-base focus:ring-2 focus:ring-emerald-500 transition-all tracking-widest" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.smartCard}</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" name="smartCard" value={formData.smartCard} onChange={handleInputChange} maxLength={12} placeholder="0000 0000 0000" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-black text-base focus:ring-2 focus:ring-emerald-500 transition-all tracking-widest" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.category}</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
                        <option value="FC">{t.fc}</option>
                        <option value="BC">{t.bc}</option>
                        <option value="MBC/DNC">{t.mbc_dnc}</option>
                        <option value="SC">{t.sc}</option>
                        <option value="ST">{t.st}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Home size={20} /></div>{t.permAddress}</h3>
                <div className="grid grid-cols-1 gap-8">
                  <AddressBlock title={t.permAddress} type="perm" data={formData.permAddress} t={t} language={language} onChange={handleAddressChange} onBulkUpdate={handleBulkAddressUpdate} />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="font-bold text-slate-900 text-xs">{t.tempAddress}</h4>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" name="isSameAddress" checked={formData.isSameAddress} onChange={handleInputChange} className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-[9px] font-bold text-slate-500 group-hover:text-emerald-600 transition-colors uppercase tracking-widest">{t.sameAsPerm}</span>
                      </label>
                    </div>
                    <AddressBlock title={t.tempAddress} type="temp" data={formData.tempAddress} disabled={formData.isSameAddress} t={t} language={language} onChange={handleAddressChange} onBulkUpdate={handleBulkAddressUpdate} />
                  </div>
                </div>
              </section>
              
              <section className="pt-8 border-t border-slate-100 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><GraduationCap size={20} /></div>{t.demographics}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.education}</label>
                    <select name="education" value={formData.education} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
                      <option value="">{t.selectQualification}</option>
                      <option value="Illiterate">{isTa ? "கல்வியறிவற்றவர்" : "Illiterate"}</option>
                      <option value="Below 10th">{isTa ? "10-ஆம் வகுப்புக்குக் கீழே" : "Below 10th"}</option>
                      <option value="10th Pass">{isTa ? "10-ஆம் வகுப்பு தேர்ச்சி" : "10th Pass"}</option>
                      <option value="12th Pass">{isTa ? "12-ஆம் வகுப்பு தேர்ச்சி" : "12th Pass"}</option>
                      <option value="Graduate">{isTa ? "பட்டதாரி" : "Graduate"}</option>
                      <option value="Post Graduate">{isTa ? "முதுகலை பட்டதாரி" : "Post Graduate"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.employmentStatus}</label>
                    <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
                      <option value="Unemployed">{t.unemployed}</option>
                      <option value="Student">{t.student}</option>
                      <option value="Homemaker">{t.homemaker}</option>
                      <option value="Daily Wage (Agriculture)">{t.dailyAgri}</option>
                      <option value="Daily Wage (Construction)">{t.dailyConst}</option>
                      <option value="MNREGA Worker">{t.mnrega}</option>
                      <option value="Street Vendor / Petty Shop">{t.streetVendor}</option>
                      <option value="Self-Employed">{t.selfEmployed}</option>
                      <option value="Unorganized Sector Worker">{t.unorganizedWorker}</option>
                      <option value="Auto / Taxi / Commercial Driver">{t.autoDriver}</option>
                      <option value="Domestic Worker / Maid">{t.domesticWorker}</option>
                      <option value="Fisherman / Fisherwoman">{t.fisherman}</option>
                      <option value="Weaver (Handloom/Powerloom)">{t.weaver}</option>
                      <option value="Sanitation / Cleaning Worker">{t.sanitationWorker}</option>
                      <option value="Security Guard">{t.securityGuard}</option>
                      <option value="Shop Assistant / Sales Clerk">{t.shopAssistant}</option>
                      <option value="Private Sector (Salaried)">{t.pvtSalaried}</option>
                      <option value="Government Sector (Salaried)">{t.govSalaried}</option>
                      <option value="Small / Marginal Farmer">{t.smallFarmer}</option>
                      <option value="Large Farmer">{t.largeFarmer}</option>
                      <option value="Retired / Pensioner">{t.retired}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 md:items-end">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{formData.incomePeriod === 'monthly' ? t.monthlyIncome : t.annualIncome}</label>
                        <div className="flex bg-slate-200 p-0.5 rounded-lg">
                          <button type="button" onClick={() => setFormData(p => ({ ...p, incomePeriod: 'monthly' }))} className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${formData.incomePeriod === 'monthly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{t.monthly}</button>
                          <button type="button" onClick={() => setFormData(p => ({ ...p, incomePeriod: 'annual' }))} className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${formData.incomePeriod === 'annual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{t.annual}</button>
                        </div>
                      </div>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="number" name="income" value={formData.income || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-lg" required />
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t.familySize}</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select name="familySize" value={formData.familySize === 6 ? 'More than 5' : formData.familySize} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-black text-lg">
                          <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="More than 5">{t.moreThan5}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-fit sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FileText size={20} /></div>{t.welfareVerification}</h3>
              <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                <FileUploadArea label={t.uploadAadhar} docType="aadharCard" icon={CreditCard} value={formData.documents.aadharCard} t={t} isVerifying={verifyingDocs.aadharCard} feedback={docFeedback.aadharCard} onUpload={handleFileUpload} onClear={handleClearDoc} />
                <FileUploadArea label={t.uploadRation} docType="rationCard" icon={FileText} value={formData.documents.rationCard} t={t} isVerifying={verifyingDocs.rationCard} feedback={docFeedback.rationCard} onUpload={handleFileUpload} onClear={handleClearDoc} />
                <FileUploadArea label={t.uploadIncome} docType="incomeCert" icon={Banknote} value={formData.documents.incomeCert} t={t} isVerifying={verifyingDocs.incomeCert} feedback={docFeedback.incomeCert} onUpload={handleFileUpload} onClear={handleClearDoc} />
                <FileUploadArea label={t.uploadCommunity} docType="communityCert" icon={Tag} value={formData.documents.communityCert} t={t} isVerifying={verifyingDocs.communityCert} feedback={docFeedback.communityCert} onUpload={handleFileUpload} onClear={handleClearDoc} selectedCategory={formData.category} />
                <FileUploadArea label={t.uploadEdu} docType="eduCert" icon={BookOpen} value={formData.documents.eduCert} t={t} isVerifying={verifyingDocs.eduCert} feedback={docFeedback.eduCert} onUpload={handleFileUpload} onClear={handleClearDoc} badgeText={formData.education} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 mt-8 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={24} /> {t.checkEligibility}</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {applicationStep === 'results' && result && (
        <div className="max-w-3xl mx-auto mt-12 space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
          <div className={`p-10 rounded-[3.5rem] shadow-2xl border-4 ${result.isEligible ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${result.isEligible ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{result.isEligible ? <CheckCircle size={40} /> : <ShieldAlert size={40} />}</div>
              <h3 className={`text-4xl font-black mb-4 ${result.isEligible ? 'text-emerald-900' : 'text-red-900'}`}>{result.isEligible ? t.eligibleCongrats : t.notEligible}</h3>
              <div className="bg-white p-8 rounded-[2rem] w-full text-left shadow-inner border border-slate-100 mt-6 space-y-6">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.reasonForStatus}</p><p className="text-slate-700 font-medium leading-relaxed">{result.evaluationReason}</p></div>
                {result.isEligible && <div><p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">{t.verifiedBenefits}</p><p className="text-xl font-black text-emerald-800">{result.potentialBenefits}</p></div>}
              </div>
              {result.isEligible ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 w-full">
                  <button onClick={startApplying} className="py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95">
                     <Landmark size={24} /> {t.applyNow}
                  </button>
                  <button onClick={saveReminder} disabled={isReminded} className={`py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${isReminded ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'}`}>
                    <Bookmark size={24} /> {isReminded ? t.savedToVault : t.saveOffline}
                  </button>
                </div>
              ) : (
                <button onClick={() => setApplicationStep('select')} className="mt-10 text-slate-500 font-bold hover:underline transition-all active:scale-95">{t.backToSelection}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityChecker;
