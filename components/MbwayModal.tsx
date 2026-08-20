'use client';

import React, { useState } from 'react';

interface MbwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    priceEuros?: number;
  } | null;
}

export default function MbwayModal({ isOpen, onClose, item }: MbwayModalProps) {
  const mbwayPhone = '911151577';
  const [copied, setCopied] = useState(false);
  const [senderPhone, setSenderPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mbwayPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone.trim()) {
      alert('Por favor introduz o teu número/nome para validação.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 transition-colors"
        >
          ✕
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
                📲
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Pagamento MB WAY</h3>
                <p className="text-xs text-zinc-400">Ativação rápida e direta na tua conta</p>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-5">
              <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                <span>Item selecionado:</span>
                <span className="text-emerald-400 font-bold truncate max-w-[200px]">{item.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total a transferir:</span>
                <span className="text-2xl font-black text-amber-400">€{item.priceEuros?.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  1. Envia o valor via MB WAY para:
                </label>
                <div className="flex items-center gap-2 bg-black/60 border border-emerald-500/40 rounded-xl p-3">
                  <span className="text-xl font-mono font-black text-emerald-400 flex-1 tracking-widest">
                    911 151 577
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 transition-all shadow-md active:scale-95"
                  >
                    {copied ? '✓ Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <form onSubmit={handleConfirm} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    2. O teu contacto ou nome de envio:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 919 000 000 ou O Teu Nome"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all mt-2 active:scale-95"
                >
                  Já enviei o MB WAY! Confirmar
                </button>
              </form>
            </div>

            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              Obrigado por apoiares o projeto independente Acorda Portugal!
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
              🇵🇹
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Pedido Registado!</h3>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              Recebemos a tua confirmação para <strong className="text-emerald-400">{item.title}</strong> (<strong>€{item.priceEuros?.toFixed(2)}</strong>). O item será validado e ativado no teu inventário.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-sm text-white transition-all"
            >
              Voltar à Loja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
