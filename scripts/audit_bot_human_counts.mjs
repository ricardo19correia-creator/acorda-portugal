import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy...",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "acorda-portugal.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "acorda-portugal",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "acorda-portugal.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function runAudit() {
  console.log('=== AUDITORIA FIREBASE: HUMANOS VS BOTS ===');
  
  try {
    const pubSnap = await getDocs(collection(db, 'publicProfiles'));
    console.log(`Coleção 'publicProfiles': ${pubSnap.size} documentos`);
    
    let humanCount = 0;
    let botInPubCount = 0;
    pubSnap.forEach(d => {
      const data = d.data();
      if (data.isNpc === true || data.playerType === 'npc' || d.id.startsWith('npc_')) {
        botInPubCount++;
      } else {
        humanCount++;
        console.log(` -> Humano: [${d.id}] "${data.displayName || data.name}" | XP: ${data.xp} | Distrito: ${data.district || 'N/A'}`);
      }
    });

    let botPlayersCount = 0;
    try {
      const botsSnap = await getDocs(collection(db, 'botPlayers'));
      botPlayersCount = botsSnap.size;
      console.log(`Coleção 'botPlayers': ${botPlayersCount} documentos`);
    } catch (e) {
      console.log(`Coleção 'botPlayers' inacessível ou vazia:`, e.message);
    }

    console.log('\n=== SUMÁRIO ===');
    console.log(`humanCount (publicProfiles humanos): ${humanCount}`);
    console.log(`botInPublicProfiles: ${botInPubCount}`);
    console.log(`botPlayers (coleção botPlayers): ${botPlayersCount}`);
    console.log(`totalPlayers (humanos + bots): ${humanCount + botPlayersCount + botInPubCount}`);
  } catch (err) {
    console.error('Erro na auditoria:', err);
  }
}

runAudit();
