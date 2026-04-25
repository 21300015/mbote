import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673188.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/4607/4607317.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface MapProps {
  center: Location;
  zoom?: number;
  riderLocation?: Location;
  driverLocation?: Location;
  destination?: Location;
  nearbyDrivers?: { id: string, location: Location }[];
  onMapClick?: (loc: Location) => void;
}

function ChangeView({ center }: { center: Location }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

export default function InteractiveMap({ 
  center, 
  zoom = 13, 
  riderLocation, 
  driverLocation, 
  destination,
  nearbyDrivers = [],
  onMapClick 
}: MapProps) {

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ChangeView center={center} />

      {riderLocation && (
        <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
          <Popup>Rider Location</Popup>
        </Marker>
      )}

      {driverLocation && (
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup>Driver Location</Popup>
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
      
      <MapEventHandler onMapClick={onMapClick} />
    </MapContainer>
  );
}

function MapEventHandler({ onMapClick }: { onMapClick?: (loc: Location) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onMapClick) return;
    
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
  return null;
}
