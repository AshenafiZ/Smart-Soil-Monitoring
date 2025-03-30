"use client"; 

import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ethiopiaGeoJSON from "@/public/map/admin3.json";
import { GeoJSONData, GeoJSONFeature } from "@/types/geojson";

const MapComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedFeature, setHighlightedFeature] = useState<GeoJSONFeature | null>(null);

  // Function to handle region search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const matchedFeature = (ethiopiaGeoJSON as GeoJSONData).features.find(
      (feature: GeoJSONFeature) => feature.properties.REGIONNAME.toLowerCase() === query.toLowerCase()
    );
    setHighlightedFeature(matchedFeature || null);
    console.log(highlightedFeature);
  };

  // Function to style features
  const geoJSONStyle = (feature: GeoJSONFeature) => ({
    fillColor: highlightedFeature && feature === highlightedFeature ? "red" : "blue",
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 0.2,
  });

  return (
    <div className="relative w-full h-[500px]">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search a region..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="absolute top-4 left-4 p-2 z-[1000] bg-white shadow-md rounded-md"
      />

      {/* Leaflet Map */}
      <MapContainer center={[9.145, 40.4897]} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* GeoJSON Layer */}
        <GeoJSON
          data={ethiopiaGeoJSON as GeoJSONData}
          style={geoJSONStyle}
          onEachFeature={(feature: GeoJSONFeature, layer: L.Layer) => {
            layer.on("click", () => setHighlightedFeature(feature));
          }}
        />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
