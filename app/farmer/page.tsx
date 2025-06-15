"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Leaf, BarChart2 } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Field = {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
};

type SensorData = {
  id: string;
  fieldId: string;
  moisture: number;
  pH: number;
  nutrients: { nitrogen: number; phosphorus: number; potassium: number };
  timestamp: Date;
};

type ChartData = {
  time: string;
  moisture: number;
  pH: number;
};

export default function FarmerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Fetch user data from Firestore to verify role
        const userRef = collection(db, "users");
        const userQuery = query(userRef, where("email", "==", currentUser.email));
        onSnapshot(userQuery, (snapshot) => {
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            if (userData.role === "farmer") {
              setUser({ id: snapshot.docs[0].id, ...userData });
            } else {
              setError("Access denied: You are not a farmer");
              router.push("/login");
            }
          } else {
            setError("User data not found");
            router.push("/login");
          }
          setLoading(false);
        });
      } else {
        setError("Please log in to access the dashboard");
        router.push("/login");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Fetch fields for the user
    const fieldsQuery = query(collection(db, "fields"), where("userId", "==", user.id));
    const unsubscribeFields = onSnapshot(fieldsQuery, (snapshot) => {
      const fieldsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
        location: doc.data().location || "",
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      setFields(fieldsData);
    }, (err) => {
      console.error("Error fetching fields:", err);
      setError("Failed to load fields");
    });

    // Fetch sensor data for all fields
    const sensorsQuery = query(collection(db, "sensors"));
    const unsubscribeSensors = onSnapshot(sensorsQuery, (snapshot) => {
      const sensorsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          fieldId: doc.data().fieldId,
          moisture: doc.data().moisture || 0,
          pH: doc.data().pH || 0,
          nutrients: doc.data().nutrients || { nitrogen: 0, phosphorus: 0, potassium: 0 },
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }))
        .filter((data) => fields.some((field) => field.id === data.fieldId));

      setSensorData(sensorsData);

      // Prepare chart data (last 10 readings)
      const chart = sensorsData
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map((data) => ({
          time: data.timestamp.toLocaleTimeString(),
          moisture: data.moisture,
          pH: data.pH,
        }));
      setChartData(chart.reverse());
    }, (err) => {
      console.error("Error fetching sensor data:", err);
      setError("Failed to load sensor data");
    });

    return () => {
      unsubscribeFields();
      unsubscribeSensors();
    };
  }, [user, fields]);

  const handleLogout = useCallback(async () => {
    try {
      await getAuth().signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      setError("Failed to log out");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-gray-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-gray-100">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      {/* Header with Circular Logo */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://res.cloudinary.com/djnyauytw/image/upload/v1746426571/smart_soil_logo.png"
              alt="Smart Soil Monitoring Logo"
              width={48}
              height={48}
              className="rounded-full border border-gray-200 dark:border-gray-600 hover:scale-105 transition-transform duration-200"
              priority
            />
          </Link>
          <nav className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/farmer/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/about">About</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/contact">Contact</Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Welcome, {user.firstName}!
        </h1>

        {/* Overview Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600" />
                Your Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Latest Moisture</TableHead>
                    <TableHead>Latest pH</TableHead>
                    <TableHead>Nutrients (N/P/K)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => {
                    const latestSensor = sensorData
                      .filter((data) => data.fieldId === field.id)
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

                    return (
                      <TableRow key={field.id}>
                        <TableCell>{field.name}</TableCell>
                        <TableCell>{field.location}</TableCell>
                        <TableCell>
                          {latestSensor ? `${latestSensor.moisture}%` : "N/A"}
                        </TableCell>
                        <TableCell>
                          {latestSensor ? latestSensor.pH : "N/A"}
                        </TableCell>
                        <TableCell>
                          {latestSensor
                            ? `${latestSensor.nutrients.nitrogen}/${latestSensor.nutrients.phosphorus}/${latestSensor.nutrients.potassium}`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {fields.length === 0 && (
                <p className="text-gray-600 dark:text-gray-300 text-center mt-4">
                  No fields registered. Contact support to add fields.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Sensor Trends Chart */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-purple-600" />
                Soil Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="moisture" stroke="#22c55e" name="Moisture (%)" />
                    <Line type="monotone" dataKey="pH" stroke="#3b82f6" name="pH" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  No sensor data available.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}