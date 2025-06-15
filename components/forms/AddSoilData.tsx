"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Props {
  onClose: () => void;
}

const AddSoilDataForm: React.FC<Props> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    latitude: "",
    longitude: "",
    moisture: "",
    pH: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "soil_data"), {
        ...formData,
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        moisture: parseFloat(formData.moisture),
        pH: parseFloat(formData.pH),
        timestamp: serverTimestamp(),
      });
      alert("Soil data added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding soil data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {["nitrogen", "phosphorus", "potassium", "moisture"].map((field) => (
          <input
            key={field}
            type="number"
            name={field}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="border p-2 rounded w-full"
            required
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          placeholder="Latitude"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          placeholder="Longitude"
          className="border p-2 rounded"
          required
        />
      </div>
      <input
        type="number"
        step="0.01"
        name="pH"
        value={formData.pH}
        onChange={handleChange}
        placeholder="pH Level"
        className="border p-2 rounded w-full"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Submit Data
      </button>
    </form>
  );
};

export default AddSoilDataForm;
