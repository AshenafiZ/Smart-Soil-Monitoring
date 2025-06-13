"use client";
import { useState } from "react";
import { db } from "@/app/firebase/config"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface DataFormProps {
  onClose: () => void;
}

const DataForm: React.FC<DataFormProps> = ({ onClose }) => {
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
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        moisture: parseFloat(formData.moisture),
        pH: parseFloat(formData.pH),
        timestamp: serverTimestamp(),
      });

      alert("Data added successfully!");
      onClose(); 
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          name="nitrogen"
          value={formData.nitrogen}
          onChange={handleChange}
          placeholder="Nitrogen (N)"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="phosphorus"
          value={formData.phosphorus}
          onChange={handleChange}
          placeholder="Phosphorus (P)"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="potassium"
          value={formData.potassium}
          onChange={handleChange}
          placeholder="Potassium (K)"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="moisture"
          value={formData.moisture}
          onChange={handleChange}
          placeholder="Moisture (%)"
          className="border p-2 rounded"
          required
        />
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

export default DataForm;
