"use strict";
/**
 * Serviço Oficial de Dados e Interações do Módulo «OS CRIADORES» 🇵🇹
 * Acorda Portugal — Desafio Nacional
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_COMMENTS = exports.SEED_POSTS = exports.DAILY_CHALLENGE = exports.CREATOR_CATEGORIES = void 0;
exports.sanitizeText = sanitizeText;
exports.getCreatorPosts = getCreatorPosts;
exports.createCreatorPost = createCreatorPost;
exports.togglePostLike = togglePostLike;
exports.togglePostSave = togglePostSave;
exports.getPostComments = getPostComments;
exports.addPostComment = addPostComment;
exports.voteOnPoll = voteOnPoll;
exports.voteOnSuggestion = voteOnSuggestion;
exports.reportPost = reportPost;
exports.getCreatorProfile = getCreatorProfile;
var firestore_1 = require("firebase/firestore");
var firebase_1 = require("@/lib/firebase");
exports.CREATOR_CATEGORIES = [
    {
        slug: 'desabafos',
        name: 'Desabafos',
        icon: '💬',
        tagline: 'Há coisas que precisam de ser ditas.',
        description: 'Partilha pensamentos sinceros, reflexões sobre o quotidiano português e a vida com opção de anonimato.',
        accentColor: '#ec4899',
        badgeBg: 'rgba(236, 72, 153, 0.15)',
        borderColor: 'rgba(236, 72, 153, 0.4)',
    },
    {
        slug: 'ideias',
        name: 'Ideias',
        icon: '🧠',
        tagline: 'E se fizéssemos isto de outra forma?',
        description: 'Conceitos inovadores, projetos criativos e visões de futuro para Portugal.',
        accentColor: '#06b6d4',
        badgeBg: 'rgba(6, 182, 212, 0.15)',
        borderColor: 'rgba(6, 182, 212, 0.4)',
    },
    {
        slug: 'humor',
        name: 'Humor',
        icon: '😂',
        tagline: 'Porque Portugal também sabe rir de si próprio.',
        description: 'Memes, tiradas hilariantes, sátira ligeira e o inimitável sentido de humor luso.',
        accentColor: '#f59e0b',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
        slug: 'historias',
        name: 'Histórias',
        icon: '📖',
        tagline: 'Cada pessoa tem uma história.',
        description: 'Memórias de família, vivências nas aldeias e cidades, episódios marcantes e tradições orais.',
        accentColor: '#f97316',
        badgeBg: 'rgba(249, 115, 22, 0.15)',
        borderColor: 'rgba(249, 115, 22, 0.4)',
    },
    {
        slug: 'portugal',
        name: 'Portugal',
        icon: '🇵🇹',
        tagline: 'Coisas que só quem vive Portugal entende.',
        description: 'Costumes, gastronomia, recantos escondidos e o pulsar das nossas terras.',
        accentColor: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    {
        slug: 'opinioes',
        name: 'Opiniões',
        icon: '🗣️',
        tagline: 'Diz o que pensas.',
        description: 'Pontos de vista sobre cultura, desporto, sociedade e atualidade nacional com respeito e elevação.',
        accentColor: '#3b82f6',
        badgeBg: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.4)',
    },
    {
        slug: 'sugestoes',
        name: 'Sugestões para o Jogo',
        icon: '💡',
        tagline: 'Ajuda-nos a construir o Acorda Portugal.',
        description: 'Propostas de novas funcionalidades, modos de jogo e temas que a comunidade vota diretamente.',
        accentColor: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 0.6)',
    },
    {
        slug: 'debates',
        name: 'Debates',
        icon: '🔥',
        tagline: 'Concordas? Discordas? Explica porquê.',
        description: 'Votações interativas e discussões acesas sobre os temas que apaixonam os portugueses.',
        accentColor: '#ef4444',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    {
        slug: 'destaques',
        name: 'Destaques da Comunidade',
        icon: '🏆',
        tagline: 'O melhor que a comunidade criou.',
        description: 'Publicações galardoadas pela moderação e pelas votações populares dos jogadores.',
        accentColor: '#eab308',
        badgeBg: 'rgba(234, 179, 8, 0.18)',
        borderColor: 'rgba(234, 179, 8, 0.5)',
    },
];
exports.DAILY_CHALLENGE = {
    id: 'chal_today',
    date: '2026-08-26',
    title: 'Desafio do Dia',
    question: 'Se pudesses mudar uma única coisa no Portugal de hoje, qual seria a tua primeira medida?',
    author: 'Equipa Acorda Portugal 🇵🇹',
    participantsCount: 418,
    featuredResponse: {
        authorName: 'Afonso Henriques V',
        authorDistrict: 'Guimarães',
        text: 'Criar incentivos reais para fixar os jovens no interior do país e valorizar o património histórico e agropecuário nacional.',
    },
};
// Dados semente iniciais ricos e autênticos em Português de Portugal
exports.SEED_POSTS = [
    {
        id: 'post_seed_001',
        authorId: 'official_team',
        authorName: 'Acorda Portugal Oficial',
        authorUsername: 'acorda_portugal',
        authorAvatar: '/images/avatars/avatar_galo.png',
        authorLevel: 100,
        authorDistrict: 'Lisboa',
        authorTitle: 'Guardião da Nação',
        isOfficial: true,
        category: 'destaques',
        highlightBadge: 'oficial_acorda_portugal',
        title: '🇵🇹 Bem-vindos a «Os Criadores» — O Teu Espaço Comunitário!',
        content: 'Portugal não é só para jogar. É para participar! Inauguramos oficialmente este centro comunitário para que todos os jogadores possam dar voz às suas ideias, partilhar histórias das suas terras, lançar debates e sugerir novas funcionalidades para o jogo. Respeito mútuo, elevação e paixão por Portugal acima de tudo.',
        createdAt: '2026-08-26T00:00:00.000Z',
        likesCount: 342,
        commentsCount: 56,
        sharesCount: 89,
        savesCount: 120,
        isFeatured: true,
        moderationStatus: 'approved',
    },
    {
        id: 'post_seed_002',
        authorId: 'user_porto_01',
        authorName: 'Gonçalo Ribeiro',
        authorUsername: 'tripeiro_raiz',
        authorAvatar: '/images/avatars/avatar_camões.png',
        authorLevel: 28,
        authorDistrict: 'Porto',
        authorTitle: 'Conquistador Luso',
        category: 'sugestoes',
        isSuggestion: true,
        suggestionStatus: 'em_desenvolvimento',
        upvotesCount: 284,
        downvotesCount: 12,
        title: 'E se no modo 1v1 pudéssemos desafiar jogadores do mesmo Distrito?',
        content: 'Acho que seria incrível criar um "Torneio Distrital" semanal onde os jogadores de um mesmo distrito competem entre si numa tabela eliminatória rápida para coroar o Campeão do Distrito! Quem concorda?',
        createdAt: '2026-08-25T18:30:00.000Z',
        likesCount: 198,
        commentsCount: 34,
        sharesCount: 15,
        isFeatured: true,
        highlightBadge: 'melhor_ideia',
        moderationStatus: 'approved',
    },
    {
        id: 'post_seed_003',
        authorId: 'user_faro_02',
        authorName: 'Mariana Vicente',
        authorUsername: 'algarvia_mar',
        authorAvatar: '/images/avatars/avatar_padeira.png',
        authorLevel: 22,
        authorDistrict: 'Faro',
        authorTitle: 'Embaixadora Regional',
        category: 'debates',
        isPoll: true,
        pollQuestion: 'Qual é o melhor prato tradicional de Verão em Portugal?',
        pollOptions: [
            { id: 'opt_1', text: 'Sardinha Assada com Pimentos', votes: 142 },
            { id: 'opt_2', text: 'Amêijoas à Bulhão Pato', votes: 98 },
            { id: 'opt_3', text: 'Cataplana de Marisco', votes: 67 },
            { id: 'opt_4', text: 'Arroz de Marisco', votes: 85 },
        ],
        pollTotalVotes: 392,
        title: '🔥 Grande Debate de Verão: O Prato Rainha da Costa Portuguesa',
        content: 'Com o calor de agosto e o mar à porta, não há consenso. Em Tavira juramos pelas conquilhas e cataplana, mas em Matosinhos e Portimão a sardinha na brasa manda. Qual é a vossa escolha inegociável?',
        createdAt: '2026-08-25T14:15:00.000Z',
        likesCount: 156,
        commentsCount: 42,
        sharesCount: 21,
        moderationStatus: 'approved',
    },
    {
        id: 'post_seed_004',
        authorId: 'user_braga_03',
        authorName: 'Tiago Antunes',
        authorUsername: 'minhoto_guerreiro',
        authorAvatar: '/images/avatars/avatar_ze_povinho.png',
        authorLevel: 19,
        authorDistrict: 'Braga',
        authorTitle: 'Veterano das Quinas',
        category: 'humor',
        highlightBadge: 'humor_do_dia',
        title: '😂 A evolução das respostas da minha avó ao GPS quando vamos à terra',
        content: 'O GPS diz: "Na rotunda, siga pela terceira saída."\nA minha avó no banco de trás:\n— "Não vás por aí, rapaz! Vira mas é junto ao café do senhor Manuel que o caminho é mais direito e não tem buracos!"\nQuem mais tem uma avó mais fiável que o satélite da Google? 🇵🇹',
        createdAt: '2026-08-25T11:20:00.000Z',
        likesCount: 245,
        commentsCount: 29,
        sharesCount: 64,
        moderationStatus: 'approved',
    },
    {
        id: 'post_seed_005',
        authorId: 'anon_01',
        authorName: 'Cidadão Anónimo',
        authorUsername: 'anonimo',
        authorAvatar: '/images/avatars/avatar_default.png',
        isAnonymous: true,
        category: 'desabafos',
        title: '💬 A saudade que sinto de Portugal mesmo estando apenas a trabalhar fora',
        content: 'Mudei-me para a Suíça há 8 meses por razões profissionais. O país é fantástico, mas nada substitui o cheiro a café torrado logo de manhã na pastelaria do bairro, a luz única de Lisboa ao fim da tarde e o calor das pessoas. Jogar Acorda Portugal todas as noites é o meu pedaço de casa.',
        createdAt: '2026-08-25T09:00:00.000Z',
        likesCount: 312,
        commentsCount: 48,
        sharesCount: 30,
        highlightBadge: 'espirito_portugues',
        moderationStatus: 'approved',
    },
    {
        id: 'post_seed_006',
        authorId: 'user_viseu_04',
        authorName: 'Beatriz Castelo',
        authorUsername: 'beira_alta_viva',
        authorAvatar: '/images/avatars/avatar_d_afonso.png',
        authorLevel: 15,
        authorDistrict: 'Viseu',
        authorTitle: 'Noviça da Nação',
        category: 'historias',
        title: '📖 O segredo dos socalcos da minha bisavó no Douro',
        content: 'Encontrei recentemente cartas antigas de 1934 onde a minha bisavó contava como toda a família subia a encosta de xisto a pé às 5h da manhã para a vindima. Hoje olhamos para as garrafas de vinho do Porto e esquecemos o suor e a coragem de gerações inteiras de transmontanos e beirões.',
        createdAt: '2026-08-24T20:45:00.000Z',
        likesCount: 184,
        commentsCount: 18,
        sharesCount: 19,
        moderationStatus: 'approved',
    },
    {
        id: 'post_seed_007',
        authorId: 'user_coimbra_05',
        authorName: 'Duarte Nuno Silva',
        authorUsername: 'coimbra_doutor',
        authorAvatar: '/images/avatars/avatar_camões.png',
        authorLevel: 31,
        authorDistrict: 'Coimbra',
        authorTitle: 'Mestre do Conhecimento',
        category: 'opinioes',
        title: '🗣️ A importância de valorizarmos a língua portuguesa e os nossos autores clássicos',
        content: 'Numa era dominada por termos anglo-saxónicos e abreviaturas digitais, iniciativas como o banco de perguntas de Literatura e História do Acorda Portugal têm um papel cívico essencial. Ler Eça, Garrett, Camilo e Sophia devia ser um orgulho nacional vivo, não apenas matéria de exame escolar.',
        createdAt: '2026-08-24T16:10:00.000Z',
        likesCount: 167,
        commentsCount: 22,
        sharesCount: 38,
        moderationStatus: 'approved',
    },
    {
        id: 'post_seed_008',
        authorId: 'user_leiria_06',
        authorName: 'Inês Pinheiro',
        authorUsername: 'pinhal_rei',
        authorAvatar: '/images/avatars/avatar_padeira.png',
        authorLevel: 17,
        authorDistrict: 'Leiria',
        authorTitle: 'Defensora das Tradições',
        category: 'portugal',
        title: '🇵🇹 Sabias que o Pinhal de Leiria foi mandado semear por D. Afonso III e reforçado por D. Dinis?',
        content: 'O Pinhal de Leiria (ou Pinhal do Rei) forneceu a madeira de pinho bravo para a construção das caravelas e naus das Descobertas marítimas portuguesas. É um monumento vivo à engenharia e visão estratégica dos primeiros reis de Portugal!',
        createdAt: '2026-08-24T12:00:00.000Z',
        likesCount: 195,
        commentsCount: 14,
        sharesCount: 45,
        moderationStatus: 'approved',
    },
];
exports.SEED_COMMENTS = {
    post_seed_001: [
        {
            id: 'comm_001_1',
            postId: 'post_seed_001',
            authorId: 'user_porto_01',
            authorName: 'Gonçalo Ribeiro',
            authorUsername: 'tripeiro_raiz',
            authorAvatar: '/images/avatars/avatar_camões.png',
            authorLevel: 28,
            authorDistrict: 'Porto',
            content: 'Espetacular iniciativa! Já fazia falta um local oficial onde a comunidade pudesse trocar ideias e apoiar a evolução do jogo.',
            createdAt: '2026-08-26T00:15:00.000Z',
            likesCount: 18,
            replies: [
                {
                    id: 'comm_001_1_rep1',
                    postId: 'post_seed_001',
                    authorId: 'official_team',
                    authorName: 'Acorda Portugal Oficial',
                    authorUsername: 'acorda_portugal',
                    authorAvatar: '/images/avatars/avatar_galo.png',
                    authorLevel: 100,
                    isOfficial: true,
                    content: 'Obrigado Gonçalo! Contamos com as tuas propostas e debates do Norte!',
                    createdAt: '2026-08-26T00:25:00.000Z',
                    likesCount: 12,
                },
            ],
        },
        {
            id: 'comm_001_2',
            postId: 'post_seed_001',
            authorId: 'user_faro_02',
            authorName: 'Mariana Vicente',
            authorUsername: 'algarvia_mar',
            authorAvatar: '/images/avatars/avatar_padeira.png',
            authorLevel: 22,
            authorDistrict: 'Faro',
            content: 'Viva Portugal! Adorei a separação por categorias, muito bem estruturado!',
            createdAt: '2026-08-26T00:30:00.000Z',
            likesCount: 9,
        },
    ],
    post_seed_002: [
        {
            id: 'comm_002_1',
            postId: 'post_seed_002',
            authorId: 'user_braga_03',
            authorName: 'Tiago Antunes',
            authorUsername: 'minhoto_guerreiro',
            authorAvatar: '/images/avatars/avatar_ze_povinho.png',
            authorLevel: 19,
            authorDistrict: 'Braga',
            content: 'Excelente ideia. Em Braga íamos ter dérbis épicos!',
            createdAt: '2026-08-25T19:00:00.000Z',
            likesCount: 14,
        },
    ],
};
/**
 * Sanitiza textos para prevenção estrita contra XSS e injeção de HTML
 */
