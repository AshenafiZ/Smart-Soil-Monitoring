"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/config";

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  moisture: number;
  nitrogen: number;
  potassium: number;
  phosphorus: number;
  phLevel: number;
  timestamp: any; 
};

export default function LiveTrackingText() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "liveData"), (querySnapshot) => {
      const locationsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let timestamp = data.timestamp;

        // Check if timestamp exists
        if (timestamp) {
          if (typeof timestamp === "string") {
            timestamp = new Date(timestamp); // Parse string into a Date object
          } else if (timestamp.toDate) {
            timestamp = timestamp.toDate(); // If it's a Firestore Timestamp, convert to Date
          } else {
            // Handle case where the timestamp is not in expected format
            console.warn(`Unexpected timestamp format: ${timestamp}`);
            timestamp = new Date(); // Default to the current date if it's invalid
          }
        } else {
          // If no timestamp, set it to the current date
          timestamp = new Date();
        }

        return {
          id: doc.id,
          ...data,
          timestamp,
        } as Location;
      });

      setLocations(locationsData);
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center text-xl font-semibold">Loading data...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Live Location Updates</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-lg shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center mb-4">
              <div className="text-2xl font-semibold text-white">{`Location ID: ${loc.id}`}</div>
            </div>

            <div className="space-y-2 text-white">
              <p><strong>Latitude:</strong> {loc.latitude}</p>
              <p><strong>Longitude:</strong> {loc.longitude}</p>
              <p><strong>Moisture:</strong> {loc.moisture}%</p>
              <p><strong>Nitrogen:</strong> {loc.nitrogen} ppm</p>
              <p><strong>Potassium:</strong> {loc.potassium} ppm</p>
              <p><strong>Phosphorus:</strong> {loc.phosphorus} ppm</p>
              <p><strong>pH Level:</strong> {loc.phLevel}</p>
              <p><strong>Timestamp:</strong> {new Date(loc.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
