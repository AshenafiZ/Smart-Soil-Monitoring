'use client';

import { Loader2 } from "lucide-react";

export default function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors">
      <Loader2 className="animate-spin h-16 w-16 text-blue-500" />
      <p className="mt-4 text-lg font-medium animate-pulse">
        Loading data, please wait...
      </p>
    </div>
  );
}
