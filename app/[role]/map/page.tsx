export const dynamic = "force-dynamic"; // <- add this!

import EthiopiaMap from "@/components/Map";
import { notFound } from "next/navigation";

const validRoles = ["admin", "farmer", "advisor", "technician"];

export default async function MapPage({ params }: { params: { role: string } }) {
  const { role } = params;

  if (!validRoles.includes(role)) {
    notFound();
  }

  return <EthiopiaMap />;
}
