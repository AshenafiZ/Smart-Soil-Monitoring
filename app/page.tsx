'use client'
import { DynamicSidebar } from "@/components/DynamicSidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LocationFetcher from "@/components/Locationfetcher";
import EthiopiaMap from "@/components/Map";
import MapView from "@/components/MapView";
import Link from "next/link";
import { useState } from "react";
const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div>
      {/* <EthiopiaMap /> */}
    <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Ethiopia Map</h1>
    <LocationFetcher />
    <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter a city or place (e.g., Addis Ababa)"
        className="border p-2 rounded w-full mb-4"
      />
      <MapView searchQuery={searchQuery} />
    </div>
  );
};

export default Home;