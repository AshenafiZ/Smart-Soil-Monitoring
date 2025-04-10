import { useState, useEffect } from "react";
import { Search, Clock, MapPin } from "lucide-react";
import { useMap } from "react-leaflet";
import { GeoJsonData } from "./GoogleMap";
interface Props {
  name: string,

}
const SearchBar: React.FC<GeoJsonData> = ({ places }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const map = useMap(); // Access Leaflet map instance

  // Search functionality
  const handleSearch = (query: string) => {
    setQuery(query);
    if (query.length < 1) return setResults([]);

    // Filter places based on query
    const filtered = places.filter((place) =>
      place.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  // Save to localStorage for recent searches
  const saveSearch = (place) => {
    const searches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const updatedSearches = [
      place,
      ...searches.filter((item) => item.name !== place.name),
    ].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    setRecentSearches(updatedSearches);

    // Move map to selected place
    if (place.coords) {
      map.setView([place.coords.lat, place.coords.lng], 14);
    }
  };

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(JSON.parse(localStorage.getItem("recentSearches") || "[]"));
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Search Input */}
      <div className="flex items-center border rounded-full bg-white px-4 py-2 shadow-md">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setTimeout(() => setIsActive(false), 200)}
          className="w-full px-2 outline-none"
        />
      </div>

      {/* Dropdown */}
      {isActive && (results.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-12 left-0 w-full bg-white border shadow-lg rounded-lg">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              {recentSearches.map((place, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => saveSearch(place)}
                >
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-800">{place.name}</span>
                </div>
              ))}
              <hr />
            </div>
          )}

          {/* Search Results */}
          {results.map((place, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => saveSearch(place)}
            >
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-gray-800">{place.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default SearchBar;