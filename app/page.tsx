import { DynamicSidebar } from "@/components/DynamicSidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LocationFetcher from "@/components/Locationfetcher";
import EthiopiaMap from "@/components/Map";
import Link from "next/link";
const Home: React.FC = () => {
  return (
    <div>
      {/* <EthiopiaMap /> */}
    <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Ethiopia Map</h1>
    <LocationFetcher />
    </div>
  );
};

export default Home;