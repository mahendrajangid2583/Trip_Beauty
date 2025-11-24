import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Navigation, Filter, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePlace } from '../store/selectedPlacesSlice.js';
import { selectSelectedPlaces } from '../store/index.js';
import api from '../services/api';

// Image Carousel Component
const ImageCarousel = ({ images, placeName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative">
      <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`${placeName} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
          }}
        />
        
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Image Dots Indicator */}
      {images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-200 ${
                idx === currentIndex
                  ? 'w-6 bg-blue-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Places in {cityName}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {places.length > 0 ? `${places.length} places found` : 'Discover amazing places'}
                </p>
              </div>
              {selectedPlaces.length > 0 && (
                <div className="ml-auto flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedPlaces.length} selected
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        const response = await api.post(`/api/plan-trip`, { city: cityName, places: selectedPlaces });
                        const data = response.data;
                        // persist for fallback and navigate
                        localStorage.setItem('tripPlan', JSON.stringify(data));
                        navigate('/trip-planner', { state: { trip: data } });
                      } catch (err) {
                        console.error('Trip plan error:', err);
                        alert('Failed to create trip plan. Please try again.');
                      }
                    }}
                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors duration-150"
                  >
                    Generate Trip Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading places...</h3>
            <p className="text-gray-600">Please wait while we fetch amazing places for you</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-600">Try searching for a different city</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {places.map((place) => (
              <PlaceCard key={place.id || place.name} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Place Card Component with expandable description
const PlaceCard = ({ place }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const dispatch = useDispatch();
  const isSelected = useSelector((state) => state.selectedPlaces.items.some((p) => p.id === place.id));

  const handleToggleSelect = () => {
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden">
      {/* Thumbnail Image */}
      {place.thumbnail && (
        <div className="w-full h-64 bg-gray-200 overflow-hidden">
          <img
            src={place.thumbnail}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6">
        {/* Place Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {place.name}
        </h3>

        {/* Address */}
        {place.address && (
          <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
            <span>{place.address}</span>
          </div>
        )}

        {/* Description */}
        {place.description && (
          <div className="mb-4">
            <p className={`text-base text-gray-700 leading-relaxed ${!isDescriptionExpanded && 'line-clamp-3'}`}>
              {place.description}
            </p>
            {place.description.length > 150 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150 flex items-center space-x-1"
              >
                <span>{isDescriptionExpanded ? 'Show less' : 'Show more'}</span>
                {!isDescriptionExpanded && <ChevronRight className="h-4 w-4" />}
                {isDescriptionExpanded && <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {/* Image Gallery Carousel */}
        {place.images && place.images.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">
                {place.images.length} image{place.images.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ImageCarousel images={place.images} placeName={place.name} />
          </div>
        )}

        {/* Selection + Category and Distance */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
          {place.category && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 capitalize">
                {Array.isArray(place.category) 
                  ? place.category[0]?.split('.').pop() || 'tourism'
                  : (typeof place.category === 'string' ? place.category.split('.').pop() : 'tourism')}
              </span>
            </div>
          )}
          {place.dist && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Navigation className="h-4 w-4" />
              <span>{(place.dist / 1000).toFixed(1)} km away</span>
            </div>
          )}
          <label className="ml-auto inline-flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleToggleSelect}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-sm text-gray-800">{isSelected ? 'Selected' : 'Select'}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Places;
