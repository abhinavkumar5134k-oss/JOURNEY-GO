import { useState, useEffect, useRef } from 'react';
import {
  Shield, Phone, MapPin, Building2, Cross, Pill, Flame,
  AlertTriangle, Share2, X, Loader2, Navigation, Clock,
  ShieldAlert, PhoneCall, MessageCircleWarning, Globe
} from 'lucide-react';
import { useEmergencyServices } from '../hooks/useEmergencyServices';
import type { Page, UserLocation } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

// India National Emergency Helplines
const NATIONAL_HELPLINES = [
  { id: 'nh1', name: 'Emergency (All India)', phone: '112', icon: ShieldAlert, color: 'red', description: 'Unified emergency response' },
  { id: 'nh2', name: 'Women Helpline', phone: '181', icon: Phone, color: 'pink', description: '24/7 Women in Distress' },
  { id: 'nh3', name: 'Women Power Line', phone: '1091', icon: Shield, color: 'pink', description: 'Women Protection' },
  { id: 'nh4', name: 'Police Control Room', phone: '100', icon: Building2, color: 'blue', description: 'Police Emergency' },
  { id: 'nh5', name: 'Child Helpline', phone: '1098', icon: PhoneCall, color: 'orange', description: 'Child in Distress' },
  { id: 'nh6', name: 'Ambulance', phone: '102 / 108', icon: Cross, color: 'green', description: 'Medical Emergency' },
  { id: 'nh7', name: 'Fire Brigade', phone: '101', icon: Flame, color: 'orange', description: 'Fire Emergency' },
  { id: 'nh8', name: 'Cyber Crime', phone: '1930', icon: Globe, color: 'slate', description: 'Report Cyber Crime' },
];

