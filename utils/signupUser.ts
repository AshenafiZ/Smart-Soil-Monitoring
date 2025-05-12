import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";

export async function signupUser({
  email,
  password,
  firstName,
  lastName,
  role,
  photoURL,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "farmer" | "advisor" | "technician";
  photoURL?: string;
}) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: firstName +" "+ lastName, photoURL });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    firstName,
    lastName,
    email,
    role,
    photoURL: photoURL || null,
    createdAt: serverTimestamp(),
  });

  return user;
}
