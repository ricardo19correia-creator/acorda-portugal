'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import {
  ShieldCheck,
  Mail,
  MapPin,
  ExternalLink,
  Radio,
  FileText,
  Lock,
  Gamepad2,
  BookOpen,
} from 'lucide-react'

export function SiteFooter() {
  const pathname = usePathname()

  // O rodapé institucional é exibido na homepage e nas páginas institucionais
  const isInstitutionalPage =
    pathname === '/' ||
    pathname === '/desafio-nacional' ||
    pathname === '/beta' ||
    pathname === '/termos' ||
    pathname === '/privacidade' ||
    pathname === '/ajuda'

  if (!isInstitutionalPage) {
    return null
  }

  return (
    <footer className="relative border-t border-[#D4AF37]/20 bg-[#030b06] backdrop-blur-xl mt-20 select-none text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Topo do Rodapé: Logo & Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          
          {/* Coluna 1 & 2: Descrição Institucional (2 colunas) */}
          <div className="lg:col-span-2 space-y-4 max-w-sm">
            <Link
              href="/"
              aria-label="Acorda Portugal — Plataforma Nacional"
              className="inline-block"
            >
              <BrandLogo size="md" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-300">
              Plataforma nacional e independente de informação, participação cívica e comunicação em tempo real. De norte a sul e nas ilhas, a informação começa nas pessoas.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Rede Nacional Cívica Ativa</span>
            </div>
          </div>

          {/* Coluna 2: Plataforma Cívica */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#E5C158] font-mono">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#acorda-portugal" className="hover:text-emerald-400 transition-colors">
                  Acorda Portugal
                </a>
              </li>
              <li>
                <a href="/#noticias" className="hover:text-emerald-400 transition-colors">
                  Informação e Notícias
                </a>
              </li>
              <li>
                <a href="/#voz-cidadaos" className="hover:text-emerald-400 transition-colors">
                  A Voz dos Cidadãos
                </a>
              </li>
              <li>
                <a href="/#diretos" className="hover:text-emerald-400 transition-colors">
                  Diretos e Acontecimentos
                </a>
              </li>
              <li>
                <a href="/#verificacao" className="hover:text-emerald-400 transition-colors">
                  Verificação de Informação
                </a>
              </li>
              <li>
                <a href="/#radar" className="hover:text-emerald-400 transition-colors">
                  Radar Nacional
                </a>
              </li>
              <li>
                <Link href="/jogar" className="hover:text-amber-400 transition-colors font-semibold">
                  Desafio Nacional
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Iniciativas Culturais & Aplicações */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Iniciativas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/desafio-nacional" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>Desafio Nacional</span>
                </Link>
              </li>
              <li>
                <Link href="/jogar" className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5" title="Aceder à plataforma de Quiz">
                  <Gamepad2 className="w-3 h-3 text-slate-500" />
                  <span>Plataforma de Quiz</span>
                </Link>
              </li>
              <li>
                <Link href="/download" className="hover:text-emerald-400 transition-colors">
                  Aplicação Android (APK)
                </Link>
              </li>
              <li>
                <Link href="/beta" className="hover:text-emerald-400 transition-colors">
                  Beta Público Oficial
                </Link>
              </li>
              <li>
                <Link href="/ajuda" className="hover:text-emerald-400 transition-colors">
                  Central de Ajuda & Apoio
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Informação Legal & Contactos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Legal & Contactos
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/termos" className="hover:text-emerald-400 transition-colors">
                  Termos de Utilização
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-emerald-400 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <span className="text-slate-400 block pt-1">Contacto Institucional:</span>
                <a
                  href="mailto:contacto@acordaportugal.pt"
                  className="font-mono text-emerald-400 hover:underline block break-all text-[11px]"
                >
                  contacto@acordaportugal.pt
                </a>
              </li>
              <li className="pt-1 text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Portugal Continental & Ilhas</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Linha Final de Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 Acorda Portugal — Plataforma Nacional Independente</p>

          <p className="text-center font-medium tracking-wide">
            Uma criação de{' '}
            <Link
              href="/beta"
              className="font-bold text-slate-200 hover:text-emerald-400 transition-colors underline decoration-emerald-500/30 underline-offset-4"
              title="Acorda Portugal — Informação e Cidadania"
            >
              Riky Moreira
            </Link>{' '}
            🇵🇹
          </p>

          <p className="flex items-center gap-1.5">
            Feito com orgulho em Portugal
            <span className="inline-block h-3 w-4.5 overflow-hidden rounded-[2px] align-middle">
              <span className="flex h-full w-full">
                <span className="h-full w-2/5 bg-[#006644]" />
                <span className="h-full w-3/5 bg-[#ef4444]" />
              </span>
            </span>
          </p>
        </div>

      </div>
    </footer>
  )
}