function sanitizeText(text) {
    if (!text)
        return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
/**
 * Obtém o estado local de likes e saves do utilizador a partir de localStorage
 */
function getLocalUserData() {
    if (typeof window === 'undefined')
        return { likes: new Set(), saves: new Set(), pollVotes: {}, suggestionVotes: {} };
    try {
        var likes = new Set(JSON.parse(localStorage.getItem('creator_user_likes') || '[]'));
        var saves = new Set(JSON.parse(localStorage.getItem('creator_user_saves') || '[]'));
        var pollVotes = JSON.parse(localStorage.getItem('creator_poll_votes') || '{}');
        var suggestionVotes = JSON.parse(localStorage.getItem('creator_suggestion_votes') || '{}');
        return { likes: likes, saves: saves, pollVotes: pollVotes, suggestionVotes: suggestionVotes };
    }
    catch (_a) {
        return { likes: new Set(), saves: new Set(), pollVotes: {}, suggestionVotes: {} };
    }
}
/**
 * Grava o estado de likes do utilizador
 */
function saveLocalLikes(likes) {
    if (typeof window === 'undefined')
        return;
    localStorage.setItem('creator_user_likes', JSON.stringify(Array.from(likes)));
}
/**
 * Grava o estado de guardados do utilizador
 */
function saveLocalSaves(saves) {
    if (typeof window === 'undefined')
        return;
    localStorage.setItem('creator_user_saves', JSON.stringify(Array.from(saves)));
}
/**
 * Armazenamento em memória / cache reativo local para novos posts criados na sessão
 */
var memoryPosts = __spreadArray([], exports.SEED_POSTS, true);
var memoryComments = __assign({}, exports.SEED_COMMENTS);
/**
 * Lista publicações com filtros e ordenação
 */
function getCreatorPosts(params) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, likes, saves, pollVotes, suggestionVotes, results, q, snap, fsPosts, err_1, term_1, sortBy;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = getLocalUserData(), likes = _a.likes, saves = _a.saves, pollVotes = _a.pollVotes, suggestionVotes = _a.suggestionVotes;
                    results = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, 'creatorPosts'), (0, firestore_1.where)('moderationStatus', '==', 'approved'), (0, firestore_1.orderBy)('createdAt', 'desc'), (0, firestore_1.limit)(50));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 2:
                    snap = _b.sent();
                    if (!snap.empty) {
                        fsPosts = snap.docs.map(function (docSnap) {
                            var _a;
                            var d = docSnap.data();
                            return __assign(__assign({ id: docSnap.id }, d), { createdAt: ((_a = d.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString() });
                        });
                        results = fsPosts;
                    }
                    else {
                        results = __spreadArray([], memoryPosts, true);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    // Fallback gracioso para cache de memória com dados semente
                    results = __spreadArray([], memoryPosts, true);
                    return [3 /*break*/, 4];
                case 4:
                    // Filtrar por categoria
                    if ((params === null || params === void 0 ? void 0 : params.category) && params.category !== 'todas') {
                        if (params.category === 'destaques') {
                            results = results.filter(function (p) { return p.isFeatured || p.category === 'destaques' || Boolean(p.highlightBadge); });
                        }
                        else {
                            results = results.filter(function (p) { return p.category === params.category; });
                        }
                    }
                    // Filtrar por distrito
                    if ((params === null || params === void 0 ? void 0 : params.district) && params.district !== 'Todos os Distritos') {
                        results = results.filter(function (p) { var _a, _b; return ((_a = p.authorDistrict) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === ((_b = params.district) === null || _b === void 0 ? void 0 : _b.toLowerCase()); });
                    }
                    // Filtrar por termo de pesquisa
                    if ((params === null || params === void 0 ? void 0 : params.searchQuery) && params.searchQuery.trim()) {
                        term_1 = params.searchQuery.trim().toLowerCase();
                        results = results.filter(function (p) {
                            return p.title.toLowerCase().includes(term_1) ||
                                p.content.toLowerCase().includes(term_1) ||
                                p.authorName.toLowerCase().includes(term_1) ||
                                p.authorUsername.toLowerCase().includes(term_1);
                        });
                    }
                    // Aplicar enriquecimento de estado do utilizador (likes, saves, poll votes)
                    results = results.map(function (p) { return (__assign(__assign({}, p), { hasLiked: likes.has(p.id), hasSaved: saves.has(p.id), userVotedOptionId: pollVotes[p.id], userVote: suggestionVotes[p.id] || null })); });
                    sortBy = (params === null || params === void 0 ? void 0 : params.sortBy) || 'destaques';
                    results.sort(function (a, b) {
                        if (sortBy === 'destaques') {
                            if (a.isFeatured && !b.isFeatured)
                                return -1;
                            if (!a.isFeatured && b.isFeatured)
                                return 1;
                            return b.likesCount + b.commentsCount * 2 - (a.likesCount + a.commentsCount * 2);
                        }
                        if (sortBy === 'populares') {
                            return b.likesCount - a.likesCount;
                        }
                        if (sortBy === 'comentadas') {
                            return b.commentsCount - a.commentsCount;
                        }
                        if (sortBy === 'tendencias') {
                            return b.sharesCount * 3 + b.likesCount - (a.sharesCount * 3 + a.likesCount);
                        }
                        // 'recentes'
                        var dateA = new Date(a.createdAt).getTime();
                        var dateB = new Date(b.createdAt).getTime();
                        return dateB - dateA;
                    });
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * Cria uma nova publicação com validação e proteção contra spam
 */
function createCreatorPost(data) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanTitle, cleanContent, newPostId, nowIso, pollFormattedOptions, newPost, err_2, likes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cleanTitle = sanitizeText(data.title.trim());
                    cleanContent = sanitizeText(data.content.trim());
                    if (!cleanTitle || cleanTitle.length < 4) {
                        throw new Error('O título da publicação deve conter pelo menos 4 caracteres.');
                    }
                    if (!cleanContent || cleanContent.length < 10) {
                        throw new Error('O conteúdo da publicação deve conter pelo menos 10 caracteres.');
                    }
                    newPostId = "post_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 7));
                    nowIso = new Date().toISOString();
                    pollFormattedOptions = undefined;
                    if (data.isPoll && data.pollOptions && data.pollOptions.length >= 2) {
                        pollFormattedOptions = data.pollOptions.map(function (optText, idx) { return ({
                            id: "opt_".concat(idx + 1),
                            text: sanitizeText(optText.trim()),
                            votes: 0,
                        }); });
                    }
                    newPost = {
                        id: newPostId,
                        authorId: data.isAnonymous ? 'anonymous' : data.authorId,
                        authorName: data.isAnonymous ? 'Cidadão Anónimo' : data.authorName,
                        authorUsername: data.isAnonymous ? 'anonimo' : data.authorUsername,
                        authorAvatar: data.isAnonymous ? '/images/avatars/avatar_default.png' : data.authorAvatar,
                        authorLevel: data.isAnonymous ? undefined : data.authorLevel,
                        authorDistrict: data.isAnonymous ? undefined : data.authorDistrict,
                        authorTitle: data.isAnonymous ? undefined : data.authorTitle,
                        isAnonymous: Boolean(data.isAnonymous),
                        category: data.category,
                        title: cleanTitle,
                        content: cleanContent,
                        imageUrl: data.imageUrl ? sanitizeText(data.imageUrl.trim()) : undefined,
                        createdAt: nowIso,
                        likesCount: 1, // O criador apoia a sua própria publicação por defeito
                        commentsCount: 0,
                        sharesCount: 0,
                        savesCount: 0,
                        moderationStatus: 'approved',
                        isSuggestion: data.category === 'sugestoes' || data.isSuggestion,
                        suggestionStatus: (data.category === 'sugestoes' || data.isSuggestion) ? 'sugestao' : undefined,
                        upvotesCount: (data.category === 'sugestoes' || data.isSuggestion) ? 1 : undefined,
                        downvotesCount: 0,
                        isPoll: Boolean(data.isPoll),
                        pollQuestion: data.pollQuestion ? sanitizeText(data.pollQuestion.trim()) : undefined,
                        pollOptions: pollFormattedOptions,
                        pollTotalVotes: 0,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, 'creatorPosts', newPostId), __assign(__assign({}, newPost), { createdAt: (0, firestore_1.serverTimestamp)(), updatedAt: (0, firestore_1.serverTimestamp)() }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.warn('[CREATORS] Aviso ao gravar no Firestore (usando fallback local):', err_2);
                    return [3 /*break*/, 4];
                case 4:
                    // Adicionar à memória local
                    memoryPosts.unshift(newPost);
                    likes = getLocalUserData().likes;
                    likes.add(newPostId);
                    saveLocalLikes(likes);
                    return [2 /*return*/, newPost];
            }
        });
    });
}
/**
 * Alterna o Gosto (Like) numa publicação
 */
