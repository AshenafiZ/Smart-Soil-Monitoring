'use client';
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L, { LatLngBoundsExpression, LatLngTuple, Icon } from 'leaflet';
import { useMap } from "react-leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then(mod => mod.GeoJSON), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then(mod => mod.Tooltip), { ssr: false });

type Location = {
  name: string;
  coords: LatLngTuple; 
  type: string;
  moisture?: number;
  pH?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  time?: string;
};

const EthiopiaMap: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 
  }, []);

  if (!isClient) return null;

  const ethiopiaBounds: LatLngBoundsExpression = [
    [14.2, 38.0], 
    [4.0, 42.0],  
  ];

  type SoilIcon = Icon;
  
  const hospitalIcon = new L.Icon({
    iconUrl: '/icons/hospital.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  
  const schoolIcon = new L.Icon({
    iconUrl: '/icons/school.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  
  const defaultIcon = new L.Icon({
    iconUrl: '/icons/default.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  
  const healthySoilIcon = new L.Icon({
  iconUrl: '/icons/healthy-soil.png',  // Replace with your soil icon path
  iconSize: [25, 30],
  iconAnchor: [12, 41],
});

const erodedSoilIcon = new L.Icon({
  iconUrl: '/icons/eroded-soil.png',  // Replace with your eroded soil icon path
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const farmingIcon = new L.Icon({
  iconUrl: '/icons/farming.png',  // Replace with your farming-related icon path
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Example locations with soil-related types
const soilLocations = [
  { name: 'Healthy Soil', coords: [9.03, 38.74], type: 'Healthy Soil' },
  { name: 'Eroded Soil', coords: [9.05, 38.76], type: 'Eroded Soil' },
  { name: 'Farming Area', coords: [9.04, 38.73], type: 'Farming' },
];
const locations: Location[] = [
  { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.03, 38.74], type: 'Healthy Soil', moisture: 70, pH: 6, nitrogen: 1240, phosphorus: 430, potassium: 45, time:'15/2/2017 11:26:34 Am' },
  { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.05, 38.76], type: 'Healthy Soil', moisture: 30, pH: 12, nitrogen: 240, phosphorus: 130, potassium: 245, time:'15/2/2017 11:26:34 Am' },
  { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.04, 38.73], type: 'Healthy Soil', moisture: 50, pH: 4, nitrogen: 120, phosphorus: 30, potassium: 445, time:'15/2/2017 11:26:34 Am' },
  { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.06, 38.78], type: 'Healthy Soil', moisture: 90, pH: 7, nitrogen: 220, phosphorus: 40, potassium: 450, time:'15/2/2017 11:26:34 Am' },
];
// Dynamic function to get the right icon based on soil type
const getSoilIcon = (type: string): SoilIcon => {
  switch (type) {
    case 'Healthy Soil':
      return healthySoilIcon;
    case 'Eroded Soil':
      return erodedSoilIcon;
    case 'Farming':
      return farmingIcon;
    case 'Capital':
      return healthySoilIcon;
    case 'Hospital':
      return hospitalIcon;
    case 'School':
      return schoolIcon;
    default:
      return new L.Icon({
        iconUrl: '/icons/default-soil.png',  // Fallback default icon
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
  }
};

  return (
    <div className="flex justify-center items-center py-8">
      <div
        className="relative w-full max-w-4xl h-[500px] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden hover:shadow-2xl transition-shadow"
      >
        <MapContainer
          bounds={ethiopiaBounds} // Ensure the map fits within Ethiopia's bounds
          maxBounds={ethiopiaBounds} // Restrict map panning to Ethiopia only
          style={{ height: '100%', width: '100%' }}
          zoomControl={false} // Remove default zoom controls
          minZoom={5} // Restrict minimum zoom level
          zoomSnap={0.5}
          zoomDelta={0.5}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />
          {locations.map((location, index) => (
            <Marker key={index} position={location.coords} icon={getSoilIcon(location.type)}>
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div>
                  <h3 className="text-sm font-bold">{location.name}</h3>
                  <p className="text-xs">{`Nitrogen: ${location.nitrogen}`}</p>
                  <p className="text-xs">{`Phosphorus: ${location.phosphorus}`}</p>
                  <p className="text-xs">{`Potassium: ${location.potassium}`}</p>
                  <p className="text-xs">{`Soil Moisture: ${location.moisture}`}</p>
                  <p className="text-xs">{`pH value: ${location.pH}`}</p>
                  <p className="text-xs">{`Last Updated: ${location.time}`}</p>
                  <p className="text-xs">{`Coordinates: ${location.coords[0]}, ${location.coords[1]}`}</p>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default EthiopiaMap;
