"use client";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/config";
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

interface FeatureProperties {
  regionName?: string;
  zoneName?: string;
  woredaName?: string;
  kebeleName?: string;
  [key: string]: any;
}
interface GeoJsonFeature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: {
    type: string;
    coordinates: any;
  };
}
interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}
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
type Location1 = {
    id: string;
    latitude: number;
    longitude: number;
    moisture: number;
    nitrogen: number;
    potassium: number;
    phosphorus: number;
    phLevel: number;
    timestamp: any; 
  };
type LocationData = {
  name: string;
  coordinates: [number, number];
};

const FlyToLocation = ({ lat, lng, zoom, triggerFly }: { lat: number | null; lng: number | null; zoom: number | null; triggerFly: boolean }) => {
  const map = useMap();

  if (triggerFly && lat !== null && lng !== null) {
    map.flyTo([lat, lng], zoom || 4 , { animate: true, duration: 2 });
  }

  return lat !== null && lng !== null ? (
    <Marker position={[lat, lng]}>
    </Marker>
  ) : null;
};

const EthiopiaMap = () => {
  const levels = ["region", "zone", "wereda", "kebele"] as const;
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [triggerFly, setTriggerFly] = useState(false);
  const [locationNames, setLocationNames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  type AdminLevel = (typeof levels)[number];

  const propertyKeys: { [key in AdminLevel]: string } = {
    region: "REGIONNAME",
    zone: "ZONENAME",
    wereda: "WOREDANAME",
    kebele: "RK_NAME",
  };

  const [geoJsonData, setGeoJsonData] = useState<{ [key in AdminLevel]: GeoJsonData | null }>({
    region: null,
    zone: null,
    wereda: null,
    kebele: null,
  });

  const [selectedBoundary, setSelectedBoundary] = useState<GeoJsonData | null>(null);
  const [pendingFeature, setPendingFeature] = useState<GeoJsonFeature | null>(null);
  const mapRef = useRef<L.Map | null>(null);
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
    iconUrl: '/icons/healthy-soil.png', 
    iconSize: [25, 30],
    iconAnchor: [12, 41],
  });

  const erodedSoilIcon = new L.Icon({
    iconUrl: '/icons/eroded-soil.png',  
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const farmingIcon = new L.Icon({
    iconUrl: '/icons/farming.png',  
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    const loadGeoJson = async (level: AdminLevel, path: string) => {
      try {
        const key = propertyKeys[level];
        const response = await fetch(path); 
        const data = await response.json();
        setGeoJsonData((prev) => ({ ...prev, [level]: data }));
        const names = data.features.map((feature: any) => 
          feature.properties[key] || 
          feature.properties[key] || 
          feature.properties[key] || 
          feature.properties[key] || 
          "Unknown"
        );
        
        setLocationNames((prev) => [...prev, ...names]);
      } catch (error) {
        console.error(`Failed to load ${level} data`, error);
      }
    };
  
    if (typeof window !== "undefined") {
      loadGeoJson("region", "/map/admin1.json");
      loadGeoJson("zone", "/map/admin2.json");
      loadGeoJson("wereda", "/map/admin3.json");
      loadGeoJson("kebele", "/map/admin4.json");
    }
  }, []);
  useEffect(() => {
      const storedSearches = localStorage.getItem("recentSearches");
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    }, []);
  useEffect(() => {
    if (mapRef.current && pendingFeature) {
      console.log("Map is now initialized. Zooming to boundary...");
      setPendingFeature(null); 
    }
  }, [mapRef.current, pendingFeature]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setSearchTerm(searchTerm);
    let allNames: string[] = [];
    
    for (const level of levels) {
        if (!geoJsonData[level]) continue;
        
        const key = propertyKeys[level];

        const levelNames = geoJsonData[level]?.features.map(
            (feature: any) => feature.properties[key]
        );
        allNames = [...allNames, ...levelNames];
        if (searchTerm.length > 1) {
            const filtered = allNames.filter((loc) =>
              loc.toLowerCase().startsWith(searchTerm.toLowerCase())
            );
            setSuggestions(filtered);
          } else {
            setSuggestions([]);
          }
        const foundFeature = geoJsonData[level]?.features.find(
            (feature) => feature.properties[key]?.toLowerCase() === searchTerm.toLowerCase()
        );

        if (foundFeature) {
            const newBoundary: GeoJsonData = { type: "FeatureCollection", features: [foundFeature] };
            setSelectedBoundary(newBoundary);
            setLat(getCenterOfPolygon(foundFeature.geometry)?.[0] ?? null);
            setLng(getCenterOfPolygon(foundFeature.geometry)?.[1] ?? null);
            setZoom(getZoomLevel(L.geoJSON(foundFeature).getBounds()));

            console.log("Boundary set!", lat, lng);
            setTriggerFly(true);
            setTimeout(() => setTriggerFly(false), 500); 
            console.log("Boundary set!");

            return;
        }
    }
    console.log(allNames)
    setSelectedBoundary(null);
};
const handleSelectLocation = (location: string) => {
    // setSelectedLocation(location);
    setSearchTerm(location);
    setSuggestions([]);

    // Update recent searches
    const updatedSearches = [location, ...recentSearches.filter((item) => item !== location)];
    setRecentSearches(updatedSearches.slice(0, 5)); 
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const getCenterOfPolygon = (geometry: { coordinates: any; type: string }) => {
    if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") return null;

    let totalPoints = 0;
    let sumLat = 0;
    let sumLng = 0;

    const processCoords = (coords: number[][]) => {
      coords.forEach(([lng, lat]) => {
        sumLat += lat;
        sumLng += lng;
        totalPoints++;
      });
    };

    if (geometry.type === "Polygon") {
      geometry.coordinates.forEach(processCoords);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon: number[][][]) => polygon.forEach(processCoords));
    }

    return totalPoints > 0 ? [sumLat / totalPoints, sumLng / totalPoints] : null;
  };

  const getZoomLevel = (bounds: L.LatLngBounds) => {
    const area = bounds.getSouthWest().distanceTo(bounds.getNorthEast());
    if (area > 2000000) {
      return 6;
    } else if(area > 100000) {
      return 8;
    } else if(area > 5000) {
      return 10;
    } else {
      return 12;
    }
    
  };
  const locations: Location[] = [
    { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.03, 38.74], type: 'Healthy Soil', moisture: 70, pH: 6, nitrogen: 1240, phosphorus: 430, potassium: 45, time:'15/2/2017 11:26:34 Am' },
    { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.05, 38.76], type: 'Healthy Soil', moisture: 30, pH: 12, nitrogen: 240, phosphorus: 130, potassium: 245, time:'15/2/2017 11:26:34 Am' },
    { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.04, 38.73], type: 'Healthy Soil', moisture: 50, pH: 4, nitrogen: 120, phosphorus: 30, potassium: 445, time:'15/2/2017 11:26:34 Am' },
    { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.06, 38.78], type: 'Healthy Soil', moisture: 90, pH: 7, nitrogen: 220, phosphorus: 40, potassium: 450, time:'15/2/2017 11:26:34 Am' },
  ];
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
          iconUrl: '/icons/default-soil.png',  
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });
    }
  };
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search Place"
          className="border p-2 rounded w-full"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {recentSearches.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-bold">Recent Searches</h3>
            <ul className="border bg-white shadow-md">
              {recentSearches.map((loc, index) => (
                <li key={index} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleSelectLocation(loc)}>
                  {loc}
                </li>
              ))}
            </ul>
          </div>
        )}
        {suggestions.length > 0 && (
          <ul className="border mt-2 bg-white shadow-md">
            {suggestions.map((loc, index) => (
              <li key={index} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleSelectLocation(loc)}>
                {loc}
              </li>
            ))}
          </ul>
        )}
      </div>
      <MapContainer
        center={[9, 39]}
        zoom={6}
        style={{ height: "500px", width: "100%" }}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selectedBoundary && <GeoJSON data={selectedBoundary} />}
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
        <FlyToLocation lat={lat} lng={lng} zoom={zoom} triggerFly={triggerFly} />
      </MapContainer>
    </div>
  );
};

