import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import type { UserProfile, MonthlyRecord, MetricDefinition } from "@/types";

// ========== USERS ==========

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), uid: doc.id }) as UserProfile
  );
}

export async function getUser(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function updateUser(
  uid: string,
  data: { displayName?: string; email?: string }
): Promise<void> {
  await updateDoc(doc(db, "users", uid), data);
}

// ========== RECORDS ==========

export async function getAllRecords(): Promise<MonthlyRecord[]> {
  const snapshot = await getDocs(
    query(collection(db, "records"), orderBy("date", "desc"))
  );
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as MonthlyRecord
  );
}

export async function getUserRecords(
  userId: string
): Promise<MonthlyRecord[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "records"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    )
  );
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as MonthlyRecord
  );
}

export async function upsertRecord(
  userId: string,
  date: string,
  weight: number,
  customMetrics: Record<string, number>
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(db, "records"),
      where("userId", "==", userId),
      where("date", "==", date)
    )
  );

  if (snapshot.empty) {
    await addDoc(collection(db, "records"), {
      userId,
      date,
      weight,
      customMetrics,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    const existingDoc = snapshot.docs[0];
    await updateDoc(doc(db, "records", existingDoc.id), {
      weight,
      customMetrics,
      updatedAt: new Date(),
    });
  }
}

// ========== METRICS ==========

export async function getAllMetrics(): Promise<MetricDefinition[]> {
  const snapshot = await getDocs(
    query(collection(db, "metrics"), orderBy("createdAt", "asc"))
  );
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as MetricDefinition
  );
}

export async function addMetric(
  name: string,
  unit: string,
  color: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "metrics"), {
    name,
    unit,
    color,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateMetric(
  metricId: string,
  data: { name?: string; unit?: string; color?: string }
): Promise<void> {
  await updateDoc(doc(db, "metrics", metricId), data);
}

export async function deleteMetric(metricId: string): Promise<void> {
  await deleteDoc(doc(db, "metrics", metricId));
}
