"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FlyToLocation = ({ lat, lng, triggerFly }: { lat: number | null; lng: number | null; triggerFly: boolean }) => {
  const map = useMap();

  if (triggerFly && lat !== null && lng !== null) {
    map.flyTo([lat, lng], 12, { animate: true, duration: 2 });
  }

  return lat !== null && lng !== null ? (
    <Marker position={[lat, lng]}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};

const MapPage = () => {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [triggerFly, setTriggerFly] = useState(false);

  const handleFly = () => {
    setTriggerFly(true);
    setTimeout(() => setTriggerFly(false), 500); // Reset fly state after flying
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }}
      >
        <input
          type="number"
          placeholder="Latitude"
          value={lat ?? ""}
          onChange={(e) => setLat(parseFloat(e.target.value) || null)}
          style={{ marginRight: "5px", padding: "5px", width: "80px" }}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lng ?? ""}
          onChange={(e) => setLng(parseFloat(e.target.value) || null)}
          style={{ marginRight: "5px", padding: "5px", width: "80px" }}
        />
        <button
          onClick={handleFly}
          style={{
            marginLeft: "5px",
            padding: "5px 10px",
            background: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Fly
        </button>
      </div>

      <MapContainer center={[9.145, 40.4897]} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToLocation lat={lat} lng={lng} triggerFly={triggerFly} />
      </MapContainer>
    </div>
  );
};

export default MapPage;
