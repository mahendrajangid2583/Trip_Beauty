import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, X, Calendar } from 'lucide-react';
import { addPlaceToTrip } from '../store/tripSlice';

export default function AddToTripModal({ isOpen, onClose, place }) {
  const dispatch = useDispatch();
  const { trips } = useSelector(state => state.trips);

  if (!isOpen || !place) return null;

  // Filter for active/upcoming trips only (not completed)
  const activeTrips = trips.filter(trip => trip.status !== 'completed');

  const handleAddToTrip = (tripId) => {
    dispatch(addPlaceToTrip({
      tripId,
      placeData: {
        name: place.name,
        image: place.image,
        description: place.description,
        lat: place.lat,
        lng: place.lng,
        source: place.source || 'geoapify'
      }
    }));
    onClose();
    // alert(`Added ${place.name} to trip!`); // Removed alert for smoother UX, maybe use toast if available
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#fcd34d]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
        >
            <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-serif font-bold text-white mb-2">Add to Journey</h2>
        <p className="text-slate-400 text-sm mb-6 font-light">Select a trip to add <span className="text-[#fcd34d] font-medium">{place.name}</span> to:</p>
        
        <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
          {activeTrips.length > 0 ? (
            activeTrips.map(trip => (
              <button
                key={trip._id}
                onClick={() => handleAddToTrip(trip._id)}
                className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#fcd34d]/30 transition-all flex items-center justify-between group"
              >
                <div>
                    <span className="font-medium block text-slate-200 group-hover:text-white mb-1">{trip.tripName || trip.name || "Untitled Journey"}</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(trip.startDate)}</span>
                    </div>
                </div>
                <div className="p-2 rounded-full border border-white/10 group-hover:border-[#fcd34d] group-hover:bg-[#fcd34d] transition-all shadow-lg">
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#020617]" />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-slate-500 mb-2 font-medium">No active journeys found.</p>
                <p className="text-xs text-slate-600 font-light">Create a new journey from the dashboard first.</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors border border-white/5 text-sm"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
