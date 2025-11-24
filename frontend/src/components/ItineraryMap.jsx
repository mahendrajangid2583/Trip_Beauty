import React, { useMemo } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { BASE_URL } from '../services/api';

const ItineraryMap = ({ itinerary, userLocation }) => {
  // Default center (Delhi) if no user location
  const initialViewState = {
    longitude: userLocation ? userLocation[1] : 77.2090,
    latitude: userLocation ? userLocation[0] : 28.6139,
    zoom: 10
  };

  // Prepare GeoJSON for routes
  const routesGeoJSON = useMemo(() => {
    if (!itinerary) return null;
    
    const features = itinerary.flatMap((day, dayIndex) => {
      if (!day.places || day.places.length < 2) return [];
      
      const coordinates = day.places.map(p => [p.lon, p.lat]);
      
      return {
        type: 'Feature',
        properties: { day: dayIndex + 1 },
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }, [itinerary]);

  // Route Layer Style
  const routeLayer = {
    id: 'route-lines',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#1e40af',
      'line-width': 4,
      'line-opacity': 0.8
    }
  };

  return (
    <div className="h-[500px] w-full rounded-2xl shadow-md overflow-hidden relative">
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`${BASE_URL}/api/proxy/tiles/style.json`}
        mapLib={maplibregl}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker 
            longitude={userLocation[1]} 
            latitude={userLocation[0]} 
            anchor="center"
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          </Marker>
        )}

        {/* Place Markers */}
        {itinerary && itinerary.map((day, dayIndex) => (
          day.places.map((place, i) => (
            <Marker 
              key={`${dayIndex}-${i}`} 
              longitude={place.lon} 
              latitude={place.lat} 
              anchor="bottom"
            >
              <div className="group relative flex flex-col items-center">
                <MapPin className="text-red-500 drop-shadow-md hover:scale-110 transition-transform" size={24} fill="currentColor" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-black text-xs p-2 rounded shadow-lg whitespace-nowrap z-10">
                  <div className="font-bold">{place.name}</div>
                  <div className="text-gray-500">{place.address}</div>
                </div>
              </div>
            </Marker>
          ))
        ))}

        {/* Route Lines */}
        {routesGeoJSON && (
          <Source id="routes" type="geojson" data={routesGeoJSON}>
            <Layer {...routeLayer} />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default ItineraryMap;