function togglePostLike(postId) {
    return __awaiter(this, void 0, void 0, function () {
        var likes, hasLiked, isLiking, post, newCount, postRef, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    likes = getLocalUserData().likes;
                    hasLiked = likes.has(postId);
                    isLiking = !hasLiked;
                    if (isLiking) {
                        likes.add(postId);
                    }
                    else {
                        likes.delete(postId);
                    }
                    saveLocalLikes(likes);
                    post = memoryPosts.find(function (p) { return p.id === postId; });
                    newCount = post ? post.likesCount : 0;
                    if (post) {
                        post.likesCount = Math.max(0, post.likesCount + (isLiking ? 1 : -1));
                        newCount = post.likesCount;
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    postRef = (0, firestore_1.doc)(firebase_1.db, 'creatorPosts', postId);
                    return [4 /*yield*/, (0, firestore_1.updateDoc)(postRef, {
                            likesCount: (0, firestore_1.increment)(isLiking ? 1 : -1),
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, { liked: isLiking, newCount: newCount }];
            }
        });
    });
}
/**
 * Alterna guardar publicação nos favoritos
 */
function togglePostSave(postId) {
    var saves = getLocalUserData().saves;
    var isSaved = saves.has(postId);
    if (isSaved) {
        saves.delete(postId);
    }
    else {
        saves.add(postId);
    }
    saveLocalSaves(saves);
    return !isSaved;
}
/**
 * Obtém os comentários de uma publicação
 */
