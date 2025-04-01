"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/config";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photo?: string;
  createdAt: any; // Will handle both string and Timestamp
};

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
      const usersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let createdAt = data.createdAt;

        // Check if createdAt exists
        if (createdAt) {
          if (typeof createdAt === "string") {
            createdAt = new Date(createdAt); // Parse string into a Date object
          } else if (createdAt.toDate) {
            createdAt = createdAt.toDate(); // If it's a Firestore Timestamp, convert to Date
          } else {
            // Handle case where the date is not in expected format
            console.warn(`Unexpected date format: ${createdAt}`);
            createdAt = new Date(); // Default to the current date if it's invalid
          }
        } else {
          // If no createdAt, set it to the current date
          createdAt = new Date();
        }

        return {
          id: doc.id,
          ...data,
          createdAt,
        } as User;
      });

      setUsers(usersData);
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
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
              <td className="border border-gray-300 p-2">
                {new Date(user.createdAt).toLocaleDateString()} {/* Format date */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
