import React, { useRef, useMemo } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { BASE_URL } from '../../services/api';

const MapView = ({ 
  userLocation, 
  destination, 
  routeData, 
  viewState, 
  onMove,
  onRecenter 
}) => {
  const mapRef = useRef(null);

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

  // Route GeoJSON Data
  const routeGeoJSON = useMemo(() => {
    if (!routeData) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeData.coordinates
      }
    };
  }, [routeData]);

  return (
    <div className="h-full w-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => onMove(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`${BASE_URL}/api/proxy/tiles/style.json`}
        mapLib={maplibregl}
        pitch={60} // Default 3D pitch
        maxPitch={85}
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
              {/* Direction Cone (Simulated) */}
              <div 
                className="absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[30px] border-b-blue-500/20 -top-8 transform -translate-y-1/2"
                style={{ transform: `rotate(${viewState.bearing || 0}deg)` }}
              />
            </div>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker 
            longitude={destination.lng} 
            latitude={destination.lat} 
            anchor="bottom"
          >
            <div className="relative">
              <MapPin className="text-red-500 drop-shadow-lg" size={40} fill="currentColor" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-black/30 rounded-full blur-sm" />
            </div>
          </Marker>
        )}

        {/* Route Line */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayer} />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default MapView;
