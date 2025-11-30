import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Loader, Info } from 'lucide-react';
import { getSights } from '../services/geoapify';
import { getPlaceDetails } from '../services/wikipedia';
import { getDistanceFromLatLonInKm } from '../utils/recommendationAlgo';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import AddToTripModal from '../components/AddToTripModal'; // Assuming this is where it is

export default function NearbySights() {
  const [sights, setSights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [activeId, setActiveId] = useState(null); // Exclusive expansion state
  const [images, setImages] = useState({}); // Map sight ID to image URL
  const [selectedSightForTrip, setSelectedSightForTrip] = useState(null); // For modal
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          findNearbySights(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          toast.error("Could not get your location.");
        }
      );
    } else {
      setLoading(false);
      toast.error("Geolocation is not supported by your browser.");
    }
  }, []);

  const findNearbySights = async (lat, lng, radius = 5000) => {
    setLoading(true);
    try {
      const data = await getSights(lat, lng, 'tourism.sights', radius, 50);
      
      if (data.length < 5 && radius < 100000) {
        const newRadius = radius * 2;
        toast(`Expanding search to ${(newRadius / 1000).toFixed(0)}km...`, {
            icon: '🌍',
            style: {
              borderRadius: '10px',
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            },
            duration: 2000
        });
        findNearbySights(lat, lng, newRadius);
        return;
      }

      // Calculate distances and sort
      const sorted = data.map(sight => ({
        ...sight,
        distance: getDistanceFromLatLonInKm(lat, lng, sight.lat, sight.lng)
      })).sort((a, b) => a.distance - b.distance);

      setSights(sorted);
      setLoading(false);

      // Fetch images in background
      fetchImages(sorted);

    } catch (error) {
      console.error("Error fetching sights:", error);
      setLoading(false);
      toast.error("Failed to find nearby sights.");
    }
  };

  const fetchImages = async (sightsList) => {
    const imageMap = {};
    // Process in chunks to avoid overwhelming the API
    const chunks = [];
    for (let i = 0; i < sightsList.length; i += 5) {
        chunks.push(sightsList.slice(i, i + 5));
    }

    for (const chunk of chunks) {
        await Promise.all(chunk.map(async (sight) => {
            const details = await getPlaceDetails(sight.name);
            if (details && details.image) {
                imageMap[sight.place_id || sight.name] = details.image;
            }
        }));
        setImages(prev => ({ ...prev, ...imageMap }));
    }
  };

  const handleNavigate = (sight) => {
    navigate('/navigate', { state: { destination: { lat: sight.lat, lng: sight.lng }, name: sight.name } });
  };

  const toggleExpand = (id) => {
    setActiveId(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-28 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="bottom-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">
                Nearby Sights
            </h1>
            <p className="text-slate-400 font-light tracking-wide">Discover hidden gems around you.</p>
          </div>
          {userLocation && (
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fcd34d] bg-[#fcd34d]/10 px-4 py-2 rounded-full border border-[#fcd34d]/20 shadow-lg shadow-[#fcd34d]/5">
                <MapPin className="w-4 h-4" />
                <span>Locating...</span>
             </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader className="w-12 h-12 text-[#fcd34d] animate-spin" />
            <p className="text-slate-500 animate-pulse font-light tracking-widest uppercase text-sm">Scanning the horizon...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sights.map((sight, index) => {
              const id = sight.place_id || index;
              const image = images[id || sight.name];
              
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#fcd34d]/30 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 group flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    {image ? (
                        <img src={image} alt={sight.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <MapPin className="w-12 h-12 text-slate-700" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#fcd34d]">
                            <MapPin className="w-3 h-3" />
                            {sight.distance.toFixed(1)} km
                        </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-[#fcd34d] transition-colors leading-tight">{sight.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 font-light">{sight.address}</p>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <button
                        onClick={() => toggleExpand(id)}
                        className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm border border-white/5"
                      >
                        <Info className="w-4 h-4" />
                        Details
                      </button>
                      <button
                        onClick={() => handleNavigate(sight)}
                        className="py-2.5 rounded-xl bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-[#020617] font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#fcd34d]/20"
                      >
                        <Navigation className="w-4 h-4" />
                        Go
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {activeId === id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#020617]/50 border-t border-white/5 px-6 py-4"
                      >
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Full Address</p>
                         <p className="text-sm text-slate-300 font-light leading-relaxed">{sight.address}</p>
                         
                         {/* Add to Trip Button (Optional, if needed here) */}
                         {/* <button onClick={() => setSelectedSightForTrip(sight)} ... /> */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            
            {sights.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500 font-light">
                    No sights found nearby. Try moving to a more populated area!
                </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add To Trip Modal (If we want to enable adding from here) */}
      {/* <AddToTripModal isOpen={!!selectedSightForTrip} onClose={() => setSelectedSightForTrip(null)} place={selectedSightForTrip} /> */}
    </div>
  );
}
