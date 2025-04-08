"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
import DataForm from "@/components/DataForm";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded shadow"
      >
        Add Soil Data
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Enter Soil Data</h2>
        <DataForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
