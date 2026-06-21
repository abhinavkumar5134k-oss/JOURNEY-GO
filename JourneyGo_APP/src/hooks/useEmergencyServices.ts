import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { EmergencyContact, UserLocation } from '../types';

interface NearbyResult {
  id: string;
  name: string;
  phone: string;
  type: 'police' | 'hospital' | 'pharmacy' | 'helpline';
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  area?: string;
  available24h?: boolean;
  distance?: number;
}

export function useEmergencyServices() {
  const [nearby, setNearby] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const fetchNearby = useCallback(async (loc: UserLocation, force = false) => {
    if (!loc) return;

    // Throttle: only re-fetch if moved > 500m or forced
    if (!force && lastPosRef.current) {
      const R = 6371;
      const dLat = ((loc.lat - lastPosRef.current.lat) * Math.PI) / 180;
      const dLon = ((loc.lng - lastPosRef.current.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lastPosRef.current.lat * Math.PI) / 180) *
          Math.cos((loc.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist < 0.5) return;
    }

    lastPosRef.current = { lat: loc.lat, lng: loc.lng };
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('nearby_emergency_services', {
        user_lat: loc.lat,
        user_lng: loc.lng,
        max_km: 50,
        type_filter: null,
      });

      if (error) {
        console.error('Emergency services RPC error:', error);
        setNearby([]);
      } else if (data) {
        const mapped: EmergencyContact[] = (data as unknown[]).map((r: unknown) => {
          const row = r as Record<string, unknown>;
          return {
            id: String(row.id),
            name: String(row.name),
            phone: String(row.phone),
            type: String(row.type) as EmergencyContact['type'],
            lat: Number(row.lat),
            lng: Number(row.lng),
            address: row.address ? String(row.address) : undefined,
            city: row.city ? String(row.city) : undefined,
            area: row.area ? String(row.area) : undefined,
            available24h: Boolean(row.available24h),
            distance: row.distance_km ? Number(row.distance_km) : undefined,
          };
        });
        setNearby(mapped);
      }
    } catch (e) {
      console.error('Emergency services fetch error:', e);
      setNearby([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { nearby, loading, fetchNearby };
}
