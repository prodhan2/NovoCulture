import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

export async function getProjects() {
  if (!db) return [];
  const q = query(collection(db, "projects"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProject(id) {
  if (!db) return null;
  const ref = doc(db, "projects", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addProject(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "projects"), data);
  return ref.id;
}

export async function setProject(id, data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "projects", id), data);
}

export async function deleteProject(id) {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "projects", id));
}

export async function getMedia() {
  if (!db) return [];
  const q = query(collection(db, "media"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addMedia(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "media"), data);
  return ref.id;
}

export async function setMedia(id, data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "media", id), data);
}

export async function deleteMedia(id) {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "media", id));
}

export async function getSettings() {
  if (!db) return null;
  const ref = doc(db, "site", "settings");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setSettings(data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "site", "settings"), data, { merge: true });
}
