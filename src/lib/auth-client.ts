// lib/auth-client.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from './firebase-config';
import { getFunctions, httpsCallable } from 'firebase/functions';

export async function signIn(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signUp(email: string, password: string): Promise<void> {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function generateSyncCode(): Promise<string> {
  try {
    const functions = getFunctions();
    const generateCode = httpsCallable(functions, 'generateSyncCode');
    const result = await generateCode();
    return (result.data as { code: string }).code;
  } catch (error) {
    console.error('Generate sync code error:', error);
    throw error;
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthStateChanged(callback: (user: any) => void) {
  return auth.onAuthStateChanged(callback);
}
