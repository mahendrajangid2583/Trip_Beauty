import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Plus, MapPin, ExternalLink, Loader } from 'lucide-react';
import { getPlaceDetails } from '../services/wikipedia';
import { getSights } from '../services/geoapify';
import { addBookmark, removeBookmark, selectBookmarks, fetchBookmarks } from '../store/bookmarksSlice';
import { addPlaceToTrip, fetchTrips } from '../store/tripSlice';
import AddToTripModal from '../components/AddToTripModal';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const TARGET_CITIES = [
  "Paris", "London", "New York", "Tokyo", "Rome", "Dubai", "Barcelona", "Istanbul", "Bangkok", "Singapore",
  "Amsterdam", "Prague", "Seoul", "Hong Kong", "Sydney", "Los Angeles", "San Francisco", "Las Vegas", "Miami",
  "Rio de Janeiro", "Cape Town", "Cairo", "Marrakech", "Kyoto", "Osaka", "Bali", "Phuket", "Santorini",
  "Mykonos", "Venice", "Florence", "Milan", "Vienna", "Berlin", "Munich", "Madrid", "Lisbon", "Athens",
  "Budapest", "Dublin", "Edinburgh", "Stockholm", "Copenhagen", "Oslo", "Helsinki", "Reykjavik", "Toronto",
  "Vancouver", "Montreal", "Mexico City", "Buenos Aires", "Lima", "Cusco", "Machu Picchu", "Petra"
];

// API Key is now handled in the backend

const getCityCoordinates = async (cityName) => {
  try {
    const response = await api.get(`/api/proxy/geoapify/geocode`, {
      params: { text: cityName }
    });
    if (response.data && response.data.features && response.data.features.length > 0) {
      const { lat, lon } = response.data.features[0].properties;
      return { lat, lon };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching coordinates for ${cityName}:`, error);
    return null;
  }
};

export default function Discover() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const dispatch = useDispatch();
  const bookmarks = useSelector(selectBookmarks);
  const loadedCitiesRef = useRef(new Set());
  const loadMorePlaces = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    // Pick 5 random cities that haven't been loaded yet (or reset if all loaded)
    let availableCities = TARGET_CITIES.filter(c => !loadedCitiesRef.current.has(c));
    if (availableCities.length === 0) {
        loadedCitiesRef.current.clear();
        availableCities = TARGET_CITIES;
    }

    const shuffled = [...availableCities].sort(() => 0.5 - Math.random());
    const selectedCities = shuffled.slice(0, 5);
    
    selectedCities.forEach(c => loadedCitiesRef.current.add(c));

    const newPlaces = [];

    for (const city of selectedCities) {
      const coords = await getCityCoordinates(city);
      if (coords) {
        // Fetch top sight for this city
        const sights = await getSights(coords.lat, coords.lon, 'tourism.sights', 5000, 1);
        if (sights.length > 0) {
          const sight = sights[0];
          // Hydrate with Wiki
          const wikiDetails = await getPlaceDetails(sight.name);
          
          if (wikiDetails && wikiDetails.image) {
             newPlaces.push({
                ...sight,
                image: wikiDetails.image,
                description: wikiDetails.description,
                wikiUrl: wikiDetails.pageUrl,
                cityName: city
             });
          }
        }
      }
    }

    // Append new places using spread operator
    setPlaces(prev => {
        // Deduplicate just in case
        const existingIds = new Set(prev.map(p => p.name)); // Use name as ID proxy if ID is unstable
        const uniqueNew = newPlaces.filter(p => !existingIds.has(p.name));
        return [...prev, ...uniqueNew];
    });
    setLoading(false);
  }, [loading]);

  useEffect(() => {
    loadMorePlaces();
    dispatch(fetchTrips());
    dispatch(fetchBookmarks()); // Ensure bookmarks are loaded
  }, []); // Initial load only

  // Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
        loadMorePlaces();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePlaces]);

  const isBookmarked = (place) => {
    return bookmarks.some(b => 
        (b.id && b.id === place.id) || 
        (b.name === place.name && b.lat === place.lat && b.lng === place.lng)
    );
  };

  const handleToggleBookmark = (place) => {
    if (isBookmarked(place)) {
       const bookmark = bookmarks.find(b => 
        (b.id && b.id === place.id) || 
        (b.name === place.name && b.lat === place.lat && b.lng === place.lng)
      );
      const idToRemove = bookmark?._id || place.id;
      dispatch(removeBookmark(idToRemove));
    } else {
      dispatch(addBookmark({
        id: place.id,
        name: place.name,
        image: place.image,
        description: place.description,
        lat: place.lat,
        lng: place.lng,
        source: 'geoapify'
      }));
    }
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
        source: 'geoapify'
      }
    }));
    setSelectedPlace(null);
    alert('Added to trip!');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#fef3c7] tracking-tight">
          World Explorer
        </h1>
        <p className="text-slate-400 mb-12 text-lg text-center max-w-2xl mx-auto font-light tracking-wide">
          Curated collection of the world's most breathtaking destinations.
        </p>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {places.map((place, index) => (
            <motion.div
              key={`${place.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer shadow-2xl shadow-black/50 border border-white/5 hover:border-[#fcd34d]/30 transition-all duration-500"
            >
              {/* Image */}
              <div className="aspect-[4/3] w-full relative overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl font-serif font-bold text-[#fcd34d] leading-tight drop-shadow-lg">{place.name}</h3>
                    <span className="text-[10px] font-bold bg-white/10 backdrop-blur-md px-2 py-1 rounded-full text-slate-200 mb-1 ml-2 whitespace-nowrap border border-white/10 uppercase tracking-wider">{place.cityName}</span>
                </div>
                
                <p className="text-slate-300 text-sm mb-4 line-clamp-2 font-light">{place.description}</p>
                
                {/* Hover Actions */}
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleBookmark(place); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-[#020617] rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#fcd34d]/20"
                  >
                    <Heart className={`w-3 h-3 ${isBookmarked(place) ? 'fill-[#020617] text-[#020617]' : 'text-[#020617]'}`} />
                    {isBookmarked(place) ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPlace(place); }}
                    className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-colors border border-white/10"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                  <a
                    href={place.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-colors ml-auto border border-white/10"
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-[#fcd34d] animate-spin" />
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      <AnimatePresence>
        {selectedPlace && (
            <AddToTripModal 
                isOpen={!!selectedPlace} 
                onClose={() => setSelectedPlace(null)} 
                place={selectedPlace} 
            />
        )}
      </AnimatePresence>
    </div>
  );
}
