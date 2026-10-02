import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DocumentItem } from '../types';
import { sanitizeDocument, saveDocuments } from './documentStorage';
import { INITIAL_DOCUMENTS } from '../data/initialDocuments';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'documents';

/**
 * Seed initial official documents to Firestore if collection is empty
 */
export async function seedInitialDocumentsToFirestore(): Promise<void> {
  const path = COLLECTION_NAME;
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      INITIAL_DOCUMENTS.forEach(d => {
        const clean = sanitizeDocument(d);
        const docRef = doc(db, path, clean.id);
        batch.set(docRef, clean);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Initial seeding skipped or already present:', err);
  }
}

/**
 * Real-time listener: synchronizes Firestore documents directly to any client across the globe
 */
export function subscribeToDocuments(onUpdate: (docs: DocumentItem[]) => void): () => void {
  const path = COLLECTION_NAME;
  const colRef = collection(db, path);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Trigger background seed if empty
        seedInitialDocumentsToFirestore();
        return;
      }
      const fetched: DocumentItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data) {
          fetched.push(sanitizeDocument({ ...data, id: docSnap.id }));
        }
      });
      if (fetched.length > 0) {
        saveDocuments(fetched);
        onUpdate(fetched);
      }
    },
    (error) => {
      console.warn('Firestore subscription fallback:', error.message);
    }
  );

  return unsubscribe;
}

/**
 * Persists a document to Firestore cloud database
 */
export async function saveDocumentToCloud(document: DocumentItem): Promise<boolean> {
  const clean = sanitizeDocument(document);
  const path = `${COLLECTION_NAME}/${clean.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, clean.id);
    await setDoc(docRef, clean, { merge: true });
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      return false;
    }
  }
}

/**
 * Removes a document from Firestore cloud database
 */
export async function deleteDocumentFromCloud(id: string): Promise<boolean> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch {
      return false;
    }
  }
}
