// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const generateSyncCode = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate a sync code'
    );
  }

  const userId = context.auth.uid;

  try {
    // Create a document in the syncCodes collection
    const syncCodeRef = await admin
      .firestore()
      .collection('syncCodes')
      .add({
        userId,
        created: admin.firestore.FieldValue.serverTimestamp(),
        expires: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 1000 * 60 * 15) // 15 minutes from now
        )
      });

    return { code: syncCodeRef.id };
  } catch (error) {
    console.error('Error generating sync code:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate sync code');
  }
});
