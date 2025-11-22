import React from 'react'
import Navbar from '../components/Navbar';

import SearchPage from '../components/home/SearchPage';
import HomeSearchBar from '../components/home/HomeSearchBar';
import ReviewSection from '../components/home/ReviewSection';
import TripPlannerDemo from '../components/home/TripPlannerDemo';
import FeaturesSection from '../components/home/FeaturesSection';
import { useState } from 'react';

const Home = () => {
   const [isSearchPageOpen, setIsSearchPageOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
 

  const handleSearchClick = () => {
    setIsTransitioning(true);
    // Reduced delay for snappier response
    setTimeout(() => {
      setIsSearchPageOpen(true);
    }, 200);
  };

  const handleSearchClose = () => {
    setIsSearchPageOpen(false);
    // Reset transition state immediately for faster response
    setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
  };

  return (
    <div className={`min-h-screen will-change-transform ${
      isTransitioning ? 'bg-white transition-colors duration-300 ease-out' : 'bg-gradient-to-br from-blue-50 to-purple-50'
    }`}>
      {/* Simplified CSS animations */}
      {/* <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style> */}
      
      {/* Hero Section with Search */}
      <div className={`relative px-6 will-change-transform transition-all duration-300 ease-out ${
        isTransitioning 
          ? 'py-8 opacity-20 -translate-y-12' 
          : 'py-20 opacity-100 translate-y-0'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-5xl font-bold text-gray-900 mb-6 will-change-transform transition-all duration-250 ease-out ${
            isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
          }`}>
            Discover Your Next Adventure
          </h1>
          <p className={`text-xl text-gray-600 mb-10 will-change-transform transition-all duration-250 ease-out ${
            isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
          }`} style={{ transitionDelay: isTransitioning ? '0ms' : '50ms' }}>
            Explore amazing destinations, plan perfect trips, and create unforgettable memories
          </p>
          
          {/* Home Search Bar */}
          <HomeSearchBar
            onSearchClick={handleSearchClick} 
            isTransitioning={isTransitioning}
          />
        </div>
      </div>

      {/* Search Page Overlay */}
      <SearchPage 
        isOpen={isSearchPageOpen} 
        onClose={handleSearchClose} 
      />
      <div>
            <TripPlannerDemo/>
      </div>
      <div>
        <FeaturesSection/>
      </div>
      <div>
            <ReviewSection/>
      </div>
    </div>

  );
}

export default Home