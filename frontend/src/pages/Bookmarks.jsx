import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, MapPin, ExternalLink } from 'lucide-react';
import { removeBookmark, selectBookmarks } from '../store/bookmarksSlice';
import { addPlaceToTrip, fetchTrips } from '../store/tripSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function Bookmarks() {
  const dispatch = useDispatch();
  const bookmarks = useSelector(selectBookmarks);
  const { trips } = useSelector(state => state.trips);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    dispatch(fetchTrips());
  }, []);

  const handleRemoveBookmark = (place) => {
    dispatch(removeBookmark({ id: place.id, name: place.name, lat: place.lat, lng: place.lng }));
  };

  const handleAddToTrip = (tripId) => {
    if (!selectedPlace) return;
    dispatch(addPlaceToTrip({
      tripId,
      placeData: {
        name: selectedPlace.name,
        image: selectedPlace.image,
        description: selectedPlace.description,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        source: selectedPlace.source || 'manual'
      }
    }));
    setSelectedPlace(null);
    alert('Added to trip!');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-28 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-white mb-2">My Bookmarks</h1>
            <p className="text-slate-400 font-light tracking-wide">Your curated collection of world treasures.</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
            <div className="p-4 bg-white/5 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-xl font-serif text-slate-300 mb-2">Your collection is empty.</p>
            <p className="text-slate-500 font-light">Explore the world to add treasures.</p>
            <a href="/discover" className="mt-6 px-6 py-2 bg-[#fcd34d] text-[#020617] rounded-full font-bold text-sm hover:bg-[#fcd34d]/90 transition-colors">
                Start Exploring
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map((place, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#fcd34d]/30 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 group flex flex-col"
              >
                <div className="relative h-56 bg-slate-900 overflow-hidden">
                  {place.image ? (
                    <img 
                        src={place.image} 
                        alt={place.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                      <MapPin className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
                    <button
                      onClick={() => handleRemoveBookmark(place)}
                      className="p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors border border-white/10"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="p-2 bg-[#fcd34d] backdrop-blur-md rounded-full hover:bg-[#fcd34d]/90 text-[#020617] transition-colors shadow-lg shadow-[#fcd34d]/20"
                      title="Add to Trip"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-serif font-bold text-white mb-2 leading-tight group-hover:text-[#fcd34d] transition-colors">{place.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 font-light leading-relaxed">
                    {place.description || "No description available."}
                  </p>
                  
                  {place.lat && place.lng && (
                     <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pt-4 border-t border-white/5">
                        <MapPin className="w-3 h-3" />
                        {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                     </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      <AnimatePresence>
        {selectedPlace && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            >
              <h2 className="text-xl font-serif font-bold text-white mb-2">Add to Journey</h2>
              <p className="text-slate-400 text-sm mb-6 font-light">Select a trip to add <span className="text-[#fcd34d] font-medium">{selectedPlace.name}</span> to:</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {trips.length > 0 ? (
                  trips.map(trip => (
                    <button
                      key={trip._id}
                      onClick={() => handleAddToTrip(trip._id)}
                      className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#fcd34d]/30 transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium text-slate-200 group-hover:text-white">{trip.tripName || trip.name}</span>
                      <div className="p-1 rounded-full border border-white/10 group-hover:border-[#fcd34d] group-hover:bg-[#fcd34d] transition-all">
                        <Plus className="w-3 h-3 text-slate-400 group-hover:text-[#020617]" />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4 text-sm italic">No trips found. Create one first!</p>
                )}
              </div>

              <button
                onClick={() => setSelectedPlace(null)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors border border-white/5 text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
