import { db } from "@/lib/firebase";
import {collection, doc, onSnapshot, getDoc, DocumentData, QuerySnapshot,} from "firebase/firestore";

export type Coordinates = [number, number];

export interface SoilPoint {
  id: string;
  coordinates: Coordinates;
  name: string;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  createdAt?: Date;
  lastUpdated?: Date;
}

export function listenToSoilPoints(
  onUpdate: (points: SoilPoint[]) => void
) {
  const unsubscribe = onSnapshot(collection(db, "soilData"), async (snapshot: QuerySnapshot<DocumentData>) => {
    const results = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const locationRef = data.location;
        if (!locationRef) return null;

        const locationDoc = await getDoc(doc(db, "locations", locationRef));
        if (!locationDoc.exists()) return null;

        const loc = locationDoc.data();
        return {
          id: docSnap.id,
          coordinates: [loc.latitude, loc.longitude] as Coordinates,
          name: data.name,
          moisture: data.moisture,
          ph: data.ph,
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
          createdAt: data.createdAt?.toDate(),
          lastUpdated: data.lastUpdated?.toDate(),

        } as SoilPoint;
      })
    );

    onUpdate(results.filter(Boolean) as SoilPoint[]);
  });

  return unsubscribe;
}
