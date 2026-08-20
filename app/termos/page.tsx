import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FileText,
  ShieldCheck,
  Gamepad2,
  UserCheck,
  Trophy,
  Coins,
  Scale,
  Sparkles,
  AlertTriangle,
  Mail,
  Calendar,
  Layers,
  Lock,
  Globe2,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Termos e Condições — Acorda Portugal',
  description:
    'Termos e Condições de Utilização da plataforma Acorda Portugal. Regras de jogo, contas, rankings e direitos.',
}

const SECTIONS = [
  {
    id: '1-introducao',
    number: '01',
    title: 'Introdução',
    icon: FileText,
    content: (
      <div className="space-y-3">
        <p>
          Bem-vindo ao <strong>Acorda Portugal</strong>, uma plataforma digital interativa dedicada ao conhecimento,
          cultura, história, geografia, tradições e atualidade de Portugal.
        </p>
        <p>
          Estes Termos e Condições de Utilização estabelecem as regras, direitos e obrigações aplicáveis a qualquer
          pessoa que aceda ou utilize o website, jogos, desafios, rankings e funcionalidades disponibilizadas pela plataforma.
        </p>
      </div>
    ),
  },
  {
    id: '2-aceitacao-dos-termos',
    number: '02',
    title: 'Aceitação dos Termos',
    icon: ShieldCheck,
    content: (
      <div className="space-y-3">
        <p>
          Ao aceder, navegar, registar uma conta ou participar nos jogos do Acorda Portugal, o utilizador confirma que leu,
          compreendeu e aceita integralmente estes Termos e Condições.
        </p>
        <p>
          Se não concordar com qualquer parte das condições aqui descritas, deve interromper imediatamente a utilização da
          plataforma e dos seus serviços.
        </p>
      </div>
    ),
  },
  {
    id: '3-utilizacao-do-acorda-portugal',
    number: '03',
    title: 'Utilização do Acorda Portugal',
    icon: Globe2,
    content: (
      <div className="space-y-3">
        <p>
          O Acorda Portugal destina-se a fins lúdicos, culturais, recreativos e educativos de cariz estritamente pessoal e
          não comercial.
        </p>
        <p>
          O utilizador compromete-se a aceder à plataforma apenas através das interfaces legítimas fornecidas, abstendo-se de
          qualquer prática que possa sobrecarregar, danificar ou comprometer a integridade dos servidores e sistemas.
        </p>
      </div>
    ),
  },
  {
    id: '4-conta-de-utilizador',
    number: '04',
    title: 'Conta de Utilizador',
    icon: UserCheck,
    content: (
      <div className="space-y-3">
        <p>
          O acesso a determinadas funcionalidades — tais como gravação de progresso, acumulação de experiência (XP),
          conquistas, missões diárias e representação de distrito nos rankings — requer a criação e autenticação de uma conta.
        </p>
        <p>
          O utilizador é o único responsável pela guarda e confidencialidade dos seus dados de acesso, bem como por todas as
          ações efetuadas na plataforma através da sua conta. Caso suspeite de acesso não autorizado, deverá informar de
          imediato o suporte.
        </p>
      </div>
    ),
  },
  {
    id: '5-regras-do-jogo',
    number: '05',
    title: 'Regras do Jogo',
    icon: Gamepad2,
    content: (
      <div className="space-y-3">
        <p>
          Os desafios e questionários do Acorda Portugal regem-se por mecanismos de tempo limitado, rondas de perguntas por
          categoria e cálculo de precisão.
        </p>
        <p>
          É terminantemente proibido o recurso a ferramentas automatizadas, bots, scripts de resposta automática, extensões de
          exploração de código, adulteração de pacotes de dados ou qualquer outro método que confira vantagem desleal em
          relação aos restantes participantes.
        </p>
      </div>
    ),
  },
  {
    id: '6-xp-pontuacao-e-rankings',
    number: '06',
    title: 'XP, Pontuação e Rankings',
    icon: Trophy,
    content: (
      <div className="space-y-3">
        <p>
          Os Pontos de Experiência (XP) e as posições nas tabelas de classificação (nacional, regional e distrital) são
          atribuídos com base no desempenho legítimo dos utilizadores nos questionários e missões.
        </p>
        <p>
          A equipa do Acorda Portugal reserva-se o direito de rever, recalcular, ajustar ou anular pontuações e posições obtidas
          mediante anomalias técnicas, erros de sistema ou condutas comprovadamente fraudulentas, assegurando a justiça
          competitiva para toda a comunidade.
        </p>
      </div>
    ),
  },
  {
    id: '7-moedas-e-funcionalidades-virtuais',
    number: '07',
    title: 'Moedas e Funcionalidades Virtuais',
    icon: Coins,
    content: (
      <div className="space-y-3">
        <p>
          Elementos virtuais como moedas fictícias, vidas, medalhas, títulos honoríficos, molduras de avatar e bónus de
          jogo constituem apenas itens cosméticos e mecânicas lúdicas internas.
        </p>
        <p>
          Estes bens virtuais não possuem valor monetário no mundo real, não constituem propriedade transmissível e não são
          reembolsáveis nem convertíveis em moeda corrente, bens materiais ou valores de qualquer espécie fora da plataforma.
        </p>
      </div>
    ),
  },
  {
    id: '8-conduta-dos-utilizadores',
    number: '08',
    title: 'Conduta dos Utilizadores',
    icon: Scale,
    content: (
      <div className="space-y-3">
        <p>
          Todos os membros da comunidade devem manter uma postura de respeito mútuo, cordialidade e espírito desportivo.
        </p>
        <p>
          São proibidos comportamentos como:
        </p>
        <ul className="list-inside list-disc space-y-1.5 pl-2 text-muted-foreground">
          <li>Utilização de nomes de utilizador, fotografias de perfil ou mensagens ofensivas, difamatórias, discriminatórias ou ilegais;</li>
          <li>Assédio, intimidação ou usurpação de identidade de outros jogadores ou dos administradores;</li>
          <li>Tentativas de intrusão, exploração de vulnerabilidades de segurança ou engenharia reversa do código da aplicação.</li>
        </ul>
      </div>
    ),
  },
  {
    id: '9-propriedade-intelectual',
    number: '09',
    title: 'Propriedade Intelectual',
    icon: Sparkles,
    content: (
      <div className="space-y-3">
        <p>
          A marca, logótipos, design visual, ilustrações, textos, arquitetura de software, base de dados de perguntas e
          respostas, efeitos sonoros e audiovisuais são propriedade exclusiva do <strong>Acorda Portugal</strong> ou dos
          respetivos criadores e licenciadores, protegidos pelas leis de direitos de autor e propriedade industrial.
        </p>
        <p>
          É expressamente proibida a cópia, reprodução, distribuição, modificação ou extração de dados (scraping) de qualquer
          elemento da plataforma sem consentimento prévio por escrito.
        </p>
      </div>
    ),
  },
  {
    id: '10-conteudo-da-plataforma',
    number: '10',
    title: 'Conteúdo da Plataforma',
    icon: Layers,
    content: (
      <div className="space-y-3">
        <p>
          O conteúdo das perguntas, curiosidades e factos históricos é desenvolvido e revisto com o intuito de proporcionar
          rigor cultural e educacional.
        </p>
        <p>
          Apesar do esforço contínuo para manter a precisão de todas as informações, eventuais lapsos, imprecisões ou
          divergências interpretativas podem ocorrer e podem ser reportados para correção através dos mecanismos de contacto.
        </p>
      </div>
    ),
  },
  {
    id: '11-publicidade-e-monetizacao',
    number: '11',
    title: 'Publicidade e Monetização',
    icon: AlertTriangle,
    content: (
      <div className="space-y-3">
        <p>
          A plataforma poderá exibir anúncios, patrocínios ou parcerias institucionais destinados a suportar os custos de
          alojamento, manutenção dos servidores e expansão contínua do projeto.
        </p>
        <p>
          O Acorda Portugal empenha-se em manter formatos de comunicação transparentes e não intrusivos, não sendo responsável
          pelos conteúdos, produtos ou serviços promovidos em websites de terceiros aos quais o utilizador possa aceder.
        </p>
      </div>
    ),
  },
  {
    id: '12-disponibilidade-do-servico',
    number: '12',
    title: 'Disponibilidade do Serviço',
    icon: Clock,
    content: (
      <div className="space-y-3">
        <p>
          Procuramos manter o serviço disponível de forma contínua e estável. Contudo, não é possível garantir um funcionamento
          isento de interrupções, atrasos ou falhas resultantes de limitações de conectividade, manutenções técnicas de rotina
          ou eventos de força maior.
        </p>
        <p>
          O Acorda Portugal reserva-se o direito de atualizar, modificar, pausar ou descontinuar funcionalidades ou o serviço no
          seu todo, no momento e moldes que considere apropriados.
        </p>
      </div>
    ),
  },
  {
    id: '13-suspensao-ou-encerramento-de-contas',
    number: '13',
    title: 'Suspensão ou Encerramento de Contas',
    icon: ShieldAlert,
    content: (
      <div className="space-y-3">
        <p>
          Reservamo-nos a faculdade de suspender preventivamente ou encerrar de forma definitiva contas de utilizador que
          infrinjam os presentes Termos, recorram a práticas desleais de jogo ou coloquem em risco a segurança e reputação da
          comunidade.
        </p>
        <p>
          O utilizador pode igualmente solicitar o encerramento da sua conta e remoção dos seus dados de perfil a qualquer
          momento através dos canais de contacto disponíveis.
        </p>
      </div>
    ),
  },
  {
    id: '14-limitacao-de-responsabilidade',
    number: '14',
    title: 'Limitação de Responsabilidade',
    icon: Lock,
    content: (
      <div className="space-y-3">
        <p>
          Na máxima extensão autorizada pela legislação aplicável, o Acorda Portugal e os seus criadores não respondem por
          quaisquer danos diretos, indiretos, incidentais ou consequentes que resultem da utilização, incapacidade de acesso ou
          perda de progresso na plataforma.
        </p>
        <p>
          O serviço é disponibilizado na base de "como está" e "conforme disponível", sem garantias explícitas ou implícitas de
          qualquer natureza além das expressamente enunciadas.
        </p>
      </div>
    ),
  },
  {
    id: '15-alteracoes-aos-termos',
    number: '15',
    title: 'Alterações aos Termos',
    icon: HelpCircle,
    content: (
      <div className="space-y-3">
        <p>
          Estes Termos e Condições podem ser revistos periodicamente para acomodar novas funcionalidades, melhorias no serviço
          ou ajustamentos de conformidade regulamentar.
        </p>
        <p>
          A versão mais atualizada estará permanentemente acessível nesta página. A continuidade na utilização da plataforma
          após a entrada em vigor de alterações pressupõe a sua total aceitação.
        </p>
      </div>
    ),
  },
  {
    id: '16-contacto',
    number: '16',
    title: 'Contacto',
    icon: Mail,
    content: (
      <div className="space-y-3">
        <p>
          Para esclarecimento de dúvidas sobre estes Termos e Condições, comunicação de problemas técnicos, reporte de erros
          em perguntas ou questões gerais sobre o projeto, utilize os canais e formulários oficiais disponibilizados na
          plataforma Acorda Portugal.
        </p>
      </div>
    ),
  },
  {
    id: '17-data-de-atualizacao',
    number: '17',
    title: 'Data de Atualização',
    icon: Calendar,
    content: (
      <div className="space-y-3">
        <p>
          Os presentes Termos e Condições entraram em vigor e foram revistos pela última vez em{' '}
          <strong>15 de agosto de 2026</strong>.
        </p>
      </div>
    ),
  },
]

