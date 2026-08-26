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
exports.CreatorsCommentsDrawer = CreatorsCommentsDrawer;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var creators_service_1 = require("@/lib/creators-service");
var auth_provider_1 = require("@/components/auth-provider");
var user_avatar_1 = require("@/components/user-avatar");
function CreatorsCommentsDrawer(_a) {
    var _this = this;
    var post = _a.post, isOpen = _a.isOpen, onClose = _a.onClose, onCommentAdded = _a.onCommentAdded;
    var _b = (0, auth_provider_1.useAuth)(), user = _b.user, profile = _b.profile;
    var _c = (0, react_1.useState)([]), comments = _c[0], setComments = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(''), newCommentText = _e[0], setNewCommentText = _e[1];
    var _f = (0, react_1.useState)(null), replyingTo = _f[0], setReplyingTo = _f[1];
    var _g = (0, react_1.useState)(false), isSubmitting = _g[0], setIsSubmitting = _g[1];
    var _h = (0, react_1.useState)(null), errorMsg = _h[0], setErrorMsg = _h[1];
    (0, react_1.useEffect)(function () {
        if (isOpen && post) {
            setLoading(true);
            (0, creators_service_1.getPostComments)(post.id)
                .then(function (data) { return setComments(data); })
                .finally(function () { return setLoading(false); });
        }
        else {
            setComments([]);
            setReplyingTo(null);
            setNewCommentText('');
            setErrorMsg(null);
        }
    }, [isOpen, post]);
    if (!isOpen || !post)
        return null;
    var handleSendComment = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var created_1, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    setErrorMsg(null);
                    if (!user) {
                        setErrorMsg('Precisas de iniciar sessão para comentar.');
                        return [2 /*return*/];
                    }
                    if (newCommentText.trim().length < 2) {
                        setErrorMsg('O comentário não pode estar vazio.');
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, creators_service_1.addPostComment)({
                            postId: post.id,
                            authorId: user.uid,
                            authorName: (profile === null || profile === void 0 ? void 0 : profile.displayName) || user.displayName || 'Jogador',
                            authorUsername: (profile === null || profile === void 0 ? void 0 : profile.username) || ((_a = user.displayName) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(/\s+/g, '_')) || 'jogador',
                            authorAvatar: (profile === null || profile === void 0 ? void 0 : profile.photoURL) || user.photoURL || '/images/avatars/avatar_default.png',
                            authorLevel: (profile === null || profile === void 0 ? void 0 : profile.level) || 1,
                            authorDistrict: (profile === null || profile === void 0 ? void 0 : profile.district) || 'Portugal',
                            authorTitle: (profile === null || profile === void 0 ? void 0 : profile.equippedTitle) || 'Cidadão Ativo',
                            content: newCommentText,
                            parentId: (replyingTo === null || replyingTo === void 0 ? void 0 : replyingTo.id) || null,
                        })];
                case 2:
                    created_1 = _b.sent();
                    if (replyingTo) {
                        setComments(function (prev) {
                            return prev.map(function (c) {
                                if (c.id === replyingTo.id) {
                                    return __assign(__assign({}, c), { replies: __spreadArray(__spreadArray([], (c.replies || []), true), [created_1], false) });
                                }
                                return c;
                            });
                        });
                    }
                    else {
                        setComments(function (prev) { return __spreadArray(__spreadArray([], prev, true), [created_1], false); });
                    }
                    onCommentAdded(post.id);
                    setNewCommentText('');
                    setReplyingTo(null);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    setErrorMsg((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Erro ao enviar comentário.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-slate-900 shadow-2xl">
        {/* Header da Gaveta */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <lucide_react_1.MessageSquare className="h-5 w-5 text-emerald-400"/>
            <div>
              <h3 className="font-display text-sm font-black uppercase text-white tracking-wide">
                Comentários ({post.commentsCount + (comments.length - post.commentsCount > 0 ? comments.length - post.commentsCount : 0)})
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{post.title}</p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <lucide_react_1.X className="h-5 w-5"/>
          </button>
        </div>

        {/* Lista de Comentários */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading ? (<div className="flex flex-col items-center justify-center py-12 text-xs text-slate-400 gap-2 animate-pulse">
              <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"/>
              <span>A carregar conversas...</span>
            </div>) : comments.length === 0 ? (<div className="text-center py-12 text-slate-400 space-y-2">
              <div className="text-3xl">💬</div>
              <div className="font-bold text-white text-sm">Ainda não há comentários</div>
              <p className="text-xs">Sê o primeiro a participar e dar a tua opinião!</p>
            </div>) : (comments.map(function (comm) { return (<div key={comm.id} className="space-y-2.5">
                {/* Comentário Principal */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <user_avatar_1.UserAvatar avatarUrl={comm.authorAvatar} size="sm"/>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{comm.authorName}</span>
                          {comm.isOfficial && <span className="text-emerald-400 text-xs">✓</span>}
                          {comm.authorLevel && (<span className="rounded-full bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-black text-amber-400">
                              Nv. {comm.authorLevel}
                            </span>)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {comm.authorDistrict && "".concat(comm.authorDistrict, " \u2022 ")}
                          {new Date(comm.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <button type="button" onClick={function () { return setReplyingTo(comm); }} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                      Responder
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pl-8">
                    {comm.content}
                  </p>
                </div>

                {/* Respostas Aninhadas (Nível 2) */}
                {comm.replies && comm.replies.length > 0 && (<div className="pl-6 space-y-2 border-l-2 border-emerald-500/30 ml-3">
                    {comm.replies.map(function (reply) { return (<div key={reply.id} className="rounded-2xl border border-white/5 bg-slate-950/90 p-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <user_avatar_1.UserAvatar avatarUrl={reply.authorAvatar} size="xs"/>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{reply.authorName}</span>
                            {reply.isOfficial && <span className="text-emerald-400 text-xs">✓</span>}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reply.createdAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-6">
                          {reply.content}
                        </p>
                      </div>); })}
                  </div>)}
              </div>); }))}
        </div>

        {/* Formulário de Envio no Fundo */}
        <div className="border-t border-white/10 p-3 sm:p-4 bg-slate-950">
          {errorMsg && (<div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-rose-400">
              <lucide_react_1.AlertCircle className="h-3.5 w-3.5"/>
              <span>{errorMsg}</span>
            </div>)}

          {replyingTo && (<div className="mb-2 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300">
              <span className="truncate">A responder a <strong>@{replyingTo.authorUsername}</strong></span>
              <button type="button" onClick={function () { return setReplyingTo(null); }} className="text-slate-400 hover:text-white cursor-pointer ml-2">
                <lucide_react_1.X className="h-3.5 w-3.5"/>
              </button>
            </div>)}

          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input type="text" required maxLength={400} value={newCommentText} onChange={function (e) { return setNewCommentText(e.target.value); }} placeholder={user ? 'Escreve um comentário...' : 'Inicia sessão para comentar...'} disabled={!user || isSubmitting} className="flex-1 rounded-xl border border-white/15 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 disabled:opacity-50"/>

            <button type="submit" disabled={!user || isSubmitting || !newCommentText.trim()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0">
              <lucide_react_1.Send className="h-4 w-4"/>
            </button>
          </form>
        </div>
      </div>
    </div>);
}
