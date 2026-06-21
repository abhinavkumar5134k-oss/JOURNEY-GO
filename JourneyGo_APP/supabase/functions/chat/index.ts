import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_API_KEY =
  Deno.env.get("GROQ_API_KEY") ?? "YOUR_KEY_HERE";
const WEATHER_API_KEY =
  Deno.env.get("WEATHER_API_KEY") ?? "YOUR_KEY_HERE";

// ─────────────────────────────────────────────────────────────────────────────
// DATA LAYER  – mirrors src/data/trains.ts & src/data/locations.ts
// ─────────────────────────────────────────────────────────────────────────────

interface TrainStation {
  station_name: string;
  station_code: string;
  sta: string;
  std: string;
  day: number;
  distance: number;
}

interface TrainEntry {
  train_number: string;
  train_name: string;
  type: string;
  origin: string;
  destination: string;
  distance_km: number;
  duration: string;
  running_days: string[];
  route: TrainStation[];
}

const TRAIN_DATABASE: Record<string, TrainEntry> = {
  "18615": {
    train_number: "18615",
    train_name: "KRIYA YOGA EXPRESS",
    type: "Mail/Express",
    origin: "HOWRAH JN (HWH)",
    destination: "HATIA (HTE)",
    distance_km: 423,
    duration: "9h 40m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    route: [
      { station_name: "HOWRAH JN", station_code: "HWH", sta: "Source", std: "21:10", day: 1, distance: 0 },
      { station_name: "MECHEDA", station_code: "MCA", sta: "22:03", std: "22:08", day: 1, distance: 58 },
      { station_name: "KHARAGPUR JN", station_code: "KGP", sta: "22:55", std: "23:00", day: 1, distance: 115 },
      { station_name: "JHARGRAM", station_code: "JGM", sta: "23:34", std: "23:36", day: 1, distance: 153 },
      { station_name: "CHAKULIA", station_code: "CKU", sta: "00:18", std: "00:20", day: 2, distance: 182 },
      { station_name: "GHATSILA", station_code: "GTS", sta: "00:43", std: "00:45", day: 2, distance: 213 },
      { station_name: "TATANAGAR JN", station_code: "TATA", sta: "01:07", std: "01:12", day: 2, distance: 249 },
      { station_name: "Kandra Jn", station_code: "KND", sta: "02:18", std: "02:19", day: 2, distance: 271 },
      { station_name: "Chandil Jn", station_code: "CNI", sta: "02:40", std: "02:42", day: 2, distance: 285 },
      { station_name: "MURI JN", station_code: "MURI", sta: "04:00", std: "04:20", day: 2, distance: 343 },
      { station_name: "RANCHI JN", station_code: "RNC", sta: "05:40", std: "05:50", day: 2, distance: 397 },
      { station_name: "HATIA", station_code: "HTE", sta: "06:50", std: "Destination", day: 2, distance: 404 },
    ],
  },
  "68019": {
    train_number: "68019",
    train_name: "JHARGRAM - PURULIA MEMU",
    type: "MEMU Passenger",
    origin: "Jhargram (JGM)",
    destination: "Purulia Jn (PRR)",
    distance_km: 185,
    duration: "4h 30m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    route: [
      { station_name: "Jhargram", station_code: "JGM", sta: "Source", std: "05:00", day: 1, distance: 0 },
      { station_name: "Chakulia", station_code: "CKU", sta: "05:24", std: "05:25", day: 1, distance: 29 },
      { station_name: "Ghatsila", station_code: "GTS", sta: "05:57", std: "05:59", day: 1, distance: 60 },
      { station_name: "Rakha Mines", station_code: "RHE", sta: "06:18", std: "06:19", day: 1, distance: 77 },
      { station_name: "Tatanagar Jn", station_code: "TATA", sta: "06:55", std: "07:05", day: 1, distance: 96 },
      { station_name: "Adityapur", station_code: "ADTP", sta: "07:12", std: "07:13", day: 1, distance: 100 },
      { station_name: "Kandra Jn", station_code: "KND", sta: "07:33", std: "07:34", day: 1, distance: 117 },
      { station_name: "Chandil Jn", station_code: "CNI", sta: "08:03", std: "08:05", day: 1, distance: 131 },
      { station_name: "Barabhum", station_code: "BBM", sta: "08:35", std: "08:37", day: 1, distance: 153 },
      { station_name: "Purulia Jn", station_code: "PRR", sta: "09:30", std: "Destination", day: 1, distance: 185 },
    ],
  },
  "68003": {
    train_number: "68003",
    train_name: "HOWRAH - GHATSILA MEMU",
    type: "MEMU Passenger",
    origin: "Howrah Jn (HWH)",
    destination: "Ghatsila (GTS)",
    distance_km: 213,
    duration: "4h 30m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    route: [
      { station_name: "Howrah Jn", station_code: "HWH", sta: "Source", std: "10:00", day: 1, distance: 0 },
      { station_name: "Santragachi Jn", station_code: "SRC", sta: "10:15", std: "10:17", day: 1, distance: 7 },
      { station_name: "Mecheda", station_code: "MCA", sta: "11:24", std: "11:26", day: 1, distance: 58 },
      { station_name: "Kharagpur Jn", station_code: "KGP", sta: "12:35", std: "12:40", day: 1, distance: 115 },
      { station_name: "Jhargram", station_code: "JGM", sta: "13:23", std: "13:25", day: 1, distance: 153 },
      { station_name: "Chakulia", station_code: "CKU", sta: "13:49", std: "13:51", day: 1, distance: 182 },
      { station_name: "Ghatsila", station_code: "GTS", sta: "14:30", std: "Destination", day: 1, distance: 213 },
    ],
  },
  "12859": {
    train_number: "12859",
    train_name: "GITANJALI EXPRESS",
    type: "Superfast",
    origin: "Mumbai CSM Terminus (CSMT)",
    destination: "Howrah Jn (HWH)",
    distance_km: 1965,
    duration: "30h 45m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    route: [
      { station_name: "Mumbai CSM Terminus", station_code: "CSMT", sta: "Source", std: "06:00", day: 1, distance: 0 },
      { station_name: "Nagpur Jn", station_code: "NGP", sta: "18:55", std: "19:00", day: 1, distance: 835 },
      { station_name: "Bilaspur Jn", station_code: "BSP", sta: "01:25", std: "01:35", day: 2, distance: 1248 },
      { station_name: "Chakradharpur", station_code: "CKP", sta: "07:35", std: "07:40", day: 2, distance: 1654 },
      { station_name: "Tatanagar Jn", station_code: "TATA", sta: "08:45", std: "08:55", day: 2, distance: 1716 },
      { station_name: "Kharagpur Jn", station_code: "KGP", sta: "10:50", std: "10:55", day: 2, distance: 1850 },
      { station_name: "Howrah Jn", station_code: "HWH", sta: "12:45", std: "Destination", day: 2, distance: 1965 },
    ],
  },
  "20898": {
    train_number: "20898",
    train_name: "RANCHI - HOWRAH VANDE BHARAT EXP",
    type: "Vande Bharat",
    origin: "Ranchi Jn (RNC)",
    destination: "Howrah Jn (HWH)",
    distance_km: 455,
    duration: "7h 05m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    route: [
      { station_name: "Ranchi Jn", station_code: "RNC", sta: "Source", std: "05:15", day: 1, distance: 0 },
      { station_name: "Muri Jn", station_code: "MURI", sta: "06:13", std: "06:15", day: 1, distance: 60 },
      { station_name: "Purulia Jn", station_code: "PRR", sta: "07:08", std: "07:10", day: 1, distance: 121 },
      { station_name: "Chandil Jn", station_code: "CNI", sta: "07:53", std: "07:54", day: 1, distance: 171 },
      { station_name: "Tatanagar Jn", station_code: "TATA", sta: "08:35", std: "08:40", day: 1, distance: 206 },
      { station_name: "Kharagpur Jn", station_code: "KGP", sta: "10:20", std: "10:22", day: 1, distance: 340 },
      { station_name: "Howrah Jn", station_code: "HWH", sta: "12:20", std: "Destination", day: 1, distance: 455 },
    ],
  },
  "12814": {
    train_number: "12814",
    train_name: "STEEL EXPRESS",
    type: "Superfast",
    origin: "Tatanagar Jn (TATA)",
    destination: "Howrah Jn (HWH)",
    distance_km: 249,
    duration: "4h 10m",
    running_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    route: [
      { station_name: "Tatanagar Jn", station_code: "TATA", sta: "Source", std: "06:10", day: 1, distance: 0 },
      { station_name: "Rakha Mines", station_code: "RHE", sta: "06:29", std: "06:31", day: 1, distance: 19 },
      { station_name: "Ghatsila", station_code: "GTS", sta: "06:43", std: "06:45", day: 1, distance: 36 },
      { station_name: "Chakulia", station_code: "CKU", sta: "07:07", std: "07:09", day: 1, distance: 67 },
      { station_name: "Jhargram", station_code: "JGM", sta: "07:30", std: "07:32", day: 1, distance: 96 },
      { station_name: "Kharagpur Jn", station_code: "KGP", sta: "08:15", std: "08:17", day: 1, distance: 134 },
      { station_name: "Santragachi Jn", station_code: "SRC", sta: "09:38", std: "09:40", day: 1, distance: 242 },
      { station_name: "Howrah Jn", station_code: "HWH", sta: "10:20", std: "Destination", day: 1, distance: 249 },
    ],
  },
};

