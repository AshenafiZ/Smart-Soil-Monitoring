// "use client";
// import { useState, useEffect } from "react";
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "@/app/firebase/config";
// import FullPageLoader from "@/components/Loader";

// type User = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: string;
//   photo?: string;
//   photoURL?: string;
//   createdAt: any; 
// };

// export default function UsersList() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
//       const usersData = querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         let createdAt = data.createdAt;

//         // Check if createdAt exists
//         if (createdAt) {
//           if (typeof createdAt === "string") {
//             createdAt = new Date(createdAt); // Parse string into a Date object
//           } else if (createdAt.toDate) {
//             createdAt = createdAt.toDate(); // If it's a Firestore Timestamp, convert to Date
//           } else {
//             // Handle case where the date is not in expected format
//             console.warn(`Unexpected date format: ${createdAt}`);
//             createdAt = new Date(); // Default to the current date if it's invalid
//           }
//         } else {
//           // If no createdAt, set it to the current date
//           createdAt = new Date();
//         }

//         return {
//           id: doc.id,
//           ...data,
//           createdAt,
//         } as User;
//       });

//       setUsers(usersData);
//       setLoading(false);
//     });

//     // Cleanup
//     return () => unsubscribe();
//   }, []);

//   if (loading) return FullPageLoader();

//   return (
//     <div className="max-w-4xl mx-auto mt-10">
//       <h2 className="text-xl font-bold mb-4">User List</h2>
//       <table className="w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border border-gray-300 p-2">Photo</th>
//             <th className="border border-gray-300 p-2">Name</th>
//             <th className="border border-gray-300 p-2">Email</th>
//             <th className="border border-gray-300 p-2">Role</th>
//             <th className="border border-gray-300 p-2">Created At</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user) => (
//             <tr key={user.id} className="text-center">
//               <td className="border border-gray-300 p-2">
//                 {user.photo ? (
//                   <img src={`data:image/png;base64,${user.photo}`} alt="Profile" className="w-12 h-12 rounded-full mx-auto" />
//                 ) : (
//                   <img src={`${user.photoURL}`} className="w-12 h-12 rounded-full mx-auto" />
//                 )}
//               </td>
//               <td className="border border-gray-300 p-2">
//                 {user.firstName} {user.lastName}
//               </td>
//               <td className="border border-gray-300 p-2">{user.email}</td>
//               <td className="border border-gray-300 p-2">{user.role}</td>
//               <td className="border border-gray-300 p-2">
//                 {new Date(user.createdAt).toLocaleDateString()} {/* Format date */}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react"; // Import Lucide User icon
import FullPageLoader from "@/components/Loader";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoURL?: string;
  createdAt: Date;
};

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (querySnapshot) => {
        try {
          const usersData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            let createdAt = data.createdAt;

            if (createdAt) {
              createdAt = createdAt.toDate
                ? createdAt.toDate()
                : new Date(createdAt);
            } else {
              createdAt = new Date();
            }

            return {
              id: doc.id,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              role: data.role || "user",
              photoURL: data.photoURL,
              createdAt,
            } as User;
          });

          setUsers(usersData);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching users:", err);
          setError("Failed to load users");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to connect to database");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddUser = useCallback(async () => {
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.role
    ) {
      setError("All fields are required");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        ...newUser,
        createdAt: new Date(),
        photoURL: "", // No photoURL for new users; uses icon fallback
      });
      setNewUser({ firstName: "", lastName: "", email: "", role: "" });
      setIsAddDialogOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Failed to add user");
    }
  }, [newUser]);

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, "users", userToDelete));
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
    }
  }, [userToDelete]);

  if (loading) return <FullPageLoader />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Management
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add New User</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Photo
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Name
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Email
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Role
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Created At
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="p-3">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="p-3 text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3 text-gray-900 dark:text-white">
                  {user.email}
                </td>
                <td className="p-3">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="p-3 text-gray-900 dark:text-white">
                  {user.createdAt.toLocaleDateString()}
                </td>
                <td className="p-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setUserToDelete(user.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}