import { useState } from 'react';
import { ArrowLeft, Star, Shield, ChevronRight, CalendarDays, CreditCard, Smartphone, Wallet } from 'lucide-react';
import TransportBadge from '../components/TransportBadge';
import type { Page, RouteOption } from '../types';

interface Props {
  from: string;
  to: string;
  route: RouteOption;
  onNavigate: (page: Page) => void;
  onConfirm: (route: RouteOption, scheduledAt?: Date) => Promise<void>;
}

type PayMethod = 'upi' | 'card' | 'wallet';

const payOptions: { id: PayMethod; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'upi', label: 'UPI', desc: 'GPay · PhonePe · Paytm', icon: Smartphone },
  { id: 'card', label: 'Card', desc: 'Credit or Debit card', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', desc: 'TrackMate Balance ₹340', icon: Wallet },
];

export default function BookingConfirm({ from, to, route, onNavigate, onConfirm }: Props) {
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [scheduleNow, setScheduleNow] = useState(true);
  const [loading, setLoading] = useState(false);

  const serviceCharge = Math.max(5, Math.round(route.price * 0.05));
  const total = route.price + serviceCharge;

  async function handleBook() {
    setLoading(true);
    try {
      await onConfirm(route, scheduleNow ? undefined : new Date(Date.now() + 3600000));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('route-options')}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Confirm Booking</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Journey summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <TransportBadge mode={route.mode} size="lg" />
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900">{route.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                  <Star size={11} className="fill-amber-400" />{route.rating}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{route.duration} min</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{route.distance} km</span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 border-t border-gray-50 pt-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50" />
                <div className="w-0.5 h-7 bg-gray-200 my-1" />
                <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50" />
              </div>
              <div className="flex-1 space-y-2.5">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">From</p>
                  <p className="text-sm font-semibold text-gray-800">{from}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">To</p>
                  <p className="text-sm font-semibold text-gray-800">{to}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CalendarDays size={15} className="text-blue-600" />
            Departure time
          </p>
          <div className="grid grid-cols-2 gap-2">
            {([{ v: true, l: 'Now', s: 'Leave immediately' }, { v: false, l: 'Later', s: 'Schedule for later' }] as const).map(
              ({ v, l, s }) => (
                <button
                  key={String(v)}
                  onClick={() => setScheduleNow(v)}
                  className={`rounded-xl p-3 text-left border-2 transition-all ${
                    scheduleNow === v ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <p className={`text-sm font-bold ${scheduleNow === v ? 'text-blue-700' : 'text-gray-700'}`}>{l}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s}</p>
                </button>
              )
            )}
          </div>
        </div>

        {/* Segments */}
        {route.segments.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">Journey segments</p>
            <div className="space-y-3">
              {route.segments.map((seg, i) => (
                <div key={i} className="flex items-center gap-3">
                  <TransportBadge mode={seg.mode} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{seg.name}</p>
                    <p className="text-xs text-gray-500 truncate">{seg.from.split(',')[0]} → {seg.to.split(',')[0]}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900">₹{seg.price}</p>
                    <p className="text-xs text-gray-400">{seg.duration}m</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-bold text-gray-900 mb-3">Payment method</p>
          <div className="space-y-2">
            {payOptions.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPayMethod(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  payMethod === id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  payMethod === id ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <Icon size={16} className={payMethod === id ? 'text-white' : 'text-gray-500'} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  payMethod === id ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {payMethod === id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-bold text-gray-900 mb-3">Price breakdown</p>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Base fare</span>
              <span className="text-sm font-semibold text-gray-900">₹{route.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service charge (5%)</span>
              <span className="text-sm font-semibold text-gray-900">₹{serviceCharge}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center gap-3 bg-green-50 rounded-2xl px-4 py-3 border border-green-100">
          <Shield size={18} className="text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-800 font-semibold leading-relaxed">
            100% secure payment · Instant booking confirmation · Free cancellation within 5 min
          </p>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-20">
        <div className="bg-white border-t border-gray-100 px-5 py-4" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Total to pay</p>
              <p className="text-xl font-bold text-gray-900">₹{total}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ChevronRight size={12} />
              <span>{payOptions.find(p => p.id === payMethod)?.label}</span>
            </div>
          </div>
          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Pay ₹${total} & Confirm Booking`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

