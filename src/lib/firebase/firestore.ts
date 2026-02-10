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
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  UserProfile,
  MonthlyRecord,
  MetricDefinition,
  Message,
} from "@/types";

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
  height: number | undefined,
  customMetrics: Record<string, number>
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(db, "records"),
      where("userId", "==", userId),
      where("date", "==", date)
    )
  );

  const data: Record<string, unknown> = {
    weight,
    customMetrics,
    updatedAt: new Date(),
  };
  if (height !== undefined) {
    data.height = height;
  }

  if (snapshot.empty) {
    await addDoc(collection(db, "records"), {
      userId,
      date,
      ...data,
      createdAt: new Date(),
    });
  } else {
    const existingDoc = snapshot.docs[0];
    await updateDoc(doc(db, "records", existingDoc.id), data);
  }

  // 身長バックフィル: 同ユーザーの height 未設定レコードを更新
  if (height !== undefined && height > 0) {
    const allUserRecords = await getDocs(
      query(
        collection(db, "records"),
        where("userId", "==", userId)
      )
    );
    const updates = allUserRecords.docs
      .filter((d) => {
        const h = d.data().height;
        return h === undefined || h === null || h === 0;
      })
      .map((d) => updateDoc(doc(db, "records", d.id), { height }));
    await Promise.all(updates);
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

// ========== CONTACT (グループチャット) ==========

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

export async function getContactMessages(): Promise<Message[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "contactMessages"),
      orderBy("createdAt", "asc")
    )
  );
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      senderUid: data.senderUid,
      senderName: data.senderName,
      text: data.text,
      createdAt: toDate(data.createdAt),
    } as Message;
  });
}

export async function sendContactMessage(
  senderUid: string,
  senderName: string,
  text: string
): Promise<void> {
  await addDoc(collection(db, "contactMessages"), {
    senderUid,
    senderName,
    text,
    createdAt: new Date(),
  });
}
