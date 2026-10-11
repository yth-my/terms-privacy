import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SavedPolicyDoc, PolicyFormData, GitHubConfig } from '../types/policy';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with specific database ID from config or default
export const db = 
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Auth helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  return signOut(auth);
};

import { generateAppSlug } from './slug';

// Firestore CRUD operations for Policies
export const savePolicyToFirestore = async (
  userId: string,
  docId: string | null,
  policyData: {
    title: string;
    formData: PolicyFormData;
    privacyMarkdown: string;
    privacyHtml: string;
    termsMarkdown: string;
    termsHtml: string;
    isPublic: boolean;
    lastGithubPush?: SavedPolicyDoc['lastGithubPush'];
  }
): Promise<string> => {
  const policiesRef = collection(db, 'policies');
  const slug = generateAppSlug(policyData.formData.appName || policyData.title);
  // Use slug as document ID if no docId specified, or use existing docId
  const effectiveId = docId || slug;
  const targetDocRef = doc(policiesRef, effectiveId);
  const now = Date.now();

  const dataToSave: Partial<SavedPolicyDoc> & { updatedAtServer: any } = {
    userId,
    slug,
    title: policyData.title || policyData.formData.appName || 'Untitled Policy',
    formData: policyData.formData,
    privacyMarkdown: policyData.privacyMarkdown,
    privacyHtml: policyData.privacyHtml,
    termsMarkdown: policyData.termsMarkdown,
    termsHtml: policyData.termsHtml,
    isPublic: policyData.isPublic !== undefined ? policyData.isPublic : true,
    updatedAt: now,
    updatedAtServer: serverTimestamp(),
  };

  if (!docId) {
    dataToSave.createdAt = now;
  }

  if (policyData.lastGithubPush) {
    dataToSave.lastGithubPush = policyData.lastGithubPush;
  }

  await setDoc(targetDocRef, dataToSave, { merge: true });
  return targetDocRef.id;
};

export const getUserPolicies = async (userId: string): Promise<SavedPolicyDoc[]> => {
  try {
    const policiesRef = collection(db, 'policies');
    const q = query(policiesRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    })) as SavedPolicyDoc[];
  } catch (error) {
    console.warn('Error fetching with order, falling back without order:', error);
    // Fallback if composite index isn't ready
    const policiesRef = collection(db, 'policies');
    const q = query(policiesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    })) as SavedPolicyDoc[];
    return results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }
};

export const getPolicyBySlugOrId = async (identifier: string): Promise<SavedPolicyDoc | null> => {
  if (!identifier) return null;
  const normalized = identifier.toLowerCase().trim();

  try {
    // 1. First attempt direct document lookup
    const policyDocRef = doc(db, 'policies', identifier);
    const snapshot = await getDoc(policyDocRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as SavedPolicyDoc;
    }

    // 2. Lookup by slug field
    const policiesRef = collection(db, 'policies');
    const qSlug = query(policiesRef, where('slug', '==', normalized));
    const slugSnap = await getDocs(qSlug);
    if (!slugSnap.empty) {
      const docItem = slugSnap.docs[0];
      return {
        id: docItem.id,
        ...docItem.data()
      } as SavedPolicyDoc;
    }

    // 3. Fallback: Lookup by title / appName
    const qTitle = query(policiesRef, where('title', '==', identifier));
    const titleSnap = await getDocs(qTitle);
    if (!titleSnap.empty) {
      const docItem = titleSnap.docs[0];
      return {
        id: docItem.id,
        ...docItem.data()
      } as SavedPolicyDoc;
    }

    return null;
  } catch (error) {
    console.error('Error fetching policy by slug or id:', error);
    return null;
  }
};

export const getPolicyById = getPolicyBySlugOrId;

export const deletePolicyFromFirestore = async (policyId: string): Promise<void> => {
  const policyDocRef = doc(db, 'policies', policyId);
  await deleteDoc(policyDocRef);
};

// Save User Settings (e.g., GitHub config saved securely per user)
export const saveUserSettings = async (userId: string, data: { github?: Partial<GitHubConfig> }) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data, { merge: true });
};

export const getUserSettings = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (err) {
    console.error('Error getting user settings:', err);
    return null;
  }
};
