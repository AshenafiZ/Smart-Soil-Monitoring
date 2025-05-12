"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L, { LatLngTuple, Icon } from "leaflet";
import { useMap } from "react-leaflet";
import { FaSearch,  } from "react-icons/fa";
import { Search, Clock, MapPin } from "lucide-react";
import { listenToSoilPoints, SoilPoint } from "@/lib/soilData";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

interface FeatureProperties {
  REGIONNAME?: string;
  ZONENAME?: string;
  WOREDANAME?: string;
  RK_NAME?: string;
  level?: string;
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
interface EthiopiaMapProps {
  role: string; 
}
const FlyToLocation = ({ lat, lng, zoom, triggerFly }: { lat: number | null; lng: number | null; zoom: number | null; triggerFly: boolean }) => {
  const map = useMap();
  useEffect(() => {
    if (triggerFly && lat !== null && lng !== null && zoom !== null) {
      map.flyTo([lat, lng], zoom, { animate: true, duration: 2 });
    }
  }, [triggerFly, lat, lng, zoom, map]);

  return lat !== null && lng !== null ? <Marker position={[lat, lng]} /> : null;
};

const EthiopiaMap = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const levels = ["region", "zone", "wereda", "kebele"] as const;
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
  const [soilPoints, setSoilPoints] = useState<SoilPoint[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [triggerFly, setTriggerFly] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoJsonFeature[]>([]);
  const [recent, setRecent] = useState<GeoJsonFeature[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBoundary, setSelectedBoundary] = useState<GeoJsonData | null>(null);

  const healthySoilIcon = new L.Icon({
    iconUrl: "/icons/healthy-soil.png",
    iconSize: [25, 30],
    iconAnchor: [12, 41],
  });

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
    const stopListening = listenToSoilPoints(setSoilPoints);
    return () => stopListening();
  }, []);

  useEffect(() => {
    const loadGeoJson = async (level: AdminLevel, path: string) => {
      try {
        const response = await fetch(path);
        const data = await response.json();
        const taggedData = {
          ...data,
          features: data.features.map((feature: GeoJsonFeature) => ({
            ...feature,
            properties: { ...feature.properties, level },
          })),
        };
        setGeoJsonData((prev) => ({ ...prev, [level]: taggedData }));
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
      try {
        const parsed = JSON.parse(storedSearches);
        const sanitized = parsed.map((feature: GeoJsonFeature) => {
          if (feature.properties?.level) return feature;
          for (const level of levels) {
            const key = propertyKeys[level];
            const features = geoJsonData[level]?.features || [];
            const match = features.find((f) => f.properties[key] === feature.properties[key]);
            if (match) {
              return { ...feature, properties: { ...feature.properties, level } };
            }
          }
          return feature; 
        });
        setRecent(sanitized);
      } catch (error) {
        console.error("Failed to parse recent searches", error);
      }
    }
  }, [geoJsonData]); 

  const getFeatureName = (feature: GeoJsonFeature): string => {
    let level = feature.properties.level as AdminLevel | undefined;
    if (!level) {
      for (const l of levels) {
        const key = propertyKeys[l];
        if (feature.properties[key]) {
          level = l;
          feature.properties.level = l; 
          break;
        }
      }
    }
    const nameKey = level ? propertyKeys[level] : "Unknown";
    return feature.properties[nameKey] || "Unknown";
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
    if (area > 2000000) return 6;
    else if (area > 100000) return 8;
    else if (area > 5000) return 10;
    else return 12;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(!!value);

    const filtered: GeoJsonFeature[] = [];
    for (const level of levels) {
      const key = propertyKeys[level];
      const features = geoJsonData[level]?.features || [];
      const matches = features.filter((feature) =>
        feature.properties[key]?.toLowerCase().includes(value.toLowerCase())
      );
      filtered.push(...matches);
    }
    setResults(filtered.slice(0, 10)); 
  };

  const handleSearch = (customQuery?: string) => {
    const searchQuery = (customQuery ?? query).trim().toLowerCase();
    if (!searchQuery) return;

    const allFiltered: GeoJsonFeature[] = [];
    let exactMatch: GeoJsonFeature | null = null;

    for (const level of levels) {
      const key = propertyKeys[level];
      const features = geoJsonData[level]?.features || [];
      const filtered = features.filter((feature) =>
        feature.properties[key]?.toLowerCase().includes(searchQuery)
      );
      allFiltered.push(...filtered);

      const match = features.find((feature) => feature.properties[key]?.toLowerCase() === searchQuery);
      if (match) {
        exactMatch = match;
        break;
      }
    }

    setResults(allFiltered.slice(0, 10)); 

    if (exactMatch || allFiltered.length > 0) {
      const featureToShow = exactMatch || allFiltered[0];
      const newBoundary: GeoJsonData = { type: "FeatureCollection", features: [featureToShow] };
      setSelectedBoundary(newBoundary);
      const center = getCenterOfPolygon(featureToShow.geometry);
      setLat(center?.[0] ?? null);
      setLng(center?.[1] ?? null);
      setZoom(getZoomLevel(L.geoJSON(featureToShow).getBounds()));
      setTriggerFly(true);
      setTimeout(() => setTriggerFly(false), 500);
      addToRecent(featureToShow);
    }
  };

  const addToRecent = (feature: GeoJsonFeature) => {
    const featureName = getFeatureName(feature);
    const updatedRecent = [
      feature,
      ...recent.filter((f) => getFeatureName(f) !== featureName),
    ].slice(0, 5);
    setRecent(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
  };

  const handleSelect = (feature: GeoJsonFeature) => {
    setQuery(getFeatureName(feature));
    setShowDropdown(false);
    handleSearch(getFeatureName(feature));
  };

  const getSoilIcon = (type: string): Icon => {
    switch (type) {
      case "Healthy Soil":
        return healthySoilIcon;
      default:
        return new L.Icon({
          iconUrl: "/icons/default-soil.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });
    }
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer center={[9, 39]} zoom={6} style={{ height: "500px", width: "100%" }} className="z-10" attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selectedBoundary && <GeoJSON data={selectedBoundary} />}
        {soilPoints.map((point, index) => (
          <Marker key={index} position={point.coordinates} icon={getSoilIcon("Healthy Soil")}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div>
                <h3 className="text-sm font-bold">Ethiopia Soil Nutrient Mapping</h3>
                <p className="text-xs"><strong>Nitrogen</strong>: {point.nitrogen}</p>
                <p className="text-xs"><strong>Phosphorus</strong>: {point.phosphorus}</p>
                <p className="text-xs"><strong>Potassium</strong>: {point.potassium}</p>
                <p className="text-xs"><strong>Soil Moisture</strong>: {point.moisture}</p>
                <p className="text-xs"><strong>pH value</strong>: {point.ph}</p>
                {/* <p className="text-xs"><strong>Last Updated</strong>: {point.lastUpdated}</p> */}
                <p className="text-xs"><strong>Coordinates</strong>: {point.coordinates[0]}, {point.coordinates[1]}</p>
              </div>
            </Tooltip>
          </Marker>
        ))}
        <FlyToLocation lat={lat} lng={lng} zoom={zoom} triggerFly={triggerFly} />
      </MapContainer>

      <div className="absolute top-4 left-4 z-[100] w-full max-w-md">
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm bg-white focus-within:ring-2 ring-blue-500 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Google Maps"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-grow outline-none pr-10"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-10 text-gray-400 hover:text-red-500 text-sm focus:outline-none"
            >
              ✕
            </button>
          )}
          <button onClick={() => handleSearch()} className="ml-2 text-gray-600 hover:text-blue-600">
            <FaSearch />
          </button>
        </div>

        {showDropdown && (
          <div className="absolute mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg max-h-64 overflow-y-auto z-[120]">
            {recent.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500">Recent Searches</p>
                {recent.map((feature, index) => (
                  <div
                    key={`${getFeatureName(feature)}-${index}`}
                    onMouseDown={() => handleSelect(feature)}
                    className="flex items-center cursor-pointer gap-3 px-2 py-1 hover:bg-gray-100 rounded"
                  > 
                    <Clock className="w-5 h-5 text-gray-400 bg-gray-200 rounded-full" />
                    <span>{getFeatureName(feature)} ({feature.properties.level || "Unknown"})</span>
                  </div>
                ))}
              </div>
            )}
            {results.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-500">Available Locations</p>
                {results.map((feature, index) => (
                  <div
                    key={`${getFeatureName(feature)}-${index}`}
                    onMouseDown={() => handleSelect(feature)}
                    className="flex gap-3 cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    <MapPin className="w-5 h-5 text-gray-400" />
                    {getFeatureName(feature)} ({feature.properties.level || "Unknown"})
                  </div>
                ))}
              </div>
            )}
            {results.length === 0 && recent.length === 0 && query && (
              <div className="p-2 text-gray-500 text-sm">No results found</div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .leaflet-top.leaflet-left {
          margin-top: 80px;
        }
      `}</style>
      <style jsx>{`
        .leaflet-container {
          z-index: 10 !important;
        }
        .leaflet-control-container {
          z-index: 20 !important;
        }
      `}</style>
    </div>
  );
};

export default EthiopiaMap;