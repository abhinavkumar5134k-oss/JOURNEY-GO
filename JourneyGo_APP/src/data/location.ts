export const POPULAR_LOCATIONS = [
  // Chaibasa Area
  { name: 'Chaibasa Clock Tower', area: 'Chaibasa', city: 'Jharkhand' },
  { name: 'Jubilee Lake Park', area: 'Chaibasa', city: 'Jharkhand' },
  { name: 'Roro Dam', area: 'Chaibasa', city: 'Jharkhand' },
  // Jamshedpur Area
  { name: 'Tatanagar Junction', area: 'Jamshedpur', city: 'Jharkhand' },
  { name: 'Bistupur Market', area: 'Jamshedpur', city: 'Jharkhand' },
  { name: 'Jubilee Park', area: 'Jamshedpur', city: 'Jharkhand' },
  { name: 'Dalma Sanctuary', area: 'Jamshedpur', city: 'Jharkhand' },
  // Kolkata Area
  { name: 'Howrah Railway Station', area: 'Howrah', city: 'Kolkata' },
  { name: 'Victoria Memorial', area: 'Central Kolkata', city: 'Kolkata' },
  { name: 'Howrah Bridge', area: 'Howrah', city: 'Kolkata' },
  { name: 'Eco Park', area: 'New Town', city: 'Kolkata' },
  { name: 'Dakshineswar Kali Temple', area: 'North Kolkata', city: 'Kolkata' },
  // Delhi Area
  { name: 'Connaught Place', area: 'Central Delhi', city: 'Delhi' },
  { name: 'IGI Airport', area: 'Dwarka', city: 'Delhi' },
  { name: 'India Gate', area: 'Rajpath', city: 'Delhi' },
  { name: 'Saket', area: 'South Delhi', city: 'Delhi' },
  { name: 'Hauz Khas', area: 'South Delhi', city: 'Delhi' },
  { name: 'New Delhi Railway Station', area: 'Central Delhi', city: 'Delhi' },
  // Transit Stations
  { name: 'Kharagpur Junction', area: 'Kharagpur', city: 'West Bengal' },
  { name: 'Jhargram Station', area: 'Jhargram', city: 'West Bengal' },
  { name: 'Ghatsila Station', area: 'Ghatsila', city: 'Jharkhand' },
  { name: 'Chakradharpur Station', area: 'Chakradharpur', city: 'Jharkhand' },
  { name: 'Santragachi Junction', area: 'Howrah', city: 'Kolkata' },
  { name: 'Seraikela Town', area: 'Seraikela', city: 'Jharkhand' },
];

export const RECENT_ROUTES = [
  { from: 'Howrah Railway Station', to: 'Tatanagar Junction', distance: 249 },
  { from: 'Chaibasa Clock Tower', to: 'Bistupur Market', distance: 42 },
  { from: 'Tatanagar Junction', to: 'Kharagpur Junction', distance: 134 },
  { from: 'Victoria Memorial', to: 'Eco Park', distance: 18 },
];

export interface MapPlace {
  name: string;
  category: string;
  lat: number;
  lng: number;
  symbol: string;
  description: string;
}

