// components/LiveSoilMapList.tsx
'use client';

import { useEffect, useState } from "react";
import { db, doc } from "@/lib/firebase";
import {
  collection,
  getDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
// import MapMarkerList from "./MapMarkerList";

type LatLngTuple = [number, number];

interface SoilMapPoint {
  id: string;
  position: LatLngTuple;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  createAt?: Date;
  lastUpdated?: Date;

}

export default function LiveSoilMapList() {
  const [points, setPoints] = useState<SoilMapPoint[]>([]);

  useEffect(() => {
    const soilQuery = query(collection(db, "soilData"));

    const unsub = onSnapshot(soilQuery, async (snapshot) => {
      const tempPoints: SoilMapPoint[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const locationId = data.location;

        // fetch linked location doc
        const locSnap = await getDoc(doc(db, "locations", locationId));
        if (!locSnap.exists()) continue;

        const locData = locSnap.data();
        const latlng: LatLngTuple = [locData.latitude, locData.longitude];

        tempPoints.push({
          id: docSnap.id,
          position: latlng,
          moisture: data.moisture,
          ph: data.ph,
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
          createAt: data.createdAt?.toDate(),
          lastUpdated: data.lastUpdated?.toDate(),
        });
      }

      setPoints(tempPoints);
    });

    return () => unsub();
  }, []);
  console.log("points", points);
  return (
    <div className="h-[500px]">
      location
    </div>
  );
}
