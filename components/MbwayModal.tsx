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
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length < 9) {
      alert('Por favor introduz um número de telemóvel válido com 9 dígitos.');
      return;
    }

    try {
      setLoading(true);
      setStatusMessage('A comunicar com a EuPago e a enviar notificação...');

      const res = await fetch('/api/pagamento/mbway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          amount: item.priceEuros,
          itemId: item.id,
        }),
      });

      const data = await res.json();

      if (data.sucesso === true || data.estado === 0 || data.sucesso !== false) {
        setIsSuccess(true);
        setStatusMessage('Pedido enviado para o teu telemóvel! Abre a app MB WAY e introduz o teu PIN para confirmar.');

        // Desbloquear o item no inventário local do jogador
        try {
          const savedInv = JSON.parse(localStorage.getItem('ap_user_inventory') || '[]');
          if (!savedInv.includes(item.id)) {
            const updatedInv = [...savedInv, item.id];
            localStorage.setItem('ap_user_inventory', JSON.stringify(updatedInv));
          }
        } catch (err) {
          console.error('Erro ao atualizar inventário local:', err);
        }
      } else {
        alert(data.mensagem || data.resposta || 'Não foi possível iniciar o pagamento. Tenta novamente.');
        setStatusMessage(null);
      }
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao processar o pagamento MB WAY.');
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhone('');
    setStatusMessage(null);
    setIsSuccess(false);
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

        {!isSuccess ? (
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
                <span>Artigo Selecionado:</span>
                <span className="text-emerald-400 font-bold truncate max-w-[200px]">{item.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total a pagar:</span>
                <span className="text-2xl font-black text-amber-400">€{item.priceEuros?.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={12}
                    className="w-full pl-16 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>A enviar pedido...</span>
                  </>
                ) : (
                  <>
                    <span>Pagar com MB WAY</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-[11px] text-zinc-500 text-center leading-relaxed">
              Receberás uma notificação instantânea da app MB WAY para autorizar a transação.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-30" />
              📲
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Notificação Enviada!</h3>
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-emerald-300 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 mb-6 text-xs text-zinc-400 text-left">
              <p className="flex justify-between mb-1">
                <span>Item:</span> <strong className="text-white">{item.title}</strong>
              </p>
              <p className="flex justify-between">
                <span>Valor:</span> <strong className="text-amber-400">€{item.priceEuros?.toFixed(2)}</strong>
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-sm hover:brightness-110 shadow-lg transition-all"
            >
              Concluído / Voltar à Loja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
