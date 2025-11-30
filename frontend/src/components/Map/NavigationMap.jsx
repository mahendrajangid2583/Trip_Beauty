import React, { useRef, useEffect, useMemo } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BASE_URL } from '../../services/api';

const NavigationMap = ({ 
  userLocation, 
  routeGeoJson, 
  apiKey, 
  viewState: parentViewState, 
  onMove,
  isNavigationActive // New Prop
}) => {
  const mapRef = useRef(null);
  
  // Helper: Calculate bearing between two points
  const calculateBearing = (startLat, startLng, destLat, destLng) => {
    const startLatRad = (startLat * Math.PI) / 180;
    const startLngRad = (startLng * Math.PI) / 180;
    const destLatRad = (destLat * Math.PI) / 180;
    const destLngRad = (destLng * Math.PI) / 180;

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x =
      Math.cos(startLatRad) * Math.sin(destLatRad) -
      Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // Determine the target bearing based on route
  const targetBearing = useMemo(() => {
    if (!userLocation || !routeGeoJson?.geometry?.coordinates) return 0;

    const coords = routeGeoJson.geometry.coordinates;
    // Find the closest point on the route to the user
    let minDist = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < coords.length; i++) {
      const [lng, lat] = coords[i];
      const dist = Math.sqrt(Math.pow(lng - userLocation.lng, 2) + Math.pow(lat - userLocation.lat, 2));
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    // Look ahead a few points to get a stable bearing
    const lookAheadIndex = Math.min(closestIndex + 2, coords.length - 1);
    const [nextLng, nextLat] = coords[lookAheadIndex];

    return calculateBearing(userLocation.lat, userLocation.lng, nextLat, nextLng);
  }, [userLocation, routeGeoJson]);

  // Handle Mode Transitions (2D <-> 3D)
  useEffect(() => {
    if (userLocation) {
      if (isNavigationActive) {
        // Navigation Mode: 3D, Zoomed In, Follow Bearing
        onMove({
          ...parentViewState,
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          zoom: 18,
          pitch: 60,
          bearing: targetBearing,
          transitionDuration: 1500,
        });
      } else {
        // Overview Mode: 2D, Zoomed Out, North Up
        onMove({
          ...parentViewState,
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          zoom: 15, // Overview zoom
          pitch: 0,
          bearing: 0,
          transitionDuration: 1500,
        });
      }
    }
  }, [isNavigationActive, userLocation, targetBearing]); // Trigger on mode change

  // Continuous Updates in Navigation Mode
  useEffect(() => {
    if (isNavigationActive && userLocation) {
      onMove({
        ...parentViewState,
        longitude: userLocation.lng,
        latitude: userLocation.lat,
        zoom: 18,
        pitch: 60,
        bearing: targetBearing,
        transitionDuration: 1000, // Smooth continuous update
      });
    }
  }, [userLocation, targetBearing]); // Only update when location changes

  // Route Layer Style
  const routeLayer = {
    id: 'route',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3b82f6',
      'line-width': 8,
      'line-opacity': 0.8
    }
  };

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...parentViewState}
        onMove={evt => onMove(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`${BASE_URL}/api/proxy/tiles/style.json`}
        mapLib={maplibregl}
        maxPitch={85}
        onStyleImageMissing={(e) => {
          // Load a transparent 1x1 pixel to prevent errors for missing icons
          if (!e.map.hasImage(e.id)) {
            e.map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
          }
        }}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker 
            longitude={userLocation.lng} 
            latitude={userLocation.lat} 
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg z-20" />
              <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping z-10" />
              {/* Direction Cone */}
              <div 
                className="absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[30px] border-b-blue-500/20 -top-8 transform -translate-y-1/2"
                style={{ transform: `rotate(${parentViewState.bearing || 0}deg)` }}
              />
            </div>
          </Marker>
        )}

        {/* Route Line */}
        {routeGeoJson && (
          <Source id="route-source" type="geojson" data={routeGeoJson}>
            <Layer {...routeLayer} />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default NavigationMap;
