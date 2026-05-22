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
  where,
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

// Media Categories
export async function getMediaCategories() {
  if (!db) return [];
  const q = query(collection(db, "mediaCategories"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addMediaCategory(name) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "mediaCategories"), {
    name,
    created_at: new Date().toISOString()
  });
  return { id: ref.id, name };
}

export async function deleteMediaCategory(id) {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "mediaCategories", id));
}

export async function getSettings() {
  if (!db) return null;
  const ref = doc(db, "settings", "main");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setSettings(data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "settings", "main"), data, { merge: true });
}

// Hero Updates (Sampritik, Notice, Posts)
export async function getHeroUpdates() {
  if (!db) return [];
  const q = query(collection(db, "heroUpdates"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getHeroUpdate(id) {
  if (!db) return null;
  const ref = doc(db, "heroUpdates", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addHeroUpdate(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "heroUpdates"), {
    ...data,
    date: new Date().toISOString()
  });
  return ref.id;
}

export async function setHeroUpdate(id, data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "heroUpdates", id), data, { merge: true });
}

export async function deleteHeroUpdate(id) {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "heroUpdates", id));
}

// Join Us Registrations
export async function getJoinRegistrations(category) {
  if (!db) return [];
  const q = query(
    collection(db, "joinRegistrations"), 
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return category ? all.filter(item => item.category === category) : all;
}

export async function addJoinRegistration(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "joinRegistrations"), {
    ...data,
    date: new Date().toISOString()
  });
  return ref.id;
}

// About Page Content
export async function getAboutContent() {
  if (!db) return [];
  const q = query(collection(db, "aboutContent"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addAboutSection(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "aboutContent"), {
    ...data,
    order: Date.now()
  });
  return ref.id;
}

export async function updateAboutSection(id, data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "aboutContent", id), data, { merge: true });
}

export async function deleteAboutSection(id) {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "aboutContent", id));
}

// User Profile
export async function getUserProfile(uid) {
  if (!db) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setUserProfile(uid, data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function getAllUsers() {
  if (!db) return [];
  const q = query(collection(db, "users"), orderBy("displayName", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Contact Messages
export async function addContactMessage(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "contactMessages"), {
    ...data,
    date: new Date().toISOString()
  });
  return ref.id;
}

// Donations
export async function addDonation(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "donations"), {
    ...data,
    date: new Date().toISOString()
  });
  return ref.id;
}

export async function getDonations(uid = null) {
  if (!db) return [];
  try {
    let q;
    if (uid) {
      q = query(
        collection(db, "donations"), 
        where("uid", "==", uid),
        orderBy("date", "desc")
      );
    } else {
      q = query(collection(db, "donations"), orderBy("date", "desc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
}

// Contact Message History
export async function getContactMessages(uid) {
  if (!db) return [];
  const q = query(
    collection(db, "contactMessages"), 
    where("uid", "==", uid),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllContactMessages() {
  if (!db) return [];
  const q = query(collection(db, "contactMessages"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateContactMessage(id, data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "contactMessages", id), data, { merge: true });
}

export async function deleteContactMessage(id) {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "contactMessages", id));
}
