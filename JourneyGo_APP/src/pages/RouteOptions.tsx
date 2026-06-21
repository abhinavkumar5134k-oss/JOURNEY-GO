import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, SlidersHorizontal, Star, Clock, ChevronDown, ChevronUp, Heart, HeartOff, MapPin, Zap } from 'lucide-react';
import LeafletMap from '../components/LeafletMap';
import RouteWeather from '../components/RouteWeather';
import TransportBadge from '../components/TransportBadge';
import TrainSchedule from '../components/TrainSchedule';
import type { Page, RouteOption, TransportMode } from '../types';
import { generateRoutes } from '../data/routes';

interface Props {
  from: string;
  to: string;
  onNavigate: (page: Page) => void;
  onBook: (route: RouteOption) => void;
  onSave: (route: RouteOption) => void;
  isSaved: (routeName: string) => boolean;
}

type SortKey = 'recommended' | 'price' | 'duration';

const modeChips: { id: TransportMode | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'metro', label: 'Metro' },
  { id: 'bus', label: 'Bus' },
  { id: 'auto', label: 'Auto' },
  { id: 'cab', label: 'Cab' },
  { id: 'train', label: 'Train' },
  { id: 'combined', label: 'Combo' },
];

export default function RouteOptions({ from, to, onNavigate, onBook, onSave, isSaved }: Props) {
  const [activeMode, setActiveMode] = useState<TransportMode | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortKey>('recommended');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSort) return;
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSort]);

  const allRoutes = generateRoutes(from, to);
  const bestRoute = allRoutes.find(r => r.recommended) ?? allRoutes[0];

  // Extract destination city for weather ("IGI Airport, Delhi" → "Delhi")
  const weatherCity = to.split(',').pop()?.trim() ?? to.split(',')[0]?.trim() ?? 'Delhi';

  const filtered = allRoutes
    .filter(r => activeMode === 'all' || r.mode === activeMode)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'duration') return a.duration - b.duration;
      if (a.recommended) return -1;
      if (b.recommended) return 1;
      return a.duration - b.duration;
    });

  return (
    <div className="bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-[900]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Route Options</h1>
          </div>
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSort(!showSort)}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <SlidersHorizontal size={17} className="text-gray-600" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[1000] w-44 py-1 overflow-hidden">
                {(['recommended', 'price', 'duration'] as SortKey[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSortBy(s); setShowSort(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors ${
                      sortBy === s ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'recommended' ? '⭐ Recommended' : s === 'price' ? '💰 Lowest Price' : '⚡ Fastest'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Route pill */}
        <div className="bg-gray-50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-700 truncate flex-1">{from.split(',')[0]}</span>
          <span className="text-gray-400 text-xs">→</span>
          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-700 truncate flex-1">{to.split(',')[0]}</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Real Leaflet Map */}
        <LeafletMap
          from={from}
          to={to}
          distance={bestRoute.distance}
          duration={bestRoute.duration}
          interactive
        />

        {/* Weather along route — between map and routes */}
        <RouteWeather city={weatherCity} />

        {/* Train Schedule Dashboard */}
        <TrainSchedule />

        {/* Mode filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {modeChips.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveMode(id as TransportMode | 'all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeMode === id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">Available Travel Options</p>
          <p className="text-xs text-gray-400">{filtered.length} options</p>
        </div>

        {/* Route cards */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <MapPin size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No routes match this filter</p>
            </div>
          )}

          {filtered.map(route => {
            const expanded = expandedId === route.id;
            const saved = isSaved(route.name);

            return (
              <div
                key={route.id}
                className={`bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                  route.recommended
                    ? 'border-green-400 shadow-lg shadow-green-100'
                    : 'border-gray-100 shadow-sm'
                }`}
              >
                {route.recommended && (
                  <div className="bg-green-500 px-4 py-2 flex items-center gap-2">
                    <Zap size={12} className="text-white fill-white" />
                    <span className="text-white text-xs font-bold tracking-wide uppercase">Recommended · Best Value</span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <TransportBadge mode={route.mode} size="md" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{route.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{route.priceDisplay}</span>
                        <span className="text-gray-200">•</span>
                        <span className="flex items-center gap-0.5 text-xs text-gray-500">
                          <Clock size={10} />{route.duration}m
                        </span>
                        <span className="text-gray-200">•</span>
                        <span className="text-xs text-gray-500">{route.distance}km</span>
                        <span className="text-gray-200">•</span>
                        <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                          <Star size={10} className="fill-amber-400" />{route.rating}
                        </span>
                      </div>
                      {route.nextDeparture && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Next departure: {route.nextDeparture}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => onBook(route)}
                        className="bg-green-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-transform shadow-sm shadow-green-200"
                      >
                        Book
                      </button>
                      <button
                        onClick={() => onSave(route)}
                        className="flex items-center gap-1 text-xs font-semibold"
                      >
                        {saved
                          ? <><HeartOff size={13} className="text-red-400" /><span className="text-red-400">Saved</span></>
                          : <><Heart size={13} className="text-gray-400" /><span className="text-gray-400">Save</span></>
                        }
                      </button>
                    </div>
                  </div>

                  {route.segments.length > 1 && (
                    <button
                      onClick={() => setExpandedId(expanded ? null : route.id)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-semibold"
                    >
                      {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {expanded ? 'Hide' : 'Show'} {route.segments.length} journey segments
                    </button>
                  )}

                  {expanded && (
                    <div className="mt-3 pt-3 border-t border-gray-50 space-y-3">
                      {route.segments.map((seg, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <TransportBadge mode={seg.mode} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{seg.name}</p>
                            <p className="text-xs text-gray-500">{seg.from.split(',')[0]} → {seg.to.split(',')[0]}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-gray-900">₹{seg.price}</p>
                            <p className="text-xs text-gray-400">{seg.duration}m</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-1 border-t border-gray-50">
                        <span className="text-xs font-semibold text-gray-600">Total journey</span>
                        <span className="text-xs font-bold text-gray-900">{route.priceDisplay} · {route.duration}m</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}




