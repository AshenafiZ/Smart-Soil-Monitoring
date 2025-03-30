"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photo?: string;
  createdAt: string;
};

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">User List</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Photo</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Role</th>
            <th className="border border-gray-300 p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border border-gray-300 p-2">
                {user.photo ? (
                  <img src={`data:image/png;base64,${user.photo}`} alt="Profile" className="w-12 h-12 rounded-full mx-auto" />
                ) : (
                  "No Image"
                )}
              </td>
              <td className="border border-gray-300 p-2">
                {user.firstName} {user.lastName}
              </td>
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">{user.role}</td>
              <td className="border border-gray-300 p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
