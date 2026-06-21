import { useState, useEffect, useRef } from 'react';
import BottomNav from './components/BottomNav';
import ChatBot from './components/ChatBot';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Search from './pages/Search';
import RouteOptions from './pages/RouteOptions';
import BookingConfirm from './pages/BookingConfirm';
import BookingSuccess from './pages/BookingSuccess';
import Bookings from './pages/Bookings';
import Wishlist from './pages/Wishlist';
import EmergencyHub from './pages/EmergencyHub';
import Account from './pages/Account';
import { useAuth } from './hooks/useAuth';
import { useBookings } from './hooks/useBookings';
import { useSavedRoutes } from './hooks/useSavedRoutes';
import type { Page, RouteOption, Booking } from './types';
import { Navigation } from 'lucide-react';

const NAV_PAGES: Page[] = ['home', 'search', 'bookings', 'wishlist', 'emergency', 'account'];

export default function App() {
  const { user, profile, loading: authLoading, signIn, signUp, signInWithGoogle, signOut, updateProfile } = useAuth();
  const { bookings, loading: bookingsLoading, createBooking, cancelBooking } = useBookings(user?.id ?? null);
  const { savedRoutes, loading: savedLoading, saveRoute, removeRoute, isRouteSaved } = useSavedRoutes(user?.id ?? null);

  const [page, setPage] = useState<Page>('onboarding');
  const [journeyFrom, setJourneyFrom] = useState('Howrah Railway Station, Kolkata');
  const [journeyTo, setJourneyTo] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      setPage(prev => (prev === 'onboarding' || prev === 'auth') ? 'home' : prev);
    }
  }, [authLoading, user]);

  function navigate(p: Page) {
    setPage(p);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  function planJourney(from: string, to: string) {
    setJourneyFrom(from);
    setJourneyTo(to);
    navigate('route-options');
  }

  function selectRoute(route: RouteOption) {
    setSelectedRoute(route);
    navigate('booking-confirm');
  }

  async function handleSaveRoute(route: RouteOption) {
    if (!user) { navigate('auth'); return; }
    if (isRouteSaved(journeyFrom, journeyTo, route.name)) {
      const sr = savedRoutes.find(r =>
        r.from_location === journeyFrom && r.to_location === journeyTo && r.route_name === route.name
      );
      if (sr) await removeRoute(sr.id);
    } else {
      await saveRoute(journeyFrom, journeyTo, route);
    }
  }

  async function handleConfirmBooking(route: RouteOption, scheduledAt?: Date) {
    if (!user) { navigate('auth'); return; }
    const booking = await createBooking(journeyFrom, journeyTo, route, scheduledAt);
    if (booking) {
      setConfirmedBooking(booking);
      navigate('booking-success');
    }
  }

  const showNav = NAV_PAGES.includes(page);

  return (
    <div className="app-shell">
      {authLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white gap-4">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Navigation size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-lg font-bold text-gray-900">TrackMate</p>
            <p className="text-sm text-gray-400">Loading your journeys...</p>
          </div>
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mt-2" />
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="page-scroll">
            {page === 'onboarding' && <Onboarding onNavigate={navigate} />}

            {page === 'auth' && (
              <Auth
                onNavigate={navigate}
                onSignIn={async (email, password) => {
                  const result = await signIn(email, password);
                  if (!result.error) navigate('home');
                  return result;
                }}
                onSignUp={async (email, password, name) => {
                  const result = await signUp(email, password, name);
                  if (!result.error) navigate('home');
                  return result;
                }}
                onSignInWithGoogle={async () => {
                  const result = await signInWithGoogle();
                  return result;
                }}
              />
            )}

            {page === 'home' && (
              <Home profile={profile} onNavigate={navigate} onPlanJourney={planJourney} />
            )}

            {page === 'search' && (
              <Search initialFrom={journeyFrom} onNavigate={navigate} onPlanJourney={planJourney} />
            )}

            {page === 'route-options' && (
              <RouteOptions
                from={journeyFrom}
                to={journeyTo}
                onNavigate={navigate}
                onBook={selectRoute}
                onSave={handleSaveRoute}
                isSaved={(routeName) => isRouteSaved(journeyFrom, journeyTo, routeName)}
              />
            )}

            {page === 'booking-confirm' && selectedRoute && (
              <BookingConfirm
                from={journeyFrom}
                to={journeyTo}
                route={selectedRoute}
                onNavigate={navigate}
                onConfirm={handleConfirmBooking}
              />
            )}

            {page === 'booking-success' && confirmedBooking && (
              <BookingSuccess booking={confirmedBooking} onNavigate={navigate} />
            )}

            {page === 'bookings' && (
              <Bookings
                bookings={bookings}
                loading={bookingsLoading}
                onNavigate={navigate}
                onCancel={cancelBooking}
                onRepeat={planJourney}
              />
            )}

            {page === 'wishlist' && (
              <Wishlist
                savedRoutes={savedRoutes}
                loading={savedLoading}
                onNavigate={navigate}
                onRemove={removeRoute}
                onPlanJourney={planJourney}
              />
            )}

            {page === 'emergency' && (
              <EmergencyHub onNavigate={navigate} />
            )}

            {page === 'account' && (
              <Account
                profile={profile}
                email={user?.email ?? ''}
                onNavigate={navigate}
                onSignOut={async () => { await signOut(); navigate('onboarding'); }}
                onUpdateProfile={updateProfile}
              />
            )}
          </div>

          {showNav && (
            <BottomNav
              current={page}
              onNavigate={navigate}
              onToggleChat={() => setChatOpen(prev => !prev)}
              isChatOpen={chatOpen}
            />
          )}

          {/* ChatBot overlay - available on all nav pages */}
          {showNav && <ChatBot />}
        </>
      )}
    </div>
  );
}





