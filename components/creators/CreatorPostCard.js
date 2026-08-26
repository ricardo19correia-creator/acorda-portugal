'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorPostCard = CreatorPostCard;
var react_1 = require("react");
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react");
var creators_service_1 = require("@/lib/creators-service");
var user_avatar_1 = require("@/components/user-avatar");
var utils_1 = require("@/lib/utils");
function timeAgo(dateInput) {
    var date = new Date(dateInput);
    var now = new Date();
    var diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'Agora mesmo';
    var diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
        return "H\u00E1 ".concat(diffInMinutes, " min");
    var diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
        return "H\u00E1 ".concat(diffInHours, " h");
    var diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1)
        return 'Ontem';
    if (diffInDays < 30)
        return "H\u00E1 ".concat(diffInDays, " dias");
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}
function CreatorPostCard(_a) {
    var _b, _c;
    var post = _a.post, onLike = _a.onLike, onSave = _a.onSave, onOpenComments = _a.onOpenComments, onVotePoll = _a.onVotePoll, onVoteSuggestion = _a.onVoteSuggestion, onReport = _a.onReport;
    var _d = (0, react_1.useState)(false), copiedShare = _d[0], setCopiedShare = _d[1];
    var _e = (0, react_1.useState)(false), likePulsing = _e[0], setLikePulsing = _e[1];
    var categoryInfo = creators_service_1.CREATOR_CATEGORIES.find(function (c) { return c.slug === post.category; }) || creators_service_1.CREATOR_CATEGORIES[0];
    var handleLikeClick = function () {
        setLikePulsing(true);
        setTimeout(function () { return setLikePulsing(false); }, 400);
        onLike(post.id);
    };
    var handleShareClick = function () {
        if (typeof window !== 'undefined') {
            var shareUrl = "".concat(window.location.origin, "/criadores?post=").concat(post.id);
            navigator.clipboard.writeText(shareUrl).catch(function () { });
            setCopiedShare(true);
            setTimeout(function () { return setCopiedShare(false); }, 2000);
        }
    };
    var suggestionStatusBadge = function (status) {
        switch (status) {
            case 'em_desenvolvimento':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
            🛠️ Em Desenvolvimento
          </span>);
            case 'implementada':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            ✅ Implementada no Jogo
          </span>);
            case 'em_analise':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
            👀 Em Análise
          </span>);
            case 'recusada':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
            ❌ Recusada
          </span>);
            default:
                return (<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
            💡 Sugestão Comunitária
          </span>);
        }
    };
    var highlightBadgeDisplay = function (badge) {
        switch (badge) {
            case 'oficial_acorda_portugal':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <lucide_react_1.CheckCircle className="h-3 w-3 text-emerald-400"/>
            <span>Equipa Oficial</span>
          </span>);
            case 'publicacao_do_dia':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
            <lucide_react_1.Crown className="h-3 w-3 text-amber-400"/>
            <span>Publicação do Dia</span>
          </span>);
            case 'melhor_ideia':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/50 bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
            <lucide_react_1.Sparkles className="h-3 w-3 text-cyan-400"/>
            <span>Melhor Ideia</span>
          </span>);
            case 'humor_do_dia':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/50 bg-yellow-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-300">
            <span>😂 Humor do Dia</span>
          </span>);
            case 'espirito_portugues':
                return (<span className="inline-flex items-center gap-1 rounded-full border border-red-500/50 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-300">
            <span>🇵🇹 Espírito Português</span>
          </span>);
            default:
                return null;
        }
    };
    return (<article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/95 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      {/* Header da Publicação: Autor, Nível, Distrito, Categoria e Tempo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {post.isAnonymous ? (<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-950/60 text-lg shadow-inner">
              🎭
            </div>) : (<link_1.default href={"/criadores/".concat(post.authorUsername)} className="shrink-0 transition-transform active:scale-95">
              <user_avatar_1.UserAvatar avatarUrl={post.authorAvatar} size="md"/>
            </link_1.default>)}

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {post.isAnonymous ? (<span className="font-bold text-slate-200 text-sm">Cidadão Anónimo</span>) : (<link_1.default href={"/criadores/".concat(post.authorUsername)} className="font-bold text-white text-sm hover:text-emerald-300 transition-colors truncate">
                  {post.authorName}
                </link_1.default>)}

              {post.isOfficial && (<span className="text-emerald-400" title="Verificado Oficial">
                  ✓
                </span>)}

              {post.authorLevel && !post.isAnonymous && (<span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-black text-amber-400">
                  Nv. {post.authorLevel}
                </span>)}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {!post.isAnonymous && (<>
                  <span className="text-slate-400">@{post.authorUsername}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">{post.authorDistrict || 'Portugal'}</span>
                  <span>•</span>
                </>)}
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Botão de Denúncia / Ações */}
        <button type="button" onClick={function () { return onReport(post); }} title="Denunciar publicação" className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-rose-400 cursor-pointer shrink-0">
          <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
        </button>
      </div>

      {/* Badges de Categoria & Destaque */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider" style={{
            backgroundColor: categoryInfo.badgeBg,
            borderColor: categoryInfo.borderColor,
            color: categoryInfo.accentColor,
        }}>
          <span>{categoryInfo.icon}</span>
          <span>{categoryInfo.name}</span>
        </span>

        {highlightBadgeDisplay(post.highlightBadge)}
        {post.isSuggestion && suggestionStatusBadge(post.suggestionStatus)}
      </div>

      {/* Título da Publicação */}
      <h2 className="mt-3 font-display text-base sm:text-lg font-black text-white leading-snug tracking-tight">
        {post.title}
      </h2>

      {/* Conteúdo Textual */}
      <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
        {post.content}
      </p>

      {/* Imagem Opcional */}
      {post.imageUrl && (<div className="mt-3 overflow-hidden rounded-2xl border border-white/10 max-h-80 bg-slate-950">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy"/>
        </div>)}

      {/* Módulo Especial: Enquetes / Debates */}
      {post.isPoll && post.pollOptions && post.pollOptions.length > 0 && (<div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wider">
            <lucide_react_1.Flame className="h-3.5 w-3.5 text-red-400"/>
            <span>{post.pollQuestion || 'Votação Aberta à Comunidade'}</span>
          </div>

          <div className="space-y-2">
            {post.pollOptions.map(function (opt) {
                var totalVotes = post.pollTotalVotes || 1;
                var percentage = Math.round((opt.votes / totalVotes) * 100);
                var hasVoted = Boolean(post.userVotedOptionId);
                var isSelected = post.userVotedOptionId === opt.id;
                return (<button key={opt.id} type="button" disabled={hasVoted} onClick={function () { return onVotePoll(post.id, opt.id); }} className={(0, utils_1.cn)('group relative w-full overflow-hidden rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer disabled:cursor-default', isSelected
                        ? 'border-red-400 bg-red-500/20 text-white font-bold ring-1 ring-red-400/50'
                        : 'border-white/10 bg-slate-900/90 text-slate-200 hover:border-red-400/40 hover:bg-slate-800')}>
                  {/* Barra de Progresso do Voto */}
                  {hasVoted && (<div className="absolute inset-y-0 left-0 bg-red-500/20 transition-all duration-500" style={{ width: "".concat(percentage, "%") }}/>)}

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="truncate">{opt.text}</span>
                    {hasVoted && (<span className="shrink-0 font-black tabular-nums text-red-300">
                        {percentage}% ({opt.votes})
                      </span>)}
                  </div>
                </button>);
            })}
          </div>

          {post.pollTotalVotes !== undefined && post.pollTotalVotes > 0 && (<div className="text-[11px] text-slate-400 text-right font-medium">
              {post.pollTotalVotes} votos registados
            </div>)}
        </div>)}

      {/* Módulo Especial: Sugestões para o Jogo (Votação 👍/👎) */}
      {post.isSuggestion && (<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-3.5">
          <div className="text-xs text-slate-300 font-medium">
            Apoias a inclusão desta ideia no Acorda Portugal?
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={function () { return onVoteSuggestion(post.id, 'up'); }} className={(0, utils_1.cn)('inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95', post.userVote === 'up'
                ? 'border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'border-white/10 bg-slate-900 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300')}>
              <lucide_react_1.ThumbsUp className="h-3.5 w-3.5"/>
              <span>{(_b = post.upvotesCount) !== null && _b !== void 0 ? _b : 0}</span>
            </button>

            <button type="button" onClick={function () { return onVoteSuggestion(post.id, 'down'); }} className={(0, utils_1.cn)('inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95', post.userVote === 'down'
                ? 'border-rose-400 bg-rose-500/30 text-rose-300'
                : 'border-white/10 bg-slate-900 text-slate-300 hover:border-rose-500/40 hover:text-rose-300')}>
              <lucide_react_1.ThumbsDown className="h-3.5 w-3.5"/>
              <span>{(_c = post.downvotesCount) !== null && _c !== void 0 ? _c : 0}</span>
            </button>
          </div>
        </div>)}

      {/* Footer: Gostos, Comentários, Partilhas e Favoritos */}
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs text-slate-400">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botão Gostar */}
          <button type="button" onClick={handleLikeClick} className={(0, utils_1.cn)('flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold transition-all cursor-pointer active:scale-90', post.hasLiked
            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
            : 'text-slate-400 hover:text-rose-400 hover:bg-white/5', likePulsing && 'scale-125')}>
            <lucide_react_1.Heart className={(0, utils_1.cn)('h-4 w-4', post.hasLiked && 'fill-rose-400')}/>
            <span className="tabular-nums">{post.likesCount}</span>
          </button>

          {/* Botão Comentários */}
          <button type="button" onClick={function () { return onOpenComments(post); }} className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold text-slate-400 transition-colors hover:text-emerald-400 hover:bg-white/5 cursor-pointer">
            <lucide_react_1.MessageSquare className="h-4 w-4"/>
            <span className="tabular-nums">{post.commentsCount}</span>
          </button>

          {/* Botão Partilhar */}
          <button type="button" onClick={handleShareClick} className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-bold text-slate-400 transition-colors hover:text-cyan-400 hover:bg-white/5 cursor-pointer">
            <lucide_react_1.Share2 className="h-4 w-4"/>
            <span>{copiedShare ? 'Copiado!' : post.sharesCount || 'Partilhar'}</span>
          </button>
        </div>

        {/* Botão Guardar / Favorito */}
        <button type="button" onClick={function () { return onSave(post.id); }} title={post.hasSaved ? 'Remover dos guardados' : 'Guardar publicação'} className={(0, utils_1.cn)('flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer', post.hasSaved
            ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
            : 'text-slate-400 hover:text-amber-400 hover:bg-white/5')}>
          <lucide_react_1.Bookmark className={(0, utils_1.cn)('h-4 w-4', post.hasSaved && 'fill-amber-400')}/>
        </button>
      </div>
    </article>);
}
