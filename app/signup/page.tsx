'use client'
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config"; 

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  photo: File | null;
};

export default function SignUp() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    photo: null
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(formData.photo as File);
      reader.onload = async () => {
        const base64Image = reader.result?.toString().split(",")[1];

        // Add document to Firestore in the "users" collection
        console.log({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            photo: base64Image,
            createdAt: new Date(),
          });
          
        const userDocRef = await addDoc(collection(db, "users"), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          photo: base64Image,
          createdAt: new Date(),
        });
        

        setMessage("User registered successfully!");
      };
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields here */}
            <div>
              <Label>First Name</Label>
              <Input type="text" name="firstName" placeholder="John" required onChange={handleChange} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input type="text" name="lastName" placeholder="Doe" required onChange={handleChange} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" name="email" placeholder="johndoe@example.com" required onChange={handleChange} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" name="password" placeholder="••••••" required onChange={handleChange} />
            </div>
            <div>
              <Label>Role</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profile Photo</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            {message && <p className="text-center text-sm text-green-600">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
