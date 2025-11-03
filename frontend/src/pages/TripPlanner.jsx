import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ItineraryMap from "../components/ItineraryMap";
import ItineraryCard from "../components/ItineraryCard";

const TripPlanner = () => {
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const incoming = location.state?.trip;
    if (incoming) {
      setTrip(incoming);
      localStorage.setItem('tripPlan', JSON.stringify(incoming));
    } else {
      const cached = localStorage.getItem('tripPlan');
      if (cached) setTrip(JSON.parse(cached));
    }
  }, [location.state]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos =>
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
      );
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center">
        🗺️ Your Smart Trip Plan
      </h1>

      {!trip ? (
        <p className="text-center text-gray-600">Waiting for trip plan...</p>
      ) : (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">{trip.city}</h2>
            <p className="text-sm text-gray-600">Total days: {trip.totalDays}</p>
          </div>
          {/* Map */}
          <ItineraryMap
            itinerary={trip.days?.map(d => ({
              places: d.items.filter(i => i.type === 'visit').map(v => ({
                lat: v.lat,
                lon: v.lon,
                name: v.name,
                address: v.address,
              }))
            })) || []}
            userLocation={userLocation}
          />

          {/* Day Cards */}
          <div className="space-y-4">
            {trip.days?.map((day) => (
              <ItineraryCard key={day.dayNumber} day={day} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
