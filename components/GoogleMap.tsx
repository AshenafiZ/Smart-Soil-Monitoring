// "use client";
// import dynamic from "next/dynamic";
// import { useEffect, useState, useRef } from "react";
// import "leaflet/dist/leaflet.css";
// import 'leaflet-defaulticon-compatibility';
// import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
// import L, { LatLngBoundsExpression, LatLngTuple, Icon } from 'leaflet';
// import { useMap } from "react-leaflet";
// import { FaSearch } from "react-icons/fa";
// import { listenToSoilPoints, SoilPoint } from "@/lib/soilData";

// const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
// const GeoJSON = dynamic(() => import("react-leaflet").then(mod => mod.GeoJSON), { ssr: false });
// const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
// const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
// const Tooltip = dynamic(() => import("react-leaflet").then(mod => mod.Tooltip), { ssr: false });

// interface FeatureProperties {
//   regionName?: string;
//   zoneName?: string;
//   woredaName?: string;
//   kebeleName?: string;
//   [key: string]: any;
// }
// interface GeoJsonFeature {
//   type: "Feature";
//   properties: FeatureProperties;
//   geometry: {
//     type: string;
//     coordinates: any;
//   };
// }
// export interface GeoJsonData {
//   type: "FeatureCollection";
//   features: GeoJsonFeature[];
// }
// type Location = {
//   name: string;
//   coords: LatLngTuple; 
//   type: string;
//   moisture?: number;
//   pH?: number;
//   nitrogen?: number;
//   phosphorus?: number;
//   potassium?: number;
//   time?: string;
// };
// // type LocationData = {
// //   name: string;
// //   coordinates: [number, number];
// // };


// const FlyToLocation = ({ lat, lng, zoom, triggerFly }: { lat: number | null; lng: number | null; zoom: number | null; triggerFly: boolean }) => {
//   const map = useMap();

//   if (triggerFly && lat !== null && lng !== null) {
//     map.flyTo([lat, lng], zoom || 4 , { animate: true, duration: 2 });
//   }

//   return lat !== null && lng !== null ? (
//     <Marker position={[lat, lng]}>
//     </Marker>
//   ) : null;
// };

// const EthiopiaMap = () => {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const levels = ["region", "zone", "wereda", "kebele"] as const;
//   const [soilPoints, setSoilPoints] = useState<SoilPoint[]>([]);
//   const [lat, setLat] = useState<number | null>(null);
//   const [lng, setLng] = useState<number | null>(null);
//   const [zoom, setZoom] = useState<number | null>(null);
//   const [triggerFly, setTriggerFly] = useState(false);
//   const [locationNames, setLocationNames] = useState<string[]>([]);
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<GeoJsonFeature[]>([]);
//   const [recent, setRecent] = useState<GeoJsonFeature[]>([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState<GeoJsonFeature | null>(null);
//   type AdminLevel = (typeof levels)[number];

//   const propertyKeys: { [key in AdminLevel]: string } = {
//     region: "REGIONNAME",
//     zone: "ZONENAME",
//     wereda: "WOREDANAME",
//     kebele: "RK_NAME",
//   };

//   const [geoJsonData, setGeoJsonData] = useState<{ [key in AdminLevel]: GeoJsonData | null }>({
//     region: null,
//     zone: null,
//     wereda: null,
//     kebele: null,
//   });
//   const [selectedBoundary, setSelectedBoundary] = useState<GeoJsonData | null>(null);
//   // const [pendingFeature, setPendingFeature] = useState<GeoJsonFeature | null>(null);
//   const mapRef = useRef<L.Map | null>(null);
//   type SoilIcon = Icon;
  
