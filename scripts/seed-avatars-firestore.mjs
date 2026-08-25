import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

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

const REAL_9_AVATARS = [
  {
    id: 'camoes_2050',
    name: 'Luís de Camões',
    categoryKey: 'cultura',
    categoryTitle: 'Cultura & Literatura',
    rarity: 'Lendário',
    price: 0,
    description: 'O Poeta das Quinas e símbolo imortal da cultura portuguesa.',
    image: '/images/avatars/camoes-2050.jpg',
    icon: '📜',
    isExclusive: false,
  },
  {
    id: 'guardiao_acores',
    name: 'Guardião dos Açores',
    categoryKey: 'geografia',
    categoryTitle: 'Geografia & Açores',
    rarity: 'Épico',
    price: 0,
    description: 'A força vulcânica e a majestade do arquipélago atlântico.',
    image: '/images/avatars/vulcao-acores.jpg',
    icon: '🌋',
    isExclusive: false,
  },
  {
    id: 'lenda_futebol',
    name: 'Lenda do Futebol',
    categoryKey: 'desporto',
    categoryTitle: 'Desporto & Futebol',
    rarity: 'Lendário',
    price: 0,
    description: 'A garra e mestria do desporto rei português.',
    image: '/images/avatars/lenda-futebol-2050.jpg',
    icon: '⚽',
    isExclusive: false,
  },
  {
    id: 'alma_alfama',
    name: 'Alma de Alfama',
    categoryKey: 'musica',
    categoryTitle: 'Música & Fado',
    rarity: 'Raro',
    price: 0,
    description: 'A voz profunda do fado e a alma das vielas históricas de Lisboa.',
    image: '/images/avatars/alma-alfama-2050.jpg',
    icon: '🎸',
    isExclusive: false,
  },
  {
    id: 'sebastiao_nevoeiro',
    name: 'D. Sebastião',
    categoryKey: 'historia',
    categoryTitle: 'História de Portugal',
    rarity: 'Mítico',
    price: 0,
    description: 'O Rei adormecido na névoa, mito e esperança de Portugal.',
    image: '/images/avatars/sebastiao-2050.jpg',
    icon: '👑',
    isExclusive: false,
  },
  {
    id: 'campeao_nacional',
    name: 'Campeão Nacional',
    categoryKey: 'geral',
    categoryTitle: 'Conquistas Nacionais',
    rarity: 'Épico',
    price: 0,
    description: 'A distinção máxima outorgada ao grande campeão de Portugal.',
    image: '/images/avatars/Campeão Nacional.png',
    icon: '🏆',
    isExclusive: false,
  },
  {
    id: 'lenda_suprema_acorda',
    name: 'Lenda Suprema do Acorda',
    categoryKey: 'historia',
    categoryTitle: 'História de Portugal',
    rarity: 'Mítico',
    price: 0,
    description: 'Forjado na glória imortal das maiores conquistas do Acorda Portugal.',
    image: '/images/avatars/LENDA SUPREMA DO ACORDA.png',
    icon: '🔥',
    isExclusive: false,
  },
  {
    id: 'representante_distrital',
    name: 'Representante Distrital',
    categoryKey: 'geografia',
    categoryTitle: 'Geografia & Açores',
    rarity: 'Épico',
    price: 0,
    description: 'O guardião e líder supremo com o brasão honorífico do seu distrito.',
    image: '/images/avatars/REPRESENTANTE DISTRITAL.png',
    icon: '🇵🇹',
    isExclusive: false,
  },
  {
    id: 'tita_top_10',
    name: 'Titã do Top 10',
    categoryKey: 'geral',
    categoryTitle: 'Conquistas Nacionais',
    rarity: 'Lendário',
    price: 0,
    description: 'Consagrado entre a elite dos melhores estrategas da nação.',
    image: '/images/avatars/TITÃ DO TOP 10.png',
    icon: '🥇',
    isExclusive: false,
  },
];

async function syncFirestore() {
  console.log('A verificar colecoes de avatares no Firestore...');
  const collectionsToCheck = ['avatars', 'shop_avatars', 'store_avatars', 'shopAvatars'];

  for (const colName of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (!snap.empty) {
        console.log('A limpar ' + snap.size + ' documentos na colecao ' + colName + '...');
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      }
    } catch (e) {
      console.log('Colecao ' + colName + ': ' + e.message);
    }
  }

  console.log('A gravar os 9 avatares oficiais na colecao Firestore avatars...');
  for (const av of REAL_9_AVATARS) {
    try {
      await setDoc(doc(db, 'avatars', av.id), av);
      console.log('  Gravado no Firestore: ' + av.name + ' (' + av.id + ')');
    } catch (e) {
      console.log('  Aviso ao gravar ' + av.id + ': ' + e.message);
    }
  }

  console.log('Sincronizacao Firestore concluida com sucesso!');
  process.exit(0);
}

syncFirestore().catch((err) => {
  console.error('Erro na sincronizacao:', err);
  process.exit(0);
});
