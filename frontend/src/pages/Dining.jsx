import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Info, Loader } from 'lucide-react';
import { getRestaurants } from '../services/geoapify';
import { getPlaceDetails } from '../services/wikipedia';
import { getDistanceFromLatLonInKm } from '../utils/recommendationAlgo';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

export default function Dining() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [activeId, setActiveId] = useState(null); // Exclusive expansion state
  const [images, setImages] = useState({}); // Map restaurant ID to image URL
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          findRestaurants(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          findRestaurants(40.7128, -74.0060); 
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const findRestaurants = async (lat, lng, radius = 1000) => {
    setLoading(true);
    try {
      const data = await getRestaurants(lat, lng, radius);
      
      if (data.length === 0 && radius < 50000) {
        const newRadius = radius * 2;
        toast(`No food nearby, widening search to ${newRadius}m...`, {
          icon: '🍔',
          style: {
            borderRadius: '10px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          },
        });
        findRestaurants(lat, lng, newRadius);
      } else {
        // Calculate distances and sort
        const sorted = data.map(rest => ({
            ...rest,
            distance: getDistanceFromLatLonInKm(lat, lng, rest.lat, rest.lng)
        })).sort((a, b) => a.distance - b.distance);
        
        setRestaurants(sorted);
        setLoading(false);

        // Fetch images in background
        fetchImages(sorted);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setLoading(false);
    }
  };

  const fetchImages = async (list) => {
    const imageMap = {};
    const chunks = [];
    for (let i = 0; i < list.length; i += 5) {
        chunks.push(list.slice(i, i + 5));
    }

    for (const chunk of chunks) {
        await Promise.all(chunk.map(async (item) => {
            // For restaurants, we might want to append "restaurant" to search if name is generic, 
            // but let's try direct name first as per request.
            const details = await getPlaceDetails(item.name);
            if (details && details.image) {
                imageMap[item.place_id || item.name] = details.image;
            }
        }));
        setImages(prev => ({ ...prev, ...imageMap }));
    }
  };

  const handleNavigate = (restaurant) => {
    navigate('/navigate', { state: { destination: { lat: restaurant.lat, lng: restaurant.lng }, name: restaurant.name } });
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
                Nearby Dining
            </h1>
            <p className="text-slate-400 font-light tracking-wide">Culinary experiences near you.</p>
          </div>
          {userLocation && (
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#fcd34d] bg-[#fcd34d]/10 px-4 py-2 rounded-full border border-[#fcd34d]/20 shadow-lg shadow-[#fcd34d]/5">
                <MapPin className="w-4 h-4" />
                <span>Near You</span>
             </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader className="w-12 h-12 text-[#fcd34d] animate-spin" />
            <p className="text-slate-500 animate-pulse font-light tracking-widest uppercase text-sm">Hunting for food...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant, index) => {
              const id = restaurant.place_id || index;
              const image = images[id || restaurant.name];

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
                        <img src={image} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <div className="text-center">
                                <span className="text-4xl mb-2 block">🍽️</span>
                            </div>
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#fcd34d]">
                            <MapPin className="w-3 h-3" />
                            {restaurant.distance.toFixed(1)} km
                        </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#fcd34d] transition-colors leading-tight">{restaurant.name}</h3>
                    </div>
                    <p className="text-xs text-[#fcd34d] font-medium uppercase tracking-wider mb-4">
                        {restaurant.categories?.find(c => c.startsWith('catering.cuisine'))?.split('.').pop() || 'Restaurant'}
                    </p>
                    
                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 font-light">{restaurant.address}</p>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <button
                        onClick={() => toggleExpand(id)}
                        className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors flex items-center justify-center gap-2 text-sm border border-white/5"
                      >
                        <Info className="w-4 h-4" />
                        Details
                      </button>
                      <button
                        onClick={() => handleNavigate(restaurant)}
                        className="py-2.5 rounded-xl bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-[#020617] font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#fcd34d]/20"
                      >
                        <Navigation className="w-4 h-4" />
                        Go
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeId === id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#020617]/50 border-t border-white/5 px-6 py-4"
                      >
                        <div className="grid grid-cols-1 gap-3 text-sm text-slate-300">
                           <div>
                              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Address</span>
                              <p className="font-light">{restaurant.address}</p>
                           </div>
                           {restaurant.details?.contact?.phone && (
                               <div>
                                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Phone</span>
                                  <p className="font-light">{restaurant.details.contact.phone}</p>
                               </div>
                           )}
                           {restaurant.details?.website && (
                               <div>
                                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Website</span>
                                  <a href={restaurant.details.website} target="_blank" rel="noopener noreferrer" className="text-[#fcd34d] hover:underline truncate block font-light">
                                     {restaurant.details.website}
                                  </a>
                               </div>
                           )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            
            {restaurants.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500 font-light">
                    No restaurants found nearby.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
