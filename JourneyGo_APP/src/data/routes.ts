import type { RouteOption, TransportMode } from '../types';
import { CHAIBASA_PLACES } from './locations';

function getDistance(from: string, to: string): number {
  // Try to compute real distance from known place coordinates
  const fromPlace = CHAIBASA_PLACES.find(p => from.toLowerCase().includes(p.name.toLowerCase()));
  const toPlace = CHAIBASA_PLACES.find(p => to.toLowerCase().includes(p.name.toLowerCase()));

  if (fromPlace && toPlace) {
    const R = 6371;
    const dLat = (toPlace.lat - fromPlace.lat) * Math.PI / 180;
    const dLon = (toPlace.lng - fromPlace.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(fromPlace.lat * Math.PI / 180) * Math.cos(toPlace.lat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }

  const hash = (from + to).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round((((hash % 30) + 5) * 10)) / 10;
}

function getTime(): string {
  const now = new Date();
  const mins = Math.floor(Math.random() * 10) + 3;
  now.setMinutes(now.getMinutes() + mins);
  return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function generateRoutes(from: string, to: string): RouteOption[] {
  const dist = getDistance(from, to);
  const seed = (from + to).split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const routes: RouteOption[] = [
    {
      id: 'train-' + seed,
      mode: 'train',
      name: 'Steel Express (12814)',
      price: Math.max(40, Math.round(dist * 1.8)),
      priceDisplay: `₹${Math.max(40, Math.round(dist * 1.8))}`,
      duration: Math.round(dist * 1.1),
      distance: dist,
      rating: 4.8,
      recommended: dist > 20,
      color: '#7C3AED',
      nextDeparture: getTime(),
      seats: 550,
      segments: [
        {
          mode: 'auto',
          name: 'Auto to Station',
          from,
          to: 'Nearest Railway Station',
          duration: 10,
          price: 40,
        },
        {
          mode: 'train',
          name: 'Steel Express',
          from: 'Nearest Railway Station',
          to: 'Destination Station',
          duration: Math.round(dist * 1.1) - 20,
          price: Math.max(40, Math.round(dist * 1.8)) - 80,
        },
        {
          mode: 'cab',
          name: 'Last Mile Cab',
          from: 'Destination Station',
          to,
          duration: 10,
          price: 40,
        },
      ],
    },
    {
      id: 'metro-' + seed,
      mode: 'metro',
      name: 'Vande Bharat Express (20898)',
      price: Math.round((dist * 2.5) / 5) * 5,
      priceDisplay: `₹${Math.round((dist * 2.5) / 5) * 5}`,
      duration: Math.round(dist * 0.9),
      distance: dist,
      rating: 4.9,
      recommended: dist > 50,
      color: '#2563EB',
      nextDeparture: getTime(),
      seats: 380,
      segments: [
        {
          mode: 'auto',
          name: 'Auto to Station',
          from,
          to: 'Boarding Station',
          duration: 8,
          price: 50,
        },
        {
          mode: 'metro',
          name: 'Vande Bharat Express',
          from: 'Boarding Station',
          to: 'Alighting Station',
          duration: Math.round(dist * 0.9) - 16,
          price: Math.round((dist * 2.5) / 5) * 5 - 90,
        },
        {
          mode: 'cab',
          name: 'Ola Auto',
          from: 'Alighting Station',
          to,
          duration: 8,
          price: 40,
        },
      ],
    },
    {
      id: 'bus-' + seed,
      mode: 'bus',
      name: `Inter-city Bus ${500 + (seed % 40)}`,
      price: Math.round(dist * 1.2),
      priceDisplay: `₹${Math.round(dist * 1.2)}`,
      duration: Math.round(dist * 1.95),
      distance: dist,
      rating: 4.1,
      recommended: false,
      color: '#16A34A',
      nextDeparture: getTime(),
      seats: 45,
      segments: [
        {
          mode: 'bus',
          name: `Bus Route ${500 + (seed % 40)}`,
          from,
          to,
          duration: Math.round(dist * 1.95),
          price: Math.round(dist * 1.2),
        },
      ],
    },
    {
      id: 'auto-' + seed,
      mode: 'auto',
      name: 'Auto Rickshaw / Toto',
      price: Math.round(dist * 7),
      priceDisplay: `₹${Math.round(dist * 6)}–${Math.round(dist * 8)}`,
      duration: Math.round(dist * 1.55),
      distance: dist,
      rating: 4.0,
      recommended: dist < 5,
      color: '#F59E0B',
      nextDeparture: getTime(),
      segments: [
        {
          mode: 'auto',
          name: 'Auto / Toto',
          from,
          to,
          duration: Math.round(dist * 1.55),
          price: Math.round(dist * 7),
        },
      ],
    },
    {
      id: 'cab-' + seed,
      mode: 'cab',
      name: 'Direct Highway Cab',
      price: Math.round(dist * 12),
      priceDisplay: `₹${Math.round(dist * 11)}–${Math.round(dist * 13)}`,
      duration: Math.round(dist * 1.3),
      distance: dist,
      rating: 4.3,
      recommended: false,
      color: '#0EA5E9',
      nextDeparture: getTime(),
      segments: [
        {
          mode: 'cab',
          name: 'Ola / Uber Cab',
          from,
          to,
          duration: Math.round(dist * 1.3),
          price: Math.round(dist * 12),
        },
      ],
    },
    {
      id: 'combined-' + seed,
      mode: 'combined',
      name: 'Smart Combo (Train + Auto)',
      price: Math.round(dist * 2.0),
      priceDisplay: `₹${Math.round(dist * 2.0)}`,
      duration: Math.round(dist * 1.3),
      distance: dist,
      rating: 4.5,
      recommended: dist > 10 && dist <= 50,
      color: '#0F766E',
      nextDeparture: getTime(),
      segments: [
        {
          mode: 'auto',
          name: 'Auto to Station',
          from,
          to: 'Connecting Station',
          duration: Math.round(dist * 0.2),
          price: Math.round(dist * 0.5),
        },
        {
          mode: 'train',
          name: 'MEMU Passenger',
          from: 'Connecting Station',
          to: 'Transfer Station',
          duration: Math.round(dist * 0.7),
          price: Math.round(dist * 1.0),
        },
        {
          mode: 'auto',
          name: 'Last Mile Auto',
          from: 'Transfer Station',
          to,
          duration: Math.round(dist * 0.3),
          price: Math.round(dist * 0.5),
        },
      ],
    },
  ];

  return routes.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.duration - b.duration;
  });
}

export const TRANSPORT_ICONS: Record<TransportMode, string> = {
  metro: '🚇',
  bus: '🚌',
  train: '🚆',
  auto: '🛺',
  cab: '🚕',
  combined: '🗺️',
};

export const TRANSPORT_COLORS: Record<TransportMode, string> = {
  metro: '#2563EB',
  bus: '#16A34A',
  train: '#7C3AED',
  auto: '#F59E0B',
  cab: '#0EA5E9',
  combined: '#0F766E',
};