export const CHAIBASA_PLACES: MapPlace[] = [
  // Chaibasa Area
  { name: "Chaibasa Clock Tower", category: "Landmark", lat: 22.5533, lng: 85.8058, symbol: "🏛️", description: "Bustling commercial hub." },
  { name: "Jubilee Lake Park", category: "Park", lat: 22.5580, lng: 85.8120, symbol: "🏞️", description: "Serene park centered around a beautiful local lake." },
  { name: "Kachahari Talab Park", category: "Park", lat: 22.5500, lng: 85.8200, symbol: "🌳", description: "Well-maintained community space." },
  { name: "Chaibasa Engineering College", category: "College", lat: 22.5180, lng: 85.8080, symbol: "🎓", description: "Engineering institute." },
  { name: "Roro Dam", category: "Attraction", lat: 22.5350, lng: 85.8010, symbol: "🌊", description: "Tranquil water reservoir." },

  // Jamshedpur Area
  { name: "Seraikela Town", category: "Town", lat: 22.6975, lng: 85.9288, symbol: "🏘️", description: "Historic town and district headquarters." },
  { name: "Adityapur Toll Bridge", category: "Landmark", lat: 22.7845, lng: 86.1654, symbol: "🌉", description: "Gateway to Jamshedpur crossing the Kharkai River." },
  { name: "NIT Jamshedpur", category: "College", lat: 22.7766, lng: 86.1438, symbol: "🎓", description: "National Institute of Technology in Adityapur." },
  { name: "Bistupur Market", category: "Market", lat: 22.7963, lng: 86.1837, symbol: "🛍️", description: "Prime commercial area." },
  { name: "Jubilee Park, JSR", category: "Park", lat: 22.8055, lng: 86.1832, symbol: "🌳", description: "Massive urban park." },
  { name: "Dalma Sanctuary", category: "Attraction", lat: 22.8833, lng: 86.2167, symbol: "🐘", description: "Forested area famous for wild elephants." },

  // Kolkata & Howrah
  { name: "Victoria Memorial", category: "Landmark", lat: 22.5448, lng: 88.3426, symbol: "🏛️", description: "Iconic marble building." },
  { name: "Howrah Bridge", category: "Landmark", lat: 22.5851, lng: 88.3468, symbol: "🌉", description: "Historic cantilever bridge." },
  { name: "Eco Park", category: "Park", lat: 22.6163, lng: 88.4665, symbol: "🌳", description: "Massive urban park in New Town." },
  { name: "Dakshineswar Kali Temple", category: "Temple", lat: 22.6534, lng: 88.3577, symbol: "🛕", description: "Famous Hindu temple." },

  // Railway Stations
  { name: "Howrah Railway Station", category: "Train Station", lat: 22.5830, lng: 88.3425, symbol: "🚉", description: "Terminal Station." },
  { name: "Santragachi Junction", category: "Train Station", lat: 22.5802, lng: 88.2774, symbol: "🚉", description: "Major junction in Howrah." },
  { name: "Kharagpur Railway Station", category: "Train Station", lat: 22.3330, lng: 87.3250, symbol: "🚉", description: "Major railway junction." },
  { name: "Jhargram Station", category: "Train Station", lat: 22.4540, lng: 86.9930, symbol: "🚉", description: "Important stop before entering Jharkhand." },
  { name: "Ghatsila Station", category: "Train Station", lat: 22.5830, lng: 86.4780, symbol: "🚉", description: "Tourist destination station." },
  { name: "Rakha Mines Station", category: "Train Station", lat: 22.6375, lng: 86.3785, symbol: "🚉", description: "Station near the copper mining area." },
  { name: "Tatanagar Junction", category: "Train Station", lat: 22.7667, lng: 86.1985, symbol: "🚉", description: "Major junction serving Jamshedpur." },
  { name: "Adityapur Station", category: "Train Station", lat: 22.7850, lng: 86.1550, symbol: "🚉", description: "Industrial hub station." },
  { name: "Sini Junction", category: "Train Station", lat: 22.7950, lng: 85.9550, symbol: "🚉", description: "Railway junction." },
  { name: "Rajkharsawan Junction", category: "Train Station", lat: 22.7500, lng: 85.8200, symbol: "🚉", description: "Junction where lines split to Chaibasa & Chakradharpur." },
  { name: "Chaibasa Railway Station", category: "Train Station", lat: 22.5650, lng: 85.8150, symbol: "🚉", description: "Station serving West Singhbhum headquarters." },
  { name: "Chakradharpur Railway Station", category: "Train Station", lat: 22.6784, lng: 85.6263, symbol: "🚉", description: "Headquarters of the Chakradharpur railway division." },

  // Metro & Ferry
  { name: "Howrah Metro Station", category: "Metro", lat: 22.5848, lng: 88.3434, symbol: "🚇", description: "Deepest metro station in India." },
  { name: "Howrah Ferry Ghat", category: "Ferry", lat: 22.5835, lng: 88.3441, symbol: "⛴️", description: "Major ferry terminal." },
];

export interface RailwayLine {
  name: string;
  color: string;
  track: [number, number][];
}

export const RAILWAY_LINES: RailwayLine[] = [
  {
    name: "South Eastern Main Line",
    color: "#2c3e50",
    track: [
      [22.5830, 88.3425], [22.5802, 88.2774], [22.3892, 87.7121], [22.3330, 87.3250],
      [22.4540, 86.9930], [22.5830, 86.4780], [22.6375, 86.3785], [22.7667, 86.1985],
      [22.7850, 86.1550], [22.7950, 85.9550], [22.7500, 85.8200], [22.6784, 85.6263],
    ],
  },
  {
    name: "Chaibasa Branch Line",
    color: "#8e44ad",
    track: [[22.7500, 85.8200], [22.5650, 85.8150]],
  },
];



