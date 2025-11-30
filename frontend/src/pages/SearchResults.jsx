import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Plus, MapPin, Loader } from 'lucide-react';
import { getPlacesByCity } from '../services/geoapify';
import { getPlaceDetails } from '../services/wikipedia';
import { addBookmark, removeBookmark, selectBookmarks } from '../store/bookmarksSlice';
import { addPlaceToTrip, fetchTrips } from '../store/tripSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AddToTripModal from '../components/AddToTripModal';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  // State
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchMeta, setSearchMeta] = useState(null); // Stores bbox/lat/lon
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const dispatch = useDispatch();
  const bookmarks = useSelector(selectBookmarks);
  
  // Sentinel Ref for Infinite Scroll
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Reset on new query
  useEffect(() => {
    if (query) {
      setResults([]);
      setOffset(0);
      setHasMore(true);
      setSearchMeta(null);
      fetchPlaces(query, 0, null);
    }
    dispatch(fetchTrips());
  }, [query]);

  // Fetch on offset change (Infinite Scroll)
  useEffect(() => {
    if (offset > 0 && query && hasMore && !loading) {
      fetchPlaces(query, offset, searchMeta);
    }
  }, [offset]);

  const fetchPlaces = async (searchTerm, currentOffset, meta) => {
    setLoading(true);
    try {
      // 1. Fetch from Geoapify (using Bbox/Pagination)
      // Note: limit is handled inside getPlacesByCity (default 50)
      const { results: newPlaces, meta: newMeta } = await getPlacesByCity(searchTerm, currentOffset, 50, meta);
      
      if (!meta && newMeta) {
        setSearchMeta(newMeta); // Cache meta on first call
      }

      if (newPlaces.length < 50) {
        setHasMore(false);
      }

      // 2. Hydrate with Wikipedia (Parallel)
      const hydratedPlaces = await Promise.all(newPlaces.map(async (place) => {
        const wikiDetails = await getPlaceDetails(place.name);
        return {
          ...place,
          image: wikiDetails?.image || null,
          description: wikiDetails?.description || place.address,
          wikiUrl: wikiDetails?.pageUrl
        };
      }));

      // 3. Append Results with State-Level Deduplication
      setResults(prev => {
         const existingNames = new Set(prev.map(p => p.name.toLowerCase().trim()));
         const uniqueNew = hydratedPlaces.filter(p => {
             const normalized = p.name.toLowerCase().trim();
             if (existingNames.has(normalized)) return false;
             existingNames.add(normalized);
             return true;
         });
         return [...prev, ...uniqueNew];
      });

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold">
            {searchMeta?.matchType && ['country', 'state'].includes(searchMeta.matchType) ? 'Top Sights in ' : 'Results for '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {searchMeta?.formatted?.split(',')[0] || query}
            </span>
            </h1>
            {searchMeta?.matchType && ['country', 'state'].includes(searchMeta.matchType) && (
                <p className="text-gray-400 mt-2">Exploring popular destinations across the region.</p>
            )}
        </div>

        {/* Results List (YouTube Style) */}
        <div className="space-y-6">
          {results.map((place, index) => {
             // Attach ref to the last element
             const isLast = index === results.length - 1;
             return (
                <motion.div
                    ref={isLast ? lastElementRef : null}
                    key={`${place.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row gap-6 bg-[#111] hover:bg-[#1a1a1a] p-4 rounded-xl border border-white/5 transition-colors group"
                >
                    {/* Thumbnail */}
                    <div className="w-full md:w-80 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 relative">
                        {place.image ? (
                            <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
                                <MapPin className="w-10 h-10 opacity-50" />
                            </div>
                        )}
                        {/* Distance Badge */}
                        {place.distance && (
                            <div className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-1 rounded text-white font-mono">
                                {(place.distance / 1000).toFixed(1)} km
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{place.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{place.address}</p>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleToggleBookmark(place)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    title="Save"
                                >
                                    <Heart className={`w-5 h-5 ${isBookmarked(place) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                </button>
                                <button
                                    onClick={() => setSelectedPlace(place)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    title="Add to Trip"
                                >
                                    <Plus className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                            {place.description}
                        </p>

                        {/* Tags */}
                        <div className="flex gap-2 mt-auto">
                            {place.categories && place.categories.slice(0, 3).map(cat => (
                                <span key={cat} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                                    {cat.split('.').pop()}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
             );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}

        {/* End of Results */}
        {!hasMore && results.length > 0 && (
            <div className="text-center py-12 text-gray-600">
                You've reached the end of the world (or at least the results).
            </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && (
            <div className="text-center py-20">
                <p className="text-xl text-gray-500">No results found for "{query}".</p>
                <p className="text-sm text-gray-600 mt-2">Try searching for a major city or country.</p>
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
