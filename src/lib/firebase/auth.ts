import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

async function ensureUserDoc(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      createdAt: new Date(),
    });
  }
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(credential.user, { displayName });

  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    displayName,
    email,
    createdAt: new Date(),
  });

  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle() {
  await signInWithRedirect(auth, googleProvider);
}

export async function handleRedirectResult() {
  const result = await getRedirectResult(auth);
  if (result) {
    await ensureUserDoc(result.user);
    return result.user;
  }
  return null;
}

export async function updateDisplayName(displayName: string) {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName });
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
