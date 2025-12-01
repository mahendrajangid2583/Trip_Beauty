import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Crosshair, Navigation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Navbar from '../components/Navbar';
import MetroTimeline from '../components/Navigation/MetroTimeline';
import NavigationMap from '../components/Map/NavigationMap';
import TravelModeSelector from '../components/Navigation/TravelModeSelector';

// Utils & Actions
import { api } from '../utils/api';
import { getNextRecommendation } from '../utils/recommendationAlgo';
import { updatePlaceStatus, fetchTrips } from '../store/tripSlice';

const ActiveNavigation = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { trips, status } = useSelector(state => state.trips);
  const location = useLocation();
  const reduxTrip = trips.find(t => t._id === tripId);
  const trip = reduxTrip || location.state?.trip;

  // Fetch trips on reload if missing from Redux (even if we have location state, we want live updates)
  useEffect(() => {
    if (!reduxTrip && status === 'idle') {
      dispatch(fetchTrips());
    }
  }, [reduxTrip, status, dispatch]);

  const [userLocation, setUserLocation] = useState(null);
  const [activePlace, setActivePlace] = useState(null);
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [travelMode, setTravelMode] = useState('drive');
  const [loading, setLoading] = useState(true);
  const [isNavigationActive, setIsNavigationActive] = useState(false); // Default to Overview Mode

  // Map View State
  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 15,
    pitch: 0,
    bearing: 0
  });

  const directDestination = location.state?.destination;
  const directName = location.state?.name;

  // Find active place (Nearest Pending or Direct Destination)
  useEffect(() => {
    if (directDestination) {
      setActivePlace({
        lat: directDestination.lat,
        lng: directDestination.lng,
        name: directName || "Destination",
        _id: 'direct-dest'
      });
      // Check if all done
      const pending = trip.places?.filter(p => p.status === 'pending') || [];
      if (pending.length === 0) {
        // All visited
      } else {
        // Fallback if recommendation returns null but there are pending places
        setActivePlace(pending[0]);
      }
    } else if (trip && !userLocation) {
      // Fallback if no location yet: just show first pending
      const pending = trip.places?.filter(p => p.status === 'pending') || [];
      if (pending.length > 0) setActivePlace(pending[0]);
    }
  }, [trip, userLocation, directDestination, directName]);

  // Get User Location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Initial Center
        if (loading) {
          setViewState(prev => ({
            ...prev,
            longitude,
            latitude,
            zoom: 15, // Start in Overview zoom
            pitch: 0,
            bearing: 0
          }));
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [loading]);

  // Fetch Route
  useEffect(() => {
    const fetchRoute = async () => {
      if (userLocation && activePlace) {
        const data = await api.getRoute(
          userLocation,
          { lat: activePlace.lat, lng: activePlace.lng },
          travelMode
        );
        if (data) {
          setRouteData(data);
          setRouteGeoJson({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: data.coordinates
            }
          });
        }
      }
    };

    fetchRoute();
    const interval = setInterval(fetchRoute, 30000);
    return () => clearInterval(interval);
  }, [userLocation, activePlace, travelMode]);

  const handleArrived = async () => {
    if (activePlace) {
      if (window.confirm(`Mark ${activePlace.name} as visited?`)) {
        // 1. Dispatch update to backend/redux
        await dispatch(updatePlaceStatus({
          tripId: trip._id,
          placeId: activePlace._id,
          status: 'visited'
        }));

        // 2. Immediately find next place from current list (excluding the one just visited)
        // We use the current trip.places but filter out the activePlace
        const nextPending = trip.places?.filter(p => p.status === 'pending' && p._id !== activePlace._id) || [];

        if (nextPending.length > 0) {
          setActivePlace(nextPending[0]);
          setIsNavigationActive(false); // Reset to overview for next leg
        } else {
          setActivePlace(null);
          alert("Journey Completed!");
        }
      }
    }
  };

  const handleRecenter = () => {
    if (userLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: userLocation.lng,
        latitude: userLocation.lat,
        zoom: isNavigationActive ? 18 : 15,
        pitch: isNavigationActive ? 60 : 0,
        bearing: isNavigationActive ? prev.bearing : 0,
        transitionDuration: 1000
      }));
    }
  };

  if (!trip && !directDestination) return <div className="text-white p-10">Trip not found</div>;

  return (
    <div className="h-screen w-screen bg-gray-900 relative overflow-hidden flex flex-col">
      {/* 1. Navbar (Fixed Top) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* 2. Metro Timeline (Removed per user request) */}
      {/* <div className="fixed top-16 left-0 right-0 z-40">
        <MetroTimeline places={trip.places} currentPlaceId={activePlace?._id} />
      </div> */}

      {/* 3. Map (Full Screen Background) */}
      <div className="absolute inset-0 z-0">
        <NavigationMap
          userLocation={userLocation}
          routeGeoJson={routeGeoJson}
          viewState={viewState}
          onMove={setViewState}
          isNavigationActive={isNavigationActive}
        />
      </div>

      {/* 4. Controls Layer */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {/* Recenter FAB (Keep this floating if desired, or move it too. User didn't explicitly say to move Recenter, just the Start button. I'll keep Recenter floating for now as it's standard map UX, but maybe move it up a bit if needed. Actually, user said "button that i was talking about", which was the Start button.) */}
        <div className="absolute bottom-40 right-4 pointer-events-auto">
          <button
            onClick={handleRecenter}
            className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
          >
            <Crosshair size={24} />
          </button>
        </div>

        {/* Bottom Bar: Travel Mode Selector */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <TravelModeSelector
            currentMode={travelMode}
            onModeChange={setTravelMode}
            eta={routeData?.time}
            distance={routeData?.distance}
            onArrived={handleArrived}
            isNavigationActive={isNavigationActive}
            onToggleNavigation={() => setIsNavigationActive(!isNavigationActive)}
          />
        </div>
      </div>
    </div>
  );
};

export default ActiveNavigation;
