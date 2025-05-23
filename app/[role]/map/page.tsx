import EthiopiaMap from "@/components/Map";
import { notFound } from "next/navigation";
// import { stringify } from "querystring";

const validRoles = ["admin", "farmer", "advisor", "technician"];

export default function MapPage({ params }: { params: { role: string } }) {
  const { role } = params;
  if (!validRoles.includes(role)) {
    notFound();
  }
  return <EthiopiaMap  />;
}