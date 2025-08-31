import React from 'react'
import { useState,useEffect } from 'react';
import { Search, MapPin, Clock, TrendingUp, X, Filter, Star, Calendar, Users } from 'lucide-react';
const SearchPage = ({ isOpen, onClose }) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading,setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  const searchResults = popularDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SearchPlaces = async() => {
    setLoading(true);
     try {
        
     } catch (error) {
        
     }
  };

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
    <div className={`fixed inset-0 z-50 overflow-y-auto will-change-transform ${
      isOpen && !isClosing 
        ? 'bg-white opacity-100 translate-y-0 transition-all duration-250 ease-out' 
        : 'bg-white opacity-0 translate-y-4 pointer-events-none transition-all duration-200 ease-out'
    }`}>
      
      {/* Content */}
      <div className={`relative will-change-transform ${
        isOpen && !isClosing 
          ? 'translate-y-0 opacity-100 transition-all duration-250 ease-out' 
          : 'translate-y-4 opacity-0 transition-all duration-200 ease-out'
      }`}>
        {/* Header */}
        <div className="border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150 transform hover:scale-105"
              >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, attractions, or experiences..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>

            
          </div>

         
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {!searchQuery ? (
          // No search query - show suggestions
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(search)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors duration-150 hover:scale-105 animate-fade-in"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Popular Destinations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularDestinations.map((destination, index) => (
                  <div
                    key={index}
                    onClick={() => setSearchQuery(destination.name)}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:scale-[1.01] animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-3xl">{destination.image}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{destination.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">{destination.type}</span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{destination.rating}</span>
                        </div>
                      </div>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Search results
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Search Results for "{searchQuery}"
              </h3>
              <p className="text-gray-600">{searchResults.length} results found</p>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.005] animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{result.image}</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{result.name}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">{result.type}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{result.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Plan Trip</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or browse popular destinations</p>
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