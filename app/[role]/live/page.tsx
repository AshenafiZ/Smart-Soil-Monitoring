"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

type Location = {
  id: string;
  latitude?: number; 
  longitude?: number;
  moisture?: number;
  nitrogen?: number;
  potassium?: number;
  phosphorus?: number;
  ph?: number;
  timestamp: Date;
};

export default function LiveTrackingText() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "liveData"), (querySnapshot) => {
      const locationsData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          let timestamp = data.timestamp;

          // Handle timestamp conversion
          if (timestamp) {
            if (typeof timestamp === "string") {
              timestamp = parseISO(timestamp);
            } else if (timestamp.toDate) {
              timestamp = timestamp.toDate();
            } else {
              console.warn(`Unexpected timestamp format: ${timestamp}`);
              timestamp = new Date();
            }
          } else {
            timestamp = new Date();
          }

          return {
            id: doc.id,
            latitude: typeof data.latitude === "number" ? data.latitude : undefined,
            longitude: typeof data.longitude === "number" ? data.longitude : undefined,
            moisture: typeof data.moisture === "number" ? data.moisture : undefined,
            nitrogen: typeof data.nitrogen === "number" ? data.nitrogen : undefined,
            potassium: typeof data.potassium === "number" ? data.potassium : undefined,
            phosphorus: typeof data.phosphorus === "number" ? data.phosphorus : undefined,
            ph: typeof data.ph === "number" ? data.ph : undefined,
            timestamp,
          } as Location;
        })
        // Sort by timestamp in descending order (newest first)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setLocations(locationsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching Firestore data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Memoized filtered locations based on date range and search query
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const locDate = loc.timestamp;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      // Date range filtering
      const isWithinDateRange =
        (!start || locDate >= start) &&
        (!end || locDate <= new Date(end.setHours(23, 59, 59, 999)));

      // Search query filtering (case-insensitive)
      const matchesSearch = loc.id.toLowerCase().includes(searchQuery.toLowerCase());

      return isWithinDateRange && matchesSearch;
    });
  }, [locations, startDate, endDate, searchQuery]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10 tracking-tight">
        Live Data
      </h1>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by Location ID..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Date Range Picker */}
          <div className="flex gap-4 w-full md:w-auto sm:flex-row flex-col sm:items-center sm:justify-center">
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                placeholder="Start Date"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                placeholder="End Date"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.length === 0 ? (
          <p className="text-center text-xl text-gray-500 col-span-full">
            No locations match the current filters.
          </p>
        ) : (
          filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-semibold text-gray-800">{`Location ID: ${loc.id}`}</div>
              </div>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Latitude:</strong>{" "}
                  {loc.latitude != null ? loc.latitude.toFixed(6) : "N/A"}
                </p>
                <p>
                  <strong>Longitude:</strong>{" "}
                  {loc.longitude != null ? loc.longitude.toFixed(6) : "N/A"}
                </p>
                <p>
                  <strong>Moisture:</strong>{" "}
                  {loc.moisture != null ? `${loc.moisture}%` : "N/A"}
                </p>
                <p>
                  <strong>Nitrogen:</strong>{" "}
                  {loc.nitrogen != null ? `${loc.nitrogen} ppm` : "N/A"}
                </p>
                <p>
                  <strong>Potassium:</strong>{" "}
                  {loc.potassium != null ? `${loc.potassium} ppm` : "N/A"}
                </p>
                <p>
                  <strong>Phosphorus:</strong>{" "}
                  {loc.phosphorus != null ? `${loc.phosphorus} ppm` : "N/A"}
                </p>
                <p>
                  <strong>pH Level:</strong>{" "}
                  {loc.ph != null ? loc.ph.toFixed(2) : "N/A"}
                </p>
                <p>
                  <strong>Timestamp:</strong>{" "}
                  {format(loc.timestamp, "PPP p")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}