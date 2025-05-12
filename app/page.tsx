'use client'
import { DynamicSidebar } from "@/components/DynamicSidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LocationFetcher from "@/components/Locationfetcher";
import EthiopiaMap from "@/components/Map";
import MapView from "@/components/MapView";
import Link from "next/link";
import dynamic from "next/dynamic";

// const GoogleMap = dynamic(() => import("@/components/GoogleMap"), { ssr: false });
import { useState } from "react";
import LiveSoilMapList from "@/components/SoilData";
const Home: React.FC = () => {
  return (
    <div>
      
      <EthiopiaMap />
    </div>
  );
};

export default Home;