interface MapPlace {
  name: string;
  category: string;
  lat: number;
  lng: number;
}

const KNOWN_PLACES: MapPlace[] = [
  { name: "Chaibasa Clock Tower", category: "Landmark", lat: 22.5533, lng: 85.8058 },
  { name: "Chaibasa Railway Station", category: "Train Station", lat: 22.5650, lng: 85.8150 },
  { name: "Jubilee Lake Park", category: "Park", lat: 22.5580, lng: 85.8120 },
  { name: "Roro Dam", category: "Attraction", lat: 22.5350, lng: 85.8010 },
  { name: "Seraikela Town", category: "Town", lat: 22.6975, lng: 85.9288 },
  { name: "Bistupur Market", category: "Market", lat: 22.7963, lng: 86.1837 },
  { name: "Jubilee Park", category: "Park", lat: 22.8055, lng: 86.1832 },
  { name: "Dalma Sanctuary", category: "Attraction", lat: 22.8833, lng: 86.2167 },
  { name: "NIT Jamshedpur", category: "College", lat: 22.7766, lng: 86.1438 },
  { name: "Victoria Memorial", category: "Landmark", lat: 22.5448, lng: 88.3426 },
  { name: "Howrah Bridge", category: "Landmark", lat: 22.5851, lng: 88.3468 },
  { name: "Eco Park", category: "Park", lat: 22.6163, lng: 88.4665 },
  { name: "Howrah Railway Station", category: "Train Station", lat: 22.5830, lng: 88.3425 },
  { name: "Santragachi Junction", category: "Train Station", lat: 22.5802, lng: 88.2774 },
  { name: "Kharagpur Railway Station", category: "Train Station", lat: 22.3330, lng: 87.3250 },
  { name: "Jhargram Station", category: "Train Station", lat: 22.4540, lng: 86.9930 },
  { name: "Ghatsila Station", category: "Train Station", lat: 22.5830, lng: 86.4780 },
  { name: "Tatanagar Junction", category: "Train Station", lat: 22.7667, lng: 86.1985 },
  { name: "Adityapur Station", category: "Train Station", lat: 22.7850, lng: 86.1550 },
  { name: "Rajkharsawan Junction", category: "Train Station", lat: 22.7500, lng: 85.8200 },
  { name: "Chakradharpur Railway Station", category: "Train Station", lat: 22.6784, lng: 85.6263 },
  { name: "Howrah Metro Station", category: "Metro", lat: 22.5848, lng: 88.3434 },
  { name: "Howrah Ferry Ghat", category: "Ferry", lat: 22.5835, lng: 88.3441 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOOL IMPLEMENTATIONS  – wired to real app data
// ─────────────────────────────────────────────────────────────────────────────

function getBusinessInfo(category: string): string {
  const cat = category.toLowerCase().trim();
  const intents: Record<string, string> = {
    pricing_inquiry:
      "TrackMate offers three tiers:\n• Starter – ₹499/month (basic route search)\n• Professional – ₹999/month (advanced analytics + train alerts)\n• Enterprise – ₹2,499/month (full API access, unlimited bookings)",
    refund_policy:
      "We offer a 14-day money-back guarantee for all new subscriptions. Request a refund via your Account page within 14 days of purchase.",
    onboarding_help:
      "Getting started:\n1. Create your account via the Auth screen.\n2. Set your Home and Work locations in Account → Edit Profile.\n3. Use the Search tab to find routes and hit Plan Journey!",
  };
  return (
    intents[cat] ??
    `No info found for '${category}'. Try: pricing_inquiry, refund_policy, or onboarding_help.`
  );
}

function escalateToHuman(userIssue: string): string {
  return `Your issue has been escalated to a human support agent. We will contact you shortly regarding: "${userIssue}"`;
}

async function getWeatherInfo(city: string): Promise<string> {
  const clean = city.trim().replace(/['"]/g, "");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(clean)},IN&appid=${WEATHER_API_KEY}&units=metric`;
  try {
    const res = await fetch(url);
    if (!res.ok) return `Sorry, I couldn't find weather data for ${clean}.`;
    const data = await res.json();
    const temp = Math.round(data.main.temp);
    const desc: string = data.weather[0].description;
    const humidity: number = data.main.humidity;
    const wind: number = Math.round(data.wind.speed * 3.6);
    return `Weather in ${clean}: ${temp}°C, ${desc}. Humidity ${humidity}%, wind ${wind} km/h.`;
  } catch {
    return "Weather service is currently unavailable.";
  }
}

function locatePlace(placeName: string): string {
  return `I have located ${placeName} for you on the map.`;
}

/**
 * get_train_timing – wired to TRAIN_DATABASE
 * Finds the train by number, then optionally filters to the destination stop.
 */
function getTrainTiming(train_number: string, destination?: string): string {
  // Try exact train-number lookup first
  let train = TRAIN_DATABASE[train_number.trim()];

  // If not found by number, try matching by partial name
  if (!train) {
    const q = train_number.toLowerCase();
    train =
      Object.values(TRAIN_DATABASE).find(
        (t) =>
          t.train_name.toLowerCase().includes(q) ||
          t.train_number === q
      ) ?? null!;
  }

  if (!train) {
    // Attempt to find any train that stops at the given station name
    const q = train_number.toLowerCase();
    const matches = Object.values(TRAIN_DATABASE).filter((t) =>
      t.route.some((s) => s.station_name.toLowerCase().includes(q))
    );
    if (matches.length === 0) {
      return `No train found for "${train_number}". Available trains: ${Object.values(TRAIN_DATABASE)
        .map((t) => `${t.train_number} (${t.train_name})`)
        .join(", ")}.`;
    }
    // Return summary of all trains stopping at that station
    const lines = matches.map((t) => {
      const stop = t.route.find((s) =>
        s.station_name.toLowerCase().includes(q)
      )!;
      return `• ${t.train_number} ${t.train_name}: arrives ${stop.sta}, departs ${stop.std} (Day ${stop.day})`;
    });
    return `Trains stopping at "${train_number}":\n${lines.join("\n")}`;
  }

  // Build response
  let destStop: TrainStation | undefined;
  if (destination) {
    const dq = destination.toLowerCase();
    destStop = train.route.find(
      (s) =>
        s.station_name.toLowerCase().includes(dq) ||
        s.station_code.toLowerCase() === dq
    );
  }

  const runDays = train.running_days.join(", ");

  if (destStop) {
    return (
      `${train.train_number} – ${train.train_name} (${train.type})\n` +
      `Route: ${train.origin} → ${train.destination} | Distance: ${train.distance_km} km | Duration: ${train.duration}\n` +
      `Runs: ${runDays}\n` +
      `Stop at ${destStop.station_name} (${destStop.station_code}): Arrives ${destStop.sta}, Departs ${destStop.std} on Day ${destStop.day}`
    );
  }

  // Full route summary (first 6 stops + last)
  const routePreview = train.route.slice(0, 6).map(
    (s) => `  ${s.station_name} (${s.station_code}): Dep ${s.std}`
  );
  if (train.route.length > 6) {
    const last = train.route[train.route.length - 1];
    routePreview.push(`  ... → ${last.station_name} (${last.station_code}): Arr ${last.sta}`);
  }

  return (
    `${train.train_number} – ${train.train_name} (${train.type})\n` +
    `Route: ${train.origin} → ${train.destination}\n` +
    `Distance: ${train.distance_km} km | Duration: ${train.duration} | Runs: ${runDays}\n` +
    `Schedule (first stops):\n${routePreview.join("\n")}`
  );
}

/**
 * calculate_fare – wired to KNOWN_PLACES coordinate data + routes logic
 * Computes real Haversine distance between locations and derives fares
 * using the same rate matrix from src/data/routes.ts.
 */
function calculateFare(
  start_location: string,
  end_location: string,
  transport_type: string = "train"
): string {
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }

  function findPlace(query: string): MapPlace | null {
    const q = query.toLowerCase();
    return (
      KNOWN_PLACES.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          q.includes(p.name.toLowerCase().split(" ")[0])
      ) ?? null
    );
  }

  const from = findPlace(start_location);
  const to = findPlace(end_location);

  if (!from || !to) {
    const missing = !from ? start_location : end_location;
    return (
      `Location "${missing}" not found in the TrackMate map database. ` +
      `Known stations include: Howrah Railway Station, Tatanagar Junction, ` +
      `Kharagpur Railway Station, Ghatsila Station, Chaibasa Railway Station, ` +
      `Jhargram Station, and more.`
    );
  }

  const distKm = haversine(from.lat, from.lng, to.lat, to.lng);
  const tt = transport_type.toLowerCase();

  // Fare matrix – mirrors generateRoutes() in src/data/routes.ts
  let fare = 0;
  let details = "";

  if (tt === "train" || tt === "rail") {
    fare = Math.max(40, Math.round(distKm * 1.8));
    const slFare = Math.max(265, Math.round(distKm * 0.9));
    const threAFare = Math.max(705, Math.round(distKm * 3.0));
    details =
      `Train fares (${from.name} → ${to.name}, ~${distKm} km):\n` +
      `• General (GN): ₹${Math.round(distKm * 0.6)}\n` +
      `• Sleeper (SL): ₹${slFare}\n` +
      `• 3AC (3A): ₹${threAFare}\n` +
      `• 2AC (2A): ₹${Math.round(threAFare * 1.42)}\n` +
      `• 1AC (1A): ₹${Math.round(threAFare * 2.38)}\n` +
      `Estimated journey time: ~${Math.round(distKm * 1.1)} min by express train.`;
  } else if (tt === "bus") {
    fare = Math.round(distKm * 1.2);
    details =
      `Bus fare (${from.name} → ${to.name}, ~${distKm} km): ₹${fare}.\n` +
      `Estimated journey time: ~${Math.round(distKm * 1.95)} min.`;
  } else if (tt === "cab" || tt === "taxi") {
    fare = Math.round(distKm * 12);
    details =
      `Cab fare (${from.name} → ${to.name}, ~${distKm} km): ₹${Math.round(distKm * 11)}–₹${Math.round(distKm * 13)}.\n` +
      `Estimated journey time: ~${Math.round(distKm * 1.3)} min.`;
  } else if (tt === "auto") {
    fare = Math.round(distKm * 7);
    details =
      `Auto-rickshaw fare (${from.name} → ${to.name}, ~${distKm} km): ₹${Math.round(distKm * 6)}–₹${Math.round(distKm * 8)}.\n` +
      `Estimated journey time: ~${Math.round(distKm * 1.55)} min.`;
  } else {
    fare = Math.max(40, Math.round(distKm * 1.8));
    details =
      `Multi-modal fares (${from.name} → ${to.name}, ~${distKm} km):\n` +
      `• Train (SL class): ₹${Math.max(265, Math.round(distKm * 0.9))}\n` +
      `• Bus: ₹${Math.round(distKm * 1.2)}\n` +
      `• Auto/Toto: ₹${Math.round(distKm * 6)}–₹${Math.round(distKm * 8)}\n` +
      `• Cab: ₹${Math.round(distKm * 11)}–₹${Math.round(distKm * 13)}`;
  }

  return details;
}

/**
 * get_navigation_route – wired to KNOWN_PLACES + OSRM public API
 * Returns turn-by-turn ETA, distance, and waypoints.
 */
async function getNavigationRoute(
  current_location: string,
  destination: string
): Promise<string> {
  function findPlace(query: string): MapPlace | null {
    const q = query.toLowerCase();
    return (
      KNOWN_PLACES.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          q.includes(p.name.toLowerCase().split(" ")[0])
      ) ?? null
    );
  }

  const from = findPlace(current_location);
  const to = findPlace(destination);

  if (!from || !to) {
    const missing = !from ? current_location : destination;
    return (
      `Location "${missing}" not found in the TrackMate map database. ` +
      `Try names like: Howrah Railway Station, Tatanagar Junction, Chaibasa Clock Tower, Bistupur Market.`
    );
  }

  // Straight-line distance (Haversine) as baseline
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const straightKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;

  // Try OSRM for road distance and ETA
  let roadKm = straightKm;
  let durationMin = Math.round(straightKm * 1.4);
  let routeNote = "";

  try {
    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=false&steps=false`;
    const osrmRes = await fetch(osrmUrl);
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.routes?.[0]) {
        roadKm = Math.round((osrmData.routes[0].distance / 1000) * 10) / 10;
        durationMin = Math.round(osrmData.routes[0].duration / 60);
        routeNote = "Road route calculated via OpenStreetMap OSRM.";
      }
    }
  } catch {
    routeNote = "Road routing service temporarily unavailable; using straight-line estimate.";
  }

  // Check if a direct train corridor exists between these two points
  const trainsOnCorridor = Object.values(TRAIN_DATABASE).filter((t) => {
    const fromQ = from.name.toLowerCase();
    const toQ = to.name.toLowerCase();
    const stationNames = t.route.map((s) => s.station_name.toLowerCase());
    const fromIdx = stationNames.findIndex((n) => n.includes(fromQ.split(" ")[0]));
    const toIdx = stationNames.findIndex((n) => n.includes(toQ.split(" ")[0]));
    return fromIdx !== -1 && toIdx !== -1;
  });

  let trainLine = "";
  if (trainsOnCorridor.length > 0) {
    const names = trainsOnCorridor
      .slice(0, 3)
      .map((t) => `${t.train_number} ${t.train_name}`)
      .join(", ");
    trainLine = `\nDirect train(s) available: ${names}.`;
  }

  return (
    `Navigation: ${from.name} → ${to.name}\n` +
    `Road distance: ~${roadKm} km | ETA by road: ~${durationMin} min\n` +
    `Straight-line: ~${straightKm} km${trainLine}\n` +
    `Map: ${from.category} at (${from.lat.toFixed(4)}, ${from.lng.toFixed(4)}) → ` +
    `${to.category} at (${to.lat.toFixed(4)}, ${to.lng.toFixed(4)})\n` +
    (routeNote ? routeNote : "")
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION STORAGE  – mirrors database.py get_session_history()
// ─────────────────────────────────────────────────────────────────────────────

interface SessionMessage {
  role: "user" | "assistant";
  content: string;
}

const sessionStorage = new Map<string, SessionMessage[]>();

function getSessionHistory(sessionId: string): SessionMessage[] {
  if (!sessionStorage.has(sessionId)) {
    sessionStorage.set(sessionId, []);
  }
  return sessionStorage.get(sessionId)!;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_INSTRUCTIONS = `You are Trackmate, the official AI Virtual Assistant for the 'TrackMate' transit and mapping application. You help users with travel, routes, trains, fares, weather, and local info for the Chaibasa–Jamshedpur–Kolkata corridor.

CORE BEHAVIORS:
1. When you need real-world data, use EXACTLY ONE of these tool tags:
   - TRAIN INFO:  <function-get_train_timing>{"train_number": "12814", "destination": "Howrah"}</function-get_train_timing>
   - FARES:       <function-calculate_fare>{"start_location": "Tatanagar Junction", "end_location": "Howrah Railway Station", "transport_type": "train"}</function-calculate_fare>
   - NAVIGATION:  <function-get_navigation_route>{"current_location": "Chaibasa Clock Tower", "destination": "Tatanagar Junction"}</function-get_navigation_route>
   - WEATHER:     <function-get_weather_info>{"city": "Jamshedpur"}</function-get_weather_info>
   - LOCATE MAP:  <function-locate_place>{"place_name": "Bistupur Market"}</function-locate_place>
   - BUSINESS:    <function-get_business_info>{"category": "pricing_inquiry"}</function-get_business_info>
   - ESCALATE:    <function-escalate_to_human>{"user_issue": "describe issue"}</function-escalate_to_human>

2. When you trigger a tool tag, STOP. Do not add extra text after the tag.
3. If a "Result: ..." block is given to you by the system, present that data in a warm, natural, helpful way. Never show raw tag names or JSON to the user.
4. For questions you can answer directly (greetings, general advice, app features) respond conversationally without any tags.
5. Known trains: 18615 Kriya Yoga Express, 68019 Jhargram-Purulia MEMU, 68003 Howrah-Ghatsila MEMU, 12859 Gitanjali Express, 20898 Ranchi-Howrah Vande Bharat, 12814 Steel Express.
6. Keep responses concise and friendly.`;

// ─────────────────────────────────────────────────────────────────────────────
// TOOL DISPATCH TABLE
// ─────────────────────────────────────────────────────────────────────────────

type ToolArgs = Record<string, string>;

const TOOL_MAP: Record<string, (args: ToolArgs) => Promise<string> | string> = {
  get_business_info: (a) => getBusinessInfo(a.category ?? ""),
  escalate_to_human: (a) => escalateToHuman(a.user_issue ?? ""),
  get_weather_info: (a) => getWeatherInfo(a.city ?? ""),
  locate_place: (a) => locatePlace(a.place_name ?? ""),
  get_train_timing: (a) => getTrainTiming(a.train_number ?? "", a.destination),
  calculate_fare: (a) =>
    calculateFare(
      a.start_location ?? "",
      a.end_location ?? "",
      a.transport_type ?? "train"
    ),
  get_navigation_route: (a) =>
    getNavigationRoute(a.current_location ?? "", a.destination ?? ""),
};

// ─────────────────────────────────────────────────────────────────────────────
// GROQ HELPER
// ─────────────────────────────────────────────────────────────────────────────

async function callGroq(
  messages: { role: string; content: string }[]
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.0,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Groq error", res.status, txt);
    throw new Error(`Groq ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const userText: string = (payload.message ?? "").trim();
    const sessionId: string = payload.session_id ?? "default";

    if (!userText) {
      return new Response(
        JSON.stringify({ response: "Please type a message!", tool_triggered: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build message history (mirrors database.py session logic)
    const history = getSessionHistory(sessionId);
    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_INSTRUCTIONS },
      ...history,
      { role: "user", content: userText },
    ];

    // ── First Groq call ──
    let rawOutput = "";
    try {
      rawOutput = await callGroq(messages);
    } catch {
      return new Response(
        JSON.stringify({
          response: "I'm having trouble connecting right now. Please try again!",
          tool_triggered: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Tool detection (first match wins – mirrors main.py single-tool pass) ──
    const toolMatch = rawOutput.match(/<function-(\w+)>([\s\S]*?)<\/function-\1>/);
    const locateResults: string[] = [];
    let finalOutput = rawOutput;

    if (toolMatch) {
      const toolName = toolMatch[1];
      let toolArgs: ToolArgs = {};
      try {
        toolArgs = JSON.parse(toolMatch[2].trim());
      } catch {
        /* bad JSON – skip tool */
      }

      // Collect locate signals for frontend map
      if (toolName === "locate_place" && toolArgs.place_name) {
        locateResults.push(toolArgs.place_name);
      }

      const toolFn = TOOL_MAP[toolName];
      if (toolFn) {
        let toolResult = "";
        try {
          toolResult = await toolFn(toolArgs);
        } catch (e) {
          toolResult = `Tool error: ${String(e)}`;
        }

        // ── Two-pass: feed result back to Groq (mirrors main.py pattern) ──
        const secondMessages = [
          ...messages,
          { role: "assistant", content: rawOutput },
          { role: "user", content: `Result: ${toolResult}` },
        ];

        try {
          finalOutput = await callGroq(secondMessages);
        } catch {
          // Fallback: use raw tool result directly
          finalOutput = toolResult;
        }
      }
    }

    // Strip any remaining function tags from the final response
    const cleanOutput =
      finalOutput
        .replace(/<function-\w+>[\s\S]*?<\/function-\w+>/g, "")
        .trim() || "I have processed your request.";

    // Persist to session history
    history.push({ role: "user", content: userText });
    history.push({ role: "assistant", content: cleanOutput });
    // Keep last 20 turns to avoid token overflow
    if (history.length > 40) history.splice(0, history.length - 40);

    return new Response(
      JSON.stringify({ response: cleanOutput, tool_triggered: locateResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Chat handler error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

