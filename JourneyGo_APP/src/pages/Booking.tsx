import { useState } from 'react';
import { Clock, MapPin, ChevronRight, X, Ticket, RotateCcw } from 'lucide-react';
import TransportBadge from '../components/TransportBadge';
import type { Booking, Page } from '../types';

interface Props {
  bookings: Booking[];
  loading: boolean;
  onNavigate: (page: Page) => void;
  onCancel: (id: string) => void;
  onRepeat: (from: string, to: string) => void;
}

type StatusFilter = 'all' | 'confirmed' | 'completed' | 'cancelled';

const statusConfig = {
  confirmed: { label: 'Active', dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: 'Done', dot: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400', text: 'text-red-500', bg: 'bg-red-50' },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Bookings({ bookings, loading, onNavigate, onCancel, onRepeat }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = bookings.filter(b => filter === 'all' || b.status === filter);

  return (
    <div className="bg-gray-50 min-h-full pb-6">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
          <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
            <Ticket size={18} className="text-blue-600" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['all', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all capitalize ${
                filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {s === 'all' ? `All (${bookings.length})` : `${statusConfig[s].label} (${bookings.filter(b => b.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading bookings...</p>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Ticket size={36} className="text-blue-300" />
            </div>
            <p className="text-base font-bold text-gray-600 mb-1">No bookings yet</p>
            <p className="text-sm text-gray-400 mb-6">Plan your first journey to get started</p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md"
            >
              Plan a Journey
            </button>
          </div>
        )}

        {visible.map(booking => {
          const sc = statusConfig[booking.status];
          const expanded = expandedId === booking.id;
          return (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : booking.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <TransportBadge mode={booking.transport_mode} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{booking.route_name}</p>
                      <span className={`${sc.bg} ${sc.text} text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                      <MapPin size={10} className="flex-shrink-0" />
                      {booking.from_location.split(',')[0]} → {booking.to_location.split(',')[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-black text-gray-900">₹{booking.price}</span>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <Clock size={10} />{booking.duration_minutes}m
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{fmtDate(booking.created_at)}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={15}
                    className={`text-gray-400 flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>

              {expanded && (
                <div className="border-t border-gray-50 px-4 pb-4 space-y-0">
                  {[
                    { label: 'Booking Ref', value: booking.booking_ref },
                    { label: 'Distance', value: `${booking.distance_km} km` },
                    { label: 'Total Paid', value: `₹${Math.round(booking.price * 1.05)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-500 font-medium">{label}</span>
                      <span className="text-xs font-bold text-gray-800">{value}</span>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => onRepeat(booking.from_location, booking.to_location)}
                      className="flex-1 bg-blue-600 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <RotateCcw size={12} />
                      Book Again
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => onCancel(booking.id)}
                        className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 border border-red-100"
                      >
                        <X size={12} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

