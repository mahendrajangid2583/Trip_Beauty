import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ItineraryMap = ({ itinerary, userLocation }) => {
  const position = userLocation || [28.6139, 77.2090]; // fallback: Delhi

  const dayRoutes = itinerary.map(day =>
    day.places.map(p => [p.lat, p.lon])
  );

  return (
    <MapContainer center={position} zoom={10} className="h-[500px] w-full rounded-2xl shadow-md">
      <TileLayer
        attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>'
        url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=YOUR_GEOAPIFY_API_KEY`}
      />
      {userLocation && (
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {dayRoutes.map((route, idx) => (
        <Polyline key={idx} positions={route} color="#1e40af" />
      ))}

      {itinerary.map(day =>
        day.places.map((place, i) => (
          <Marker key={i} position={[place.lat, place.lon]}>
            <Popup>
              <b>{place.name}</b>
              <br />
              {place.address}
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
};

export default ItineraryMap;
