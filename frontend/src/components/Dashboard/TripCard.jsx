import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle,
  Plus,
  Share2,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  deleteTrip,
  updateTripStatus,
  addPlaceToTrip,
  updatePlaceStatus,
  deletePlaceFromTrip
} from '../../store/tripSlice';
import PlaceItem from './PlaceItem';
import { api } from '../../utils/api';
import { getDistanceFromLatLonInKm } from '../../utils/recommendationAlgo';

const TripCard = ({ trip, index, isExpanded, onToggle, onGoClick, userLocation, onShare }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search Logic
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() && isExpanded) {
        setIsSearching(true);
        try {
          const results = await api.searchPlaces(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isExpanded]);

  const handleAddPlace = (place) => {
    dispatch(addPlaceToTrip({ tripId: trip._id, placeData: place }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const getSortedPlaces = (places) => {
    if (!places) return [];
    const pending = places.filter(p => p.status === 'pending');
    const completed = places.filter(p => p.status !== 'pending');

    if (userLocation) {
      pending.sort((a, b) => {
        const distA = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }
    return [...pending, ...completed];
  };

  const sortedPlaces = getSortedPlaces(trip.places);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#fcd34d]/30 transition-all duration-300 ${isExpanded ? 'lg:col-span-2 row-span-2' : ''}`}
    >
      {/* Trip Header */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
            <h3 className="text-xl font-serif font-bold text-white leading-tight group-hover:text-[#fcd34d] transition-colors truncate pr-2">
              {trip.name}
            </h3>
            {trip.timeConstraint && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1 font-medium uppercase tracking-wider">
                <Clock size={12} />
                <span>{trip.timeConstraint}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto relative z-10">
            <button
              onClick={(e) => { e.stopPropagation(); onShare(trip); }}
              className="p-2 text-slate-400 hover:text-[#fcd34d] hover:bg-[#fcd34d]/10 rounded-full transition-colors border border-transparent hover:border-[#fcd34d]/20"
              title="Share Trip"
            >
              <Share2 size={18} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // If it's an itinerary trip, we might want to just open it directly instead of showing the "Start Journey" modal which is for manual trips
                // OR we can let the parent handle it.
                // Let's let the parent handle it, but maybe pass a flag or check in parent.
                onGoClick(trip);
              }}
              className="flex items-center gap-1.5 bg-[#fcd34d] text-[#020617] hover:bg-[#fcd34d]/90 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#fcd34d]/20"
            >
              <Navigation size={14} />
              {trip.itinerary && trip.itinerary.length > 0 ? 'View' : 'Go'}
            </button>

            {/* Complete / Reactivate Toggle */}
            {trip.status === 'completed' ? (
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(updateTripStatus({ tripId: trip._id, status: 'active' })); }}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors border border-transparent hover:border-blue-500/20"
                title="Reactivate Trip"
              >
                <RefreshCcw size={18} />
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(updateTripStatus({ tripId: trip._id, status: 'completed' })); }}
                className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-colors border border-transparent hover:border-green-500/20"
                title="Complete Trip"
              >
                <CheckCircle size={18} />
              </button>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); dispatch(deleteTrip(trip._id)); }}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors border border-transparent hover:border-red-500/20"
              title="Delete Trip"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onToggle}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Search Bar - Only visible when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="relative overflow-visible"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#fcd34d] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Add a place to your journey..."
                  className="w-full pl-11 pr-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl focus:border-[#fcd34d] outline-none transition-all text-sm text-white placeholder-slate-600"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] rounded-xl shadow-2xl border border-white/10 z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleAddPlace(result)}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between group transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="font-medium text-slate-300 text-sm group-hover:text-white">{result.name}</span>
                      <Plus size={14} className="text-slate-500 group-hover:text-[#fcd34d]" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Places List - Only visible when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-6 bg-[#020617]/30 border-t border-white/5">
              {trip.places.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-slate-500 text-sm font-light italic">Your journey is empty. Add a destination to begin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPlaces.map(place => (
                    <PlaceItem
                      key={place._id}
                      place={place}
                      tripId={trip._id}
                      onToggleStatus={(pId, status) => dispatch(updatePlaceStatus({ tripId: trip._id, placeId: pId, status }))}
                      onSkip={(pId, status) => dispatch(updatePlaceStatus({ tripId: trip._id, placeId: pId, status }))}
                      onDelete={(pId) => dispatch(deletePlaceFromTrip({ tripId: trip._id, placeId: pId }))}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TripCard;
