"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Map, BarChart2, Sprout } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center">
        <Image
          src="https://res.cloudinary.com/djnyauytw/image/upload/v1748036839/heronew_f5iqyj.png"
          alt="Smart Soil Monitoring"
          fill
          content="object-cover"
          className="object-cover opacity-80"
          priority
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
            Smart Soil Monitoring & Mapping
          </h1>
          <p className="text-xl text-white drop-shadow-md mb-6">
            Unlock the power of data-driven agriculture with real-time soil insights for sustainable farming.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-gray-900">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </section>

      {/* Features Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose Smart Soil Monitoring?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Leaf className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle className="text-lg">Real-Time Soil Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor soil moisture, nutrients, and pH in real time to optimize crop growth and reduce waste.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Map className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Precision Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Create high-resolution soil maps to identify field variations and make informed decisions.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <BarChart2 className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Data-Driven Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Leverage advanced analytics to boost yield and promote sustainable farming practices.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-green-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Join the Future of Farming</h2>
          <p className="text-lg mb-6">
            Sign up today to access powerful tools for soil monitoring and mapping, designed for farmers, advisors, and technicians.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Start Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Sprout className="w-6 h-6" />
            <span className="text-lg font-semibold">Smart Soil Monitoring</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/signup" className="hover:underline">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}