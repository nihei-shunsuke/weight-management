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
  Conversation,
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

// ========== CONVERSATIONS ==========

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

export async function getOrCreateConversation(
  uid1: string,
  name1: string,
  uid2: string,
  name2: string
): Promise<string> {
  const sorted = [uid1, uid2].sort();
  const snapshot = await getDocs(
    query(
      collection(db, "conversations"),
      where("participantUids", "==", sorted)
    )
  );
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  const docRef = await addDoc(collection(db, "conversations"), {
    participantUids: sorted,
    participantNames: { [uid1]: name1, [uid2]: name2 },
    lastMessage: "",
    lastMessageAt: new Date(),
    lastMessageSenderUid: "",
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function getUserConversations(
  uid: string
): Promise<Conversation[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "conversations"),
      where("participantUids", "array-contains", uid),
      orderBy("lastMessageAt", "desc")
    )
  );
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      participantUids: data.participantUids,
      participantNames: data.participantNames,
      lastMessage: data.lastMessage,
      lastMessageAt: toDate(data.lastMessageAt),
      lastMessageSenderUid: data.lastMessageSenderUid,
      createdAt: toDate(data.createdAt),
    } as Conversation;
  });
}

export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  const snapshot = await getDoc(doc(db, "conversations", conversationId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    participantUids: data.participantUids,
    participantNames: data.participantNames,
    lastMessage: data.lastMessage,
    lastMessageAt: toDate(data.lastMessageAt),
    lastMessageSenderUid: data.lastMessageSenderUid,
    createdAt: toDate(data.createdAt),
  } as Conversation;
}

export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "conversations", conversationId, "messages"),
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

export async function sendMessage(
  conversationId: string,
  senderUid: string,
  senderName: string,
  text: string
): Promise<void> {
  const now = new Date();
  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      senderUid,
      senderName,
      text,
      createdAt: now,
    }
  );
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: now,
    lastMessageSenderUid: senderUid,
  });
}
