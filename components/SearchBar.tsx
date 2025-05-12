// import { useState, useEffect } from "react";
// import { Search, Clock, MapPin } from "lucide-react";
// import { useMap } from "react-leaflet";
// import { GeoJsonData } from "./GoogleMap";
// interface Props {
//   name: string,

// }
// const SearchBar: React.FC<GeoJsonData> = ({ places }) => {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const [isActive, setIsActive] = useState(false);
//   const map = useMap(); // Access Leaflet map instance

//   // Search functionality
//   const handleSearch = (query: string) => {
//     setQuery(query);
//     if (query.length < 1) return setResults([]);

//     // Filter places based on query
//     const filtered = places.filter((place) =>
//       place.name.toLowerCase().includes(query.toLowerCase())
//     );
//     setResults(filtered);
//   };

//   // Save to localStorage for recent searches
//   const saveSearch = (place) => {
//     const searches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
//     const updatedSearches = [
//       place,
//       ...searches.filter((item) => item.name !== place.name),
//     ].slice(0, 5);
//     localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
//     setRecentSearches(updatedSearches);

//     // Move map to selected place
//     if (place.coords) {
//       map.setView([place.coords.lat, place.coords.lng], 14);
//     }
//   };

//   // Load recent searches from localStorage
//   useEffect(() => {
//     setRecentSearches(JSON.parse(localStorage.getItem("recentSearches") || "[]"));
//   }, []);

//   return (
//     <div className="relative w-full max-w-md mx-auto">
//       {/* Search Input */}
//       <div className="flex items-center border rounded-full bg-white px-4 py-2 shadow-md">
//         <Search className="w-5 h-5 text-gray-500" />
//         <input
//           type="text"
//           placeholder="Search..."
//           value={query}
//           onChange={(e) => handleSearch(e.target.value)}
//           onFocus={() => setIsActive(true)}
//           onBlur={() => setTimeout(() => setIsActive(false), 200)}
//           className="w-full px-2 outline-none"
//         />
//       </div>

//       {/* Dropdown */}
//       {isActive && (results.length > 0 || recentSearches.length > 0) && (
//         <div className="absolute top-12 left-0 w-full bg-white border shadow-lg rounded-lg">
//           {/* Recent Searches */}
//           {recentSearches.length > 0 && (
//             <div>
//               {recentSearches.map((place, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                   onClick={() => saveSearch(place)}
//                 >
//                   <Clock className="w-5 h-5 text-gray-400" />
//                   <span className="text-gray-800">{place.name}</span>
//                 </div>
//               ))}
//               <hr />
//             </div>
//           )}

//           {/* Search Results */}
//           {results.map((place, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => saveSearch(place)}
//             >
//               <MapPin className="w-5 h-5 text-blue-500" />
//               <span className="text-gray-800">{place.name}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// export default SearchBar;
// 'use client';

// import React, { useRef } from 'react';
// import { FaSearch } from 'react-icons/fa';

// const availableLocations = ['Work', 'Home', 'Koye Feche', 'Bichena', 'ICS - Addis Ababa'];

// export function SearchBar1() {
//   const [inputValue, setInputValue] = useState('');
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);
//   const [showDropdown, setShowDropdown] = useState(false);

//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleSearch = () => {
//     if (!inputValue.trim()) return;
//     if (!recentSearches.includes(inputValue)) {
//       setRecentSearches(prev => [inputValue, ...prev.slice(0, 4)]); // Keep last 5
//     }
//     console.log('Searching:', inputValue);
//     // Perform actual search action here
//   };

//   const handleSelect = (value: string) => {
//     setInputValue(value);
//     setShowDropdown(false);
//     handleSearch();
//   };

//   return (
//     <div className="relative w-full max-w-md mx-auto">
//       <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm bg-white focus-within:ring-2 ring-blue-500">
//         <input
//           // ref={inputRef}
//           type="text"
//           placeholder="Search Google Maps"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onFocus={() => setShowDropdown(true)}
//           onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
//           className="flex-grow outline-none"
//         />
//         <button onClick={handleSearch} className="ml-2 text-gray-600 hover:text-blue-600">
//           <FaSearch />
//         </button>
//       </div>

