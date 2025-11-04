import React from 'react'
import { Search } from 'lucide-react';
import { useState } from 'react';
const HomeSearchBar = ({ onSearchClick, isTransitioning }) => {

  const handleClick = () => {
    onSearchClick();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        onClick={handleClick}
        className={`relative bg-white border border-gray-200 p-4 cursor-pointer group will-change-transform ${
          isTransitioning 
            ? 'rounded-lg shadow-xl -translate-y-20 transition-all duration-300 ease-out' 
            : 'rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-out'
        }`}
      >
        <div className="flex items-center space-x-4">
          <Search className={`h-5 w-5 transition-colors duration-200 ${
            isTransitioning ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
          }`} />
          <div className="flex-1">
            <p className={`transition-colors duration-200 ${
              isTransitioning ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-700'
            }`}>
              Where do you want to go?
            </p>
            <p className="text-sm mt-1 text-gray-400">
              Search destinations, attractions, or experiences
            </p>
          </div>
          <div className={`text-white p-2 rounded-full transition-all duration-200 ${
            isTransitioning ? 'bg-blue-600' : 'bg-blue-500 group-hover:bg-blue-600'
          }`}>
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );

}

export default HomeSearchBar