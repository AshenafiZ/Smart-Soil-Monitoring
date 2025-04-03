"use client";
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

const FlyToLocation = ({ lat, lng, zoom, triggerFly }: { lat: number | null; lng: number | null; zoom: number | null; triggerFly: boolean }) => {
  const map = useMap();

  if (triggerFly && lat !== null && lng !== null) {
    map.flyTo([lat, lng], zoom || undefined , { animate: true, duration: 2 });
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
        const response = await fetch(path); 
        const data = await response.json();
        setGeoJsonData((prev) => ({ ...prev, [level]: data }));
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
    if (mapRef.current && pendingFeature) {
      console.log("Map is now initialized. Zooming to boundary...");
      setPendingFeature(null); 
    }
  }, [mapRef.current, pendingFeature]);

  const handleSearch = (searchTerm: string) => {
    for (const level of levels) {
      if (!geoJsonData[level]) continue;

      const key = propertyKeys[level];

      const foundFeature = geoJsonData[level]?.features.find(
        (feature) => feature.properties[key]?.toLowerCase() === searchTerm.toLowerCase()
      );

      if (foundFeature) {
        const newBoundary: GeoJsonData = { type: "FeatureCollection", features: [foundFeature] };
        setSelectedBoundary(newBoundary);
        setLat(getCenterOfPolygon(foundFeature.geometry)?.[0] ?? null)
        setLng(getCenterOfPolygon(foundFeature.geometry)?.[1] ?? null)
        setZoom(getZoomLevel(L.geoJSON(foundFeature).getBounds()));
        console.log("Boundary set!", lat, lng);
        setTriggerFly(true);
        setTimeout(() => setTriggerFly(false), 500); 
        console.log("Boundary set! nnnn");
        return;
      }
    }

    setSelectedBoundary(null);
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
    if (area > 1000000) return 8;
    if (area > 500000) return 10;
    return 12;
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
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <MapContainer
        center={[9, 39]}
        zoom={6}
        style={{ height: "500px", width: "100%" }}
        attributionControl={false}
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
