
type LocationProps = {
    lat: string,
    lng: string
}
export async function getLocationName({lat, lng}: LocationProps) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name; 
    } catch (error) {
      console.error("Error fetching location:", error);
      return null;
    }
  }
  