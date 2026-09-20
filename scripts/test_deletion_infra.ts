import { getAdminApp, getAdminFirestore } from '../lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

try {
  const app = getAdminApp();
  const auth = getAuth(app);
  console.log('Auth deleteUser available:', typeof auth.deleteUser === 'function');
  console.log('Auth revokeRefreshTokens available:', typeof auth.revokeRefreshTokens === 'function');
  const db = getAdminFirestore();
  console.log('Firestore collections available:', typeof db.collection === 'function');
  try {
    const storage = getStorage(app);
    console.log('Storage available:', typeof storage.bucket === 'function');
  } catch (stErr: any) {
    console.log('Storage notice:', stErr.message);
  }
} catch (e: any) {
  console.error('Error:', e.message);
}
