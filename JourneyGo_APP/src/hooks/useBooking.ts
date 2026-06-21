import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Booking, RouteOption } from '../types';

export function useBookings(userId: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function createBooking(
    from: string,
    to: string,
    route: RouteOption,
    scheduledAt?: Date
  ): Promise<Booking | null> {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        from_location: from,
        to_location: to,
        transport_mode: route.mode,
        route_name: route.name,
        price: route.price,
        duration_minutes: route.duration,
        distance_km: route.distance,
        segments: route.segments,
        scheduled_at: scheduledAt?.toISOString() ?? null,
      })
      .select()
      .single();
    if (!error && data) {
      setBookings(prev => [data, ...prev]);
      return data;
    }
    return null;
  }

  async function cancelBooking(id: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
  }

  return { bookings, loading, createBooking, cancelBooking, refetch: fetch };
}

