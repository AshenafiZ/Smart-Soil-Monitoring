"use client";
import { useState } from "react";
import ReusableModal from "@/components/UIModal";
import AddSoilDataForm from "@/components/forms/AddSoilData";
import AddDeviceForm from "@/components/forms/AddDevice";

export default function HomePage() {
  const [modalType, setModalType] = useState<"soil" | "device" | null>(null);

  return (
    <div className="flex flex-col items-center space-y-4 mt-10">
      <button onClick={() => setModalType("soil")} className="bg-green-600 text-white px-4 py-2 rounded">
        Add Soil Data
      </button>
      <button onClick={() => setModalType("device")} className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Device
      </button>

      <ReusableModal isOpen={!!modalType} onClose={() => setModalType(null)} title="Enter Details">
        {modalType === "soil" ? <AddSoilDataForm onClose={() => setModalType(null)} /> : <AddDeviceForm onClose={() => setModalType(null)} />}
      </ReusableModal>
    </div>
  );
}
