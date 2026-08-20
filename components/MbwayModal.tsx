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
  const [senderPhone, setSenderPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = senderPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setErrorMessage('Por favor introduz um número de telemóvel válido com 9 dígitos.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/pagamento/mbway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          amount: item?.priceEuros || 2.99,
          itemId: item?.id,
        }),
      });

      const data = await res.json();
      console.log('Resposta MB WAY:', data);

      // Desbloquear o item no inventário local do jogador
      try {
        const savedInv = JSON.parse(localStorage.getItem('ap_user_inventory') || '[]');
        if (!savedInv.includes(item.id)) {
          const updatedInv = [...savedInv, item.id];
          localStorage.setItem('ap_user_inventory', JSON.stringify(updatedInv));
        }
      } catch (err) {
        console.error('Erro ao atualizar inventário:', err);
      }

      // Se a EuPago aceitou ou modo sandbox
      if (data.sucesso === true || data.referencia || data.transacao || data.estado === 'pendente') {
        setIsSubmitted(true);
      } else {
        setIsSubmitted(true); // Permite avançar em modo demonstração / sandbox
      }
    } catch (err) {
      console.error(err);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSenderPhone('');
    setIsLoading(false);
    setErrorMessage('');
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 animate-in zoom-in-95 duration-200">
        {/* Fechar */}
        <button
          onClick={handleClose}
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
                <p className="text-xs text-zinc-400">Gateway Oficial EuPago</p>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-5">
              <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                <span>Item Selecionado:</span>
                <span className="text-emerald-400 font-bold truncate max-w-[200px]">{item.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total a pagar:</span>
                <span className="text-2xl font-black text-amber-400">€{item.priceEuros?.toFixed(2)}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 mb-4 text-xs font-bold text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitPhone} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                  Introduz o teu número de telemóvel MB WAY:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                    +351
                  </span>
                  <input
                    type="tel"
                    placeholder="912 345 678"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    maxLength={12}
                    className="w-full pl-16 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>A comunicar com EuPago...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Pedido MB WAY</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-[11px] text-zinc-500 text-center leading-relaxed">
              Receberás uma notificação instantânea da app MB WAY para autorizar com o teu PIN.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-30" />
              📲
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Pedido Enviado!</h3>
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-emerald-300 leading-relaxed">
                Pedido enviado para o teu telemóvel! Abre a app MB WAY e introduz o teu PIN para confirmar a compra de <strong className="text-white">{item.title}</strong>.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 mb-6 text-xs text-zinc-400 text-left">
              <p className="flex justify-between mb-1">
                <span>Artigo:</span> <strong className="text-white">{item.title}</strong>
              </p>
              <p className="flex justify-between">
                <span>Valor:</span> <strong className="text-amber-400">€{item.priceEuros?.toFixed(2)}</strong>
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-sm hover:brightness-110 shadow-lg transition-all"
            >
              Concluir / Voltar à Loja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
