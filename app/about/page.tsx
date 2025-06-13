"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Map, BarChart2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">About Smart Soil Monitoring</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Empowering sustainable agriculture through advanced soil health solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300">
              The <strong>Smart Soil Monitoring and Mapping</strong> project is dedicated to revolutionizing agriculture by providing farmers, advisors, and technicians with real-time insights into soil health. Our mission is to enhance crop productivity, optimize resource use, and promote sustainable farming practices through cutting-edge technology.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Key Features</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <Leaf className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Soil Health Monitoring</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time data on soil moisture, nutrients, and pH levels to ensure optimal growing conditions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Map className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Precision Mapping</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  High-resolution soil maps to identify variations and guide precise interventions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <BarChart2 className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Data Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actionable insights and recommendations to improve yield and sustainability.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Vision</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We envision a future where every farmer has access to advanced tools to monitor and manage soil health, reducing waste and ensuring food security. Join us in building a smarter, greener tomorrow.
            </p>
          </div>
        </CardContent>
        <div className="flex justify-center gap-4 mb-6">
          <Button asChild>
            <a href="/signup">Get Started</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/contact">Contact Us</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}