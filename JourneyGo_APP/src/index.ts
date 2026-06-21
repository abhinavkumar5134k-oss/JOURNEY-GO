export type TransportMode = 'metro' | 'bus' | 'train' | 'auto' | 'cab' | 'combined';

export interface Location {
  name: string;
  area: string;
  city: string;
}

export interface RouteSegment {
  mode: TransportMode;
  name: string;
  from: string;
  to: string;
  duration: number;
  price: number;
}

export interface RouteOption {
  id: string;
  mode: TransportMode;
  name: string;
  price: number;
  priceDisplay: string;
  duration: number;
  distance: number;
  rating: number;
  recommended: boolean;
  segments: RouteSegment[];
  color: string;
  seats?: number;
  nextDeparture?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  transport_mode: TransportMode;
  route_name: string;
  price: number;
  duration_minutes: number;
  distance_km: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  booking_ref: string;
  scheduled_at: string | null;
  segments: RouteSegment[];
  created_at: string;
  updated_at: string;
}

export interface SavedRoute {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  transport_mode: TransportMode;
  route_name: string;
  price_estimate: string;
  duration_minutes: number;
  distance_km: number;
  rating: number;
  notes: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  home_location: string | null;
  work_location: string | null;
  created_at: string;
  updated_at: string;
}

export type Page =
  | 'onboarding'
  | 'auth'
  | 'home'
  | 'search'
  | 'route-options'
  | 'booking-confirm'
  | 'booking-success'
  | 'bookings'
  | 'wishlist'
  | 'emergency'
  | 'account';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'police' | 'hospital' | 'pharmacy' | 'helpline';
  distance?: number;
  address?: string;
  available24h?: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}
