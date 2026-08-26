'use client';
"use strict";
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
exports.CreatePostModal = CreatePostModal;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var creators_service_1 = require("@/lib/creators-service");
var auth_provider_1 = require("@/components/auth-provider");
var utils_1 = require("@/lib/utils");
function CreatePostModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, onPostCreated = _a.onPostCreated, createPostFn = _a.createPostFn;
    var _b = (0, auth_provider_1.useAuth)(), user = _b.user, profile = _b.profile;
    var _c = (0, react_1.useState)('ideias'), category = _c[0], setCategory = _c[1];
    var _d = (0, react_1.useState)(''), title = _d[0], setTitle = _d[1];
    var _e = (0, react_1.useState)(''), content = _e[0], setContent = _e[1];
    var _f = (0, react_1.useState)(''), imageUrl = _f[0], setImageUrl = _f[1];
    var _g = (0, react_1.useState)(false), isAnonymous = _g[0], setIsAnonymous = _g[1];
    var _h = (0, react_1.useState)(false), isPoll = _h[0], setIsPoll = _h[1];
    var _j = (0, react_1.useState)(['Opção 1', 'Opção 2']), pollOptions = _j[0], setPollOptions = _j[1];
    var _k = (0, react_1.useState)(false), isSubmitting = _k[0], setIsSubmitting = _k[1];
    var _l = (0, react_1.useState)(null), errorMessage = _l[0], setErrorMessage = _l[1];
    if (!isOpen)
        return null;
    var handleAddPollOption = function () {
        if (pollOptions.length < 5) {
            setPollOptions(__spreadArray(__spreadArray([], pollOptions, true), ["Op\u00E7\u00E3o ".concat(pollOptions.length + 1)], false));
        }
    };
    var handleRemovePollOption = function (index) {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter(function (_, i) { return i !== index; }));
        }
    };
    var handlePollOptionChange = function (index, val) {
        var updated = __spreadArray([], pollOptions, true);
        updated[index] = val;
        setPollOptions(updated);
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var newPost, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setErrorMessage(null);
                    if (!user && !isAnonymous) {
                        setErrorMessage('Precisas de ter sessão iniciada para publicar.');
                        return [2 /*return*/];
                    }
                    if (title.trim().length < 4) {
                        setErrorMessage('O título deve conter pelo menos 4 caracteres.');
                        return [2 /*return*/];
                    }
                    if (content.trim().length < 10) {
                        setErrorMessage('O conteúdo deve conter pelo menos 10 caracteres.');
                        return [2 /*return*/];
                    }
                    if (isPoll && pollOptions.some(function (o) { return !o.trim(); })) {
                        setErrorMessage('Todas as opções do debate devem estar preenchidas.');
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, createPostFn({
                            authorId: (user === null || user === void 0 ? void 0 : user.uid) || 'anon_user',
                            authorName: (profile === null || profile === void 0 ? void 0 : profile.displayName) || (user === null || user === void 0 ? void 0 : user.displayName) || ((_a = user === null || user === void 0 ? void 0 : user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'Jogador',
                            authorUsername: (profile === null || profile === void 0 ? void 0 : profile.username) || ((_b = user === null || user === void 0 ? void 0 : user.displayName) === null || _b === void 0 ? void 0 : _b.toLowerCase().replace(/\s+/g, '_')) || 'jogador',
                            authorAvatar: (profile === null || profile === void 0 ? void 0 : profile.photoURL) || (user === null || user === void 0 ? void 0 : user.photoURL) || '/images/avatars/avatar_default.png',
                            authorLevel: (profile === null || profile === void 0 ? void 0 : profile.level) || 1,
                            authorDistrict: (profile === null || profile === void 0 ? void 0 : profile.district) || 'Portugal',
                            authorTitle: (profile === null || profile === void 0 ? void 0 : profile.equippedTitle) || 'Cidadão Ativo',
                            category: category,
                            title: title,
                            content: content,
                            imageUrl: imageUrl.trim() || undefined,
                            isAnonymous: category === 'desabafos' ? isAnonymous : false,
                            isSuggestion: category === 'sugestoes',
                            isPoll: category === 'debates' || isPoll,
                            pollQuestion: isPoll ? title : undefined,
                            pollOptions: isPoll ? pollOptions : undefined,
                        })];
                case 2:
                    newPost = _c.sent();
                    onPostCreated(newPost);
                    onClose();
                    // Limpar formulário
                    setTitle('');
                    setContent('');
                    setImageUrl('');
                    setIsAnonymous(false);
                    setIsPoll(false);
                    setPollOptions(['Opção 1', 'Opção 2']);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    setErrorMessage((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Ocorreu um erro ao publicar. Tenta novamente.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-500/40 bg-slate-900 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✍️</span>
            <div>
              <h2 className="font-display text-lg font-black uppercase text-white tracking-wide">
                Criar Nova Publicação
              </h2>
              <p className="text-xs text-slate-400">
                A tua voz na comunidade do Acorda Portugal
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <lucide_react_1.X className="h-5 w-5"/>
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          {errorMessage && (<div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-300">
              <lucide_react_1.AlertCircle className="h-4 w-4 shrink-0 text-rose-400"/>
              <span>{errorMessage}</span>
            </div>)}

          {/* Seleção de Categoria */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Categoria Oficial
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {creators_service_1.CREATOR_CATEGORIES.map(function (cat) {
            var isSelected = category === cat.slug;
            return (<button key={cat.slug} type="button" onClick={function () {
                    setCategory(cat.slug);
                    if (cat.slug === 'debates')
                        setIsPoll(true);
                }} className={(0, utils_1.cn)('flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition-all cursor-pointer', isSelected
                    ? 'border-emerald-400 bg-emerald-500/20 text-white ring-1 ring-emerald-400/50 font-black'
                    : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-white')}>
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>);
        })}
            </div>
          </div>

          {/* Título da Publicação */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-black uppercase tracking-wider text-slate-300">
                Título da Publicação
              </label>
              <span className="text-slate-400 tabular-nums">{title.length}/120</span>
            </div>
            <input type="text" required maxLength={120} value={title} onChange={function (e) { return setTitle(e.target.value); }} placeholder="Ex: E se pudéssemos desafiar jogadores do nosso distrito?" className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"/>
          </div>

          {/* Conteúdo da Publicação */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-black uppercase tracking-wider text-slate-300">
                Conteúdo / História / Opinião
              </label>
              <span className="text-slate-400 tabular-nums">{content.length}/2000</span>
            </div>
            <textarea required rows={5} maxLength={2000} value={content} onChange={function (e) { return setContent(e.target.value); }} placeholder="Escreve aqui o teu texto com detalhe..." className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-y"/>
          </div>

          {/* Secção de Enquete / Debate (se ativo) */}
          {(category === 'debates' || isPoll) && (<div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                  <lucide_react_1.Flame className="h-4 w-4 text-red-400"/>
                  Opções de Votação (Enquete)
                </span>
                {pollOptions.length < 5 && (<button type="button" onClick={handleAddPollOption} className="inline-flex items-center gap-1 text-[11px] font-bold text-red-300 hover:text-white cursor-pointer">
                    <lucide_react_1.Plus className="h-3 w-3"/>
                    Adicionar Opção
                  </button>)}
              </div>

              <div className="space-y-2">
                {pollOptions.map(function (opt, idx) { return (<div key={idx} className="flex items-center gap-2">
                    <input type="text" value={opt} onChange={function (e) { return handlePollOptionChange(idx, e.target.value); }} placeholder={"Op\u00E7\u00E3o ".concat(idx + 1)} className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-red-400"/>
                    {pollOptions.length > 2 && (<button type="button" onClick={function () { return handleRemovePollOption(idx); }} className="p-2 text-slate-400 hover:text-rose-400 cursor-pointer">
                        <lucide_react_1.Trash2 className="h-3.5 w-3.5"/>
                      </button>)}
                  </div>); })}
              </div>
            </div>)}

          {/* URL de Imagem Opcional */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Link de Imagem (Opcional)
            </label>
            <div className="relative">
              <lucide_react_1.Image className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"/>
              <input type="url" value={imageUrl} onChange={function (e) { return setImageUrl(e.target.value); }} placeholder="https://exemplo.com/foto.jpg" className="w-full rounded-xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-emerald-400"/>
            </div>
          </div>

          {/* Opção de Publicação Anónima para Desabafos */}
          {category === 'desabafos' && (<div className="flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-950/20 p-3.5">
              <div className="flex items-center gap-2.5">
                <lucide_react_1.EyeOff className="h-4 w-4 text-purple-400"/>
                <div>
                  <div className="text-xs font-bold text-white">Publicar Anonimamente</div>
                  <div className="text-[11px] text-slate-400">O teu nome e distrito não serão revelados publicamente.</div>
                </div>
              </div>
              <input type="checkbox" checked={isAnonymous} onChange={function (e) { return setIsAnonymous(e.target.checked); }} className="h-5 w-5 rounded accent-purple-500 cursor-pointer"/>
            </div>)}

          {/* Botões de Submissão */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer">
              Cancelar
            </button>

            <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'A Publicar...' : 'PUBLICAR 🇵🇹'}
            </button>
          </div>
        </form>
      </div>
    </div>);
}