function getDistanceFromLatLon(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function EmergencyHub({ onNavigate }: Props) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const { nearby, loading, fetchNearby } = useEmergencyServices();

  // Watch position for dynamic updates
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported on this device');
      setLocating(false);
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      const newLoc: UserLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };
      setLocation(newLoc);
      setLocationError(null);
      setLocating(false);
      setLastUpdate(new Date());

      // Check if moved > 500m
      if (lastPosRef.current) {
        const dist = getDistanceFromLatLon(
          lastPosRef.current.lat, lastPosRef.current.lng,
          newLoc.lat, newLoc.lng
        );
        if (dist > 0.5) {
          fetchNearby(newLoc);
        }
      } else {
        fetchNearby(newLoc);
      }
      lastPosRef.current = { lat: newLoc.lat, lng: newLoc.lng };
    };

    const onError = (err: GeolocationPositionError) => {
      setLocationError(err.message);
      setLocating(false);
    };

    // Initial position
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });

    // Watch position for updates
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    });

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [fetchNearby]);

  function shareLocation() {
    if (!location) return;
    const msg = `🆘 EMERGENCY - I need help!

📍 My current location:
https://www.google.com/maps?q=${location.lat},${location.lng}

Accuracy: ${Math.round(location.accuracy)}m
Time: ${new Date().toLocaleString('en-IN')}

Sent via TrackMate Safety Feature`;

    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  }

  function makeCall(phone: string) {
    window.location.href = `tel:${phone.replace(/\s|\/+/g, '')}`;
  }

  const police = nearby.filter(s => s.type === 'police').slice(0, 2);
  const hospitals = nearby.filter(s => s.type === 'hospital').slice(0, 2);
  const pharmacies = nearby.filter(s => s.type === 'pharmacy').slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 pt-12 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldAlert size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Emergency Hub</h1>
                <p className="text-red-100 text-xs">Women Safety & Quick Access</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Quick SOS */}
          <button
            onClick={() => makeCall('112')}
            className="w-full bg-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg active:scale-98 transition-transform"
          >
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-400">
              <Phone size={28} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-red-600">SOS - 112</p>
              <p className="text-xs text-gray-500">Tap for Emergency Call</p>
            </div>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Location Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location ? 'bg-green-50' : 'bg-gray-100'}`}>
                <MapPin size={20} className={location ? 'text-green-600' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {locating ? 'Detecting location...' : location ? 'Location Active' : 'Location Unavailable'}
                </p>
                {location && (
                  <p className="text-xs text-gray-500">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </p>
                )}
                {locationError && (
                  <p className="text-xs text-red-500">{locationError}</p>
                )}
              </div>
            </div>
            {location && (
              <button
                onClick={shareLocation}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-xl text-blue-600 text-xs font-semibold"
              >
                <Share2 size={14} />
                Share
              </button>
            )}
          </div>
          {lastUpdate && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              Last updated: {lastUpdate.toLocaleTimeString('en-IN')}
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin" />
              Fetching nearby emergency services...
            </div>
          )}
        </div>

        {/* National Helplines */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="font-bold text-gray-800">National Helplines</h2>
            </div>
          </div>
          <div className="p-2 grid grid-cols-1 gap-1">
            {NATIONAL_HELPLINES.map((helpline, idx) => {
              const Icon = helpline.icon;
              const colorMap: Record<string, string> = {
                red: 'bg-red-50 text-red-600 border-red-200',
                pink: 'bg-pink-50 text-pink-600 border-pink-200',
                blue: 'bg-blue-50 text-blue-600 border-blue-200',
                green: 'bg-green-50 text-green-600 border-green-200',
                orange: 'bg-orange-50 text-orange-600 border-orange-200',
                slate: 'bg-slate-50 text-slate-600 border-slate-200',
              };
              const colors = colorMap[helpline.color] || colorMap.slate;

              return (
                <button
                  key={helpline.id}
                  onClick={() => makeCall(helpline.phone)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all active:scale-98 ${idx < 1 ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'}`}
                  style={idx < 1 ? { animation: 'pulse-border 2s infinite' } : {}}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-800">{helpline.name}</p>
                    <p className="text-xs text-gray-500">{helpline.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">{helpline.phone}</span>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone size={14} className="text-white" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nearby Services */}
        {nearby.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Navigation size={18} className="text-blue-600" />
              Nearby Emergency Services
              <span className="text-xs text-gray-500 font-normal">(dynamically fetched)</span>
            </h2>

            {/* Police Stations */}
            {police.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-blue-50 border-b border-gray-100 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Nearest Police Stations</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {police.map(s => (
                    <div key={s.id} className="p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                            <MapPin size={10} />
                            {s.distance?.toFixed(1)} km away
                          </span>
                          {s.available24h && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">24/7</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => makeCall(s.phone)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-xl text-white text-xs font-semibold"
                      >
                        <Phone size={12} />
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hospitals */}
            {hospitals.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-green-50 border-b border-gray-100 flex items-center gap-2">
                  <Cross size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Nearest Hospitals</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {hospitals.map(s => (
                    <div key={s.id} className="p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <MapPin size={10} />
                            {s.distance?.toFixed(1)} km away
                          </span>
                          {s.available24h && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">24/7</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => makeCall(s.phone)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 rounded-xl text-white text-xs font-semibold"
                      >
                        <Phone size={12} />
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pharmacies */}
            {pharmacies.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-teal-50 border-b border-gray-100 flex items-center gap-2">
                  <Pill size={16} className="text-teal-600" />
                  <span className="text-sm font-semibold text-teal-700">Nearby Pharmacies</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {pharmacies.map(s => (
                    <div key={s.id} className="p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-teal-600 flex items-center gap-1">
                            <MapPin size={10} />
                            {s.distance?.toFixed(1)} km away
                          </span>
                          {s.available24h && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">24/7</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => makeCall(s.phone)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 rounded-xl text-white text-xs font-semibold"
                      >
                        <Phone size={12} />
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Safety Tips */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircleWarning size={18} className="text-amber-400" />
            <h3 className="font-bold text-white text-sm">Quick Safety Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[8px] font-bold text-red-400">1</span>
              </span>
              <span>Stay in well-lit, populated areas. Avoid shortcuts through isolated areas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[8px] font-bold text-red-400">2</span>
              </span>
              <span>Share your trip details with family/friends when traveling alone.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[8px] font-bold text-red-400">3</span>
              </span>
              <span>Keep emergency numbers saved on speed dial. Call 112 for any emergency.</span>
            </li>
          </ul>
        </div>

        {/* Extra padding for bottom nav */}
        <div className="h-20" />
      </div>
    </div>
  );
}

