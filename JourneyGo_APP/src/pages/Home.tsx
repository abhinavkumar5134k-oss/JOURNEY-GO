import { useState } from 'react';
import { MapPin, ArrowUpDown, Navigation, ChevronRight, Bell, Star, Zap } from 'lucide-react';
import TrainSchedule from '../components/TrainSchedule';
import type { Page, TransportMode, UserProfile } from '../types';
import { RECENT_ROUTES } from '../data/locations';

interface Props {
  profile: UserProfile | null;
  onNavigate: (page: Page) => void;
  onPlanJourney: (from: string, to: string) => void;
}

type ChipMode = TransportMode | 'all';

const chips: { id: ChipMode; label: string; emoji: string }[] = [
  { id: 'bus', label: 'Bus', emoji: '🚌' },
  { id: 'metro', label: 'Train', emoji: '🚇' },
  { id: 'auto', label: 'Auto', emoji: '🛺' },
  { id: 'cab', label: 'Cab', emoji: '🚕' },
  { id: 'combined', label: 'More', emoji: '🗺️' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Home({ profile, onNavigate, onPlanJourney }: Props) {
  const [from, setFrom] = useState('Current Location — Howrah Railway Station, Kolkata');
  const [to, setTo] = useState('');
  const [activeChip, setActiveChip] = useState<ChipMode>('bus');

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Traveller';

  function handlePlan() {
    if (to.trim()) {
      onPlanJourney(from, to);
    } else {
      onNavigate('search');
    }
  }

  return (
    <div className="bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-sm text-gray-500 font-medium">{greeting()},</p>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-1.5 mt-0.5">
              {firstName}
              <span className="text-xl">👋</span>
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center relative"
              onClick={() => {}}
            >
              <Bell size={17} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">{firstName[0]?.toUpperCase() ?? 'G'}</span>
            </div>
          </div>
        </div>

        {/* Journey planner card */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          {/* Inputs */}
          <div className="space-y-2 mb-3.5">
            {/* From */}
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <div className="w-px h-3.5 bg-gray-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">From</p>
                <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{from.replace('Current Location — ', '')}</p>
              </div>
              <button
                onClick={() => { const tmp = from; setFrom(to || ''); setTo(tmp); }}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md active:scale-90 transition-transform"
              >
                <ArrowUpDown size={14} className="text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* To */}
            <div
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() => onNavigate('search')}
            >
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <div className="w-px h-3.5 bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">To</p>
                <p className={`text-sm font-semibold mt-0.5 ${to ? 'text-gray-800' : 'text-gray-400'}`}>
                  {to || 'Enter destination'}
                </p>
              </div>
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            </div>
          </div>

          <button
            onClick={handlePlan}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
          >
            <Navigation size={16} strokeWidth={2.5} />
            Plan My Journey
          </button>
        </div>
      </div>

      {/* Transport chips */}
      <div className="px-5 mt-4">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
          {chips.map(c => {
            const active = activeChip === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChip(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap flex-shrink-0 transition-all font-semibold text-sm shadow-sm ${
                  active
                    ? 'bg-blue-600 text-white shadow-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="text-base leading-none">{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Routes */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-gray-900">Recent Routes</h2>
          <button
            onClick={() => onNavigate('search')}
            className="text-sm text-blue-600 font-semibold flex items-center gap-0.5"
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {RECENT_ROUTES.slice(0, 2).map((route, i) => (
            <button
              key={i}
              onClick={() => onPlanJourney(route.from, route.to)}
              className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform text-left"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">
                  <span className="truncate">{route.from}</span>
                  <span className="text-gray-400 font-normal mx-1">→</span>
                  <span className="truncate">{route.to}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {route.distance} km
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                    <Star size={10} className="fill-amber-400" /> {(4.2 + i * 0.2).toFixed(1)}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Quick action tiles */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('bookings')}
            className="bg-blue-600 rounded-2xl p-4 text-left shadow-md active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Zap size={18} className="text-white" />
            </div>
            <p className="text-white font-bold text-sm">My Bookings</p>
            <p className="text-blue-100 text-xs mt-0.5 font-medium">View all trips</p>
          </button>
          <button
            onClick={() => onNavigate('wishlist')}
            className="bg-white rounded-2xl p-4 text-left border border-gray-100 shadow-sm active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center mb-3">
              <Star size={18} className="text-red-500" />
            </div>
            <p className="text-gray-900 font-bold text-sm">Saved Routes</p>
            <p className="text-gray-500 text-xs mt-0.5 font-medium">Your favourites</p>
          </button>
        </div>
      </div>

      {/* Train Schedule Dashboard */}
      <div className="px-5 mt-5">
        <TrainSchedule />
      </div>

    </div>
  );
}
