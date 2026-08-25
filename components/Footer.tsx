'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';

export default function Footer() {
  const router = useRouter();
  const { user } = useAuth();

  const handleStartGame = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user && !auth?.currentUser) {
      router.push('/entrar?redirect=/jogar');
      return;
    }
    router.push('/jogar');
  };

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md py-8 px-4 text-center text-xs text-zinc-400">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-medium">
        <button type="button" onClick={handleStartGame} className="hover:text-emerald-400 transition-colors cursor-pointer">Jogar</button>
        <Link href="/ranking" className="hover:text-emerald-400 transition-colors">Rankings</Link>
        <Link href="/explorar" className="hover:text-emerald-400 transition-colors">Categorias</Link>
        <Link href="/portugal" className="hover:text-emerald-400 transition-colors">Portugal &amp; Mapa</Link>
        <Link href="/eventos" className="hover:text-emerald-400 transition-colors">Eventos</Link>
        <Link href="/explorar" className="hover:text-emerald-400 transition-colors">Explorar &amp; Sobre</Link>
        <Link href="/loja" className="hover:text-emerald-400 transition-colors">Loja</Link>
        <Link href="/termos" className="hover:text-emerald-400 transition-colors">Termos &amp; Privacidade</Link>
        <Link href="/ajuda" className="text-emerald-400 font-semibold hover:underline">Central de Ajuda</Link>
      </div>
      <p className="mt-4 text-[11px] text-zinc-600">
        © {new Date().getFullYear()} Acorda Portugal — Todos os direitos reservados.
      </p>
    </footer>
  );
}
