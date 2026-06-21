import { useState } from 'react';
import { Navigation, MapPin, Layers, Zap, ChevronRight } from 'lucide-react';
import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    icon: MapPin,
    bg: 'bg-white',
    iconBg: 'bg-gray-900',
    iconColor: 'text-white',
    title: 'Find the best routes\nfrom any location',
    tag: 'Smart Routing',
  },
  {
    icon: Layers,
    bg: 'bg-blue-600',
    iconBg: 'bg-white',
    iconColor: 'text-blue-600',
    title: 'Compare Bus, Metro,\nTrain & Cab options',
    tag: 'Multi-modal',
  },
  {
    icon: Zap,
    bg: 'bg-amber-400',
    iconBg: 'bg-white',
    iconColor: 'text-amber-500',
    title: 'Book instantly,\ntravel seamlessly',
    tag: 'Quick Booking',
  },
];

export default function Onboarding({ onNavigate }: Props) {
  const [slide, setSlide] = useState(0);

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: 300 }}>
        <img
          src="https://images.pexels.com/photos/2104742/pexels-photo-2104742.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="City skyline at dusk"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(248,250,252,1) 100%)' }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-5 pt-12 flex items-center justify-between">
          <div className="bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-white text-xs font-semibold">Live tracking</span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-gray-800 text-xs font-bold">4.9</span>
            <span className="text-gray-500 text-xs">rated</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col bg-slate-50 px-5 -mt-2">
        {/* Branding */}
        <div className="flex flex-col items-center py-5">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-11 h-11 bg-gray-900 rounded-[14px] flex items-center justify-center shadow-lg">
              <Navigation size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[26px] font-bold tracking-tight text-gray-900">TrackMate</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">AI-guided travel companion</p>
        </div>

        {/* Feature cards carousel */}
        <div className="flex gap-3 overflow-x-visible mb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            const isActive = i === slide;
            return (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`flex-shrink-0 rounded-2xl p-4 text-left transition-all duration-300 ${f.bg} ${
                  isActive ? 'shadow-lg' : 'opacity-80'
                }`}
                style={{ width: isActive ? 220 : 80, minHeight: 140 }}
              >
                <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center shadow-sm mb-3`}>
                  <Icon size={22} className={f.iconColor} />
                </div>
                {isActive && (
                  <>
                    <p className={`text-sm font-bold leading-snug whitespace-pre-line mb-2 ${f.bg === 'bg-blue-600' || f.bg === 'bg-amber-400' ? 'text-white' : 'text-gray-900'}`}>
                      {f.title}
                    </p>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      f.bg === 'bg-blue-600' ? 'bg-blue-500 text-white' :
                      f.bg === 'bg-amber-400' ? 'bg-amber-300 text-amber-900' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {f.tag}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mb-6">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? 'w-6 bg-gray-900' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3 pb-8 mt-4">
          <button
            onClick={() => onNavigate('auth')}
            className="w-full bg-gray-900 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform"
          >
            Get Started
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onNavigate('auth')}
            className="w-full text-center text-sm text-gray-500 py-1"
          >
            Already have an account?{' '}
            <span className="font-bold text-gray-900 underline underline-offset-2">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}





