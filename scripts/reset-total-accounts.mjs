import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE',
  authDomain: 'desafio-nacional-5fe71.firebaseapp.com',
  projectId: 'desafio-nacional-5fe71',
  storageBucket: 'desafio-nacional-5fe71.firebasestorage.app',
  messagingSenderId: '130539395859',
  appId: '1:130539395859:web:e3b8153477ae41d6fe98e6',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_PURGE = [
  'users',
  'publicProfiles',
  'duels',
  'gameRooms',
  'duelQueue',
  'presence',
  'active_presence',
  'reports',
  'support_tickets',
  'purchases',
  'inventory',
  'userStats',
  'leaderboards',
  'gameResults',
];

async function purgeCollection(colName) {
  try {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    console.log(`[PURGE] Coleção '${colName}': ${snap.size} documentos encontrados.`);

    for (const docItem of snap.docs) {
      if (colName === 'users') {
        try {
          const txSnap = await getDocs(collection(db, 'users', docItem.id, 'transactions'));
          for (const tx of txSnap.docs) {
            await deleteDoc(doc(db, 'users', docItem.id, 'transactions', tx.id));
          }
          const wTxSnap = await getDocs(collection(db, 'users', docItem.id, 'walletTransactions'));
          for (const wTx of wTxSnap.docs) {
            await deleteDoc(doc(db, 'users', docItem.id, 'walletTransactions', wTx.id));
          }
        } catch (subErr) {
          console.warn(`[PURGE] Erro ao limpar subcoleções de users/${docItem.id}:`, subErr.message);
        }
      }
      if (colName === 'duels' || colName === 'gameRooms') {
        try {
          const reactSnap = await getDocs(collection(db, colName, docItem.id, 'reactions'));
          for (const r of reactSnap.docs) {
            await deleteDoc(doc(db, colName, docItem.id, 'reactions', r.id));
          }
        } catch (subErr) {
          console.warn(`[PURGE] Erro ao limpar reações de ${colName}/${docItem.id}:`, subErr.message);
        }
      }

      await deleteDoc(doc(db, colName, docItem.id));
    }
    console.log(`[PURGE] Coleção '${colName}' eliminada com sucesso.`);
  } catch (err) {
    console.error(`[PURGE] Erro ao processar coleção '${colName}':`, err.message);
  }
}

async function runTotalReset() {
  console.log('============================================================');
  console.log('INICIANDO RESET TOTAL DE CONTAS E DADOS NO FIRESTORE');
  console.log('============================================================');

  for (const col of COLLECTIONS_TO_PURGE) {
    await purgeCollection(col);
  }

  console.log('============================================================');
  console.log('RESET TOTAL CONCLUÍDO COM SUCESSO! FIRESTORE LIMPO.');
  console.log('============================================================');
  process.exit(0);
}

runTotalReset();
