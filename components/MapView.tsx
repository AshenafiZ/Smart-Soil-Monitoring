"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

interface Location {
  lat: number;
  lng: number;
}

interface MapViewProps {
  searchQuery: string;
}

const INITIAL_LOCATION: Location = { lat: 9.145, lng: 40.4897 }; // Ethiopia Center
const INITIAL_ZOOM = 6; // Zoom for Ethiopia
const SEARCH_ZOOM = 13; // Zoom when a location is found
const OFFSET_RANGE = 0.01; // Adjust for location blur

export default function MapView({ searchQuery }: MapViewProps) {
  const [location, setLocation] = useState<Location>(INITIAL_LOCATION);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  useEffect(() => {
    if (!searchQuery) return;

    const fetchLocation = async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          // Add a small random offset for privacy
          const blurredLat = lat + (Math.random() * OFFSET_RANGE - OFFSET_RANGE / 2);
          const blurredLng = lng + (Math.random() * OFFSET_RANGE - OFFSET_RANGE / 2);

          setLocation({ lat: blurredLat, lng: blurredLng });
          setZoom(SEARCH_ZOOM);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocation();
  }, [searchQuery]);

  return (
    <div className="w-full h-[500px] border rounded-lg overflow-hidden">
      <MapContainer center={[location.lat, location.lng]} zoom={zoom} className="w-full h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lng]} icon={customIcon} />
        <UpdateView location={location} zoom={zoom} />
      </MapContainer>
    </div>
  );
}

// Custom map marker icon
const customIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Function to smoothly update the map view
function UpdateView({ location, zoom }: { location: Location; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([location.lat, location.lng], zoom, { duration: 1.5 });
  }, [location, zoom, map]);
  return null;
}
