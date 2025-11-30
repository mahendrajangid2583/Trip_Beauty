import React, { useState } from 'react';
import { X, Navigation, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StartJourneyModal = ({ isOpen, onClose, recommendedPlace, otherPlaces, onConfirmNavigation }) => {
  const [selectedPlace, setSelectedPlace] = useState(recommendedPlace);

  // Update selected place if recommendedPlace changes
  React.useEffect(() => {
    if (recommendedPlace) {
      setSelectedPlace(recommendedPlace);
    }
  }, [recommendedPlace]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedPlace) {
      onConfirmNavigation(selectedPlace);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Navigation className="text-blue-400" size={20} />
              Start Navigation
            </h3>
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Recommended Section */}
            {recommendedPlace && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-3">Recommended Next Stop</h4>
                <div 
                  onClick={() => setSelectedPlace(recommendedPlace)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    selectedPlace?._id === recommendedPlace._id 
                      ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${selectedPlace?._id === recommendedPlace._id ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-lg">{recommendedPlace.name}</h5>
                      <p className="text-sm text-gray-400">Closest to your location</p>
                    </div>
                  </div>
                  {selectedPlace?._id === recommendedPlace._id && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  )}
                </div>
              </div>
            )}

            {/* Other Options */}
            {otherPlaces && otherPlaces.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Other Options</h4>
                <div className="space-y-2">
                  {otherPlaces.map(place => (
                    <div 
                      key={place._id}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedPlace?._id === place._id 
                          ? 'bg-blue-500/10 border-blue-500/30' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      <span className={`font-medium ${selectedPlace?._id === place._id ? 'text-blue-400' : 'text-gray-300'}`}>
                        {place.name}
                      </span>
                      {selectedPlace?._id === place._id && (
                        <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5 mt-auto">
            <button
              onClick={handleConfirm}
              disabled={!selectedPlace}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Navigate to {selectedPlace ? selectedPlace.name.split(',')[0] : 'Selected Place'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StartJourneyModal;
