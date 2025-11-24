/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  fetchTrips,
  createTrip, 
  deleteTrip, 
  updateTripStatus 
} from '../store/tripSlice';
import CreateTripModal from '../components/Dashboard/CreateTripModal';
import StartJourneyModal from '../components/Dashboard/StartJourneyModal';
import ShareTripModal from '../components/Dashboard/ShareTripModal';
import TripCard from '../components/Dashboard/TripCard';
import { getNextRecommendation } from '../utils/recommendationAlgo';

const JourneysDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trips, status } = useSelector(state => state.trips);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentTripForStart, setCurrentTripForStart] = useState(null);
  const [currentTripForShare, setCurrentTripForShare] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [expandedTrips, setExpandedTrips] = useState({});

  useEffect(() => {
    dispatch(fetchTrips());
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [dispatch]);

  const activeTrips = trips.filter(t => t.status === 'active' || t.status === 'upcoming');
  const pastTrips = trips.filter(t => t.status === 'completed');

  const handleCreateTrip = (name, timeConstraint) => {
    dispatch(createTrip({ name, timeConstraint }));
  };

  const handleGoClick = (trip) => {
    setCurrentTripForStart(trip);
    setIsStartModalOpen(true);
  };

  const handleShareClick = (trip) => {
    setCurrentTripForShare(trip);
    setIsShareModalOpen(true);
  };

  const handleConfirmNavigation = (place) => {
    setIsStartModalOpen(false);
    if (currentTripForStart) {
      navigate(`/navigate/${currentTripForStart._id}`);
    }
  };

  const toggleTrip = (tripId) => {
    setExpandedTrips(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen bg-[#020617] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#fcd34d]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-[#020617] text-slate-200 pt-28 px-4 sm:px-6 lg:px-8 selection:bg-[#fcd34d]/30 selection:text-white">
      
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#fef3c7] mb-2">
              Your Itineraries
            </h1>
            <p className="text-slate-400 font-light tracking-wide">Curate your adventures and track your journeys.</p>
        </div>

        {/* Active & Upcoming Trips */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-8 bg-[#fcd34d]/50"></div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#fcd34d]">Active Journeys</h2>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Create New Trip Card */}
            <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="h-full min-h-[200px] flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl border border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-[#fcd34d]/50 transition-all group"
            >
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#fcd34d] transition-colors mb-4 shadow-lg">
                    <Plus className="w-8 h-8 text-slate-400 group-hover:text-[#020617] transition-colors" />
                </div>
                <span className="text-lg font-serif font-medium text-slate-300 group-hover:text-white">Create New Journey</span>
            </motion.button>

            {activeTrips.map((trip, index) => (
              <TripCard 
                key={trip._id}
                trip={trip}
                index={index}
                isExpanded={!!expandedTrips[trip._id]}
                onToggle={() => toggleTrip(trip._id)}
                onGoClick={handleGoClick}
                onShare={handleShareClick}
                userLocation={userLocation}
              />
            ))}
          </div>
        </section>

        {/* Past Journeys */}
        {pastTrips.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-slate-700"></div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Past Journeys</h2>
                <div className="h-px flex-1 bg-white/5"></div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastTrips.map(trip => (
                <TripCard 
                  key={trip._id}
                  trip={trip}
                  index={0}
                  isExpanded={false}
                  onToggle={() => {}}
                  onGoClick={() => dispatch(updateTripStatus({ tripId: trip._id, status: 'active' }))}
                  onShare={handleShareClick}
                  userLocation={userLocation}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <CreateTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTrip}
      />

      {currentTripForStart && (
        <StartJourneyModal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          recommendedPlace={userLocation ? getNextRecommendation(currentTripForStart.places, userLocation.lat, userLocation.lng) : null}
          otherPlaces={currentTripForStart.places.filter(p => p.status === 'pending')}
          onConfirmNavigation={handleConfirmNavigation}
        />
      )}

      <ShareTripModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={currentTripForShare}
      />
    </div>
  );
};

export default JourneysDashboard;
