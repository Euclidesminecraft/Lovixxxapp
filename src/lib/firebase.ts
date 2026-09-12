import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  limit,
  deleteDoc,
  getDocFromServer,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { AuthUser, GenerationResult, MorningTrackerState, UserSubscription } from "../types";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore: client is offline, using fallback.");
    }
    return false;
  }
}

// Map Firebase User to AuthUser
export function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatarUrl:
      user.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        user.displayName || "User"
      )}`,
    provider: user.providerData?.[0]?.providerId === "google.com" ? "google" : "password",
    createdAt: Date.now(),
  };
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogleFirebase(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user);
  } catch (err: any) {
    // If popup is blocked in an iframe environment, handle gracefully
    console.warn("Firebase popup sign-in notice:", err?.message);
    throw err;
  }
}

// Sign out
export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Error signing out from Firebase:", err);
  }
}

// Sync User Profile in Firestore
export async function syncUserProfileToFirestore(
  user: AuthUser,
  subscription: UserSubscription,
  preferredLanguage: string
): Promise<void> {
  const path = `users/${user.id}`;
  try {
    const userRef = doc(db, "users", user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        email: user.email,
        displayName: user.name,
        photoURL: user.avatarUrl || "",
        isPro: Boolean(subscription.isPro),
        creditsRemaining: Number(subscription.creditsRemaining || 0),
        preferredLanguage: preferredLanguage === "pt" ? "pt" : "en",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Firestore syncUserProfile error (handled):", error);
  }
}

// Load User Profile from Firestore
export async function loadUserProfileFromFirestore(
  userId: string
): Promise<{ isPro?: boolean; creditsRemaining?: number } | null> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        isPro: data.isPro,
        creditsRemaining: data.creditsRemaining,
      };
    }
  } catch (error) {
    console.warn("Firestore loadUserProfile error (handled):", error);
  }
  return null;
}

// Save History Item to Firestore
export async function saveHistoryItemToFirestore(
  userId: string,
  result: GenerationResult
): Promise<void> {
  const path = `users/${userId}/history/${result.id}`;
  try {
    const historyRef = doc(db, "users", userId, "history", result.id);
    await setDoc(historyRef, {
      id: result.id,
      userId,
      inputContext: result.context.mensagem || "",
      goal: result.context.objetivo || "",
      tone: result.context.tom || "",
      spiciness: Number(result.context.ousadia || 3),
      options: result.options.map((opt) => opt.text),
      analysis: result.rawText || "",
      followUpAdvice: result.context.rumoConversa || "",
      isFavorite: Boolean(result.isFavorite),
      createdAt: new Date(result.timestamp || Date.now()).toISOString(),
    });
  } catch (error) {
    console.warn("Firestore saveHistoryItem error (handled):", error);
  }
}

// Load History Items from Firestore
export async function loadHistoryFromFirestore(
  userId: string
): Promise<GenerationResult[]> {
  const path = `users/${userId}/history`;
  try {
    const historyCol = collection(db, "users", userId, "history");
    const q = query(historyCol, limit(30));
    const snapshot = await getDocs(q);
    const items: GenerationResult[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      items.push({
        id: d.id || docSnap.id,
        timestamp: d.createdAt ? new Date(d.createdAt).getTime() : Date.now(),
        isFavorite: Boolean(d.isFavorite),
        context: {
          mensagem: d.inputContext || "",
          relacao: "Match (Tinder / Bumble / Hinge)",
          objetivo: d.goal || "Criar curiosidade e tensão positiva",
          tom: d.tone || "Provocador/Teasing",
          ousadia: d.spiciness || 3,
          rumoConversa: d.followUpAdvice || "",
        },
        rawText: d.analysis || "",
        options: Array.isArray(d.options)
          ? d.options.map((text: string, idx: number) => ({
              number: idx + 1,
              type: idx === 0 ? "Opção A" : idx === 1 ? "Opção B" : "Opção C",
              text,
            }))
          : [],
      });
    });
    return items.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.warn("Firestore loadHistory error (handled):", error);
    return [];
  }
}

// Delete History Item from Firestore
export async function deleteHistoryItemFromFirestore(
  userId: string,
  itemId: string
): Promise<void> {
  try {
    const historyRef = doc(db, "users", userId, "history", itemId);
    await deleteDoc(historyRef);
  } catch (error) {
    console.warn("Firestore deleteHistoryItem error:", error);
  }
}

// Save Morning Tracker State to Firestore
export async function saveMorningTrackerToFirestore(
  userId: string,
  state: MorningTrackerState
): Promise<void> {
  const path = `users/${userId}/morningTracker/current`;
  try {
    const trackerRef = doc(db, "users", userId, "morningTracker", "current");
    await setDoc(
      trackerRef,
      {
        userId,
        firstSeenTimestamp: state.firstSeenTimestamp,
        notificationsEnabled: state.notificationsEnabled,
        lastNotifiedDate: state.lastNotifiedDate || "",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Firestore saveMorningTracker error:", error);
  }
}

// Load Morning Tracker State from Firestore
export async function loadMorningTrackerFromFirestore(
  userId: string
): Promise<Partial<MorningTrackerState> | null> {
  try {
    const trackerRef = doc(db, "users", userId, "morningTracker", "current");
    const snap = await getDoc(trackerRef);
    if (snap.exists()) {
      return snap.data() as Partial<MorningTrackerState>;
    }
  } catch (error) {
    console.warn("Firestore loadMorningTracker error:", error);
  }
  return null;
}
