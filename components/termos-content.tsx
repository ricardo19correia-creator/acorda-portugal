'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  ShieldCheck,
  UserCheck,
  Gamepad2,
  Trophy,
  Coins,
  Scale,
  MessageSquare,
  Swords,
  Database,
  Lock,
  Eye,
  Trash2,
  RefreshCw,
  Mail,
  Calendar,
  ArrowUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { BackgroundFx } from '@/components/background-fx'

interface SectionItem {
  id: string
  number: string
  title: string
  subtitle: string
  category: 'termos' | 'privacidade' | 'contacto'
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

export function TermosContent() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const SECTIONS: SectionItem[] = [
    {
      id: '1-termos-de-utilizacao',
      number: '01',
      title: 'Termos de Utilização',
      subtitle: 'O propósito do Acorda Portugal e a aceitação das condições',
      category: 'termos',
      icon: FileText,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Bem-vindo ao <strong>Acorda Portugal: Desafio Nacional</strong> (disponível em{' '}
            <span className="text-emerald-400 font-mono">acordaportugal.pt</span> e aplicação móvel).
            A nossa plataforma é um jogo interativo de perguntas e respostas dedicado ao conhecimento,
            cultura, história, geografia, desporto, gastronomia e património de Portugal.
          </p>
          <p>
            O acesso, registo de conta e participação em qualquer modo de jogo pressupõem a leitura e aceitação
            integral destes Termos &amp; Privacidade. Se não concordares com algum ponto, deves interromper o
            uso da aplicação.
          </p>
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              Fins Estritamente Pessoais e Educativos
            </h4>
            <p className="text-xs text-slate-400">
              O serviço destina-se a fins lúdicos, culturais e recreativos individuais. É proibido qualquer uso
              comercial não autorizado ou exploração indevida da plataforma.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: '2-a-tua-conta',
      number: '02',
      title: 'A tua conta',
      subtitle: 'Criação, utilização e proteção das tuas credenciais',
      category: 'termos',
      icon: UserCheck,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Para guardar o teu progresso, subir de nível, acumular Pontos de Experiência (XP), receber recompensas diárias
            e representar o teu distrito nos rankings nacionais, é necessário criar uma conta através de autenticação
            Google ou e-mail.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong>Responsabilidade:</strong> És o único responsável pela guarda da tua palavra-passe e por todas
                as atividades efetuadas através da tua conta.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong>Acesso indevido:</strong> Se suspeitares de qualquer utilização não autorizada, deves alterar a tua
                palavra-passe e avisar imediatamente o suporte.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong>Uma conta por jogador:</strong> A criação abusiva de múltiplas contas para adulterar rankings ou
                recompensas não é permitida.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '3-regras-de-utilizacao',
      number: '03',
      title: 'Regras de utilização',
      subtitle: 'Espírito desportivo, jogo limpo e condutas proibidas',
      category: 'termos',
      icon: Scale,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            O Acorda Portugal baseia-se no fair-play e no respeito entre todos os participantes. Esperamos que todos joguem
            de forma honesta e cordial.
          </p>
          <div className="rounded-xl bg-rose-950/20 border border-rose-900/40 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Práticas Estritamente Proibidas
            </h4>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1.5 pl-1">
              <li>Uso de bots, automações, scripts ou extensões para responder ou obter vantagem desleal;</li>
              <li>Modificação de código do jogo, exploração de vulnerabilidades (exploits) ou adulteração de dados de rede;</li>
              <li>Nomes de utilizador, fotografias de perfil ou mensagens ofensivas, injuriosas, racistas ou discriminatórias;</li>
              <li>Tentativas de usurpação de identidade de outros jogadores ou de elementos da equipa.</li>
            </ul>
          </div>
          <p className="text-xs text-slate-400">
            A infração destas regras pode originar a anulação de pontuações fraudulentas, suspensão preventiva ou
            cancelamento definitivo da conta sem aviso prévio.
          </p>
        </div>
      ),
    },
    {
      id: '4-conteudo-enviado-pelos-utilizadores',
      number: '04',
      title: 'Conteúdo enviado pelos utilizadores',
      subtitle: 'Sugestões de perguntas, reporte de gralhas e feedback',
      category: 'termos',
      icon: MessageSquare,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            A comunidade do Acorda Portugal é convidada a sugerir novas perguntas culturais, reportar eventuais gralhas em
            questões existentes e partilhar sugestões de melhoria.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong>Licença de utilização:</strong> Ao submeteres perguntas, reportes ou sugestões, concedes ao Acorda
                Portugal uma licença gratuita e não exclusiva para rever, adaptar e integrar esse conteúdo no jogo.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong>Originalidade e respeito:</strong> Comprometes-te a não enviar conteúdos protegidos por direitos de
                autor de terceiros sem autorização, nem conteúdos ofensivos ou falsos.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '5-jogo-xp-e-progresso',
      number: '05',
      title: 'Jogo, XP e progresso',
      subtitle: 'Cálculo de pontos, patamares de nível e justiça nos rankings',
      category: 'termos',
      icon: Trophy,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Os questionários do Acorda Portugal funcionam com cronómetros por pergunta, precisão de respostas e rondas por
            categorias.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <span>
                <strong>Pontos de Experiência (XP):</strong> São atribuídos unicamente através da participação legítima nos
                desafios, duelos e missões do jogo.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <span>
                <strong>Classificações:</strong> As tabelas nacional, distrital e por categoria refletem o mérito dos
                jogadores. A equipa reserva-se o direito de calibrar ou anular pontuações afetadas por erros de sistema ou
                comportamento desleal para salvaguardar a integridade de todos.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '6-multiplayer-e-funcionalidades-online',
      number: '06',
      title: 'Multiplayer e funcionalidades online',
      subtitle: 'Duelos 1v1 em direto, emparelhamento e requisitos de rede',
      category: 'termos',
      icon: Swords,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Nos Duelos 1v1 e modos competitivos em direto, jogas em tempo real contra outros participantes emparelhados pelo
            sistema.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
              <h5 className="text-xs font-bold text-cyan-400 mb-1">Ligação à Internet</h5>
              <p className="text-xs text-slate-400">
                Uma ligação estável é fundamental. Falhas de conectividade ou encerramento da app durante uma partida em
                curso podem ser contabilizados como abandono/derrota.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5">
              <h5 className="text-xs font-bold text-cyan-400 mb-1">Interação Saudável</h5>
              <p className="text-xs text-slate-400">
                O envio de provocações ou emotes autorizados no jogo deve respeitar o espírito lúdico. O assédio repetido ou
                tentativas de bloqueio intencional de partidas não são tolerados.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: '7-compras-e-acordas',
      number: '07',
      title: 'Compras e Acordas',
      subtitle: 'A moeda virtual oficial, ajudas cosméticas e ausência de valor real',
      category: 'termos',
      icon: Coins,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            As <strong>Acordas</strong> (€ Acorda) são a moeda virtual oficial do jogo. São utilizadas para desbloquear
            utilidades e ajudas (como o <em>50/50</em> ou <em>Congelar Tempo</em>) e itens cosméticos de personalização
            (avatares, molduras de perfil, títulos de honra e arenas visuais).
          </p>
          <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Regras e Condições Reais das Acordas
            </h4>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1.5 pl-1">
              <li>
                <strong>Como obter:</strong> Podes ganhar Acordas ao subir de nível, cumprir missões e participar em eventos,
                ou opcionalmente adquirir pacotes na Loja Oficial (via Google Play In-App Billing ou Stripe).
              </li>
              <li>
                <strong>Natureza exclusivamente virtual:</strong> As Acordas não são euros reais, não têm valor fiduciário fora
                do jogo e não podem ser convertidas em dinheiro real nem transferidas entre utilizadores.
              </li>
              <li>
                <strong>Política de aquisição:</strong> As compras de itens cosméticos ou moedas virtuais são definitivas logo
                que os bens digitais são creditados na tua conta, sem direito a reembolso exceto nas situações imperativas
                previstas na lei de defesa do consumidor.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: '8-privacidade-e-protecao-de-dados',
      number: '08',
      title: 'Privacidade e Proteção de Dados',
      subtitle: 'O nosso compromisso com a transparência e conformidade com o RGPD',
      category: 'privacidade',
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/60 p-4 text-xs sm:text-sm text-emerald-200">
            <strong>Proteção e RGPD:</strong> O tratamento de dados pessoais no Acorda Portugal é realizado em total
            conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento UE 2016/679) e a legislação
            portuguesa aplicável (Lei n.º 58/2019).
          </div>
          <p>
            O responsável pelo tratamento dos dados é a equipa do <strong>Acorda Portugal</strong>. O nosso compromisso é
            simples: recolher apenas o estritamente necessário para que possas desfrutar do jogo, guardar as tuas partidas e
            competir de forma justa com a comunidade.
          </p>
          <p>
            Não recolhemos dados desnecessários, não realizamos rastreamento intrusivo e não vendemos os teus dados a
            terceiros. O contacto oficial para privacidade e dados é:{' '}
            <strong className="text-emerald-300 font-mono">suporte@acordaportugal.pt</strong>.
          </p>
        </div>
      ),
    },
    {
      id: '9-dados-que-recolhemos',
      number: '09',
      title: 'Dados que recolhemos',
      subtitle: 'Identificação transparente de cada informação tratada',
      category: 'privacidade',
      icon: Database,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Separamos as informações recolhidas em quatro categorias objetivas para que saibas exatamente o que existe sobre a
            tua conta:
          </p>
          <div className="grid grid-cols-1 gap-3 pt-1">
            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                <UserCheck className="w-4 h-4" />
                <span>1. Dados de Autenticação e Conta</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Endereço de e-mail, nome de utilizador público, fotografia de perfil do Google (se autenticado via Google) e
                identificador único de conta (UID) gerado pelo Firebase Authentication.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <Trophy className="w-4 h-4" />
                <span>2. Dados de Jogo e Estatísticas</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Distrito de representação escolhido, saldo de moedas virtuais (€ Acorda), nível de jogador, histórico de XP,
                conquistas alcançadas, títulos cosméticos desbloqueados e estatísticas de vitórias/derrotas nos questionários
                e duelos.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                <Lock className="w-4 h-4" />
                <span>3. Preferências Locais e Dados Técnicos</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Armazenamento no dispositivo (<code className="text-purple-300 font-mono text-xs">localStorage</code>) para
                memorizar preferências essenciais: volume do som, efeitos sonoros ligados/desligados, tema visual e estado de
                sessão, sem rastreamento de terceiros.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Coins className="w-4 h-4" />
                <span>4. Dados de Pagamento (Quando Aplicável)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Em compras in-app na Loja Oficial, a transação é processada diretamente pelas plataformas certificadas
                (Google Play In-App Billing ou Stripe). O Acorda Portugal <strong>nunca</strong> tem acesso nem armazena os
                números do teu cartão de crédito ou dados bancários.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: '10-como-utilizamos-os-dados',
      number: '10',
      title: 'Como utilizamos os dados',
      subtitle: 'As finalidades legítimas para as quais tratamos as tuas informações',
      category: 'privacidade',
      icon: Eye,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Todas as informações recolhidas destinam-se exclusivamente a disponibilizar e melhorar o jogo:
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <span>
                <strong>Autenticação e Sessão:</strong> Manter a tua conta segura e a sessão ativa entre visitas e
                dispositivos.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <span>
                <strong>Progresso na Cloud:</strong> Guardar o teu nível, moedas, itens e conquistas de forma segura na base
                de dados.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <span>
                <strong>Rankings e Competição:</strong> Apresentar a tabela classificativa do país e de cada distrito com base
                no mérito real.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <span>
                <strong>Prevenção de Fraude:</strong> Assegurar que nenhum jogador utiliza métodos fraudulentos ou prejudica a
                comunidade.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <span>
                <strong>Apoio ao Utilizador:</strong> Responder a pedidos de suporte, esclarecimento de dúvidas e resolução de
                problemas técnicos reportados.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '11-armazenamento-e-seguranca',
      number: '11',
      title: 'Armazenamento e segurança',
      subtitle: 'Infraestrutura técnica e medidas de proteção aplicadas',
      category: 'privacidade',
      icon: Lock,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Levamos a segurança das tuas informações muito a sério e recorremos a fornecedores líderes de infraestrutura na
            nuvem:
          </p>
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <h5 className="text-xs font-bold text-white mb-1">Google Cloud &amp; Firebase</h5>
              <p className="text-xs sm:text-sm text-slate-400">
                Os dados de perfil e jogo estão alojados em bases de dados geridas pelo Google Firebase Firestore, em
                centros de dados localizados no espaço da União Europeia.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <h5 className="text-xs font-bold text-white mb-1">Encriptação em Trânsito (HTTPS / TLS)</h5>
              <p className="text-xs sm:text-sm text-slate-400">
                Todas as comunicações entre a aplicação no teu telemóvel ou navegador e os nossos servidores são protegidas por
                encriptação de ponta a ponta através de protocolos SSL/TLS.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <h5 className="text-xs font-bold text-white mb-1">Regras de Segurança Estritas (Firestore Security Rules)</h5>
              <p className="text-xs sm:text-sm text-slate-400">
                A aplicação impõe regras rigorosas de autenticação e autorização ao nível da base de dados, garantindo que
                nenhum utilizador possa alterar saldos, pontuações ou dados privados de outros utilizadores.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: '12-direitos-do-utilizador',
      number: '12',
      title: 'Direitos do utilizador',
      subtitle: 'Os teus direitos fundamentais ao abrigo do RGPD e como exercê-los',
      category: 'privacidade',
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Enquanto utilizador residente no Espaço Económico Europeu, tens plenos direitos sobre as tuas informações
            pessoais:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5">
              <strong className="text-emerald-400 block text-xs uppercase tracking-wider mb-1">Direito de Acesso</strong>
              <p className="text-xs text-slate-400">
                Podes saber que informações temos registadas sobre a tua conta a qualquer momento.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5">
              <strong className="text-emerald-400 block text-xs uppercase tracking-wider mb-1">Direito de Retificação</strong>
              <p className="text-xs text-slate-400">
                Podes editar ou corrigir o teu nome público, foto ou distrito diretamente nas definições do teu perfil.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5">
              <strong className="text-emerald-400 block text-xs uppercase tracking-wider mb-1">Direito ao Apagamento</strong>
              <p className="text-xs text-slate-400">
                Podes solicitar a eliminação imediata e irreversível da tua conta e de todos os dados associados.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5">
              <strong className="text-emerald-400 block text-xs uppercase tracking-wider mb-1">Direito à Portabilidade</strong>
              <p className="text-xs text-slate-400">
                Podes solicitar uma cópia estruturada dos teus dados de jogador mediante pedido por e-mail.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            Para exercer qualquer um destes direitos por escrito, contacta-nos em:{' '}
            <span className="text-emerald-300 font-mono font-semibold">suporte@acordaportugal.pt</span>.
          </p>
        </div>
      ),
    },
    {
      id: '13-eliminacao-da-conta',
      number: '13',
      title: 'Eliminação da conta',
      subtitle: 'O processo real de auto-eliminação e remoção de dados',
      category: 'privacidade',
      icon: Trash2,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Acreditamos que deves ter controlo total sobre a tua presença no jogo. No Acorda Portugal, a eliminação de conta
            não requer processos burocráticos: podes executá-la de forma autónoma diretamente na aplicação.
          </p>
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Como Eliminar a Conta na Aplicação
            </h5>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-300 space-y-1.5 pl-1">
              <li>Inicia sessão e acede ao teu <strong>Perfil</strong> ou <strong>Definições</strong> (<code className="text-emerald-300 font-mono text-xs">/perfil</code>);</li>
              <li>Desce até à secção <strong>Eliminar Conta</strong> e clica no botão de confirmação;</li>
              <li>Por motivos de segurança, confirma a tua palavra-passe ou reautentica a tua conta Google.</li>
            </ol>
          </div>
          <div className="rounded-xl bg-rose-950/20 border border-rose-900/40 p-4 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400">
              O Que Acontece Aos Teus Dados (Efeito Imediato e Irreversível)
            </h5>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1.5 pl-1">
              <li>O teu registo de utilizador na base de dados é permanentemente apagado;</li>
              <li>O teu perfil público é removido dos rankings nacionais e distritais;</li>
              <li>O teu saldo de Acordas e itens cosméticos são destruídos;</li>
              <li>A tua conta no Firebase Authentication é eliminada em definitivo;</li>
              <li>O armazenamento local e as caches do teu dispositivo são limpos;</li>
              <li>És reencaminhado para a confirmação em <code className="text-rose-300 font-mono text-xs">/conta-eliminada</code>.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: '14-alteracoes-aos-termos-privacidade',
      number: '14',
      title: 'Alterações aos Termos & Privacidade',
      subtitle: 'Comunicação de novidades, atualizações de regras e transparência',
      category: 'privacidade',
      icon: RefreshCw,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            À medida que adicionamos novos modos de jogo, eventos culturais e melhorias técnicas, estes Termos &amp;
            Privacidade podem ser revistos para refletir com exatidão o funcionamento da plataforma.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong>Data de atualização:</strong> Todas as alterações entram em vigor no momento da sua publicação nesta
                página, identificada pela data de revisão no topo.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong>Avisos importantes:</strong> Em caso de atualizações de grande impacto, apresentaremos um aviso
                visível na aplicação. A continuidade na utilização do jogo pressupõe a aceitação da versão atualizada.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '15-contacto',
      number: '15',
      title: 'Contacto',
      subtitle: 'Canais oficiais para esclarecimento de dúvidas e suporte',
      category: 'contacto',
      icon: Mail,
      content: (
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          <p>
            Se tiveres qualquer dúvida sobre a utilização do Acorda Portugal, sobre estes termos ou sobre como os teus dados
            são protegidos, fala connosco através dos nossos canais oficiais:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="mailto:suporte@acordaportugal.pt"
              className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 transition-all hover:border-emerald-400 hover:bg-emerald-500/20 group"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">E-mail Direto</div>
                <div className="text-sm font-mono font-bold text-white truncate">suporte@acordaportugal.pt</div>
              </div>
            </a>

            <Link
              href="/ajuda"
              className="flex items-center gap-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 p-4 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 group"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Central de Ajuda</div>
                <div className="text-sm font-bold text-white truncate">acordaportugal.pt/ajuda</div>
              </div>
            </Link>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen bg-transparent text-slate-200 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <BackgroundFx variant="settings" />

      <div className="relative z-20 flex min-h-screen flex-col justify-between">
        <SiteHeader />

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
          {/* Top Banner / Hero */}
          <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">
                <ShieldCheck className="h-3.5 w-3.5" />
                Documento Legal Oficial
              </div>

              <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                TERMOS &amp; <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">PRIVACIDADE</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                Informação clara sobre a utilização do Acorda Portugal e sobre a forma como os teus dados são tratados.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  Última atualização: 15 de agosto de 2026
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  15 Secções Estruturadas
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Conforme RGPD (UE 2016/679)
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Esta página reúne os <strong>Termos de Utilização</strong> e a <strong>Política de Privacidade</strong> do
                Acorda Portugal num único documento, organizado de forma simples, transparente e sem linguagem jurídica
                desnecessariamente complexa.
              </div>
            </div>
          </div>

          {/* Quick Index / Table of Contents */}
          <div className="mb-10 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-4 mb-4">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  Índice Geral do Documento
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clica num dos tópicos para navegar diretamente para a respetiva secção
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                  01-07 Termos
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" />
                  08-14 Privacidade
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map((sec) => {
                const isPrivacidade = sec.category === 'privacidade'
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white group border border-transparent hover:border-white/5"
                  >
                    <span
                      className={`font-mono font-bold shrink-0 ${
                        isPrivacidade ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-emerald-400 group-hover:text-emerald-300'
                      }`}
                    >
                      {sec.number}.
                    </span>
                    <span className="truncate group-hover:translate-x-0.5 transition-transform">{sec.title}</span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Secções do Documento */}
          <div className="space-y-6">
            {SECTIONS.map((sec, index) => {
              const Icon = sec.icon
              const isFirstTerms = sec.id === '1-termos-de-utilizacao'
              const isFirstPrivacy = sec.id === '8-privacidade-e-protecao-de-dados'
              const isPrivacy = sec.category === 'privacidade'

              return (
                <React.Fragment key={sec.id}>
                  {/* Divisória de destaque visual ao entrar na secção de Privacidade */}
                  {isFirstPrivacy && (
                    <div
                      id="privacidade"
                      className="my-10 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl scroll-mt-24"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-2">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Parte II: Privacidade &amp; RGPD
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white">
                            Privacidade e Proteção de Dados
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-slate-300">
                            A partir deste ponto detalhamos como os teus dados são protegidos, armazenados e geridos.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Âncora invisível / redundante para compatibilidade com #termos */}
                  {isFirstTerms && <div id="termos" className="scroll-mt-24" />}

                  {/* Cartão da Secção */}
                  <section
                    id={sec.id}
                    className={`group relative scroll-mt-24 overflow-hidden rounded-2xl border bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl transition-all duration-200 shadow-lg ${
                      isPrivacy
                        ? 'border-cyan-900/40 hover:border-cyan-500/40'
                        : 'border-slate-800/80 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
                          isPrivacy
                            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-mono text-xs font-bold tracking-wider ${
                              isPrivacy ? 'text-cyan-400' : 'text-emerald-400'
                            }`}
                          >
                            SECÇÃO {sec.number}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400">{sec.subtitle}</span>
                        </div>

                        <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                          {sec.number}. {sec.title}
                        </h2>

                        <div className="mt-4 pt-3 border-t border-white/5">
                          {sec.content}
                        </div>
                      </div>
                    </div>
                  </section>
                </React.Fragment>
              )
            })}
          </div>

          {/* Card de Conclusão / Voltar ao Topo */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 text-center backdrop-blur-xl">
            <h3 className="text-base font-bold text-white">
              Transparência, Confiança e Respeito
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              O Acorda Portugal foi desenhado para celebrar o conhecimento de todo o país num ambiente saudável, seguro e
              transparente. Dúvidas ou sugestões? Envia mensagem para{' '}
              <a href="mailto:suporte@acordaportugal.pt" className="text-emerald-400 hover:underline font-mono">
                suporte@acordaportugal.pt
              </a>
              .
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 transition-all cursor-pointer"
              >
                <ArrowUp className="h-4 w-4" />
                Voltar ao topo da página
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 transition-all"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Botão Flutuante Voltar ao Topo */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          className="fixed bottom-6 right-6 z-50 grid h-11 w-11 place-items-center rounded-full border border-emerald-500/40 bg-slate-950/90 text-emerald-400 shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:bg-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