//   const hospitalIcon = new L.Icon({
//     iconUrl: '/icons/hospital.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   }); 
//   const schoolIcon = new L.Icon({
//     iconUrl: '/icons/school.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });
//   const defaultIcon = new L.Icon({
//     iconUrl: '/icons/default.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   }); 
//   const healthySoilIcon = new L.Icon({
//     iconUrl: '/icons/healthy-soil.png', 
//     iconSize: [25, 30],
//     iconAnchor: [12, 41],
//   });
//   const erodedSoilIcon = new L.Icon({
//     iconUrl: '/icons/eroded-soil.png',  
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });
//   const farmingIcon = new L.Icon({
//     iconUrl: '/icons/farming.png',  
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });
//   useEffect(() => {
//     const stopListening = listenToSoilPoints(setSoilPoints);
//     return () => stopListening();
//   }, []);
//   useEffect(() => {
//     const loadGeoJson = async (level: AdminLevel, path: string) => {
//       try {
//         const key = propertyKeys[level];
//         const response = await fetch(path); 
//         const data = await response.json();
//         setGeoJsonData((prev) => ({ ...prev, [level]: data }));
//         const names = data.features.map((feature: any) => 
//           feature.properties[key] || 
//           feature.properties[key] || 
//           feature.properties[key] || 
//           feature.properties[key] || 
//           "Unknown"
//         );
        
//         setLocationNames((prev) => [...prev, ...names]);
        
//       } catch (error) {
//         console.error(`Failed to load ${level} data`, error);
//       }
//     };
  
//     if (typeof window !== "undefined") {
//       loadGeoJson("region", "/map/admin1.json");
//       loadGeoJson("zone", "/map/admin2.json");
//       loadGeoJson("wereda", "/map/admin3.json");
//       loadGeoJson("kebele", "/map/admin4.json");
//     }
//   }, []);
//   useEffect(() => {
//       const storedSearches = localStorage.getItem("recentSearches");
//       if (storedSearches) {
//         setRecent(JSON.parse(storedSearches));
//       }
//     }, []);
//   // useEffect(() => {
//   //   if (mapRef.current && pendingFeature) {
//   //     console.log("Map is now initialized. Zooming to boundary...");
//   //     setPendingFeature(null); 
//   //   }
//   // }, [mapRef.current, pendingFeature]);
//   const handleSelect = (value: string) => {
//     setQuery(value);
//     setShowDropdown(false);
//     // handleSearch();
//   };
//   const showPlace = (feature: GeoJsonFeature) => {
//     const newBoundary: GeoJsonData = { type: "FeatureCollection", features: [feature] };
//     setSelectedBoundary(newBoundary);
//     setLat(getCenterOfPolygon(feature.geometry)?.[0] ?? null);
//     setLng(getCenterOfPolygon(feature.geometry)?.[1] ?? null);
//     setZoom(getZoomLevel(L.geoJSON(feature).getBounds()));

//     console.log("Boundary set!", lat, lng);
//     setTriggerFly(true);
//     setTimeout(() => setTriggerFly(false), 500); 
//     console.log("Boundary set!");
//   }
//   const handleSearch = () => {
//     if (!query.trim()) return;
//     const allFiltered: GeoJsonFeature[] = [];
//     for (const level of levels) {
//         if (!geoJsonData[level]) continue;
//         const key = propertyKeys[level];
//         const filtered = geoJsonData[level]?.features.filter(
//           (feature) => feature.properties[key]?.toLowerCase().includes(query.toLowerCase())
//         ).map((feature) => (
//           {...feature, properties: {...feature.properties, level,}}
//         ));
//         allFiltered.push(...filtered);
//         console.log(filtered[0]?.properties.regionName)
        
//         const foundFeature = geoJsonData[level]?.features.find(
//             (feature) => feature.properties[key]?.toLowerCase() === query.toLowerCase()
//         );
//         if (foundFeature) {
//           showPlace(foundFeature);
//           return;
//         }
//     }
//     setResults(allFiltered);
//     setSelectedBoundary(null);
// };
//   const getCenterOfPolygon = (geometry: { coordinates: any; type: string }) => {
//     if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") return null;

//     let totalPoints = 0;
//     let sumLat = 0;
//     let sumLng = 0;

//     const processCoords = (coords: number[][]) => {
//       coords.forEach(([lng, lat]) => {
//         sumLat += lat;
//         sumLng += lng;
//         totalPoints++;
//       });
//     };

//     if (geometry.type === "Polygon") {
//       geometry.coordinates.forEach(processCoords);
//     } else if (geometry.type === "MultiPolygon") {
//       geometry.coordinates.forEach((polygon: number[][][]) => polygon.forEach(processCoords));
//     }

