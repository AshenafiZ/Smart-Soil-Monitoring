import type { NextApiRequest, NextApiResponse } from "next";
import { auth, db, storage, createUserWithEmailAndPassword, setDoc, doc, ref, uploadBytes, getDownloadURL, updateProfile } from "../../lib/firebase";

type RequestBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  photo: string; 
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { firstName, lastName, email, password, role, photo }: RequestBody = req.body;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    const buffer = Buffer.from(photo, "base64");
    await uploadBytes(storageRef, buffer);
    const photoURL = await getDownloadURL(storageRef);

    await updateProfile(user, { displayName: `${firstName} ${lastName}`, photoURL });

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      email,
      role,
      photoURL,
      createdAt: new Date()
    });

    res.status(200).json({ message: "User registered successfully!" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
}