function getPostComments(postId) {
    return __awaiter(this, void 0, void 0, function () {
        var q, snap, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, 'creatorPosts', postId, 'comments'), (0, firestore_1.orderBy)('createdAt', 'asc'));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 1:
                    snap = _a.sent();
                    if (!snap.empty) {
                        return [2 /*return*/, snap.docs.map(function (d) { return (__assign({ id: d.id }, d.data())); })];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, memoryComments[postId] || []];
            }
        });
    });
}
/**
 * Adiciona um comentário a uma publicação
 */
function addPostComment(params) {
    return __awaiter(this, void 0, void 0, function () {
        var clean, commentId, newComment, commRef, e_3, parent_1, post;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clean = sanitizeText(params.content.trim());
                    if (!clean || clean.length < 2) {
                        throw new Error('O comentário não pode estar vazio.');
                    }
                    commentId = "comm_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 6));
                    newComment = {
                        id: commentId,
                        postId: params.postId,
                        authorId: params.authorId,
                        authorName: params.authorName,
                        authorUsername: params.authorUsername,
                        authorAvatar: params.authorAvatar,
                        authorLevel: params.authorLevel,
                        authorDistrict: params.authorDistrict,
                        authorTitle: params.authorTitle,
                        content: clean,
                        createdAt: new Date().toISOString(),
                        likesCount: 0,
                        parentId: params.parentId || null,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    commRef = (0, firestore_1.doc)(firebase_1.db, 'creatorPosts', params.postId, 'comments', commentId);
                    return [4 /*yield*/, (0, firestore_1.setDoc)(commRef, __assign(__assign({}, newComment), { createdAt: (0, firestore_1.serverTimestamp)() }))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_1.db, 'creatorPosts', params.postId), {
                            commentsCount: (0, firestore_1.increment)(1),
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    // Atualizar memória local
                    if (!memoryComments[params.postId]) {
                        memoryComments[params.postId] = [];
                    }
                    if (params.parentId) {
                        parent_1 = memoryComments[params.postId].find(function (c) { return c.id === params.parentId; });
                        if (parent_1) {
                            if (!parent_1.replies)
                                parent_1.replies = [];
                            parent_1.replies.push(newComment);
                        }
                        else {
                            memoryComments[params.postId].push(newComment);
                        }
                    }
                    else {
                        memoryComments[params.postId].push(newComment);
                    }
                    post = memoryPosts.find(function (p) { return p.id === params.postId; });
                    if (post) {
                        post.commentsCount += 1;
                    }
                    return [2 /*return*/, newComment];
            }
        });
    });
}
/**
 * Votação numa enquete de Debate
 */
