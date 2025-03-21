"use client";

import { useState } from "react";
import { getLocationName } from "../utils/geolocation";

export default function LocationFetcher() {
  const [location, setLocation] = useState<string | null>(null);

  const fetchLocation = async () => {
    const lat = 9.033140;  
    const lng = 38.750080; 
    const place = await getLocationName(lat, lng);
    setLocation(place);
  };

  return (
    <div>
      <button onClick={fetchLocation} className="px-4 py-2 bg-blue-500 text-white rounded">
        Get Location
      </button>
      {location && <p>📍 Location: {location}</p>}
    </div>
  );
}