//     return totalPoints > 0 ? [sumLat / totalPoints, sumLng / totalPoints] : null;
//   };
//   const getZoomLevel = (bounds: L.LatLngBounds) => {
//     const area = bounds.getSouthWest().distanceTo(bounds.getNorthEast());
//     if (area > 2000000) {
//       return 6;
//     } else if(area > 100000) {
//       return 8;
//     } else if(area > 5000) {
//       return 10;
//     } else {
//       return 12;
//     }
    
//   };
//   const locations: Location[] = [
//     { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.03, 38.74], type: 'Healthy Soil', moisture: 70, pH: 6, nitrogen: 1240, phosphorus: 430, potassium: 45, time:'15/2/2017 11:26:34 Am' },
//     { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.05, 38.76], type: 'Healthy Soil', moisture: 30, pH: 12, nitrogen: 240, phosphorus: 130, potassium: 245, time:'15/2/2017 11:26:34 Am' },
//     { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.04, 38.73], type: 'Healthy Soil', moisture: 50, pH: 4, nitrogen: 120, phosphorus: 30, potassium: 445, time:'15/2/2017 11:26:34 Am' },
//     { name: 'Ethiopia Soil Nutrient Mapping', coords: [9.06, 38.78], type: 'Healthy Soil', moisture: 90, pH: 7, nitrogen: 220, phosphorus: 40, potassium: 450, time:'15/2/2017 11:26:34 Am' },
//   ];
//   const getSoilIcon = (type: string): SoilIcon => {
//     switch (type) {
//       case 'Healthy Soil':
//         return healthySoilIcon;
//       case 'Eroded Soil':
//         return erodedSoilIcon;
//       case 'Farming':
//         return farmingIcon;
//       case 'Capital':
//         return healthySoilIcon;
//       case 'Hospital':
//         return hospitalIcon;
//       case 'School':
//         return schoolIcon;
//       default:
//         return new L.Icon({
//           iconUrl: '/icons/default-soil.png',  
//           iconSize: [25, 41],
//           iconAnchor: [12, 41],
//         });
//     }
//   };
//   function getFeatureName(feature: GeoJsonFeature): string {
//     const level = feature.properties.level as keyof typeof propertyKeys;
//     const nameKey = propertyKeys[level];
//     return feature.properties[nameKey] || "Unknown";
//   }
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setQuery(value);
//     setShowDropdown(true);
  
//     const filtered: GeoJsonFeature[] = [];
//     for (const level of levels) {
//       const key = propertyKeys[level];
//       const features = geoJsonData[level]?.features || [];
//       const matches = features.filter((feature) =>
//         feature.properties[key]?.toLowerCase().includes(value.toLowerCase())
//       );
//       filtered.push(...matches);
//     }
//     setResults(filtered);
//   };
//   const handleSearchn = (customQuery?: string) => {
//     const searchQuery = (customQuery ?? query).trim().toLowerCase();
//     if (!searchQuery) return;
  
//     const allFiltered: GeoJsonFeature[] = [];
//     for (const level of levels) {
//       const key = propertyKeys[level];
//       const features = geoJsonData[level]?.features || [];
  
//       const filtered = features.filter((feature) =>
//         feature.properties[key]?.toLowerCase().includes(searchQuery)
//       ).map((feature) => ({
//         ...feature,
//         properties: {
//           ...feature.properties,
//           level,
//         },
//       }));
//       allFiltered.push(...filtered);
  
//       const exactMatch = features.find(
//         (feature) => feature.properties[key]?.toLowerCase() === searchQuery
//       );
//       if (exactMatch) {
//         addToRecent(exactMatch);
//         showPlace(exactMatch);
//         return;
//       }
//     }
  
//     if (allFiltered.length > 0) {
//       addToRecent(allFiltered[0]);
//       showPlace(allFiltered[0]);
//     }
  
