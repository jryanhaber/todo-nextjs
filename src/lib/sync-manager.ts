// lib/sync-manager.ts
import { WorkflowItem } from './types';
import { emitEvent } from './event-emitter';

// Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

class SyncManager {
  private firebase: any;
  private db: any;
  private auth: any;
  private unsubscribe: (() => void) | null = null;
  private initialized = false;

  constructor() {
    // We'll lazy-load Firebase when needed
    this.initializeFirebase();
  }

  async initializeFirebase() {
    if (this.initialized) return;

    try {
      // Dynamically import Firebase modules
      const firebaseApp = await import('firebase/app');
      const firebaseAuth = await import('firebase/auth');
      const firebaseFirestore = await import('firebase/firestore');

      // Initialize Firebase
      this.firebase = firebaseApp.initializeApp(FIREBASE_CONFIG);
      this.auth = firebaseAuth.getAuth(this.firebase);
      this.db = firebaseFirestore.getFirestore(this.firebase);

      this.initialized = true;

      // Check if user is logged in
      this.auth.onAuthStateChanged((user: any) => {
        if (user) {
          this.setupSyncListeners(user.uid);
        } else {
          this.clearSyncListeners();
        }
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    try {
      if (!this.initialized) await this.initializeFirebase();

      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return !!userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  }

  async signUp(email: string, password: string): Promise<boolean> {
    try {
      if (!this.initialized) await this.initializeFirebase();

      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      return !!userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  }

  async signOut(): Promise<boolean> {
    try {
      if (!this.initialized) await this.initializeFirebase();

      await this.auth.signOut();
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  }

  private setupSyncListeners(userId: string) {
    if (!this.initialized || !this.db) return;

    const { collection, query, where, onSnapshot } = require('firebase/firestore');

    // Set up real-time listener for user's items
    const itemsRef = collection(this.db, 'users', userId, 'items');

    this.unsubscribe = onSnapshot(itemsRef, (snapshot: any) => {
      const items: WorkflowItem[] = [];

      snapshot.forEach((doc: any) => {
        items.push({
          id: Number(doc.id),
          ...doc.data()
        });
      });

      // Emit event for data store to update
      emitEvent('items-changed', items);
    });
  }

  private clearSyncListeners() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async syncItem(item: WorkflowItem): Promise<boolean> {
    try {
      if (!this.initialized) await this.initializeFirebase();
      if (!this.auth.currentUser) return false;

      const { doc, setDoc } = require('firebase/firestore');

      const userId = this.auth.currentUser.uid;
      const itemRef = doc(this.db, 'users', userId, 'items', item.id.toString());

      await setDoc(itemRef, item);
      return true;
    } catch (error) {
      console.error('Sync item error:', error);
      return false;
    }
  }

  async deleteItem(itemId: number): Promise<boolean> {
    try {
      if (!this.initialized) await this.initializeFirebase();
      if (!this.auth.currentUser) return false;

      const { doc, deleteDoc } = require('firebase/firestore');

      const userId = this.auth.currentUser.uid;
      const itemRef = doc(this.db, 'users', userId, 'items', itemId.toString());

      await deleteDoc(itemRef);
      return true;
    } catch (error) {
      console.error('Delete item error:', error);
      return false;
    }
  }

  async importFromChromeExtension(items: WorkflowItem[]): Promise<boolean> {
    try {
      if (!this.initialized) await this.initializeFirebase();
      if (!this.auth.currentUser) return false;

      const { writeBatch, doc } = require('firebase/firestore');
      const userId = this.auth.currentUser.uid;

      // Use batched writes for better performance
      const batch = writeBatch(this.db);

      items.forEach((item) => {
        const itemRef = doc(this.db, 'users', userId, 'items', item.id.toString());
        batch.set(itemRef, item);
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }

  // Generate a sync code for the Chrome extension to use
  async generateSyncCode(): Promise<string> {
    try {
      if (!this.initialized) await this.initializeFirebase();
      if (!this.auth.currentUser) throw new Error('User not authenticated');

      // Create a document in a 'syncCodes' collection
      const { collection, addDoc, serverTimestamp } = require('firebase/firestore');

      const syncData = {
        userId: this.auth.currentUser.uid,
        created: serverTimestamp(),
        expires: new Date(Date.now() + 1000 * 60 * 15) // 15 minutes from now
      };

      const docRef = await addDoc(collection(this.db, 'syncCodes'), syncData);

      // Return the document ID as the sync code
      return docRef.id;
    } catch (error) {
      console.error('Generate sync code error:', error);
      throw error;
    }
  }

  // Used by Chrome extension to connect to a Next.js account
  async connectWithSyncCode(syncCode: string): Promise<boolean> {
    try {
      if (!this.initialized) await this.initializeFirebase();
      if (!this.auth.currentUser) return false;

      const { doc, getDoc, Timestamp } = require('firebase/firestore');

      // Get the sync code document
      const syncDocRef = doc(this.db, 'syncCodes', syncCode);
      const syncDoc = await getDoc(syncDocRef);

      if (!syncDoc.exists()) {
        throw new Error('Invalid sync code');
      }

      const syncData = syncDoc.data();

      // Check if the code is expired
      const now = Timestamp.now();
      if (syncData.expires.seconds < now.seconds) {
        throw new Error('Sync code expired');
      }

      // Store the connected userId
      localStorage.setItem('connectedUserId', syncData.userId);

      return true;
    } catch (error) {
      console.error('Connect with sync code error:', error);
      return false;
    }
  }
}

// Create singleton instance
const syncManager = new SyncManager();
export default syncManager;
