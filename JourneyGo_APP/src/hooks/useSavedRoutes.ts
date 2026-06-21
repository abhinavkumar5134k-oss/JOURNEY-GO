import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SavedRoute, RouteOption } from '../types';

export function useSavedRoutes(userId: string | null) {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('saved_routes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setSavedRoutes(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function saveRoute(from: string, to: string, route: RouteOption): Promise<boolean> {
    if (!userId) return false;
    const { data, error } = await supabase
      .from('saved_routes')
      .insert({
        user_id: userId,
        from_location: from,
        to_location: to,
        transport_mode: route.mode,
        route_name: route.name,
        price_estimate: route.priceDisplay,
        duration_minutes: route.duration,
        distance_km: route.distance,
        rating: route.rating,
      })
      .select()
      .single();
    if (!error && data) {
      setSavedRoutes(prev => [data, ...prev]);
      return true;
    }
    return false;
  }

  async function removeRoute(id: string) {
    const { error } = await supabase
      .from('saved_routes')
      .delete()
      .eq('id', id);
    if (!error) {
      setSavedRoutes(prev => prev.filter(r => r.id !== id));
    }
  }

  function isRouteSaved(from: string, to: string, routeName: string): boolean {
    return savedRoutes.some(r =>
      r.from_location === from && r.to_location === to && r.route_name === routeName
    );
  }

  return { savedRoutes, loading, saveRoute, removeRoute, isRouteSaved, refetch: fetch };
}
