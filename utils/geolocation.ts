export interface LocationData {
    display_name: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
    };
  }
  
  export async function getLocationName(lat: number, lng: number): Promise<string | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
  
      const data: LocationData = await response.json();
      
      // Return full formatted address or fallback to city/state
      return data.display_name || data.address?.city || data.address?.state || "Unknown location";
    } catch (error) {
      console.error("Error fetching location:", error);
      return null;
    }
  }
  