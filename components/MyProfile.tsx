
import React, { useState, useEffect } from 'react';
import { Save, User, Landmark, FileText, GraduationCap, Briefcase, ShieldCheck, CheckCircle, Upload, X, FileCheck, Users, Phone, Calendar, Banknote, Tag, CreditCard, BookOpen, MapPin, Home, Edit3, Locate, Loader2, Hash, AlertCircle, Info, Mail } from 'lucide-react';
import { UserEligibilityData, Language } from '../types';
import { translations } from '../translations';
import { TN_DISTRICTS, TN_TALUKS, TN_VILLAGES, TN_DISTRICTS_TA, TN_TALUKS_TA, TN_VILLAGES_TA } from '../data/tnData';
import { reverseGeocodeToTN, verifyDocumentQuality } from '../services/geminiService';

interface FileUploadProps {
  label: string;
  docType: keyof UserEligibilityData['documents'];
  icon: any;
  value?: string;
  t: any;
  onUpload: (docType: keyof UserEligibilityData['documents'], file: File | null) => void;
  onClear: (docType: keyof UserEligibilityData['documents']) => void;
  selectedCategory?: string;
  isVerifying?: boolean;
  feedback?: { isValid: boolean; feedback: string };
  badgeText?: string;
}

const FileUploadArea: React.FC<FileUploadProps> = ({ label, docType, icon: Icon, value, t, onUpload, onClear, selectedCategory, isVerifying, feedback, badgeText }) => (
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
    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-3 min-h-[120px] cursor-pointer ${
      value 
        ? (feedback?.isValid ? 'border-emerald-500 bg-emerald-50' : feedback ? 'border-red-500 bg-red-50' : 'border-emerald-300 bg-emerald-50/30') 
        : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30'
    }`}>
      {isVerifying ? (
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <Loader2 size={24} className="text-emerald-600 animate-spin" />
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.verifying}</p>
        </div>
      ) : value ? (
        <>
          <div className="flex flex-col items-center text-center gap-2">
            {feedback?.isValid ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <FileCheck size={24} />
                <span className="text-xs font-black uppercase tracking-wider">{t.docValid}</span>
              </div>
            ) : feedback ? (
              <div className="flex flex-col items-center gap-1 text-red-600">
                <AlertCircle size={24} />
                <span className="text-xs font-black uppercase tracking-wider">{t.docInvalid}</span>
                <p className="text-[9px] font-medium leading-tight max-w-[150px]">{feedback.feedback}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600">
                <FileText size={24} />
                <span className="text-xs font-black uppercase tracking-wider">{t.verified}</span>
              </div>
            )}
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onClear(docType); }} className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 rounded-full hover:text-red-500 shadow-sm border border-slate-100 transition-colors"><X size={12}/></button>
        </>
      ) : (
        <>
          <Icon size={24} className="text-slate-300" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.dropFiles}</p>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={(e) => onUpload(docType, e.target.files ? e.target.files[0] : null)}/>
        </>
      )}
    </div>
  </div>
);

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
    if (data.taluk && !taluks.includes(data.taluk) && data.taluk !== "") setIsManualTaluk(true);
    if (data.village && !predefinedVillages.includes(data.village) && data.village !== "") setIsManualVillage(true);
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
            onBulkUpdate(type, { district: res.district, taluk: res.taluk, village: res.village, pincode: res.pincode });
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
    <div className={`space-y-4 p-6 rounded-2xl border ${disabled ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm"><MapPin size={16} className="text-emerald-600" /> {title}</h4>
        {!disabled && (
          <button type="button" onClick={detectLocation} disabled={isDetecting} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50">
            {isDetecting ? <Loader2 size={12} className="animate-spin" /> : <Locate size={12} />}
            {isDetecting ? t.detecting : t.detectLocation}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.doorNo}</label>
          <input type="text" value={data.doorNo} onChange={(e) => onChange(type, 'doorNo', e.target.value)} disabled={disabled} placeholder="e.g. 12/A, Flat 4B" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.district}</label>
          <select value={data.district} onChange={(e) => onChange(type, 'district', e.target.value)} disabled={disabled} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat">
            <option value="">{t.district}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.taluk}</label>
          {!isManualTaluk ? (
            <select value={data.taluk} onChange={(e) => handleTalukSelect(e.target.value)} disabled={disabled || !data.district} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat">
              <option value="">{t.selectTaluk}</option>
              {taluks.map(tk => <option key={tk} value={tk}>{tk}</option>)}
              <option value={t.other} className="font-bold text-emerald-600 italic">+ {t.other}</option>
            </select>
          ) : (
            <div className="relative animate-in fade-in duration-200">
              <input type="text" value={data.taluk} onChange={(e) => onChange(type, 'taluk', e.target.value)} disabled={disabled} placeholder={t.typeTalukName} className="w-full pl-3 pr-8 py-2 bg-emerald-50 border border-emerald-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm" autoFocus />
              <button type="button" onClick={() => { setIsManualTaluk(false); onChange(type, 'taluk', ''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.village}</label>
          {!isManualVillage ? (
            <select value={data.village} onChange={(e) => handleVillageSelect(e.target.value)} disabled={disabled || !data.taluk} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat">
              <option value="">{t.selectVillage}</option>
              {predefinedVillages.map(v => <option key={v} value={v}>{v}</option>)}
              <option value={t.other} className="font-bold text-emerald-600 italic">+ {t.other}</option>
            </select>
          ) : (
            <div className="relative animate-in fade-in duration-200">
              <input type="text" value={data.village} onChange={(e) => onChange(type, 'village', e.target.value)} disabled={disabled} placeholder={t.typeVillageName} className="w-full pl-3 pr-8 py-2 bg-emerald-50 border border-emerald-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm" autoFocus />
              <button type="button" onClick={() => { setIsManualVillage(false); onChange(type, 'village', ''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.pincode}</label>
          <input type="text" value={data.pincode} onChange={(e) => onChange(type, 'pincode', e.target.value)} disabled={disabled} maxLength={6} placeholder="600001" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
        </div>
      </div>
    </div>
  );
};

interface MyProfileProps {
    language: Language;
    onTriggerAlert?: (type: 'email' | 'phone', message: string, sub: string) => void;
}

const MyProfile: React.FC<MyProfileProps> = ({ language, onTriggerAlert }) => {
  const t = translations[language];
  const isTa = language === 'ta';
  const sessionIdentifier = localStorage.getItem('current_session') || '';
  const [isManualAge, setIsManualAge] = useState(false);
  
  const isPhone = /^\d{10}$/.test(sessionIdentifier);
  const isEmail = sessionIdentifier.includes('@');

  const [profileData, setProfileData] = useState<UserEligibilityData>({
    name: '', 
    phone: isPhone ? sessionIdentifier : '', 
    email: isEmail ? sessionIdentifier : '', 
    dob: '', aadhar: '', smartCard: '', income: 0, incomePeriod: 'annual', familyAssets: '', location: 'Tamil Nadu', category: 'FC', gender: 'Male', age: 0, occupation: '', education: '', employmentStatus: 'Unemployed', familySize: 1, isDisabled: false,
    permAddress: { doorNo: '', village: '', taluk: '', district: '', pincode: '' },
    tempAddress: { doorNo: '', village: '', taluk: '', district: '', pincode: '' },
    isSameAddress: false,
    documents: {}
  });
  
  const [saveStatus, setSaveStatus] = useState(false);
  const [verifyingDocs, setVerifyingDocs] = useState<Record<string, boolean>>({});
  const [docFeedback, setDocFeedback] = useState<Record<string, { isValid: boolean; feedback: string }>>({});

  useEffect(() => {
    if (sessionIdentifier) {
      const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
      if (saved) setProfileData(JSON.parse(saved));
    }
  }, [sessionIdentifier]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) age--;
    return Math.max(0, age);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isSameAddress') setProfileData(prev => ({ ...prev, isSameAddress: checked, tempAddress: checked ? { ...prev.permAddress } : prev.tempAddress }));
      else setProfileData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'dob') {
      const calculatedAge = calculateAge(value);
      setProfileData(prev => ({ ...prev, dob: value, age: calculatedAge }));
    } else if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setProfileData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'aadhar' || name === 'smartCard') {
      const cleaned = value.replace(/\D/g, '').slice(0, 12);
      setProfileData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: (name === 'income' || name === 'age' || name === 'familySize') ? (name === 'familySize' && value === 'More than 5' ? 6 : parseInt(value) || 0) : value }));
    }
  };

  const handleAddressChange = (type: 'perm' | 'temp', field: string, value: string) => {
    setProfileData(prev => {
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
    setProfileData(prev => {
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
      setProfileData(prev => ({ ...prev, documents: { ...prev.documents, [docType]: base64 } }));
      try {
        const check = await verifyDocumentQuality(base64, docType, language);
        setDocFeedback(prev => ({ ...prev, [docType]: check }));

        // Trigger simulation if document is rejected by AI
        if (!check.isValid && onTriggerAlert) {
            onTriggerAlert(
                'email', 
                t.notifyActionNeeded, 
                t.notifyEmailSentDesc.replace('{email}', profileData.email || 'your account')
            );
        }
      } catch (err) {
        setDocFeedback(prev => ({ ...prev, [docType]: { isValid: false, feedback: "AI verification failed." } }));
      } finally {
        setVerifyingDocs(prev => ({ ...prev, [docType]: false }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearDocument = (docType: keyof UserEligibilityData['documents']) => {
    setProfileData(p => ({ ...p, documents: { ...p.documents, [docType]: undefined } }));
    setDocFeedback(prev => { const next = { ...prev }; delete next[docType]; return next; });
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionIdentifier) {
      localStorage.setItem(`user_profile_${sessionIdentifier}`, JSON.stringify(profileData));
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.myProfile}</h2>
          <p className="text-slate-500 text-lg">Master Citizen Profile for Tamil Nadu e-Governance</p>
        </div>
        {saveStatus && <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 animate-bounce"><CheckCircle size={16} /> {t.profileSaved}</div>}
      </div>

      <form onSubmit={saveProfile} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-10">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20} /></div>{t.identificationDetails}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.fullName}</label>
                    <input type="text" name="name" value={profileData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" required />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.phoneNumber}</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 pointer-events-none">
                        <Phone className="text-slate-400" size={14} />
                        <span className="text-slate-600 font-bold text-sm">+91</span>
                      </div>
                      <input type="tel" name="phone" value={profileData.phone} onChange={handleInputChange} placeholder="00000 00000" className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.emailLabel} ({isTa ? "விருப்பமானது" : "Optional"})</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 pointer-events-none">
                        <Mail className="text-slate-400" size={14} />
                      </div>
                      <input type="email" name="email" value={profileData.email || ''} onChange={handleInputChange} placeholder="name@example.com" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" />
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dateOfBirth}</label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input type="checkbox" checked={isManualAge} onChange={(e) => setIsManualAge(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-600 uppercase tracking-tighter transition-colors">{t.dontKnowDob}</span>
                        </label>
                      </div>
                      {!isManualAge ? (
                        <div className="relative">
                          <input type="date" name="dob" value={profileData.dob} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" required />
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
                          value={profileData.age || ''} 
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
                      <select name="gender" value={profileData.gender} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
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
                      <input type="text" name="aadhar" value={profileData.aadhar} onChange={handleInputChange} maxLength={12} placeholder="1234 5678 9012" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-black text-base tracking-widest focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Home size={20} /></div>{t.permAddress}</h3>
                <div className="grid grid-cols-1 gap-8">
                  <AddressBlock title={t.permAddress} type="perm" data={profileData.permAddress} t={t} language={language} onChange={handleAddressChange} onBulkUpdate={handleBulkAddressUpdate} />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="font-bold text-slate-900 text-sm">{t.tempAddress}</h4>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" name="isSameAddress" checked={profileData.isSameAddress} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600 transition-colors uppercase tracking-widest">{t.sameAsPerm}</span>
                      </label>
                    </div>
                    <AddressBlock title={t.tempAddress} type="temp" data={profileData.tempAddress} disabled={profileData.isSameAddress} t={t} language={language} onChange={handleAddressChange} onBulkUpdate={handleBulkAddressUpdate} />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Landmark size={20} /></div>{t.demographics}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.smartCard}</label><input type="text" name="smartCard" value={profileData.smartCard} onChange={handleInputChange} maxLength={12} placeholder="0000 0000 0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-black text-base tracking-widest focus:ring-2 focus:ring-emerald-500" /></div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.category}</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select name="category" value={profileData.category} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
                        <option value="FC">{t.fc}</option>
                        <option value="BC">{t.bc}</option>
                        <option value="MBC/DNC">{t.mbc_dnc}</option>
                        <option value="SC">{t.sc}</option>
                        <option value="ST">{t.st}</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 md:items-end">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{profileData.incomePeriod === 'monthly' ? t.monthlyIncome : t.annualIncome}</label>
                        <div className="flex bg-slate-200 p-0.5 rounded-lg">
                          <button type="button" onClick={() => setProfileData(p => ({ ...p, incomePeriod: 'monthly' }))} className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${profileData.incomePeriod === 'monthly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{t.monthly}</button>
                          <button type="button" onClick={() => setProfileData(p => ({ ...p, incomePeriod: 'annual' }))} className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${profileData.incomePeriod === 'annual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{t.annual}</button>
                        </div>
                      </div>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="number" name="income" value={profileData.income || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-lg" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t.familySize}</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select name="familySize" value={profileData.familySize === 6 ? 'More than 5' : profileData.familySize} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-black text-lg">
                          <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="More than 5">{t.moreThan5}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.employmentStatus}</label>
                    <select name="employmentStatus" value={profileData.employmentStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
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
                      <option value="Fisherman / Fisherman">{t.fisherman}</option>
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
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.education}</label>
                    <select name="education" value={profileData.education} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat transition-all font-medium">
                      <option value="">{t.selectQualification}</option>
                      <option value="Illiterate">{isTa ? "கல்வியறிவற்றவர்" : "Illiterate"}</option>
                      <option value="Below 10th">{isTa ? "10-ஆம் வகுப்புக்குக் கீழே" : "Below 10th"}</option>
                      <option value="10th Pass">{isTa ? "10-ஆம் வகுப்பு தேர்ச்சி" : "10th Pass"}</option>
                      <option value="12th Pass">{isTa ? "12-ஆம் வகுப்பு தேர்ச்சி" : "12th Pass"}</option>
                      <option value="Graduate">{isTa ? "பட்டதாரி" : "Graduate"}</option>
                      <option value="Post Graduate">{isTa ? "முதுகலை பட்டதாரி" : "Post Graduate"}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 h-fit sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FileText size={20} /></div>{t.welfareVerification}</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                <FileUploadArea label={t.uploadAadhar} docType="aadharCard" icon={CreditCard} value={profileData.documents.aadharCard} t={t} onUpload={handleFileUpload} onClear={handleClearDocument} isVerifying={verifyingDocs.aadharCard} feedback={docFeedback.aadharCard} />
                <FileUploadArea label={t.uploadRation} docType="rationCard" icon={FileText} value={profileData.documents.rationCard} t={t} onUpload={handleFileUpload} onClear={handleClearDocument} isVerifying={verifyingDocs.rationCard} feedback={docFeedback.rationCard} />
                <FileUploadArea label={t.uploadIncome} docType="incomeCert" icon={Banknote} value={profileData.documents.incomeCert} t={t} onUpload={handleFileUpload} onClear={handleClearDocument} isVerifying={verifyingDocs.incomeCert} feedback={docFeedback.incomeCert} />
                <FileUploadArea label={t.uploadCommunity} docType="communityCert" icon={Tag} value={profileData.documents.communityCert} t={t} onUpload={handleFileUpload} onClear={handleClearDocument} selectedCategory={profileData.category} isVerifying={verifyingDocs.communityCert} feedback={docFeedback.communityCert} />
                <FileUploadArea label={t.uploadEdu} docType="eduCert" icon={BookOpen} value={profileData.documents.eduCert} t={t} onUpload={handleFileUpload} onClear={handleClearDocument} isVerifying={verifyingDocs.eduCert} feedback={docFeedback.eduCert} badgeText={profileData.education} />
              </div>
              <button type="submit" className="w-full py-4 mt-8 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-all active:scale-95"><Save size={20} /> {t.saveProfile}</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;
