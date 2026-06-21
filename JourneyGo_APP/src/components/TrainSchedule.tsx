import { useState } from 'react';
import { Search, Train, Clock, MapPin, ArrowRight } from 'lucide-react';
import { TRAIN_DATABASE, searchTrainsByStation } from '../data/trains';
import type { TrainData } from '../data/trains';

export default function TrainSchedule() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrainData[]>([]);
  const [expandedTrain, setExpandedTrain] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Try train number first
    const directMatch = TRAIN_DATABASE[trimmed];
    if (directMatch) {
      setResults([directMatch]);
    } else {
      // Search by station name
      const stationMatches = searchTrainsByStation(trimmed);
      setResults(stationMatches);
    }
    setSearched(true);
    setExpandedTrain(null);
  }

  const allTrainNumbers = Object.keys(TRAIN_DATABASE);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
          <Train size={18} className="text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Train Schedule</p>
          <p className="text-xs text-gray-400">Search by train no. or station</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="e.g. 12814 or Tatanagar"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-purple-600 text-white font-bold px-4 rounded-xl text-sm active:scale-95 transition-transform shadow-sm"
          >
            Search
          </button>
        </div>

        {/* Quick train buttons */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
          {allTrainNumbers.slice(0, 6).map(no => (
            <button
              key={no}
              onClick={() => { setQuery(no); }}
              className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              {no}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="border-t border-gray-100 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Train size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">No trains found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try a train number or station name</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {results.map(train => {
                const expanded = expandedTrain === train.train_number;
                return (
                  <div key={train.train_number} className="px-4 py-3">
                    <button
                      onClick={() => setExpandedTrain(expanded ? null : train.train_number)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Train size={14} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{train.train_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-1.5 py-0.5 rounded">{train.train_number}</span>
                            <span className="text-[10px] text-gray-400">{train.type}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-[10px] text-gray-500">{train.distance_km}km</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock size={10} />
                            {train.duration}
                          </div>
                          <div className="flex items-center gap-0.5 text-[10px] text-gray-400 mt-0.5">
                            <MapPin size={8} />
                            {train.origin.split('(')[0].trim()}
                            <ArrowRight size={8} />
                            {train.destination.split('(')[0].trim()}
                          </div>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="mt-3 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="text-left px-2.5 py-1.5 font-bold text-gray-600">#</th>
                              <th className="text-left px-2.5 py-1.5 font-bold text-gray-600">Station</th>
                              <th className="text-center px-2.5 py-1.5 font-bold text-gray-600">Arr</th>
                              <th className="text-center px-2.5 py-1.5 font-bold text-gray-600">Dep</th>
                              <th className="text-right px-2.5 py-1.5 font-bold text-gray-600">Km</th>
                            </tr>
                          </thead>
                          <tbody>
                            {train.route.map((station, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="px-2.5 py-1.5 text-gray-400 font-semibold">{idx + 1}</td>
                                <td className="px-2.5 py-1.5 font-semibold text-gray-800">{station.station_name}</td>
                                <td className="px-2.5 py-1.5 text-center text-gray-600">{station.sta}</td>
                                <td className="px-2.5 py-1.5 text-center text-blue-600 font-semibold">{station.std}</td>
                                <td className="px-2.5 py-1.5 text-right text-gray-500">{station.distance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

