import { CheckCircle, Clock, MapPin, Navigation, Download, Share2, ChevronRight } from 'lucide-react';
import type { Booking, Page } from '../types';

interface Props {
  booking: Booking;
  onNavigate: (page: Page) => void;
}

export default function BookingSuccess({ booking, onNavigate }: Props) {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 pt-14 pb-24 px-5 flex flex-col items-center text-center relative overflow-hidden">
        {/* BG circles */}
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />

        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl relative">
          <CheckCircle size={42} className="text-green-500" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h1>
        <p className="text-green-100 text-sm font-medium">Your journey is all set to go</p>

        <div className="mt-5 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
          <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">Booking Reference</p>
          <p className="text-white text-2xl font-black tracking-widest">{booking.booking_ref}</p>
        </div>
      </div>

      {/* Card */}
      <div className="px-4 -mt-12 relative z-10 pb-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-4">
          {/* Route */}
          <div className="p-5 border-b border-gray-50">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Journey Details</p>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1 flex-shrink-0 gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50" />
                <div className="w-0.5 h-6 bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50" />
              </div>
              <div className="flex-1 space-y-2.5">
                <div>
                  <p className="text-xs text-gray-400 font-semibold">From</p>
                  <p className="text-sm font-bold text-gray-800">{booking.from_location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">To</p>
                  <p className="text-sm font-bold text-gray-800">{booking.to_location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 divide-x divide-gray-50">
            {[
              { icon: Clock, label: 'Duration', value: `${booking.duration_minutes}m`, color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: MapPin, label: 'Distance', value: `${booking.distance_km}km`, color: 'text-green-500', bg: 'bg-green-50' },
              { icon: Navigation, label: 'Mode', value: booking.transport_mode, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="p-4 flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={15} className={color} />
                </div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-sm font-bold text-gray-900 capitalize">{value}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mx-4 mb-4 bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between border border-blue-100">
            <span className="text-sm font-semibold text-blue-700">Total Paid</span>
            <span className="text-xl font-black text-blue-700">₹{Math.round(booking.price * 1.05)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-700 shadow-sm active:scale-[0.97] transition-transform">
            <Download size={16} className="text-gray-500" />
            Download
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-700 shadow-sm active:scale-[0.97] transition-transform">
            <Share2 size={16} className="text-gray-500" />
            Share
          </button>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.97] transition-transform mb-3"
        >
          Back to Home
        </button>

        <button
          onClick={() => onNavigate('bookings')}
          className="w-full flex items-center justify-center gap-1 text-blue-600 font-semibold text-sm py-2"
        >
          View All Bookings <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

