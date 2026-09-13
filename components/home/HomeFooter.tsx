'use client'

import React from 'react'
import Link from 'next/link'

export function HomeFooter() {
  const ESSENTIAL_LINKS = [
    { label: 'Suporte', href: '/ajuda' },
    { label: 'Termos', href: '/termos' },
    { label: 'Privacidade', href: '/privacidade' },
    { label: 'A Nossa História', href: '/historia' },
  ]

  return (
    <footer
      aria-label="Rodapé do Menu Principal"
      className="w-full border-t border-white/10 bg-slate-950/60 backdrop-blur-md mt-10 py-8 select-none"
    >
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Marca */}
        <div>
          <span className="font-display font-black text-sm tracking-wider uppercase text-white">
            ACORDA PORTUGAL
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            © 2026 Acorda Portugal. Todos os direitos reservados.
          </p>
        </div>

        {/* Links Essenciais */}
        <nav aria-label="Links Essenciais">
          <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
            {ESSENTIAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-emerald-400 transition-colors font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bandeira de Portugal */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Feito com orgulho em Portugal</span>
          <span className="inline-block h-3 w-4.5 overflow-hidden rounded-[2px] align-middle">
            <span className="flex h-full w-full">
              <span className="h-full w-2/5 bg-emerald-600" />
              <span className="h-full w-3/5 bg-red-600" />
            </span>
          </span>
        </div>
      </div>
    </footer>
  )
}
