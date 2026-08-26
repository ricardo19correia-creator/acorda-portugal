'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorProfileView = CreatorProfileView;
var react_1 = require("react");
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react");
var creators_service_1 = require("@/lib/creators-service");
var CreatorPostCard_1 = require("@/components/creators/CreatorPostCard");
var user_avatar_1 = require("@/components/user-avatar");
var utils_1 = require("@/lib/utils");
function CreatorProfileView(_a) {
    var username = _a.username, onLike = _a.onLike, onSave = _a.onSave, onOpenComments = _a.onOpenComments, onVotePoll = _a.onVotePoll, onVoteSuggestion = _a.onVoteSuggestion, onReport = _a.onReport;
    var _b = (0, react_1.useState)(null), profile = _b[0], setProfile = _b[1];
    var _c = (0, react_1.useState)([]), posts = _c[0], setPosts = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)('publicacoes'), activeTab = _e[0], setActiveTab = _e[1];
    (0, react_1.useEffect)(function () {
        setLoading(true);
        Promise.all([
            (0, creators_service_1.getCreatorProfile)(username),
            (0, creators_service_1.getCreatorPosts)(),
        ]).then(function (_a) {
            var prof = _a[0], allPosts = _a[1];
            setProfile(prof);
            var userPosts = allPosts.filter(function (p) { return p.authorUsername.toLowerCase() === username.toLowerCase().replace('@', ''); });
            setPosts(userPosts);
        }).finally(function () { return setLoading(false); });
    }, [username]);
    if (loading) {
        return (<div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"/>
        <span className="text-xs text-slate-400">A carregar perfil de criador...</span>
      </div>);
    }
    if (!profile) {
        return (<div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center space-y-4 max-w-lg mx-auto">
        <div className="text-4xl">🧑🎨</div>
        <h2 className="font-display text-xl font-black uppercase text-white">
          Criador Não Encontrado
        </h2>
        <p className="text-xs text-slate-400">
          O utilizador <strong className="text-emerald-400">@{username}</strong> ainda não publicou nada ou o perfil não está disponível.
        </p>
        <link_1.default href="/criadores" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 uppercase tracking-wider hover:bg-emerald-400 transition-colors">
          <lucide_react_1.ArrowLeft className="h-4 w-4"/>
          <span>Voltar à Comunidade</span>
        </link_1.default>
      </div>);
    }
    var highlightPosts = posts.filter(function (p) { return Boolean(p.highlightBadge) || p.isFeatured; });
    return (<div className="space-y-6">
      {/* Botão de Voltar */}
      <link_1.default href="/criadores" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
        <lucide_react_1.ArrowLeft className="h-4 w-4"/>
        <span>Voltar ao Feed dos Criadores</span>
      </link_1.default>

      {/* Cartão de Cabeçalho do Perfil */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"/>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative">
            <user_avatar_1.UserAvatar avatarUrl={profile.avatar} size="xl"/>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950 border border-slate-900 shadow">
              Nv. {profile.level}
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
                {profile.displayName}
              </h1>
              <span className="text-sm font-bold text-slate-400">@{profile.username}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-emerald-300 font-bold">
                {profile.title || 'Cidadão Ativo'}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <lucide_react_1.MapPin className="h-3.5 w-3.5 text-red-400"/>
                {profile.district || 'Portugal'}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <lucide_react_1.Calendar className="h-3.5 w-3.5 text-cyan-400"/>
                Criador desde {profile.joinedAt}
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed pt-1">
              {profile.bio}
            </p>

            {/* Resumo Estatístico */}
            <div className="pt-4 grid grid-cols-3 gap-3 max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2.5 text-center">
                <span className="font-display text-base font-black text-white">{profile.totalPosts}</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Posts</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2.5 text-center">
                <span className="font-display text-base font-black text-rose-400">{profile.totalLikesReceived}</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Gostos</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2.5 text-center">
                <span className="font-display text-base font-black text-amber-400">{profile.totalHighlights}</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Destaques</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por Separadores */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button type="button" onClick={function () { return setActiveTab('publicacoes'); }} className={(0, utils_1.cn)('flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer', activeTab === 'publicacoes'
            ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
            : 'text-slate-400 hover:text-white hover:bg-white/5')}>
          <span>Publicações ({posts.length})</span>
        </button>

        <button type="button" onClick={function () { return setActiveTab('destaques'); }} className={(0, utils_1.cn)('flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer', activeTab === 'destaques'
            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
            : 'text-slate-400 hover:text-white hover:bg-white/5')}>
          <span>🏆 Destaques ({highlightPosts.length})</span>
        </button>

        <button type="button" onClick={function () { return setActiveTab('medalhas'); }} className={(0, utils_1.cn)('flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer', activeTab === 'medalhas'
            ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
            : 'text-slate-400 hover:text-white hover:bg-white/5')}>
          <span>Medalhas Sociais ({profile.badges.length})</span>
        </button>
      </div>

      {/* Conteúdo do Separador Ativo */}
      <div className="space-y-4">
        {activeTab === 'publicacoes' && (posts.length === 0 ? (<div className="text-center py-12 text-slate-400 text-xs">
              Este utilizador ainda não tem publicações ativas.
            </div>) : (posts.map(function (post) { return (<CreatorPostCard_1.CreatorPostCard key={post.id} post={post} onLike={onLike} onSave={onSave} onOpenComments={onOpenComments} onVotePoll={onVotePoll} onVoteSuggestion={onVoteSuggestion} onReport={onReport}/>); })))}

        {activeTab === 'destaques' && (highlightPosts.length === 0 ? (<div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma publicação destacada até ao momento.
            </div>) : (highlightPosts.map(function (post) { return (<CreatorPostCard_1.CreatorPostCard key={post.id} post={post} onLike={onLike} onSave={onSave} onOpenComments={onOpenComments} onVotePoll={onVotePoll} onVoteSuggestion={onVoteSuggestion} onReport={onReport}/>); })))}

        {activeTab === 'medalhas' && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.badges.map(function (badge) { return (<div key={badge.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-md backdrop-blur-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-2xl shadow-inner">
                  {badge.icon}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-white">{badge.name}</span>
                  <span className="text-[11px] text-slate-400 leading-snug">{badge.description}</span>
                </div>
              </div>); })}
          </div>)}
      </div>
    </div>);
}
