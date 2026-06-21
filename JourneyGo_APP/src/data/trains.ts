export interface TrainStation {
  station_name: string;
  station_code: string;
  sta: string;
  std: string;
  day: number;
  distance: number;
}

export interface TrainData {
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

export const TRAIN_DATABASE: Record<string, TrainData> = {
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

export function searchTrainsByStation(stationName: string): TrainData[] {
  const query = stationName.toLowerCase();
  return Object.values(TRAIN_DATABASE).filter(train =>
    train.route.some(s => s.station_name.toLowerCase().includes(query))
  );
}

export function getTrainByNumber(trainNo: string): TrainData | null {
  return TRAIN_DATABASE[trainNo] ?? null;
}

