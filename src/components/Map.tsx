import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';

// Fix for default marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Premium Icon Definitions
const manRiderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/236/236831.png', // Clear Male Icon
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const womanRiderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/236/236832.png', // Clear Female Icon
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3103/3103392.png', // Clear Yellow Motorbike
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25],
});

interface MapProps {
  center: Location;
  zoom?: number;
  riderLocation?: Location;
  riderGender?: 'male' | 'female';
  driverLocation?: Location;
  destination?: Location;
  nearbyDrivers?: { id: string, location: Location }[];
  activeRides?: { 
    id: string, 
    pickup: Location, 
    riderName: string, 
    gender?: 'male' | 'female',
    destination?: Location,
    fare?: number,
    rating?: number,
    comments?: string
  }[];
  onMapClick?: (loc: Location) => void;
  onRideClick?: (rideId: string) => void;
}

function MapEventsHandler({ onMapClick, center }: { onMapClick?: (loc: Location) => void, center: Location }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng]);
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 500);
    return () => clearTimeout(t);
  }, [center, map]);

  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return null;
}

export default function InteractiveMap({ 
  center, 
  zoom = 13, 
  riderLocation, 
  riderGender = 'male',
  driverLocation, 
  destination,
  nearbyDrivers = [],
  activeRides = [],
  onMapClick,
  onRideClick
}: MapProps) {

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-100">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        <MapEventsHandler onMapClick={onMapClick} center={center} />

        {/* Individual Rider (For Rider View) */}
        {riderLocation && (
          <Marker 
            position={[riderLocation.lat, riderLocation.lng]} 
            icon={riderGender === 'female' ? womanRiderIcon : manRiderIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Active Rides (For Driver View) */}
        {activeRides.map(ride => (
          <Marker 
            key={ride.id} 
            position={[ride.pickup.lat, ride.pickup.lng]} 
            icon={ride.gender === 'female' ? womanRiderIcon : manRiderIcon}
            eventHandlers={{
              click: () => onRideClick?.(ride.id),
            }}
          >
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-slate-900">{ride.riderName}</p>
                <p className="text-[10px] text-slate-500 uppercase">New Ride Request</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination</Popup>
            <Circle center={[destination.lat, destination.lng]} radius={100} color="red" />
          </Marker>
        )}

        {nearbyDrivers.map(driver => (
          <Marker key={driver.id} position={[driver.location.lat, driver.location.lng]} icon={driverIcon}>
            <Popup>Available Driver</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