//       {showDropdown && (
//         <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
//           <div className="p-2">
//             <p className="text-xs font-semibold text-gray-500">Available Locations</p>
//             {availableLocations.map((loc) => (
//               <div
//                 key={loc}
//                 onClick={() => handleSelect(loc)}
//                 className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
//               >
//                 {loc}
//               </div>
//             ))}
//           </div>
//           {recentSearches.length > 0 && (
//             <div className="p-2 border-t border-gray-100">
//               <p className="text-xs font-semibold text-gray-500">Recent Searches</p>
//               {recentSearches.map((loc) => (
//                 <div
//                   key={loc}
//                   onClick={() => handleSelect(loc)}
//                   className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
//                 >
//                   {loc}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
// import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// export default function MapWithSearch() {
//   const [inputValue, setInputValue] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [availableLocations] = useState(["Addis Ababa", "Mekelle", "Bahir Dar"]);
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleSearch = () => {
//     if (inputValue && !recentSearches.includes(inputValue)) {
//       setRecentSearches((prev) => [inputValue, ...prev.slice(0, 4)]);
//     }
//     setShowDropdown(false);
//   };

//   const handleSelect = (loc: string) => {
//     setInputValue(loc);
//     setShowDropdown(false);
//     // Optional: Center the map here
//   };

//   return (
//     <div className="relative w-full h-screen">
//       <MapContainer
//         center={[9.03, 38.74]} // Addis Ababa
//         zoom={13}
//         style={{ height: "100%", width: "100%" }}
//         zoomControl={false} // disable default position
//       >
//         <TileLayer
//           attribution='&copy; OpenStreetMap contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <ZoomControl position="topleft" />
//       </MapContainer>

//       {/* Search bar overlay */}
//       <div className="absolute top-4 right-4 z-[1000] w-full max-w-md">
//         <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm bg-white focus-within:ring-2 ring-blue-500">
//           <input
//             ref={inputRef}
//             type="text"
//             placeholder="Search Google Maps"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onFocus={() => setShowDropdown(true)}
//             onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
//             className="flex-grow outline-none"
//           />
//           <button onClick={handleSearch} className="ml-2 text-gray-600 hover:text-blue-600">
//             <FaSearch />
//           </button>
//         </div>

//         {showDropdown && (
//           <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
//             <div className="p-2">
//               <p className="text-xs font-semibold text-gray-500">Available Locations</p>
//               {availableLocations.map((loc) => (
//                 <div
//                   key={loc}
//                   onClick={() => handleSelect(loc)}
//                   className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
//                 >
//                   {loc}
//                 </div>
//               ))}
//             </div>
//             {recentSearches.length > 0 && (
//               <div className="p-2 border-t border-gray-100">
//                 <p className="text-xs font-semibold text-gray-500">Recent Searches</p>
//                 {recentSearches.map((loc) => (
//                   <div
//                     key={loc}
//                     onClick={() => handleSelect(loc)}
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
// }



// {showDropdown && (results.length > 0 || recent.length > 0) && (
//   <div className="dropdown">
//     <strong>Suggestions</strong>
//     {results.map((feature, i) => {
//       const name = Object.values(feature.properties).find((v) => typeof v === "string") || "Unknown";
//       return (
//         <div key={i} onClick={() => handleSelect(name as string)}>
//           {name}
//         </div>
//       );
//     })}

//     <strong>Recent</strong>
//     {recent.map((feature, i) => {
//       const name = Object.values(feature.properties).find((v) => typeof v === "string") || "Unknown";
//       return (
//         <div key={`recent-${i}`} onClick={() => handleSelect(name as string)}>
//           {name}
//         </div>
//       );
//     })}
//   </div>
// )}