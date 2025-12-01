import React from 'react'
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, TrendingUp, X, Filter, Star, Calendar, Users } from 'lucide-react';
import api from '../../services/api';

const SearchPage = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  // Sample data
  const popularDestinations = [
    { name: 'Paris, France', type: 'City', rating: 4.8, image: '🗼' },
    { name: 'Tokyo, Japan', type: 'City', rating: 4.9, image: '🏯' },
    { name: 'New York, USA', type: 'City', rating: 4.7, image: '🗽' },
    { name: 'Bali, Indonesia', type: 'Island', rating: 4.8, image: '🏝️' },
    { name: 'London, UK', type: 'City', rating: 4.6, image: '🏰' },
    { name: 'Rome, Italy', type: 'City', rating: 4.7, image: '🏛️' }
  ];

  const recentSearches = ['Paris', 'Tokyo', 'Bali'];

  const searchCities = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/cities/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching cities:', error);
      setError('Failed to search cities. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search queries
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCities(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery, searchCities]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    onClose();
    setTimeout(() => {
      setIsClosing(false);
    }, 300); // Match the animation duration
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto will-change-transform ${isOpen && !isClosing
        ? 'bg-slate-950/95 backdrop-blur-sm opacity-100 translate-y-0 transition-all duration-250 ease-out'
        : 'bg-slate-950/0 opacity-0 translate-y-4 pointer-events-none transition-all duration-200 ease-out'
      }`}>

      {/* Content */}
      <div className={`relative will-change-transform ${isOpen && !isClosing
          ? 'translate-y-0 opacity-100 transition-all duration-250 ease-out'
          : 'translate-y-4 opacity-0 transition-all duration-200 ease-out'
        }`}>
        {/* Header */}
        <div className="border-b border-white/10 sticky top-0 bg-slate-950/95 backdrop-blur-xl z-10 shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-150 transform hover:scale-105"
              >
                <X className="h-5 w-5 text-slate-400 hover:text-white" />
              </button>

              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations, attractions, or experiences..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#fcd34d]/50 focus:ring-1 focus:ring-[#fcd34d]/50 transition-all"
                  autoFocus
                />
              </div>


            </div>


          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {!searchQuery ? (
            // No search query - show suggestions
            <div className="space-y-10">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-lg font-serif font-semibold text-slate-200 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-[#fcd34d]" />
                    Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm text-slate-300 transition-all duration-150 hover:scale-105 hover:text-[#fcd34d] hover:border-[#fcd34d]/30 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Destinations */}
              <div>
                <h3 className="text-lg font-serif font-semibold text-slate-200 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-[#fcd34d]" />
                  Popular Destinations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularDestinations.map((destination, index) => (
                    <div
                      key={index}
                      onClick={() => setSearchQuery(destination.name)}
                      className="flex items-center space-x-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-[#fcd34d]/30 cursor-pointer transition-all duration-200 hover:scale-[1.01] animate-fade-in-up group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{destination.image}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-200 group-hover:text-[#fcd34d] transition-colors">{destination.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-slate-500">{destination.type}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-[#fcd34d] fill-current" />
                            <span className="text-sm text-slate-400 ml-1">{destination.rating}</span>
                          </div>
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-slate-600 group-hover:text-[#fcd34d] transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Search results
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-serif font-semibold text-slate-200 mb-2">
                  Search Results for "<span className="text-[#fcd34d]">{searchQuery}</span>"
                </h3>
                {loading ? (
                  <p className="text-slate-500">Searching...</p>
                ) : (
                  <p className="text-slate-500">{searchResults.length} results found</p>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12 animate-fade-in">
                  <Search className="h-12 w-12 text-slate-700 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Searching...</h3>
                  <p className="text-slate-500">Please wait while we find your destinations</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 animate-fade-in">
                  <Search className="h-12 w-12 text-red-400/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-400 mb-2">Error</h3>
                  <p className="text-slate-500">{error}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-[#fcd34d]/30 transition-all duration-200 cursor-pointer hover:scale-[1.005] animate-fade-in-up group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">
                          <MapPin className="h-8 w-8 text-slate-600 group-hover:text-[#fcd34d] transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-slate-200 group-hover:text-[#fcd34d] transition-colors">{result.name}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            {result.state && (
                              <span className="text-sm text-slate-500">{result.state}</span>
                            )}
                            {result.country && (
                              <span className="text-sm text-slate-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {result.country}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            navigate('/places', {
                              state: {
                                name: result.name,
                                lat: result.lat,
                                lon: result.lon
                              }
                            });
                            onClose();
                          }}
                          className="flex items-center space-x-1 px-3 py-1 border border-white/10 rounded-lg hover:bg-[#fcd34d] hover:text-slate-900 hover:border-[#fcd34d] text-slate-300 transition-colors duration-150"
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">Plan Trip</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-1 bg-white/10 text-slate-200 rounded-lg hover:bg-white/20 transition-colors duration-150">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <Search className="h-12 w-12 text-slate-800 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-medium text-slate-400 mb-2">No results found</h3>
                  <p className="text-slate-600">Try adjusting your search terms or browse popular destinations</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

export default SearchPage