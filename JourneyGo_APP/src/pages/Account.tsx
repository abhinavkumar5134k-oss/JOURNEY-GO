import { useState } from 'react';
import {
  Bell, Shield, Settings, HelpCircle,
  LogOut, ChevronRight, Edit3, Home, Briefcase, Phone, User
} from 'lucide-react';
import type { Page, UserProfile } from '../types';

interface Props {
  profile: UserProfile | null;
  email: string;
  onNavigate?: (page: Page) => void;
  onSignOut: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const menuSections = [
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', desc: 'Journey alerts & updates', color: 'text-blue-600', bg: 'bg-blue-50' },
      { icon: Settings, label: 'App Settings', desc: 'Language, theme & more', color: 'text-gray-600', bg: 'bg-gray-100' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: Shield, label: 'Privacy & Security', desc: 'Data and account safety', color: 'text-green-600', bg: 'bg-green-50' },
      { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs and contact us', color: 'text-amber-600', bg: 'bg-amber-50' },
    ],
  },
];

export default function Account({ profile, email, onSignOut, onUpdateProfile }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [home, setHome] = useState(profile?.home_location ?? '');
  const [work, setWork] = useState(profile?.work_location ?? '');
  const [saving, setSaving] = useState(false);

  const initials = (profile?.full_name ?? 'G').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  async function handleSave() {
    setSaving(true);
    await onUpdateProfile({ full_name: name, phone, home_location: home, work_location: work });
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="bg-gray-50 min-h-full pb-6">
      {/* Profile header */}
      <div className="relative bg-white pt-12 pb-6 px-5 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {/* BG decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />

        <div className="relative flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-xl font-black text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-gray-900 truncate">{profile?.full_name ?? 'Guest User'}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{email || 'Not signed in'}</p>
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1.5">
              Premium Member
            </span>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <Edit3 size={16} className="text-blue-600" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '24', label: 'Trips', color: 'text-blue-600' },
            { value: '340km', label: 'Travelled', color: 'text-green-600' },
            { value: '18kg', label: 'CO₂ Saved', color: 'text-amber-600' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className={`text-base font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Edit3 size={14} className="text-blue-600" />
            Edit Profile
          </p>
          <div className="space-y-3">
            {[
              { icon: User, value: name, setter: setName, placeholder: 'Full name', type: 'text' },
              { icon: Phone, value: phone, setter: setPhone, placeholder: 'Phone number', type: 'tel' },
              { icon: Home, value: home, setter: setHome, placeholder: 'Home location', type: 'text' },
              { icon: Briefcase, value: work, setter: setWork, placeholder: 'Work location', type: 'text' },
            ].map(({ icon: Icon, value, setter, placeholder, type }) => (
              <div key={placeholder} className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm active:scale-[0.97] transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-[0.97] transition-transform shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Profile details */}
      {!editing && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { icon: User, label: 'Full Name', value: profile?.full_name },
            { icon: Phone, label: 'Phone', value: profile?.phone },
            { icon: Home, label: 'Home', value: profile?.home_location },
            { icon: Briefcase, label: 'Work', value: profile?.work_location },
          ].map(({ icon: Icon, label, value }, i, arr) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{value ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu sections */}
      {menuSections.map(section => (
        <div key={section.title} className="mx-4 mt-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">{section.title}</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {section.items.map(({ icon: Icon, label, desc, color, bg }) => (
              <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={17} className={color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <ChevronRight size={15} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Sign out */}
      <div className="mx-4 mt-4">
        <button
          onClick={onSignOut}
          className="w-full bg-white rounded-2xl border border-red-100 shadow-sm px-4 py-4 flex items-center justify-center gap-2.5 text-red-500 font-bold text-sm active:scale-[0.97] transition-transform"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>

      {/* App version */}
      <p className="text-center text-xs text-gray-400 font-medium mt-6">TrackMate v1.0.0 · AI-guided travel companion</p>
    </div>
  );
}

