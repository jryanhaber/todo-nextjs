// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase-config';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-at-least-32-chars-long'
);

export async function generateToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function verifySyncCode(syncCode: string): Promise<string | null> {
  try {
    // Get the sync code document
    const syncCodeRef = doc(db, 'syncCodes', syncCode);
    const syncCodeDoc = await getDoc(syncCodeRef);

    if (!syncCodeDoc.exists()) {
      return null;
    }

    const syncData = syncCodeDoc.data();

    // Check if the code is expired
    const now = new Date();
    const expires = syncData.expires.toDate();

    if (expires < now) {
      return null;
    }

    return syncData.userId;
  } catch (error) {
    console.error('Sync code verification error:', error);
    return null;
  }
}

export async function getUserFromEmail(email: string): Promise<string | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('Get user from email error:', error);
    return null;
  }
}
