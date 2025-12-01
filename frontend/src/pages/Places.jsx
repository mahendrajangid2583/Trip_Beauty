import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Navigation, Filter, Image as ImageIcon, ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePlace } from '../store/selectedPlacesSlice.js';
import { selectSelectedPlaces } from '../store/index.js';
import api from '../services/api';
import { AnimatePresence, motion } from 'framer-motion';

// Gallery Modal Component
const GalleryModal = ({ isOpen, onClose, images, placeName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
          <img
            src={images[currentIndex]}
            alt={`${placeName} ${currentIndex + 1}`}
            className="w-full h-full object-contain rounded-lg"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden transition-all ${idx === currentIndex ? 'ring-2 ring-[#fcd34d] scale-110' : 'opacity-50 hover:opacity-100'
                }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Places = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlaces = useSelector(selectSelectedPlaces);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [cityLat, setCityLat] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cityLon, setCityLon] = useState(null);

  useEffect(() => {
    // Get city data from location state
    if (location.state) {
      const { name, lat, lon } = location.state;
      setCityName(name || 'City');
      setCityLat(lat);
      setCityLon(lon);

      if (lat && lon) {
        fetchPlaces(lat, lon);
      } else {
        setError('City coordinates are missing');
        setLoading(false);
      }
    } else {
      setError('No city selected');
      setLoading(false);
    }
  }, [location]);

  const fetchPlaces = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/api/cities/places?lat=${lat}&lon=${lon}&radius=50000&limit=10`
      );

      const data = response.data;
      setPlaces(data.places || data || []);
    } catch (error) {
      console.error('Error fetching places:', error);
      setError('Failed to load places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleGenerateTrip = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await api.post(`/api/plan-trip`, { city: cityName, places: selectedPlaces });
      const data = response.data;
      // persist for fallback and navigate
      const tripData = data.trip || { ...data, _id: data.tripId, itinerary: data.days, places: data.places };
      localStorage.setItem('tripPlan', JSON.stringify(tripData));
      navigate('/trip-planner', { state: { trip: tripData } });
    } catch (err) {
      console.error('Trip plan error:', err);
      alert('Failed to create trip plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pt-20">
      {/* Fixed Background for Navbar Area */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-slate-950 z-40" />

      {/* Header */}
      <div className="bg-slate-950/95 backdrop-blur-xl border-b border-white/10 sticky top-20 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-150 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-100">
                  Places in <span className="text-[#fcd34d]">{cityName}</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {places.length > 0 ? `${places.length} places found` : 'Discover amazing places'}
                </p>
              </div>
            </div>

            {selectedPlaces.length > 0 && (
              <div className="ml-auto flex items-center space-x-4 animate-fade-in">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#fcd34d]/10 text-[#fcd34d] border border-[#fcd34d]/20">
                  {selectedPlaces.length} selected
                </span>
                <button
                  onClick={handleGenerateTrip}
                  disabled={isGenerating}
                  className={`px-6 py-2 rounded-full bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-slate-950 text-sm font-bold tracking-wide transition-all duration-150 shadow-lg shadow-[#fcd34d]/20 flex items-center space-x-2 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Generate Trip Plan</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#fcd34d] mb-4"></div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Loading places...</h3>
            <p className="text-slate-500">Please wait while we fetch amazing places for you</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-red-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-400 mb-2">Error</h3>
            <p className="text-slate-500">{error}</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No places found</h3>
            <p className="text-slate-500">Try searching for a different city</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {places.map((place) => (
              <PlaceCard key={place.id || place.name} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Refactored Place Card Component
const PlaceCard = ({ place }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const dispatch = useDispatch();
  const isSelected = useSelector((state) => state.selectedPlaces.items.some((p) => p.id === place.id));

  const handleToggleSelect = (e) => {
    e.stopPropagation();
    const payload = {
      id: place.id,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lon: place.lon,
      thumbnail: place.thumbnail,
      description: place.description,
      category: place.category,
      dist: place.dist,
      images: place.images,
    };
    dispatch(togglePlace(payload));
  };

  return (
    <>
      <div className={`group relative bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-[#fcd34d]/30 flex flex-col md:flex-row ${isSelected ? 'ring-1 ring-[#fcd34d]/50 bg-white/10' : ''}`}>

        {/* Selection Button (Absolute Top-Right) */}
        <button
          onClick={handleToggleSelect}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isSelected
            ? 'bg-[#fcd34d] text-slate-900 rotate-0'
            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white rotate-0'
            }`}
          title={isSelected ? "Remove from trip" : "Add to trip"}
        >
          {isSelected ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>

        {/* Left: Image Section (1/3 width on desktop) */}
        <div className="w-full md:w-1/3 h-64 md:h-auto relative overflow-hidden bg-slate-800">
          {place.thumbnail ? (
            <img
              src={place.thumbnail}
              alt={place.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent md:bg-gradient-to-r" />

          {/* Category Badge on Image */}
          {place.category && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-xs font-medium text-slate-200 capitalize flex items-center gap-1">
                <Filter className="h-3 w-3 text-[#fcd34d]" />
                {Array.isArray(place.category)
                  ? place.category[0]?.split('.').pop() || 'tourism'
                  : (typeof place.category === 'string' ? place.category.split('.').pop() : 'tourism')}
              </span>
            </div>
          )}
        </div>

        {/* Right: Content Section */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Header */}
          <div className="pr-12 mb-2"> {/* Padding right for the absolute button */}
            <h3 className="text-2xl font-serif font-bold text-slate-100 group-hover:text-[#fcd34d] transition-colors">
              {place.name}
            </h3>
            {place.address && (
              <div className="flex items-start space-x-2 text-sm text-slate-400 mt-1">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-500 group-hover:text-[#fcd34d] transition-colors" />
                <span>{place.address}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex-1">
            {place.description && (
              <div className="mb-4">
                <p className={`text-base text-slate-300 leading-relaxed font-light ${!isDescriptionExpanded && 'line-clamp-3'}`}>
                  {place.description}
                </p>
                {place.description.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-1 text-sm text-[#fcd34d] hover:text-[#fcd34d]/80 font-medium transition-colors duration-150 flex items-center space-x-1"
                  >
                    <span>{isDescriptionExpanded ? 'Show less' : 'Show more'}</span>
                    {!isDescriptionExpanded && <ChevronRight className="h-4 w-4" />}
                    {isDescriptionExpanded && <ChevronLeft className="h-4 w-4" />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
            {place.dist && (
              <div className="flex items-center space-x-1 text-sm text-slate-500">
                <Navigation className="h-4 w-4" />
                <span>{(place.dist / 1000).toFixed(1)} km away</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {place.images && place.images.length > 0 && (
                <button
                  onClick={() => setShowGallery(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 hover:border-white/20 text-sm font-medium"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>View Photos ({place.images.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        images={place.images || [place.thumbnail].filter(Boolean)}
        placeName={place.name}
      />
    </>
  );
};

export default Places;
