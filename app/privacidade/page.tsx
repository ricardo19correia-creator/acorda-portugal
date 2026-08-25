import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  CreditCard,
  Mail,
  ArrowLeft,
  Eye,
  FileText,
  Share2,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Acorda Portugal',
  description:
    'Política de Privacidade e Proteção de Dados da plataforma Acorda Portugal em conformidade com o RGPD.',
}

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <BackgroundFx />
      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Proteção de Dados & RGPD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Política de Privacidade
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs transition-all border border-slate-700 hover:border-cyan-500/40 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Início
            </Link>
          </div>

          <p className="text-xs font-mono text-slate-400">
            Última atualização: Agosto de 2026 • Em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD - UE 2016/679)
          </p>

          {/* Secção 1 */}
          <section className="space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs">
                01
              </span>
              <h2>Identificação do Responsável pelo Tratamento</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              A presente aplicação web e móvel <strong>Acorda Portugal: Desafio Nacional</strong> (disponível em{' '}
              <span className="text-cyan-400 font-mono">acordaportugal.pt</span>) é operada e gerida com o compromisso rigoroso de salvaguardar a privacidade e segurança dos seus utilizadores, respeitando as normas do Regulamento Geral sobre a Proteção de Dados (RGPD) e a legislação nacional aplicável.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3.5 py-2.5 rounded-xl border border-slate-800 mt-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Contacto oficial para suporte e privacidade:{' '}
                <strong className="text-cyan-300 font-mono">suporte@acordaportugal.pt</strong>
              </span>
            </div>
          </section>

          {/* Secção 2 */}
          <section className="space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs">
                02
              </span>
              <h2>Dados Recolhidos</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Recolhemos unicamente os dados estritamente necessários para o correto funcionamento da experiência de jogo, sincronização de partidas e autenticação segura:
            </p>
            <ul className="grid grid-cols-1 gap-3 pt-2">
              <li className="flex items-start gap-3 rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
                <UserCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <strong className="text-white block mb-0.5">Dados de Autenticação (Google OAuth / E-mail):</strong>
                  Nome público, endereço de e-mail, foto de perfil do Google e identificador único de utilizador (UID).
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
                <Database className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <strong className="text-white block mb-0.5">Dados de Jogo e Estatísticas:</strong>
                  Saldo virtual (€ Acorda), inventário e itens desbloqueados (avatares, títulos, molduras, ajudas), histórico de duelos 1v1, XP, nível, distrito e pontuações do modo solo.
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
                <CreditCard className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <strong className="text-white block mb-0.5">Dados de Transações:</strong>
                  Histórico de aquisição de moedas virtuais ou passes. Os detalhes de pagamento (cartões bancários, MB WAY) são processados por gateways externas certificadas (ex.: Stripe) com encriptação de ponta a ponta e <strong>nunca</strong> passam nem são armazenados nos nossos servidores.
                </div>
              </li>
            </ul>
          </section>

          {/* Secção 3 */}
          <section className="space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs">
                03
              </span>
              <h2>Finalidade do Tratamento de Dados</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Os dados dos utilizadores destinam-se exclusivamente às seguintes finalidades legítimas:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 pl-2 leading-relaxed">
              <li>Autenticar o jogador e manter a sessão ativa de forma segura.</li>
              <li>Guardar o progresso, conquistas e moedas virtuais no Google Firebase Firestore.</li>
              <li>Sincronizar duelos multijogador em tempo real e tabelas de liderança nacional e distrital.</li>
              <li>Prevenir fraudes, comportamentos abusivos e garantir a integridade da competição.</li>
              <li>Prestar apoio técnico e responder a pedidos de suporte.</li>
            </ul>
          </section>

          {/* Secção 4 */}
          <section className="space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs">
                04
              </span>
              <h2>Partilha de Dados com Terceiros</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Não vendemos, alugamos nem cedemos</strong> dados pessoais a terceiros para fins publicitários ou comerciais. A partilha de informação restringe-se aos fornecedores de infraestrutura indispensáveis ao funcionamento do serviço:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 pl-2 leading-relaxed">
              <li><strong>Google Firebase (Google Cloud):</strong> Alojamento seguro da base de dados Firestore e gestão de autenticação.</li>
              <li><strong>Processadores de Pagamento Autorizados:</strong> Execução segura de transações financeiras.</li>
            </ul>
          </section>

          {/* Secção 5 */}
          <section className="space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs">
                05
              </span>
              <h2>Direitos do Utilizador (RGPD)</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              De acordo com o Regulamento Geral sobre a Proteção de Dados, qualquer utilizador tem o direito de:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 pl-2 leading-relaxed">
              <li><strong>Direito de Acesso:</strong> Consultar todos os dados pessoais mantidos sobre a sua conta.</li>
              <li><strong>Direito de Retificação:</strong> Atualizar ou corrigir informações incompletas ou incorretas.</li>
              <li><strong>Direito ao Apagamento («Direito a ser Esquecido»):</strong> Solicitar a eliminação definitiva e irreversível da sua conta e de todo o histórico associado.</li>
              <li><strong>Direito à Portabilidade:</strong> Obter uma cópia estruturada dos seus dados de jogador.</li>
            </ul>
            <p className="text-sm text-slate-300 leading-relaxed pt-2">
              Para exercer qualquer um destes direitos, basta enviar um pedido por escrito para{' '}
              <strong className="text-cyan-300 font-mono">suporte@acordaportugal.pt</strong>.
            </p>
          </section>

          {/* Secção 6 - Cookies e Armazenamento Local */}
          <section className="space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs">
                06
              </span>
              <h2>Armazenamento Local e Cookies Técnicos</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              A aplicação utiliza armazenamento local (<span className="text-cyan-400 font-mono text-xs">localStorage</span>) e cookies técnicos estritamente necessários para memorizar preferências essenciais do jogador (como volume de som, tema escuro, estado da sessão e preferências cosméticas), sem rastreamento de navegação invasivo.
            </p>
          </section>

          {/* Footer Card */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <span>© 2026 Acorda Portugal: Desafio Nacional. Todos os direitos reservados.</span>
            <div className="flex items-center gap-4">
              <Link className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold" href="/termos">
                Termos e Condições
              </Link>
              <Link className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold" href="/">
                Início
              </Link>
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
