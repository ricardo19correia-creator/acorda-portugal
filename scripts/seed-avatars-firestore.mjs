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

const OFFICIAL_36_AVATARS = [
  { id: 'avatar_01', name: 'O Estratega', description: 'Mente tática, calculista e frio sob pressão.', image: '/images/avatars/avatar_01.png', category: 'Cidadania', rarity: 'Comum', price: 0, icon: '🧠' },
  { id: 'avatar_02', name: 'A Líder', description: 'Presença imponente, determinação e espírito de liderança.', image: '/images/avatars/avatar_02.png', category: 'Cidadania', rarity: 'Comum', price: 0, icon: '👑' },
  { id: 'avatar_03', name: 'O Explorador', description: 'Curiosidade insaciável e audácia nas grandes rotas.', image: '/images/avatars/avatar_03.png', category: 'Cultura', rarity: 'Comum', price: 0, icon: '🧭' },
  { id: 'avatar_04', name: 'A Competidora', description: 'Foco absoluto, garra atlética e sede incansável de vitória.', image: '/images/avatars/avatar_04.png', category: 'Desporto', rarity: 'Comum', price: 0, icon: '⚡' },
  { id: 'avatar_05', name: 'O Mestre', description: 'Sabedoria profunda e serenidade nos momentos decisivos.', image: '/images/avatars/avatar_05.png', category: 'História', rarity: 'Raro', price: 500, icon: '📜' },
  { id: 'avatar_06', name: 'A Gamer', description: 'Reflexos ultrarrápidos e mestria no ecossistema digital.', image: '/images/avatars/avatar_06.png', category: 'Cultura', rarity: 'Raro', price: 500, icon: '🎮' },
  { id: 'avatar_07', name: 'O Descontraído', description: 'Carisma natural que transforma a pressão do jogo em diversão.', image: '/images/avatars/avatar_07.png', category: 'Cidadania', rarity: 'Raro', price: 500, icon: '😎' },
  { id: 'avatar_08', name: 'A Visionária', description: 'Sempre três passos à frente, desenhando o Portugal de amanhã.', image: '/images/avatars/avatar_08.png', category: 'Cultura', rarity: 'Raro', price: 750, icon: '🔮' },
  { id: 'avatar_09', name: 'O Rebelde', description: 'Desafia o óbvio e arrisca tudo pela glória no duelo.', image: '/images/avatars/avatar_09.png', category: 'Cidadania', rarity: 'Raro', price: 750, icon: '🔥' },
  { id: 'avatar_10', name: 'A Investigadora', description: 'Olhar cirúrgico que desvenda qualquer mistério ou detalhe histórico.', image: '/images/avatars/avatar_10.png', category: 'História', rarity: 'Raro', price: 750, icon: '🔍' },
  { id: 'avatar_11', name: 'O Desportista', description: 'Velocidade, resistência atlética e espírito de superação.', image: '/images/avatars/avatar_11.png', category: 'Desporto', rarity: 'Épico', price: 1000, icon: '⚽' },
  { id: 'avatar_12', name: 'A Artista', description: 'A voz profunda, emoção pura e poesia da alma portuguesa.', image: '/images/avatars/avatar_12.png', category: 'Cultura', rarity: 'Épico', price: 1000, icon: '🎨' },
  { id: 'avatar_13', name: 'O Professor', description: 'A erudição carismática de quem inspira gerações de mentes brilhantes.', image: '/images/avatars/avatar_13.png', category: 'História', rarity: 'Épico', price: 1000, icon: '📚' },
  { id: 'avatar_14', name: 'A Aventureira', description: 'Coragem destemida para conquistar serras, mares e arquipélagos.', image: '/images/avatars/avatar_14.png', category: 'Cultura', rarity: 'Épico', price: 1250, icon: '🏔️' },
  { id: 'avatar_15', name: 'O Técnico', description: 'Precisão algorítmica e raciocínio lógico infalível.', image: '/images/avatars/avatar_15.png', category: 'Cidadania', rarity: 'Épico', price: 1250, icon: '💻' },
  { id: 'avatar_16', name: 'A Estratega', description: 'Paciência cirúrgica que antecipa o adversário xeque por xeque.', image: '/images/avatars/avatar_16.png', category: 'Cidadania', rarity: 'Épico', price: 1500, icon: '♟️' },
  { id: 'avatar_17', name: 'O Visionário', description: 'Audácia e pensamento inovador que quebram velhos paradigmas.', image: '/images/avatars/avatar_17.png', category: 'Cultura', rarity: 'Épico', price: 1500, icon: '✨' },
  { id: 'avatar_18', name: 'A Campeã', description: 'A dignidade triunfante de quem ergue a taça nacional.', image: '/images/avatars/avatar_18.png', category: 'Desporto', rarity: 'Lendário', price: 2000, icon: '🥇' },
  { id: 'avatar_19', name: 'O Curioso', description: 'A fome insaciável de descobrir novas curiosidades do país.', image: '/images/avatars/avatar_19.png', category: 'Cultura', rarity: 'Raro', price: 750, icon: '💡' },
  { id: 'avatar_20', name: 'A Investigadora Urbana', description: 'Conhecedora das cidades, do património e da evolução contemporânea.', image: '/images/avatars/avatar_20.png', category: 'Cultura', rarity: 'Épico', price: 1000, icon: '🏙️' },
  { id: 'avatar_21', name: 'O Capitão', description: 'O líder firme e respeitado que conduz a tripulação à glória.', image: '/images/avatars/avatar_21.png', category: 'Cidadania', rarity: 'Lendário', price: 2500, icon: '⚓' },
  { id: 'avatar_22', name: 'A Criativa', description: 'Visual vibrante e capacidade singular de encontrar respostas inovadoras.', image: '/images/avatars/avatar_22.png', category: 'Cultura', rarity: 'Épico', price: 1000, icon: '🎭' },
  { id: 'avatar_23', name: 'O Minimalista', description: 'Elegância discreta, sobriedade e eficiência sem distrações.', image: '/images/avatars/avatar_23.png', category: 'Cidadania', rarity: 'Épico', price: 1250, icon: '🎯' },
  { id: 'avatar_24', name: 'A Challenger', description: 'Espírito irreverente que não teme nenhum titã das tabelas.', image: '/images/avatars/avatar_24.png', category: 'Desporto', rarity: 'Épico', price: 1750, icon: '💥' },
  { id: 'avatar_25', name: 'O Geek', description: 'Enciclopédia viva com um vasto arsenal de cultura lusa e geral.', image: '/images/avatars/avatar_25.png', category: 'Cultura', rarity: 'Épico', price: 1000, icon: '🕹️' },
  { id: 'avatar_26', name: 'A Analista', description: 'Raciocínio lógico estruturado e foco absoluto no resultado.', image: '/images/avatars/avatar_26.png', category: 'Cidadania', rarity: 'Épico', price: 1500, icon: '📊' },
  { id: 'avatar_27', name: 'O Comunicador', description: 'Carisma eloquente que move multidões e contagia o jogo.', image: '/images/avatars/avatar_27.png', category: 'Cultura', rarity: 'Épico', price: 1250, icon: '🎙️' },
  { id: 'avatar_28', name: 'A Exploradora Digital', description: 'Navegadora das novas fronteiras da tecnologia e do saber.', image: '/images/avatars/avatar_28.png', category: 'Cultura', rarity: 'Lendário', price: 2000, icon: '🌐' },
  { id: 'avatar_29', name: 'O Mestre do Quiz', description: 'O decifrador supremo de charadas, factos e enigmas da história.', image: '/images/avatars/avatar_29.png', category: 'História', rarity: 'Lendário', price: 2500, icon: '🎩' },
  { id: 'avatar_30', name: 'A Rainha do Ranking', description: 'A soberana indiscutível das pontuações máximas nacionais.', image: '/images/avatars/avatar_30.png', category: 'Exclusivos', rarity: 'Exclusivo', price: 0, icon: '👑', isAchievementOnly: true, unlockRequirement: 'Alcançar o Top 10 no Ranking Nacional' },
  { id: 'avatar_31', name: 'O Veterano', description: 'Anos de sabedoria e prestígio respeitados por toda a comunidade.', image: '/images/avatars/avatar_31.png', category: 'História', rarity: 'Lendário', price: 3500, icon: '🛡️' },
  { id: 'avatar_32', name: 'A Nova Geração', description: 'A força jovem e vibrante que está a redefinir o futuro da nação.', image: '/images/avatars/avatar_32.png', category: 'Cidadania', rarity: 'Épico', price: 1500, icon: '🌟' },
  { id: 'avatar_33', name: 'O Campeão', description: 'Consagrado no panteão dos maiores vencedores do Acorda Portugal.', image: '/images/avatars/avatar_33.png', category: 'Desporto', rarity: 'Lendário', price: 5000, icon: '🏆' },
  { id: 'avatar_34', name: 'A Lenda', description: 'Uma presença marcante e memorável que inspira o país inteiro.', image: '/images/avatars/avatar_34.png', category: 'História', rarity: 'Lendário', price: 7500, icon: '🔥' },
  { id: 'avatar_35', name: 'O Desafiante', description: 'Audácia competitiva inclemente perante qualquer desafio.', image: '/images/avatars/avatar_35.png', category: 'Exclusivos', rarity: 'Exclusivo', price: 0, icon: '⚔️', isAchievementOnly: true, unlockRequirement: 'Conquista de 100 Vitórias Consecutivas 1v1' },
  { id: 'avatar_36', name: 'A Lenda Portuguesa', description: 'O símbolo supremo das Quinas e da alma imortal de Portugal.', image: '/images/avatars/avatar_36.png', category: 'Exclusivos', rarity: 'Exclusivo', price: 0, icon: '🇵🇹', isAchievementOnly: true, unlockRequirement: 'Conquistar o Título Máximo de Lenda de Portugal' },
];

async function syncFirestore() {
  console.log('A verificar coleções de avatares no Firestore...');
  const collectionsToCheck = ['avatars', 'shop_avatars', 'store_avatars', 'shopAvatars'];

  for (const colName of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (!snap.empty) {
        console.log('A limpar ' + snap.size + ' documentos na coleção ' + colName + '...');
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      }
    } catch (e) {
      console.log('Coleção ' + colName + ': ' + e.message);
    }
  }

  console.log('A gravar os 36 avatares oficiais na coleção Firestore avatars...');
  for (const av of OFFICIAL_36_AVATARS) {
    try {
      await setDoc(doc(db, 'avatars', av.id), av);
      console.log('  Gravado no Firestore: ' + av.name + ' (' + av.id + ')');
    } catch (e) {
      console.log('  Aviso ao gravar ' + av.id + ': ' + e.message);
    }
  }

  console.log('Sincronização Firestore dos 36 avatares concluída com sucesso!');
  process.exit(0);
}

syncFirestore().catch((err) => {
  console.error('Erro na sincronização:', err);
  process.exit(0);
});