export default EthiopiaMap;

export function LiveTrackingText() {
  const [locations, setLocations] = useState<Location1[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "live"), (querySnapshot) => {
      const locationsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let timestamp = data.timestamp;

        // Check if timestamp exists
        if (timestamp) {
          if (typeof timestamp === "string") {
            timestamp = new Date(timestamp); // Parse string into a Date object
          } else if (timestamp.toDate) {
            timestamp = timestamp.toDate(); // If it's a Firestore Timestamp, convert to Date
          } else {
            // Handle case where the timestamp is not in expected format
            console.warn(`Unexpected timestamp format: ${timestamp}`);
            timestamp = new Date(); // Default to the current date if it's invalid
          }
        } else {
          // If no timestamp, set it to the current date
          timestamp = new Date();
        }

        return {
          id: doc.id,
          ...data,
          timestamp,
        } as Location1;
      });

      setLocations(locationsData);
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center text-xl font-semibold">Loading data...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Live Location Updates</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-lg shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center mb-4">
              <div className="text-2xl font-semibold text-white">{`Location ID: ${loc.id}`}</div>
            </div>

            <div className="space-y-2 text-white">
              <p><strong>Latitude:</strong> {loc.latitude}</p>
              <p><strong>Longitude:</strong> {loc.longitude}</p>
              <p><strong>Moisture:</strong> {loc.moisture}%</p>
              <p><strong>Nitrogen:</strong> {loc.nitrogen} ppm</p>
              <p><strong>Potassium:</strong> {loc.potassium} ppm</p>
              <p><strong>Phosphorus:</strong> {loc.phosphorus} ppm</p>
              <p><strong>pH Level:</strong> {loc.phLevel}</p>
              <p><strong>Timestamp:</strong> {new Date(loc.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

