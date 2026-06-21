import { Heart, MapPin, Clock, Star, Trash2, Navigation2, Compass } from 'lucide-react';
import TransportBadge from '../components/TransportBadge';
import type { SavedRoute, Page } from '../types';

interface Props {
  savedRoutes: SavedRoute[];
  loading: boolean;
  onNavigate: (page: Page) => void;
  onRemove: (id: string) => void;
  onPlanJourney: (from: string, to: string) => void;
}

export default function Wishlist({ savedRoutes, loading, onNavigate, onRemove, onPlanJourney }: Props) {
  return (
    <div className="bg-gray-50 min-h-full pb-6">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saved Routes</h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              {savedRoutes.length} {savedRoutes.length === 1 ? 'route' : 'routes'} saved
            </p>
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <Heart size={20} className="text-red-500 fill-red-500" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading saved routes...</p>
          </div>
        )}

        {!loading && savedRoutes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
              <Heart size={40} className="text-red-200" />
            </div>
            <p className="text-lg font-bold text-gray-700 mb-1">No saved routes</p>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Save your favourite routes while exploring to access them instantly later
            </p>
            <button
              onClick={() => onNavigate('search')}
              className="bg-blue-600 text-white font-bold px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 shadow-md active:scale-[0.97] transition-transform"
            >
              <Compass size={16} />
              Explore Routes
            </button>
          </div>
        )}

        <div className="space-y-3">
          {savedRoutes.map(route => (
            <div key={route.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <TransportBadge mode={route.transport_mode} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{route.route_name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={10} className="flex-shrink-0" />
                      {route.from_location.split(',')[0]} → {route.to_location.split(',')[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-black text-gray-900">{route.price_estimate}</span>
                      <span className="text-gray-200">·</span>
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <Clock size={10} />{route.duration_minutes}m
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                        <Star size={10} className="fill-amber-400" />{route.rating}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(route.id)}
                    className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>

                <button
                  onClick={() => onPlanJourney(route.from_location, route.to_location)}
                  className="w-full mt-3.5 bg-blue-600 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-sm"
                >
                  <Navigation2 size={13} strokeWidth={2.5} />
                  Plan This Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