export default function TermosPage() {
  return (
    <div className="relative min-h-screen bg-transparent text-foreground">
      <BackgroundFx />

      <div className="relative z-20 flex min-h-screen flex-col justify-between">
        <SiteHeader />

        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          {/* Voltar ao início */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card/60 px-4 py-2 text-sm font-semibold text-muted-foreground backdrop-blur transition hover:border-primary/30 hover:bg-card hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              Voltar ao início
            </Link>
          </div>

          {/* Cabeçalho da Página */}
          <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-8 backdrop-blur-xl sm:p-12">
            <div className="pointer-events-none absolute -right-8 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-flag-red/10 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <FileText className="h-3.5 w-3.5" />
                Documento Legal
              </div>

              <h1 className="mt-4 font-display text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Termos e <span className="text-brand-gradient">Condições</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Bem-vindo ao Acorda Portugal. Por favor, lê atentamente os presentes termos antes de usufruir da plataforma,
                jogar ou participar nos nossos rankings distritais e nacionais.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Última atualização: 15 de agosto de 2026
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  17 Secções Regulamentares
                </span>
              </div>
            </div>
          </div>

          {/* Índice Rápido */}
          <div className="mb-12 rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Índice das Secções
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-white/5 hover:text-primary"
                >
                  <span className="font-display font-bold text-primary/80">{sec.number}.</span>
                  <span className="truncate">{sec.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Secções de Conteúdo */}
          <div className="space-y-6">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon
              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="group relative scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur transition-all duration-300 hover:border-primary/30 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-xs font-bold tracking-wider text-primary">
                          SECÇÃO {sec.number}
                        </span>
                      </div>

                      <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {sec.number}. {sec.title}
                      </h2>

                      <div className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {sec.content}
                      </div>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>

          {/* Rodapé Interno da Página */}
          <div className="mt-12 text-center text-xs text-muted-foreground">
            <p>
              Ao utilizar o <strong>Acorda Portugal</strong>, confirmas a leitura e aceitação de todas as secções acima descritas.
            </p>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
