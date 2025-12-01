import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ItineraryCard from "../components/ItineraryCard";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";

const TripPlanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trips } = useSelector((state) => state.trips);

  // Initialize with location state or local storage
  const [initialTrip, setInitialTrip] = useState(null);

  useEffect(() => {
    const incoming = location.state?.trip;
    if (incoming) {
      setInitialTrip(incoming);
      localStorage.setItem('tripPlan', JSON.stringify(incoming));
    } else {
      const cached = localStorage.getItem('tripPlan');
      if (cached) setInitialTrip(JSON.parse(cached));
    }
  }, [location.state]);

  // Prefer the trip from Redux store if it exists (for live updates)
  const trip = initialTrip?._id
    ? trips.find(t => t._id === initialTrip._id) || initialTrip
    : initialTrip;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-100 tracking-tight">
            Your Trip to <span className="text-[#fcd34d]">{trip?.city || 'Destination'}</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            A perfectly curated itinerary for your adventure.
          </p>
        </div>

        {!trip ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fcd34d] mb-4"></div>
            <p className="text-slate-400">Loading your itinerary...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Trip Info Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="h-5 w-5 text-[#fcd34d]" />
                <span className="font-medium">{trip.city}</span>
              </div>
              <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar className="h-5 w-5 text-[#fcd34d]" />
                <span className="font-medium">{trip.totalDays || trip.itinerary?.length || trip.days?.length || 0} Days</span>
              </div>

              <button
                onClick={() => navigate(`/navigate/${trip._id}`, { state: { trip } })}
                className="flex items-center space-x-2 bg-[#fcd34d] text-[#020617] px-6 py-2.5 rounded-full font-bold hover:bg-[#fcd34d]/90 transition-all shadow-lg shadow-[#fcd34d]/20"
              >
                <MapPin className="h-5 w-5" />
                <span>Start Trip</span>
              </button>
            </div>

            {/* Day Cards */}
            <div className="space-y-6">
              {(trip.itinerary || trip.days)?.map((day) => (
                <ItineraryCard key={day.dayNumber} day={day} tripId={trip._id} />
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 hover:border-white/20 font-medium group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Places</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
