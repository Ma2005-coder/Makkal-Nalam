
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Loader2, Info } from 'lucide-react';
import { searchNearbyCenters } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../translations';

const ServiceCenters: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ text: string; sources: any[] } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const findCenters = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchNearbyCenters(lat, lng, language);
      setData(results);
    } catch (err) {
      setError(t.errConnect);
    } finally {
      setLoading(false);
    }
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setError(t.locationError);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        findCenters(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        setError(t.locationError);
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t.findHelp}</h2>
        <p className="text-slate-500">{t.locateHelpCenters}</p>
      </div>

      {!location && !loading && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Navigation size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t.locationRequired}</h3>
          <button
            onClick={handleGeoLocation}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto"
          >
            <MapPin size={18} /> {t.useLocation}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-emerald-600" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.findingCenters}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-700 text-center font-medium">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="text-emerald-600" /> {t.serviceCenters}
            </h3>
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed mb-8">
              {data.text}
            </div>

            {data.sources && data.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t.officialSources}</h4>
                <div className="flex flex-wrap gap-3">
                  {data.sources.map((source: any, i: number) => {
                    const url = source.web?.uri || source.maps?.uri;
                    const title = source.web?.title || source.maps?.title || t.centerDetails;
                    if (!url) return null;
                    return (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100 hover:bg-emerald-200 transition-colors"
                      >
                        <ExternalLink size={12} /> {title}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCenters;