function voteOnPoll(postId, optionId) {
    return __awaiter(this, void 0, void 0, function () {
        var pollVotes, post, opt;
        return __generator(this, function (_a) {
            pollVotes = getLocalUserData().pollVotes;
            if (pollVotes[postId]) {
                return [2 /*return*/, null]; // Já votou
            }
            pollVotes[postId] = optionId;
            if (typeof window !== 'undefined') {
                localStorage.setItem('creator_poll_votes', JSON.stringify(pollVotes));
            }
            post = memoryPosts.find(function (p) { return p.id === postId; });
            if (post && post.pollOptions) {
                opt = post.pollOptions.find(function (o) { return o.id === optionId; });
                if (opt) {
                    opt.votes += 1;
                    post.pollTotalVotes = (post.pollTotalVotes || 0) + 1;
                }
                return [2 /*return*/, __assign(__assign({}, post), { userVotedOptionId: optionId })];
            }
            return [2 /*return*/, null];
        });
    });
}
/**
 * Votação numa Sugestão para o Jogo (Implementar 👍 / Não Implementar 👎)
 */
function voteOnSuggestion(postId, vote) {
    var suggestionVotes = getLocalUserData().suggestionVotes;
    var previousVote = suggestionVotes[postId];
    var post = memoryPosts.find(function (p) { return p.id === postId; });
    var up = (post === null || post === void 0 ? void 0 : post.upvotesCount) || 0;
    var down = (post === null || post === void 0 ? void 0 : post.downvotesCount) || 0;
    if (previousVote === vote) {
        // Retirar voto
        delete suggestionVotes[postId];
        if (vote === 'up')
            up = Math.max(0, up - 1);
        if (vote === 'down')
            down = Math.max(0, down - 1);
    }
    else {
        if (previousVote === 'up')
            up = Math.max(0, up - 1);
        if (previousVote === 'down')
            down = Math.max(0, down - 1);
        if (vote === 'up')
            up += 1;
        if (vote === 'down')
            down += 1;
        suggestionVotes[postId] = vote;
    }
    if (post) {
        post.upvotesCount = up;
        post.downvotesCount = down;
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem('creator_suggestion_votes', JSON.stringify(suggestionVotes));
    }
    return { upvotes: up, downvotes: down };
}
/**
 * Submete denúncia para moderação
 */
