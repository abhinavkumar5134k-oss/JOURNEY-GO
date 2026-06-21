import { Home, Search, Ticket, ShieldAlert, User, MessageCircle } from 'lucide-react';
import type { Page } from '../types';

interface Props {
  current: Page;
  onNavigate: (page: Page) => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

const items = [
  { id: 'home' as Page, label: 'Home', icon: Home },
  { id: 'search' as Page, label: 'Search', icon: Search },
  { id: 'bookings' as Page, label: 'Bookings', icon: Ticket },
  { id: 'emergency' as Page, label: 'SOS', icon: ShieldAlert, isEmergency: true },
  { id: 'account' as Page, label: 'Account', icon: User },
];

export default function BottomNav({ current, onNavigate, onToggleChat, isChatOpen }: Props) {
  return (
    <div className="bg-white border-t border-gray-100 flex-shrink-0" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-around px-1 py-2 relative">
        {items.map(({ id, label, icon: Icon, isEmergency }, idx) => {
          const active = current === id;
          // Insert chat button before the last item (Account)
          return (
            <div key={id} className="flex items-center">
              {isEmergency ? (
                <button
                  onClick={() => onNavigate(id)}
                  className="flex flex-col items-center gap-0.5 flex-1 py-1.5 px-2 rounded-xl transition-all relative"
                >
                  <div className="relative">
                    {/* Glowing ring effect */}
                    <div className="absolute inset-0 w-12 h-12 -top-3 -left-1 rounded-full bg-red-500/20 animate-ping" />
                    <div className="absolute inset-0 w-12 h-12 -top-3 -left-1 rounded-full bg-red-500/10" />
                    {/* Button container */}
                    <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${
                      active
                        ? 'bg-red-600 shadow-red-400'
                        : 'bg-gradient-to-b from-red-500 to-red-600 shadow-red-300'
                    }`} style={{
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',
                    }}>
                      <Icon size={20} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold leading-none mt-1 ${active ? 'text-red-600' : 'text-red-500'}`}>
                    {label}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate(id)}
                  className="flex flex-col items-center gap-0.5 flex-1 py-1.5 px-2 rounded-xl transition-all"
                >
                  {active ? (
                    <div className="w-10 h-6 bg-blue-100 rounded-full flex items-center justify-center mb-0.5">
                      <Icon size={18} strokeWidth={2.5} className="text-blue-600" />
                    </div>
                  ) : (
                    <Icon size={20} strokeWidth={1.8} className="text-gray-400 mb-0.5" />
                  )}
                  <span className={`text-[10px] font-semibold leading-none ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </button>
              )}
              {idx === items.length - 2 && (
                <button
                  onClick={onToggleChat}
                  className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all"
                >
                  <div className={`w-10 h-6 rounded-full flex items-center justify-center mb-0.5 transition-colors ${
                    isChatOpen ? 'bg-blue-100' : 'bg-gray-50'
                  }`}>
                    <MessageCircle size={18} strokeWidth={2.5} className={isChatOpen ? 'text-blue-600' : 'text-gray-500'} />
                  </div>
                  <span className={`text-[10px] font-semibold leading-none ${isChatOpen ? 'text-blue-600' : 'text-gray-400'}`}>
                    Chat
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
