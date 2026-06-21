import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) ensureProfile(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) ensureProfile(session.user);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function ensureProfile(u: User) {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', u.id)
      .maybeSingle();

    if (existing) {
      setProfile(existing);
      setLoading(false);
      return;
    }

    // Auto-create profile from OAuth metadata or fallback
    const fullName =
      u.user_metadata?.full_name ??
      u.user_metadata?.name ??
      u.email?.split('@')[0] ??
      'User';

    const { data: created } = await supabase
      .from('user_profiles')
      .insert({ id: u.id, full_name: fullName })
      .select()
      .single();
    setProfile(created);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        full_name: fullName,
      });
    }
    return { error };
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...updates })
      .select()
      .single();
    setProfile(data);
  }

  return { user, profile, loading, signIn, signUp, signInWithGoogle, signOut, updateProfile };
}


