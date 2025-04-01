"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

const EthiopiaMap = () => {
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

  const [selectedBoundary, setSelectedBoundary] = useState<GeoJsonData | null>(null);
  const [pendingFeature, setPendingFeature] = useState<GeoJsonFeature | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const loadGeoJson = async (level: AdminLevel, path: string) => {
      try {
        const response = await fetch(path);
        const data: GeoJsonData = await response.json();
        setGeoJsonData((prev) => ({ ...prev, [level]: data }));
      } catch (error) {
        console.error(`Failed to load ${level} data`, error);
      }
    };

    loadGeoJson("region", "/map/admin1.json");
    loadGeoJson("zone", "/map/admin2.json");
    loadGeoJson("wereda", "/map/admin3.json");
    loadGeoJson("kebele", "/map/admin4.json");
  }, []);

  useEffect(() => {
    if (mapRef.current && pendingFeature) {
      console.log("Map is now initialized. Zooming to boundary...");
      zoomToBoundary(pendingFeature);
      setPendingFeature(null); // Reset pending feature after zooming
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
        const newBoundary = { type: "FeatureCollection", features: [foundFeature] };
        setSelectedBoundary(newBoundary);
        console.log("Boundary set!");

        if (mapRef.current) {
          zoomToBoundary(foundFeature);
        } else {
          console.warn("Map is not initialized yet! Storing feature for later zooming...");
          setPendingFeature(foundFeature);
        }

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

  const zoomToBoundary = (feature: GeoJsonFeature) => {
    if (!mapRef.current) {
      console.warn("Map is not initialized yet!");
      return;
    }

    const bounds = L.geoJSON(feature).getBounds();
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });

    const center = getCenterOfPolygon(feature.geometry);
    if (center) {
      const zoom = getZoomLevel(bounds);
      mapRef.current.setView(center, zoom);
      console.log("Zoomed to:", center, "at zoom level:", zoom);
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
        whenCreated={(map) => {
          mapRef.current = map;
          console.log("Map reference set!");

          // If a feature was pending, zoom to it now
          if (pendingFeature) {
            console.log("Applying pending zoom...");
            zoomToBoundary(pendingFeature);
            setPendingFeature(null);
          }
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selectedBoundary && <GeoJSON data={selectedBoundary} />}
      </MapContainer>
    </div>
  );
};

export default EthiopiaMap;
