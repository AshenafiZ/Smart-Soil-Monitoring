"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Props {
  onClose: () => void;
}

const AddDeviceForm: React.FC<Props> = ({ onClose }) => {
  const [device, setDevice] = useState({
    name: "",
    deviceId: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDevice({ ...device, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "devices"), {
        ...device,
        timestamp: serverTimestamp(),
      });
      alert("Device added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding device:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={device.name}
        onChange={handleChange}
        placeholder="Device Name"
        className="border p-2 rounded w-full"
        required
      />
      <input
        type="text"
        name="deviceId"
        value={device.deviceId}
        onChange={handleChange}
        placeholder="Device ID"
        className="border p-2 rounded w-full"
        required
      />
      <input
        type="text"
        name="location"
        value={device.location}
        onChange={handleChange}
        placeholder="Location"
        className="border p-2 rounded w-full"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Submit Device
      </button>
    </form>
  );
};

export default AddDeviceForm;