//     setResults(allFiltered);
//     setSelectedBoundary(null);
//   };
//   const addToRecent = (feature: GeoJsonFeature) => {
//     const updatedRecent = [feature, ...recent.filter((f) => f !== feature)].slice(0, 5);
//     setRecent(updatedRecent);
//     localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
//   };
//   return (
//     <div className="relative w-full h-screen">
//       {/* <div className="flex gap-2 mb-2">
//         <input
//           type="text"
//           placeholder="Search Place"
//           className="border p-2 rounded w-full"
//           onChange={(e) => setQuery(e.target.value)}
//         />
//         <button onClick={handleSearch}>search</button>
//       </div>
//       <SearchBar places={geoJsonData['kebele']} /> */}
//       <MapContainer
//         center={[9, 39]}
//         zoom={6}
//         style={{ height: "500px", width: "100%" }}
//         attributionControl={false}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         {selectedBoundary && <GeoJSON data={selectedBoundary} />}
//         {soilPoints.map((point, index) => (
//             <Marker key={index} position={point.coordinates} icon={getSoilIcon('Healthy Soil')}>
//               <Tooltip direction="top" offset={[0, -10]} opacity={1}>
//                 <div>
//                   <h3 className="text-sm font-bold"><strong></strong>{'Ethiopia Soil Nutrient Mapping'}</h3>
//                   <p className="text-xs"><strong>Nitrogen</strong>{`: ${point.nitrogen}`}</p>
//                   <p className="text-xs"><strong>Phosphorus</strong>{`: ${point.phosphorus}`}</p>
//                   <p className="text-xs"><strong>Potassium</strong>{`: ${point.potassium}`}</p>
//                   <p className="text-xs"><strong>Soil Moisture</strong>{`: ${point.moisture}`}</p>
//                   <p className="text-xs"><strong>pH value</strong>{`: ${point.ph}`}</p>
//                   <p className="text-xs"><strong>Last Updated</strong>{`: ${point.lastUpdated}`}</p>
//                   <p className="text-xs"><strong>Coordinates</strong>{`: ${point.coordinates[0]}, ${point.coordinates[1]}`}</p>
//                 </div>
//               </Tooltip>
//             </Marker>
//           ))}
//         <FlyToLocation lat={lat} lng={lng} zoom={zoom} triggerFly={triggerFly} />
//       </MapContainer>
//       <div className="absolute top-4 left-4 z-[1000] w-full max-w-md">
//         <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm bg-white focus-within:ring-2 ring-blue-500 relative">
//           <input
//             ref={inputRef}
//             type="text"
//             placeholder="Search Google Maps"
//             value={query}
//             onChange={handleInputChange}
//             onFocus={() => setShowDropdown(true)}
//             onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
//             className="flex-grow outline-none pr-6"
//           />

//           {/* Clear (X) Button */}
//           {query && (
//             <button
//               onClick={() => setQuery("")}
//               className="absolute right-10 text-gray-400 hover:text-red-500 text-sm focus:outline-none"
//             >
//               ✕
//             </button>
//           )}

//           {/* Search Icon */}
//           <button onClick={() => handleSearchn()} className="ml-2 text-gray-600 hover:text-blue-600">
//             <FaSearch />
//           </button>
//         </div>

//         {/* Dropdown menu */}
//         {showDropdown && (
//           <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
//             <div className="p-2">
//               <p className="text-xs font-semibold text-gray-500">Available Locations</p>
//               {results.map((loc, index) => (
//                 <div
//                   key={index}
//                   onClick={() => handleSelect("abebe")}
//                   className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
//                 >
//                   {results.slice(0,10).map((feature, index) => (
//                     <div key={index}>{getFeatureName(feature)}</div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//             {recent.length > 0 && (
//               <div className="p-2 border-t border-gray-100">
//                 <p className="text-xs font-semibold text-gray-500">Recent Searches</p>
//                 {recent.map((loc, index) => (
//                   <div
//                     key={index}
//                     onClick={() => handleSelect(locz)}
//                     className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
//                   >
//                     {loc}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Push zoom control down */}
//       <style>{`
//         .leaflet-top.leaflet-left {
//           margin-top: 80px; 
//         }
//       `}</style>
//     </div>
//   );
// };

// export default EthiopiaMap;
