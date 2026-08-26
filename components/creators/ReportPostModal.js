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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportPostModal = ReportPostModal;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var creators_service_1 = require("@/lib/creators-service");
var auth_provider_1 = require("@/components/auth-provider");
var REPORT_REASONS = [
    { value: 'spam', label: 'Spam ou Publicidade Indesejada', desc: 'Mensagens repetitivas ou links comerciais.' },
    { value: 'assedio', label: 'Assédio ou Intimidação', desc: 'Ataques pessoais direcionados a utilizadores.' },
    { value: 'discurso_odio', label: 'Discurso de Ódio', desc: 'Conteúdo discriminatório ou ofensivo.' },
    { value: 'informacao_pessoal', label: 'Exposição de Dados Pessoais', desc: 'Partilha de contactos ou dados privados.' },
    { value: 'conteudo_sexual', label: 'Conteúdo Explícito ou Impróprio', desc: 'Imagens ou textos de teor adulto.' },
    { value: 'violencia', label: 'Ameaças ou Violência', desc: 'Incentivo à agressão ou violência física.' },
    { value: 'fraude', label: 'Fraude ou Esquema Enganoso', desc: 'Tentativas de burla ou desinformação perigosa.' },
    { value: 'outro', label: 'Outro Motivo', desc: 'Violação das regras de convivência comunitária.' },
];
function ReportPostModal(_a) {
    var _this = this;
    var post = _a.post, isOpen = _a.isOpen, onClose = _a.onClose;
    var user = (0, auth_provider_1.useAuth)().user;
    var _b = (0, react_1.useState)('spam'), selectedReason = _b[0], setSelectedReason = _b[1];
    var _c = (0, react_1.useState)(''), details = _c[0], setDetails = _c[1];
    var _d = (0, react_1.useState)(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var _e = (0, react_1.useState)(false), submittedSuccess = _e[0], setSubmittedSuccess = _e[1];
    if (!isOpen || !post)
        return null;
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, creators_service_1.reportPost)({
                            postId: post.id,
                            reporterId: (user === null || user === void 0 ? void 0 : user.uid) || 'anon_reporter',
                            reason: selectedReason,
                            details: details,
                        })];
                case 2:
                    _a.sent();
                    setSubmittedSuccess(true);
                    setTimeout(function () {
                        setSubmittedSuccess(false);
                        onClose();
                    }, 2000);
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    alert('Erro ao enviar denúncia. Tenta novamente.');
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/40 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950">
          <div className="flex items-center gap-2 text-rose-400">
            <lucide_react_1.ShieldAlert className="h-5 w-5"/>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Denunciar Publicação
            </h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <lucide_react_1.X className="h-4 w-4"/>
          </button>
        </div>

        {submittedSuccess ? (<div className="p-8 text-center space-y-3">
            <lucide_react_1.CheckCircle className="h-12 w-12 text-emerald-400 mx-auto animate-bounce"/>
            <h4 className="font-display text-base font-black text-white uppercase">
              Denúncia Registada com Sucesso
            </h4>
            <p className="text-xs text-slate-300">
              A equipa de moderação do Acorda Portugal irá analisar esta publicação com a maior brevidade. Obrigado por manteres a nossa comunidade segura.
            </p>
          </div>) : (<form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Seleciona o Motivo Principal
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map(function (r) { return (<label key={r.value} className={"flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ".concat(selectedReason === r.value
                    ? 'border-rose-500 bg-rose-500/15 text-white'
                    : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20')}>
                    <input type="radio" name="report_reason" checked={selectedReason === r.value} onChange={function () { return setSelectedReason(r.value); }} className="mt-0.5 accent-rose-500"/>
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-white">{r.label}</span>
                      <span className="text-[11px] text-slate-400">{r.desc}</span>
                    </div>
                  </label>); })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Detalhes Adicionais (Opcional)
              </label>
              <textarea rows={2} maxLength={400} value={details} onChange={function (e) { return setDetails(e.target.value); }} placeholder="Descreve brevemente o problema..." className="w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-rose-400"/>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50">
                {isSubmitting ? 'A Enviar...' : 'Submeter Denúncia'}
              </button>
            </div>
          </form>)}
      </div>
    </div>);
}
