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
  try {
    const q = query(collection(db, "joinRegistrations"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // Sort locally to avoid index requirement
    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return category ? sorted.filter(item => item.category === category) : sorted;
  } catch (error) {
    console.error("Error fetching join registrations:", error);
    return [];
  }
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

/**
 * Syncs authenticated user data with Firestore 'users' collection.
 * This ensures UID, name, email, and photo are always stored.
 */
export async function syncUserWithFirestore(user) {
  if (!user || !db) return null;
  
  try {
    const profile = await getUserProfile(user.uid);
    const userData = {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      phoneNumber: user.phoneNumber || "",
      lastLogin: new Date().toISOString()
    };

    if (!profile) {
      // First time login
      userData.joinedAt = new Date().toISOString();
      userData.role = "user";
      userData.superadmin = false;
      await setUserProfile(user.uid, userData);
      return { ...userData, isNewUser: true };
    } else {
      // Update existing profile with latest basic info from Google
      await setUserProfile(user.uid, userData);
      return { ...profile, ...userData, isNewUser: false };
    }
  } catch (error) {
    console.error("Error syncing user with Firestore:", error);
    return null;
  }
}

export async function getAllUsers() {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort locally by name/displayName to avoid index requirement
    return data.sort((a, b) => {
      const nameA = (a.displayName || a.name || "").toLowerCase();
      const nameB = (b.displayName || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function toggleUserSuperadmin(uid, currentStatus) {
  if (!db) throw new Error("Firestore not initialized");
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { superadmin: !currentStatus }, { merge: true });
  return !currentStatus;
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
    date: data.date || new Date().toISOString()
  });
  return ref.id;
}

export async function getDonations(uid = null) {
  if (!db) return [];
  try {
    let q;
    if (uid) {
      // Simplified query to avoid index requirement for composite queries
      q = query(
        collection(db, "donations"), 
        where("uid", "==", uid)
      );
    } else {
      q = query(collection(db, "donations"));
    }
    
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // Sort locally to avoid index issues
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
}

// Contact Message History
export async function getContactMessages(uid) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "contactMessages"), 
      where("uid", "==", uid)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort locally to avoid composite index requirement
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return [];
  }
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

// Custom Forms
export async function getCustomForms() {
  if (!db) return [];
  const q = query(collection(db, "customForms"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCustomForm(id) {
  if (!db) return null;
  const ref = doc(db, "customForms", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getCustomFormBySlug(slug) {
  if (!db) return null;
  const q = query(collection(db, "customForms"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function addCustomForm(data) {
  if (!db) throw new Error("Firestore not initialized");
  const ref = await addDoc(collection(db, "customForms"), {
    ...data,
    created_at: new Date().toISOString()
  });
  return ref.id;
}

export async function setCustomForm(id, data) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "customForms", id), {
    ...data,
    updated_at: new Date().toISOString()
  }, { merge: true });
}

export async function deleteCustomForm(id) {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "customForms", id));
}

// Form Submissions
export async function addFormSubmission(formId, data) {
  if (!db) throw new Error("Firestore not initialized");
  
  // Extract top-level fields for easier querying if they exist in data
  const { uid, userName, userPhone, status, ...rest } = data;
  
  const ref = await addDoc(collection(db, "formSubmissions"), {
    formId,
    uid: uid || "",
    userName: userName || "",
    userPhone: userPhone || "",
    status: status || "Pending",
    data: rest, // Keep form-specific fields here
    created_at: new Date().toISOString()
  });
  return ref.id;
}

export async function getFormSubmissions(formId) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "formSubmissions"),
      where("formId", "==", formId)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // Sort locally by created_at desc to avoid composite index requirement
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return [];
  }
}

export async function getUserFormSubmissions(uid) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "formSubmissions"),
      where("uid", "==", uid)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // Sort locally to avoid index requirement
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    return [];
  }
}

export async function getFormSubmission(id) {
  if (!db) return null;
  const ref = doc(db, "formSubmissions", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateFormSubmissionStatus(id, status) {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "formSubmissions", id), { status }, { merge: true });
}
