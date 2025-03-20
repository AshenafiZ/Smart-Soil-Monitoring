import AdminSidebar from "@/components/AdminSidebar";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EthiopiaMap from "@/components/Map";

const Home: React.FC = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Ethiopia Map</h1>
      {/* <EthiopiaMap /> */}
    </div>
  );
};

export default Home;