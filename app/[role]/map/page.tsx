export const dynamic = "force-dynamic";
import EthiopiaMap from "@/components/Map";
import { notFound } from "next/navigation";

const validRoles = ["admin", "farmer", "advisor", "technician"];

export default async function MapPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;

  if (!validRoles.includes(role)) {
    notFound();
  }

  return <EthiopiaMap />;
}