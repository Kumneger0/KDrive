import React from "react";
import "./auth.css";
import { FcGoogle } from "react-icons/fc";

function Auth() {
  const signInWithGoogle = async () => {
    const { app } = await import("../firebase/initapp");
    // importing from firebase
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import(
      "firebase/auth"
    );
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);
    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) saveTofirestore(res.user); // saveing user info to firestore such as name and email
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="loginWrapper">
      <button onClick={signInWithGoogle}>
        <FcGoogle /> sign in with google
      </button>
    </div>
  );
}

export default Auth;

async function saveTofirestore(user) {
  if (!user) return;
  const { getFirestore, collection, addDoc, getDocs, query, where } =
    await import("firebase/firestore");
  const { app } = await import("../firebase/initapp");
  const db = getFirestore(app);
  const q = query(collection(db, "users"), where("email", "==", user.email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.docs.length !== 0) return; // checking if user info exists
  const userRef = await addDoc(collection(db, "users"), {
    fullName: user.displayName,
    email: user.email,
    uid: user.uid,
  });
  console.log(userRef);
}
