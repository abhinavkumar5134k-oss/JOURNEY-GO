import { useState } from 'react';
import { ArrowLeft, Search as SearchIcon, MapPin, Clock, ArrowRight, Navigation2 } from 'lucide-react';
import type { Page } from '../types';
import { POPULAR_LOCATIONS, RECENT_ROUTES } from '../data/locations';

interface Props {
  initialFrom?: string;
  onNavigate: (page: Page) => void;
  onPlanJourney: (from: string, to: string) => void;
}

export default function Search({ initialFrom = 'Howrah Railway Station, Kolkata', onNavigate, onPlanJourney }: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState('');
  const [focus, setFocus] = useState<'from' | 'to'>('to');
  const [query, setQuery] = useState('');

  const filtered = POPULAR_LOCATIONS.filter(l =>
    (l.name + ' ' + l.area + ' ' + l.city).toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  function selectLocation(name: string) {
    const loc = POPULAR_LOCATIONS.find(l => l.name === name);
    const full = loc ? `${name}, ${loc.city}` : `${name}, Jharkhand`;
    if (focus === 'from') {
      setFrom(full);
      setFocus('to');
    } else {
      setTo(full);
    }
    setQuery('');
  }

  function handlePlan() {
    if (from && to) onPlanJourney(from, to);
  }

  const canSearch = from.trim() && to.trim();

  return (
    <div className="flex flex-col bg-white min-h-full">
      {/* Sticky top */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('home')}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Plan Journey</h1>
        </div>

        {/* From / To */}
        <div className="bg-gray-50 rounded-2xl p-3 space-y-2 border border-gray-100 mb-3">
          <button
            onClick={() => { setFocus('from'); setQuery(''); }}
            className={`w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 transition-all ${
              focus === 'from' ? 'border-blue-500' : 'border-gray-100'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">From</p>
              <p className={`text-sm font-semibold truncate mt-0.5 ${from ? 'text-gray-800' : 'text-gray-400'}`}>
                {from || 'Select origin'}
              </p>
            </div>
            {focus === 'from' && <div className="w-1.5 h-5 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />}
          </button>

          <button
            onClick={() => { setFocus('to'); setQuery(''); }}
            className={`w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 transition-all ${
              focus === 'to' ? 'border-blue-500' : 'border-gray-100'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">To</p>
              <p className={`text-sm font-semibold truncate mt-0.5 ${to ? 'text-gray-800' : 'text-gray-400'}`}>
                {to || 'Enter destination'}
              </p>
            </div>
            {focus === 'to' && <div className="w-1.5 h-5 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />}
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <SearchIcon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${focus} location...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {canSearch && (
          <button
            onClick={handlePlan}
            className="w-full mt-3 bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.97] transition-transform"
          >
            <Navigation2 size={16} strokeWidth={2.5} />
            Find Routes
          </button>
        )}
      </div>

      {/* Results */}
      <div className="px-5 pt-5 pb-6 flex-1">
        {query ? (
          <>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Search Results</p>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <MapPin size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500 font-medium">No locations found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(loc.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{loc.name}</p>
                      <p className="text-xs text-gray-500">{loc.area}, {loc.city}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recent */}
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Recent Routes</p>
            <div className="space-y-1 mb-6">
              {RECENT_ROUTES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { setFrom(r.from + ', Kolkata'); setTo(r.to + (r.to.includes(',') ? '' : ', Jharkhand')); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={15} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.from} → {r.to}</p>
                    <p className="text-xs text-gray-500">{r.distance} km</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Popular */}
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Popular Destinations</p>
            <div className="space-y-1">
              {POPULAR_LOCATIONS.slice(0, 7).map((loc, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(loc.name)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{loc.name}</p>
                    <p className="text-xs text-gray-500">{loc.area}, {loc.city}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


