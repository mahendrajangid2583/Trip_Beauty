import React, { useState, useEffect } from 'react';

const TripPlannerDemo = () => {
  const [animateStep, setAnimateStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            See How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch our trip planner in action as we create an amazing itinerary. 
            See how easy it is to add destinations, optimize routes, and plan your perfect journey.
          </p>
        </div>

        {/* Video Demo Section - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-24">
          {/* App Interface */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-900 relative overflow-hidden">
                    <div className="absolute inset-0 p-4">
                      <div className="bg-white rounded-lg h-full p-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span className="font-bold text-gray-800">Trip Planner</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-20 h-8 bg-gray-200 rounded"></div>
                            <div className="w-20 h-8 bg-blue-600 rounded"></div>
                          </div>
                        </div>
                        {/* Animated Places */}
                        <div className="space-y-3">
                          {[
                            { icon: '✈️', title: 'SFO — LIH', desc: 'Arrives 10:45pm', bg: 'bg-blue-50', step: 0 },
                            { icon: '🏨', title: 'Island Serenity Suites', desc: 'Check in • 32 min', bg: 'bg-purple-50', step: 1 },
                            { icon: '🏔️', title: 'Kauai Backcountry Adventures', desc: '2 min • 0.1 mi', bg: 'bg-green-50', step: 2 },
                            { icon: '🌊', title: 'Waimea Canyon State Park', desc: '15 min • 3.2 mi', bg: 'bg-orange-50', step: 3 },
                          ].map((item, i) => (
                            <div key={i} className={`${item.bg} p-3 rounded-lg flex items-center gap-3 transition-all duration-500 ${
                              animateStep >= item.step ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                            }`}>
                              <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center text-white font-bold">
                                {item.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold">{item.title}</div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-gray-800">App Interface</h3>
              <p className="text-gray-600">Create and manage your itinerary</p>
            </div>
          </div>

          {/* Map View */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-blue-100 relative overflow-hidden">
                    {/* Water + Land */}
                    <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-blue-200"></div>
                    <div className="absolute top-1/4 right-1/3 w-1/2 h-1/2 bg-green-200 rounded-full opacity-60"></div>
                    
                    {/* Animated Pins */}
                    <div className={`absolute top-1/2 left-1/4 transition-all duration-700 ${animateStep >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                      <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-bounce"></div>
                    </div>
                    <div className={`absolute top-1/3 left-1/2 transition-all duration-700 ${animateStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                      <div className="w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow-lg animate-bounce"></div>
                    </div>
                    <div className={`absolute top-2/3 left-2/3 transition-all duration-700 ${animateStep >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                      <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-bounce"></div>
                    </div>
                    <div className={`absolute top-1/2 right-1/4 transition-all duration-700 ${animateStep >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                      <div className="w-8 h-8 bg-orange-500 rounded-full border-4 border-white shadow-lg animate-bounce"></div>
                    </div>

                    {/* Route Path */}
                    <svg className="absolute inset-0 w-full h-full">
                      <path 
                        d="M 150 280 L 300 200 L 420 350 L 500 280" 
                        stroke="#3B82F6" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray="600"
                        strokeDashoffset={animateStep >= 2 ? "0" : "600"}
                        className="transition-all duration-1000"
                      />
                    </svg>

                    {/* Info Box */}
                    <div className={`absolute top-4 left-4 bg-white rounded-lg shadow-xl p-3 max-w-xs transition-all duration-500 ${animateStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                      <div className="font-bold text-sm">Your Route</div>
                      <div className="text-xs text-gray-600">{animateStep + 1} destinations • 9.8 miles</div>
                      <div className="text-xs text-blue-600 mt-1">Estimated time: 1h 30min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-gray-800">Live Map View</h3>
              <p className="text-gray-600">Watch your route come to life</p>
            </div>
          </div>
        </div>

        {/* Features + Button */}
        <div className="flex flex-col items-center space-y-12">
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-12 text-center">
            {[
              {
                title: 'Easy Planning',
                desc: 'Add destinations with a simple click and watch them appear instantly',
                color: 'blue',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                )
              },
              {
                title: 'Smart Routes',
                desc: 'Our AI optimizes your route to save time and energy',
                color: 'green',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                )
              },
              {
                title: 'Real-time Sync',
                desc: 'See your changes instantly on both itinerary and map view',
                color: 'purple',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
              }
            ].map((item, i) => (
              <div key={i} className="w-64">
                <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <svg className={`w-8 h-8 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md">
            Start Planning
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripPlannerDemo;
