'use client';
"use strict";
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
exports.default = CriadoresPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var background_fx_1 = require("@/components/background-fx");
var site_header_1 = require("@/components/site-header");
var site_footer_1 = require("@/components/site-footer");
var CreatorsHero_1 = require("@/components/creators/CreatorsHero");
var CreatorsCategoriesBar_1 = require("@/components/creators/CreatorsCategoriesBar");
var CreatorPostCard_1 = require("@/components/creators/CreatorPostCard");
var CreatePostModal_1 = require("@/components/creators/CreatePostModal");
var CreatorsCommentsDrawer_1 = require("@/components/creators/CreatorsCommentsDrawer");
var CreatorsSidebar_1 = require("@/components/creators/CreatorsSidebar");
var ReportPostModal_1 = require("@/components/creators/ReportPostModal");
var creators_service_1 = require("@/lib/creators-service");
var districts_1 = require("@/data/districts");
var utils_1 = require("@/lib/utils");
function CriadoresPage() {
    var _this = this;
    var _a = (0, react_1.useState)([]), posts = _a[0], setPosts = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    // Filtros de Feed
    var _c = (0, react_1.useState)('todas'), selectedCategory = _c[0], setSelectedCategory = _c[1];
    var _d = (0, react_1.useState)('Todos os Distritos'), selectedDistrict = _d[0], setSelectedDistrict = _d[1];
    var _e = (0, react_1.useState)('destaques'), sortBy = _e[0], setSortBy = _e[1];
    var _f = (0, react_1.useState)(''), searchQuery = _f[0], setSearchQuery = _f[1];
    // Modais e Gavetas
    var _g = (0, react_1.useState)(false), isCreateModalOpen = _g[0], setIsCreateModalOpen = _g[1];
    var _h = (0, react_1.useState)(null), activeCommentPost = _h[0], setActiveCommentPost = _h[1];
    var _j = (0, react_1.useState)(false), isCommentsDrawerOpen = _j[0], setIsCommentsDrawerOpen = _j[1];
    var _k = (0, react_1.useState)(null), activeReportPost = _k[0], setActiveReportPost = _k[1];
    var _l = (0, react_1.useState)(false), isReportModalOpen = _l[0], setIsReportModalOpen = _l[1];
    // Feedback Toast
    var _m = (0, react_1.useState)(null), toastMessage = _m[0], setToastMessage = _m[1];
    var showToast = function (msg) {
        setToastMessage(msg);
        setTimeout(function () { return setToastMessage(null); }, 3000);
    };
    // Carregamento de Publicações
    var loadPosts = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, creators_service_1.getCreatorPosts)({
                            category: selectedCategory,
                            district: selectedDistrict,
                            sortBy: sortBy,
                            searchQuery: searchQuery,
                        })];
                case 2:
                    data = _a.sent();
                    setPosts(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('[CREATORS] Erro ao carregar posts:', err_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadPosts();
    }, [selectedCategory, selectedDistrict, sortBy, searchQuery]);
    // Contadores por Categoria
    var categoryCounts = (0, react_1.useMemo)(function () {
        var counts = { todas: posts.length };
        posts.forEach(function (p) {
            counts[p.category] = (counts[p.category] || 0) + 1;
            if (p.isFeatured || Boolean(p.highlightBadge)) {
                counts['destaques'] = (counts['destaques'] || 0) + 1;
            }
        });
        return counts;
    }, [posts]);
    // Handlers de Interação
    var handleLike = function (postId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, liked_1, newCount_1, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, creators_service_1.togglePostLike)(postId)];
                case 1:
                    _a = _b.sent(), liked_1 = _a.liked, newCount_1 = _a.newCount;
                    setPosts(function (prev) {
                        return prev.map(function (p) { return (p.id === postId ? __assign(__assign({}, p), { hasLiked: liked_1, likesCount: newCount_1 }) : p); });
                    });
                    if (liked_1) {
                        showToast('Gosto registado! ❤️');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSave = function (postId) {
        var isSaved = (0, creators_service_1.togglePostSave)(postId);
        setPosts(function (prev) {
            return prev.map(function (p) { return (p.id === postId ? __assign(__assign({}, p), { hasSaved: isSaved }) : p); });
        });
        showToast(isSaved ? 'Publicação guardada nos favoritos! 🔖' : 'Removido dos favoritos.');
    };
    var handleOpenComments = function (post) {
        setActiveCommentPost(post);
        setIsCommentsDrawerOpen(true);
    };
    var handleCommentAdded = function (postId) {
        setPosts(function (prev) {
            return prev.map(function (p) { return (p.id === postId ? __assign(__assign({}, p), { commentsCount: p.commentsCount + 1 }) : p); });
        });
        showToast('Comentário publicado! 💬');
    };
    var handleVotePoll = function (postId, optionId) { return __awaiter(_this, void 0, void 0, function () {
        var updatedPost;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, creators_service_1.voteOnPoll)(postId, optionId)];
                case 1:
                    updatedPost = _a.sent();
                    if (updatedPost) {
                        setPosts(function (prev) { return prev.map(function (p) { return (p.id === postId ? updatedPost : p); }); });
                        showToast('Voto no debate registado! 🔥');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleVoteSuggestion = function (postId, vote) {
        var _a = (0, creators_service_1.voteOnSuggestion)(postId, vote), upvotes = _a.upvotes, downvotes = _a.downvotes;
        setPosts(function (prev) {
            return prev.map(function (p) {
                return p.id === postId
                    ? __assign(__assign({}, p), { upvotesCount: upvotes, downvotesCount: downvotes, userVote: p.userVote === vote ? null : vote }) : p;
            });
        });
        showToast(vote === 'up' ? 'Apoiado! 👍' : 'Voto registado. 👎');
    };
    var handleReport = function (post) {
        setActiveReportPost(post);
        setIsReportModalOpen(true);
    };
    var handlePostCreated = function (newPost) {
        setPosts(function (prev) { return __spreadArray([newPost], prev, true); });
        showToast('Publicação criada com sucesso! 🇵🇹');
    };
    return (<div className="relative min-h-screen bg-transparent flex flex-col">
      <background_fx_1.BackgroundFx variant="about"/>

      {/* Toast Notification Flutuante */}
      {toastMessage && (<div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-400/50 bg-slate-950/95 px-5 py-3 text-xs font-black text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] backdrop-blur-xl animate-in zoom-in-95 duration-150">
          {toastMessage}
        </div>)}

      <div className="relative z-20 flex-1 flex flex-col">
        <site_header_1.SiteHeader />

        <main className="flex-1 pb-20 sm:pb-12">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 space-y-6">
            {/* Hero Principal Oficial */}
            <CreatorsHero_1.CreatorsHero onOpenCreateModal={function () { return setIsCreateModalOpen(true); }} onSelectHighlights={function () { return setSelectedCategory('destaques'); }} totalPostsCount={posts.length}/>

            {/* Barra de Categorias */}
            <CreatorsCategoriesBar_1.CreatorsCategoriesBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} categoryCounts={categoryCounts}/>

            {/* Barra de Filtros, Ordenação e Pesquisa */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 backdrop-blur-md">
              {/* Abas de Ordenação */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {[
            { id: 'destaques', label: '🔥 Em Destaque' },
            { id: 'recentes', label: '🆕 Mais Recentes' },
            { id: 'populares', label: '❤️ Populares' },
            { id: 'comentadas', label: '💬 Comentadas' },
            { id: 'tendencias', label: '📈 Tendências' },
        ].map(function (tab) { return (<button key={tab.id} type="button" onClick={function () { return setSortBy(tab.id); }} className={(0, utils_1.cn)('shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer', sortBy === tab.id
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5')}>
                    {tab.label}
                  </button>); })}
              </div>

              {/* Controlo de Pesquisa & Filtro Distrital */}
              <div className="flex items-center gap-2">
                {/* Filtro por Distrito */}
                <div className="relative">
                  <select value={selectedDistrict} onChange={function (e) { return setSelectedDistrict(e.target.value); }} className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400 cursor-pointer">
                    <option value="Todos os Distritos">📍 Todos os Distritos</option>
                    {districts_1.VALID_DISTRICTS.map(function (d) { return (<option key={d} value={d}>
                        {d}
                      </option>); })}
                  </select>
                </div>

                {/* Caixa de Pesquisa Textual */}
                <div className="relative flex-1 sm:w-56">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500"/>
                  <input type="text" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} placeholder="Procurar publicações..." className="w-full rounded-xl border border-white/15 bg-slate-950 pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"/>
                </div>
              </div>
            </div>

            {/* Layout Principal: 2 Colunas (Feed + Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna Central: Feed de Publicações (8 colunas no Desktop) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Botão Superior Rápido para Criar Publicação */}
                <div onClick={function () { return setIsCreateModalOpen(true); }} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-md backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-slate-900 cursor-pointer group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 text-lg border border-emerald-500/30 group-hover:scale-105 transition-transform">
                    ✍️
                  </div>
                  <div className="flex-1 text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">
                    Tens uma ideia, história, desabafo ou piada? <span className="text-emerald-400 font-bold">Publica aqui...</span>
                  </div>
                  <button type="button" className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 uppercase tracking-wider group-hover:bg-emerald-400 transition-colors shadow">
                    Publicar
                  </button>
                </div>

                {/* Lista de Cartões do Feed */}
                {loading ? (<div className="space-y-4 py-8">
                    {[1, 2, 3].map(function (i) { return (<div key={i} className="h-44 rounded-3xl border border-white/5 bg-slate-900/40 animate-pulse"/>); })}
                  </div>) : posts.length === 0 ? (<div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center space-y-4">
                    <div className="text-4xl">🇵🇹</div>
                    <h3 className="font-display text-lg font-black uppercase text-white">
                      Ainda Não Há Publicações
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      {selectedCategory !== 'todas'
                ? "Ningu\u00E9m publicou nada na categoria \"".concat(selectedCategory, "\" ainda. Queres ser o primeiro?")
                : 'Se calhar és tu quem vai começar a conversa no Acorda Portugal.'}
                    </p>
                    <button type="button" onClick={function () { return setIsCreateModalOpen(true); }} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg">
                      <lucide_react_1.PenSquare className="h-4 w-4"/>
                      <span>Criar Primeira Publicação</span>
                    </button>
                  </div>) : (posts.map(function (post) { return (<CreatorPostCard_1.CreatorPostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} onOpenComments={handleOpenComments} onVotePoll={handleVotePoll} onVoteSuggestion={handleVoteSuggestion} onReport={handleReport}/>); }))}
              </div>

              {/* Coluna Direita: Sidebar Comunitária (4 colunas no Desktop) */}
              <div className="lg:col-span-4">
                <CreatorsSidebar_1.CreatorsSidebar onSelectTopic={function (topic) { return setSearchQuery(topic); }} onOpenCreateForChallenge={function () {
            setSelectedCategory('opinioes');
            setIsCreateModalOpen(true);
        }}/>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Action Button (FAB) Mobile para Criar Publicação */}
        <button type="button" onClick={function () { return setIsCreateModalOpen(true); }} aria-label="Criar Publicação" className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all hover:scale-110 active:scale-95 sm:hidden cursor-pointer">
          <lucide_react_1.Plus className="h-7 w-7 stroke-[3]"/>
        </button>

        {/* Modais e Gavetas */}
        <CreatePostModal_1.CreatePostModal isOpen={isCreateModalOpen} onClose={function () { return setIsCreateModalOpen(false); }} onPostCreated={handlePostCreated} createPostFn={creators_service_1.createCreatorPost}/>

        <CreatorsCommentsDrawer_1.CreatorsCommentsDrawer post={activeCommentPost} isOpen={isCommentsDrawerOpen} onClose={function () {
            setIsCommentsDrawerOpen(false);
            setActiveCommentPost(null);
        }} onCommentAdded={handleCommentAdded}/>

        <ReportPostModal_1.ReportPostModal post={activeReportPost} isOpen={isReportModalOpen} onClose={function () {
            setIsReportModalOpen(false);
            setActiveReportPost(null);
        }}/>

        <site_footer_1.SiteFooter />
      </div>
    </div>);
}