function reportPost(data) {
    return __awaiter(this, void 0, void 0, function () {
        var report, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        postId: data.postId,
                        reporterId: data.reporterId,
                        reason: data.reason,
                        details: data.details ? sanitizeText(data.details.trim()) : undefined,
                        createdAt: new Date().toISOString(),
                        status: 'pending',
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'creatorReports'), __assign(__assign({}, report), { createdAt: (0, firestore_1.serverTimestamp)() }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _a.sent();
                    console.warn('[REPORT] Reporte registado localmente:', report);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
/**
 * Obtém resumo de perfil público do criador
 */
function getCreatorProfile(username) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanUsername, posts, sample, totalLikes, totalComments, totalHighlights;
        return __generator(this, function (_a) {
            cleanUsername = username.toLowerCase().replace('@', '');
            posts = memoryPosts.filter(function (p) { return p.authorUsername.toLowerCase() === cleanUsername; });
            if (posts.length === 0 && cleanUsername !== 'acorda_portugal') {
                return [2 /*return*/, null];
            }
            sample = posts[0];
            totalLikes = posts.reduce(function (sum, p) { return sum + p.likesCount; }, 0);
            totalComments = posts.reduce(function (sum, p) { return sum + p.commentsCount; }, 0);
            totalHighlights = posts.filter(function (p) { return Boolean(p.highlightBadge) || p.isFeatured; }).length;
            return [2 /*return*/, {
                    uid: (sample === null || sample === void 0 ? void 0 : sample.authorId) || 'uid_creator',
                    displayName: (sample === null || sample === void 0 ? void 0 : sample.authorName) || 'Jogador Português',
                    username: cleanUsername,
                    avatar: (sample === null || sample === void 0 ? void 0 : sample.authorAvatar) || '/images/avatars/avatar_default.png',
                    level: (sample === null || sample === void 0 ? void 0 : sample.authorLevel) || 15,
                    district: (sample === null || sample === void 0 ? void 0 : sample.authorDistrict) || 'Portugal',
                    title: (sample === null || sample === void 0 ? void 0 : sample.authorTitle) || 'Cidadão Ativo',
                    bio: 'Participante e criador na comunidade do Acorda Portugal.',
                    joinedAt: '2026',
                    totalPosts: posts.length,
                    totalLikesReceived: totalLikes,
                    totalComments: totalComments,
                    totalHighlights: totalHighlights,
                    badges: __spreadArray([
                        { id: 'b_first', name: 'Primeiro Criador', description: 'Publicou na comunidade', icon: '🖊️' },
                        { id: 'b_pt', name: 'Voz de Portugal', description: 'Participação ativa e positiva', icon: '🇵🇹' }
                    ], (totalHighlights > 0 ? [{ id: 'b_high', name: 'Criador Destaque', description: 'Publicação destacada', icon: '🏆' }] : []), true),
                }];
        });
    });
}
