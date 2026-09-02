export type TitleGroup =
  | 'tematico' // 18 categorias de conhecimento
  | 'progressao' // Nível e XP global
  | 'competicao' // Duelos 1v1
  | 'streaks' // Sequências de vitórias
  | 'precisao' // Taxa de acerto
  | 'distrito' // Ranking regional
  | 'exclusivo' // Rankings, Eventos, Lançamento e Conquistas

export type TitleRarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Mítico'

export interface TitleItem {
  id: string
  name: string
  categoryKey: string
  categoryTitle: string
  group: TitleGroup
  price: number | null // null = Desbloqueio por Conquista/Mérito
  requirement?: string // Condição visível se for exclusivo
  rarity: TitleRarity
  badgeColor: string
}

export const getTitleRarityBadge = (rarity: TitleRarity): string => {
  switch (rarity) {
    case 'Comum':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'Raro':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    case 'Épico':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'Lendário':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
    case 'Mítico':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700'
  }
}

export const TITLE_SHOP_CATALOG: TitleItem[] = [
  // ============================================================================
  // 1. PORTUGAL (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_pt_1', name: 'Filho de Portugal', categoryKey: 'portugal', categoryTitle: 'Portugal', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_pt_2', name: 'Português de Alma', categoryKey: 'portugal', categoryTitle: 'Portugal', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_pt_3', name: 'Orgulho Nacional', categoryKey: 'portugal', categoryTitle: 'Portugal', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_pt_4', name: 'Embaixador de Portugal', categoryKey: 'portugal', categoryTitle: 'Portugal', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_pt_5', name: 'Guardião de Portugal', categoryKey: 'portugal', categoryTitle: 'Portugal', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_pt_6', name: 'O Conquistador', categoryKey: 'portugal', categoryTitle: 'Portugal', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_pt_7', name: 'Lenda de Portugal', categoryKey: 'portugal', categoryTitle: 'Portugal', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 2. ATUALIDADE (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_at_1', name: 'Observador', categoryKey: 'atualidade', categoryTitle: 'Atualidade', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_at_2', name: 'Repórter', categoryKey: 'atualidade', categoryTitle: 'Atualidade', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_at_3', name: 'Informado', categoryKey: 'atualidade', categoryTitle: 'Atualidade', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_at_4', name: 'Analista', categoryKey: 'atualidade', categoryTitle: 'Atualidade', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_at_5', name: 'Correspondente', categoryKey: 'atualidade', categoryTitle: 'Atualidade', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_at_6', name: 'Voz Nacional', categoryKey: 'atualidade', categoryTitle: 'Atualidade', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_at_7', name: 'Mestre da Atualidade', categoryKey: 'atualidade', categoryTitle: 'Atualidade', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 3. POLÍTICA (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_pol_1', name: 'Cidadão', categoryKey: 'politica', categoryTitle: 'Política', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_pol_2', name: 'Eleitor', categoryKey: 'politica', categoryTitle: 'Política', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_pol_3', name: 'Constitucionalista', categoryKey: 'politica', categoryTitle: 'Política', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_pol_4', name: 'Deputado', categoryKey: 'politica', categoryTitle: 'Política', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_pol_5', name: 'Estratega', categoryKey: 'politica', categoryTitle: 'Política', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_pol_6', name: 'Estadista', categoryKey: 'politica', categoryTitle: 'Política', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_pol_7', name: 'Mestre da República', categoryKey: 'politica', categoryTitle: 'Política', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 4. EMPRESAS (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_emp_1', name: 'Empreendedor', categoryKey: 'empresas', categoryTitle: 'Empresas', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_emp_2', name: 'Executivo', categoryKey: 'empresas', categoryTitle: 'Empresas', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_emp_3', name: 'Visionário', categoryKey: 'empresas', categoryTitle: 'Empresas', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_emp_4', name: 'Investidor', categoryKey: 'empresas', categoryTitle: 'Empresas', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_emp_5', name: 'Empresário', categoryKey: 'empresas', categoryTitle: 'Empresas', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_emp_6', name: 'Magnata', categoryKey: 'empresas', categoryTitle: 'Empresas', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_emp_7', name: 'Titã dos Negócios', categoryKey: 'empresas', categoryTitle: 'Empresas', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 5. FUTEBOL (8 TÍTULOS)
  // ============================================================================
  { id: 'tit_fut_1', name: 'Adepto', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_fut_2', name: 'Futebolista', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_fut_3', name: 'Craque', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_fut_4', name: 'Artilheiro', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_fut_5', name: 'Capitão', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_fut_6', name: 'Treinador', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 2500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_fut_7', name: 'Campeão', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 4000, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_fut_8', name: 'Lenda do Futebol', categoryKey: 'futebol', categoryTitle: 'Futebol', group: 'tematico', price: 85000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 6. DESAFIO VISUAL (6 TÍTULOS)
  // ============================================================================
  { id: 'tit_vis_1', name: 'Observador', categoryKey: 'visual', categoryTitle: 'Desafio Visual', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_vis_2', name: 'Olho de Águia', categoryKey: 'visual', categoryTitle: 'Desafio Visual', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_vis_3', name: 'Detetive Visual', categoryKey: 'visual', categoryTitle: 'Desafio Visual', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_vis_4', name: 'Perito', categoryKey: 'visual', categoryTitle: 'Desafio Visual', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_vis_5', name: 'Mestre da Observação', categoryKey: 'visual', categoryTitle: 'Desafio Visual', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_vis_6', name: 'Visão Absoluta', categoryKey: 'visual', categoryTitle: 'Desafio Visual', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },

  // ============================================================================
  // 7. MODO MALUCO (6 TÍTULOS)
  // ============================================================================
  { id: 'tit_mal_1', name: 'Maluco', categoryKey: 'modo-maluco', categoryTitle: 'Modo Maluco', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_mal_2', name: 'Fora da Caixa', categoryKey: 'modo-maluco', categoryTitle: 'Modo Maluco', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_mal_3', name: 'Caótico', categoryKey: 'modo-maluco', categoryTitle: 'Modo Maluco', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_mal_4', name: 'Imprevisível', categoryKey: 'modo-maluco', categoryTitle: 'Modo Maluco', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_mal_5', name: 'Mestre do Caos', categoryKey: 'modo-maluco', categoryTitle: 'Modo Maluco', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_mal_6', name: 'Rei da Loucura', categoryKey: 'modo-maluco', categoryTitle: 'Modo Maluco', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },

  // ============================================================================
  // 8. HISTÓRIA (8 TÍTULOS)
  // ============================================================================
  { id: 'tit_his_1', name: 'Aprendiz da História', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_his_2', name: 'Historiador', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_his_3', name: 'Cronista', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_his_4', name: 'Cavaleiro', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_his_5', name: 'Navegador', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_his_6', name: 'Conquistador', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 2500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_his_7', name: 'Mestre da História', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 4000, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_his_8', name: 'Lenda Histórica', categoryKey: 'historia', categoryTitle: 'História', group: 'tematico', price: 85000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 9. GEOGRAFIA (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_geo_1', name: 'Viajante', categoryKey: 'geografia', categoryTitle: 'Geografia', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_geo_2', name: 'Explorador', categoryKey: 'geografia', categoryTitle: 'Geografia', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_geo_3', name: 'Cartógrafo', categoryKey: 'geografia', categoryTitle: 'Geografia', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_geo_4', name: 'Navegador dos Mares', categoryKey: 'geografia', categoryTitle: 'Geografia', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_geo_5', name: 'Geógrafo', categoryKey: 'geografia', categoryTitle: 'Geografia', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_geo_6', name: 'Mestre dos Mapas', categoryKey: 'geografia', categoryTitle: 'Geografia', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_geo_7', name: 'Senhor do Mundo', categoryKey: 'geografia', categoryTitle: 'Geografia', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 10. CIÊNCIA E TECNOLOGIA (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_cie_1', name: 'Curioso', categoryKey: 'ciencia', categoryTitle: 'Ciência & Tecnologia', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cie_2', name: 'Investigador', categoryKey: 'ciencia', categoryTitle: 'Ciência & Tecnologia', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cie_3', name: 'Cientista', categoryKey: 'ciencia', categoryTitle: 'Ciência & Tecnologia', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_cie_4', name: 'Inventor', categoryKey: 'ciencia', categoryTitle: 'Ciência & Tecnologia', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_cie_5', name: 'Engenheiro', categoryKey: 'ciencia', categoryTitle: 'Ciência & Tecnologia', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_cie_6', name: 'Visionário Quântico', categoryKey: 'ciencia', categoryTitle: 'Ciência & Tecnologia', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_cie_7', name: 'Génio da Ciência', categoryKey: 'ciencia', categoryTitle: 'Ciência & Tecnologia', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 11. CULTURA (6 TÍTULOS)
  // ============================================================================
  { id: 'tit_cul_1', name: 'Curioso Cultural', categoryKey: 'cultura', categoryTitle: 'Cultura', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cul_2', name: 'Artista', categoryKey: 'cultura', categoryTitle: 'Cultura', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cul_3', name: 'Criador', categoryKey: 'cultura', categoryTitle: 'Cultura', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_cul_4', name: 'Intelectual', categoryKey: 'cultura', categoryTitle: 'Cultura', group: 'tematico', price: 800, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_cul_5', name: 'Mestre da Cultura', categoryKey: 'cultura', categoryTitle: 'Cultura', group: 'tematico', price: 1500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_cul_6', name: 'Guardião da Cultura', categoryKey: 'cultura', categoryTitle: 'Cultura', group: 'tematico', price: 2500, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 12. MÚSICA (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_mus_1', name: 'Ouvinte', categoryKey: 'musica', categoryTitle: 'Música', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_mus_2', name: 'Melómano', categoryKey: 'musica', categoryTitle: 'Música', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_mus_3', name: 'Músico', categoryKey: 'musica', categoryTitle: 'Música', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_mus_4', name: 'Fadista', categoryKey: 'musica', categoryTitle: 'Música', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_mus_5', name: 'Maestro', categoryKey: 'musica', categoryTitle: 'Música', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_mus_6', name: 'Mestre da Música', categoryKey: 'musica', categoryTitle: 'Música', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_mus_7', name: 'Lenda Musical', categoryKey: 'musica', categoryTitle: 'Música', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 13. GASTRONOMIA (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_gas_1', name: 'Guloso', categoryKey: 'gastronomia', categoryTitle: 'Gastronomia', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_gas_2', name: 'Gourmet', categoryKey: 'gastronomia', categoryTitle: 'Gastronomia', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_gas_3', name: 'Conhecedor', categoryKey: 'gastronomia', categoryTitle: 'Gastronomia', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_gas_4', name: 'Sommelier', categoryKey: 'gastronomia', categoryTitle: 'Gastronomia', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_gas_5', name: 'Chef', categoryKey: 'gastronomia', categoryTitle: 'Gastronomia', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_gas_6', name: 'Mestre dos Sabores', categoryKey: 'gastronomia', categoryTitle: 'Gastronomia', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_gas_7', name: 'Rei da Gastronomia', categoryKey: 'gastronomia', categoryTitle: 'Gastronomia', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 14. CINEMA E TV (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_cin_1', name: 'Cinéfilo', categoryKey: 'cinema-tv', categoryTitle: 'Cinema e TV', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cin_2', name: 'Espectador', categoryKey: 'cinema-tv', categoryTitle: 'Cinema e TV', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cin_3', name: 'Crítico', categoryKey: 'cinema-tv', categoryTitle: 'Cinema e TV', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_cin_4', name: 'Argumentista', categoryKey: 'cinema-tv', categoryTitle: 'Cinema e TV', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_cin_5', name: 'Realizador', categoryKey: 'cinema-tv', categoryTitle: 'Cinema e TV', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_cin_6', name: 'Estrela', categoryKey: 'cinema-tv', categoryTitle: 'Cinema e TV', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_cin_7', name: 'Lenda do Cinema', categoryKey: 'cinema-tv', categoryTitle: 'Cinema e TV', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 15. DESPORTO (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_des_1', name: 'Atleta', categoryKey: 'desporto', categoryTitle: 'Desporto', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_des_2', name: 'Competidor', categoryKey: 'desporto', categoryTitle: 'Desporto', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_des_3', name: 'Desportista', categoryKey: 'desporto', categoryTitle: 'Desporto', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_des_4', name: 'Campeão do Desporto', categoryKey: 'desporto', categoryTitle: 'Desporto', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_des_5', name: 'Medalhista', categoryKey: 'desporto', categoryTitle: 'Desporto', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_des_6', name: 'Campeão Olímpico', categoryKey: 'desporto', categoryTitle: 'Desporto', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_des_7', name: 'Lenda do Desporto', categoryKey: 'desporto', categoryTitle: 'Desporto', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 16. CURIOSIDADES (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_cur_1', name: 'Curioso Nato', categoryKey: 'curiosidades', categoryTitle: 'Curiosidades', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cur_2', name: 'Sabichão', categoryKey: 'curiosidades', categoryTitle: 'Curiosidades', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_cur_3', name: 'Enciclopédia', categoryKey: 'curiosidades', categoryTitle: 'Curiosidades', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_cur_4', name: 'Caçador de Factos', categoryKey: 'curiosidades', categoryTitle: 'Curiosidades', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_cur_5', name: 'Mestre das Curiosidades', categoryKey: 'curiosidades', categoryTitle: 'Curiosidades', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_cur_6', name: 'Mente Brilhante Lusitana', categoryKey: 'curiosidades', categoryTitle: 'Curiosidades', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_cur_7', name: 'Sabe-Tudo', categoryKey: 'curiosidades', categoryTitle: 'Curiosidades', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 17. GAMING (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_gam_1', name: 'Jogador', categoryKey: 'gaming', categoryTitle: 'Gaming', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_gam_2', name: 'Gamer', categoryKey: 'gaming', categoryTitle: 'Gaming', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_gam_3', name: 'Player Pro', categoryKey: 'gaming', categoryTitle: 'Gaming', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_gam_4', name: 'Speedrunner', categoryKey: 'gaming', categoryTitle: 'Gaming', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_gam_5', name: 'Mestre Gamer', categoryKey: 'gaming', categoryTitle: 'Gaming', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_gam_6', name: 'Boss Final', categoryKey: 'gaming', categoryTitle: 'Gaming', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_gam_7', name: 'Lenda Gaming', categoryKey: 'gaming', categoryTitle: 'Gaming', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // 18. MUNDO E SOCIEDADE (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_mun_1', name: 'Viajante do Globo', categoryKey: 'mundo', categoryTitle: 'Mundo & Sociedade', group: 'tematico', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_mun_2', name: 'Cidadão do Mundo', categoryKey: 'mundo', categoryTitle: 'Mundo & Sociedade', group: 'tematico', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_mun_3', name: 'Explorador Global', categoryKey: 'mundo', categoryTitle: 'Mundo & Sociedade', group: 'tematico', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_mun_4', name: 'Diplomata', categoryKey: 'mundo', categoryTitle: 'Mundo & Sociedade', group: 'tematico', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_mun_5', name: 'Embaixador', categoryKey: 'mundo', categoryTitle: 'Mundo & Sociedade', group: 'tematico', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_mun_6', name: 'Visionário Global', categoryKey: 'mundo', categoryTitle: 'Mundo & Sociedade', group: 'tematico', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_mun_7', name: 'Mestre do Mundo', categoryKey: 'mundo', categoryTitle: 'Mundo & Sociedade', group: 'tematico', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // PROGRESSÃO GLOBAL (9 TÍTULOS)
  // ============================================================================
  { id: 'tit_prog_1', name: 'Novato', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_prog_2', name: 'Iniciado', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_prog_3', name: 'Aprendiz', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_prog_4', name: 'Competidor', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_prog_5', name: 'Veterano', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_prog_6', name: 'Especialista', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 2500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_prog_7', name: 'Mestre', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 4000, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_prog_8', name: 'Grão-Mestre', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 55000, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_prog_9', name: 'Lenda', categoryKey: 'progressao', categoryTitle: 'Progressão', group: 'progressao', price: 90000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // COMPETIÇÃO 1V1 (7 TÍTULOS)
  // ============================================================================
  { id: 'tit_comp_1', name: 'Duelista', categoryKey: 'competicao', categoryTitle: 'Duelos 1v1', group: 'competicao', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_comp_2', name: 'Desafiante', categoryKey: 'competicao', categoryTitle: 'Duelos 1v1', group: 'competicao', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_comp_3', name: 'Invicto', categoryKey: 'competicao', categoryTitle: 'Duelos 1v1', group: 'competicao', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_comp_4', name: 'Dominador', categoryKey: 'competicao', categoryTitle: 'Duelos 1v1', group: 'competicao', price: 800, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_comp_5', name: 'Gladiador', categoryKey: 'competicao', categoryTitle: 'Duelos 1v1', group: 'competicao', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_comp_6', name: 'Campeão da Arena', categoryKey: 'competicao', categoryTitle: 'Duelos 1v1', group: 'competicao', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_comp_7', name: 'Rei dos Duelos', categoryKey: 'competicao', categoryTitle: 'Duelos 1v1', group: 'competicao', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // SEQUÊNCIAS (5 TÍTULOS)
  // ============================================================================
  { id: 'tit_strk_1', name: 'Em Ascensão', categoryKey: 'streaks', categoryTitle: 'Sequências', group: 'streaks', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_strk_2', name: 'Em Chamas', categoryKey: 'streaks', categoryTitle: 'Sequências', group: 'streaks', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_strk_3', name: 'Imparável', categoryKey: 'streaks', categoryTitle: 'Sequências', group: 'streaks', price: 800, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_strk_4', name: 'Máquina de Vitórias', categoryKey: 'streaks', categoryTitle: 'Sequências', group: 'streaks', price: 1500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_strk_5', name: 'Invencível', categoryKey: 'streaks', categoryTitle: 'Sequências', group: 'streaks', price: 2500, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // PRECISÃO (6 TÍTULOS)
  // ============================================================================
  { id: 'tit_prec_1', name: 'Boa Memória', categoryKey: 'precisao', categoryTitle: 'Precisão', group: 'precisao', price: 150, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_prec_2', name: 'Conhecedor Preciso', categoryKey: 'precisao', categoryTitle: 'Precisão', group: 'precisao', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_prec_3', name: 'Perito no Quiz', categoryKey: 'precisao', categoryTitle: 'Precisão', group: 'precisao', price: 800, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_prec_4', name: 'Mestre do Conhecimento', categoryKey: 'precisao', categoryTitle: 'Precisão', group: 'precisao', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_prec_5', name: 'Mente Brilhante', categoryKey: 'precisao', categoryTitle: 'Precisão', group: 'precisao', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_prec_6', name: 'Génio do Quiz', categoryKey: 'precisao', categoryTitle: 'Precisão', group: 'precisao', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // DISTRITO (5 TÍTULOS)
  // ============================================================================
  { id: 'tit_dist_1', name: 'Orgulho do Distrito', categoryKey: 'distrito', categoryTitle: 'Distrito', group: 'distrito', price: 250, rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_dist_2', name: 'Representante Distrital', categoryKey: 'distrito', categoryTitle: 'Distrito', group: 'distrito', price: 500, rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_dist_3', name: 'Campeão Distrital', categoryKey: 'distrito', categoryTitle: 'Distrito', group: 'distrito', price: 1500, rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_dist_4', name: 'Rei do Distrito', categoryKey: 'distrito', categoryTitle: 'Distrito', group: 'distrito', price: 2500, rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_dist_5', name: 'Lenda Distrital', categoryKey: 'distrito', categoryTitle: 'Distrito', group: 'distrito', price: 4000, rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // TÍTULOS EXCLUSIVOS POR MÉRITO & CONQUISTAS (price: null)
  // ============================================================================
  // Rankings
  { id: 'tit_excl_rank1', name: '#1 Nacional', categoryKey: 'exclusivo', categoryTitle: 'Rankings', group: 'exclusivo', price: null, requirement: 'Top 1 no Ranking Nacional', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'tit_excl_top3', name: 'Top 3 Nacional', categoryKey: 'exclusivo', categoryTitle: 'Rankings', group: 'exclusivo', price: null, requirement: 'Top 3 no Ranking Nacional', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'tit_excl_top10', name: 'Top 10 Nacional', categoryKey: 'exclusivo', categoryTitle: 'Rankings', group: 'exclusivo', price: null, requirement: 'Top 10 no Ranking Nacional', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_excl_top100', name: 'Top 100 Nacional', categoryKey: 'exclusivo', categoryTitle: 'Rankings', group: 'exclusivo', price: null, requirement: 'Top 100 no Ranking Nacional', rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_excl_campeao_nac', name: 'Campeão Nacional', categoryKey: 'exclusivo', categoryTitle: 'Rankings', group: 'exclusivo', price: null, requirement: 'Vencedor do Ranking da Temporada', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // Eventos
  { id: 'tit_excl_evt_camp', name: 'Campeão do Evento', categoryKey: 'exclusivo', categoryTitle: 'Eventos', group: 'exclusivo', price: null, requirement: 'Vencedor de Evento Especial Oficial', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_excl_evt_temp', name: 'Vencedor da Temporada', categoryKey: 'exclusivo', categoryTitle: 'Eventos', group: 'exclusivo', price: null, requirement: 'Vencedor da Temporada de Competição', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'tit_excl_evt_rei', name: 'Rei do Desafio', categoryKey: 'exclusivo', categoryTitle: 'Eventos', group: 'exclusivo', price: null, requirement: 'Conclusão de Todos os Desafios de Temporada', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_excl_evt_mestre', name: 'Mestre do Torneio', categoryKey: 'exclusivo', categoryTitle: 'Eventos', group: 'exclusivo', price: null, requirement: 'Vencedor de Torneio Eliminatório 1v1', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },

  // Lançamento
  { id: 'tit_excl_fundador', name: 'Fundador', categoryKey: 'exclusivo', categoryTitle: 'Lançamento', group: 'exclusivo', price: null, requirement: 'Passe Fundador / Pioneiro Oficial', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'tit_excl_pioneiro', name: 'Pioneiro', categoryKey: 'exclusivo', categoryTitle: 'Lançamento', group: 'exclusivo', price: null, requirement: 'Primeiros 1.000 Jogadores Registados', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_excl_1geracao', name: 'Primeira Geração', categoryKey: 'exclusivo', categoryTitle: 'Lançamento', group: 'exclusivo', price: null, requirement: 'Conta criada na semana de lançamento', rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_excl_veterano', name: 'Veterano do Lançamento', categoryKey: 'exclusivo', categoryTitle: 'Lançamento', group: 'exclusivo', price: null, requirement: 'Participação nas partidas do lançamento', rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },

  // Conquistas
  { id: 'tit_excl_100v', name: '100 Vitórias', categoryKey: 'exclusivo', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Alcançar 100 vitórias em Duelos 1v1', rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  { id: 'tit_excl_500v', name: '500 Vitórias', categoryKey: 'exclusivo', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Alcançar 500 vitórias em Duelos 1v1', rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_excl_1000v', name: '1.000 Vitórias', categoryKey: 'exclusivo', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Alcançar 1.000 vitórias em Duelos 1v1', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'tit_excl_1v', name: 'Primeira Vitória', categoryKey: 'exclusivo', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Vencer o teu primeiro duelo 1v1', rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_excl_10streak', name: '10 Vitórias Consecutivas', categoryKey: 'exclusivo', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Sequência invicta de 10 vitórias 1v1', rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'tit_excl_50streak', name: '50 Vitórias Consecutivas', categoryKey: 'exclusivo', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Sequência invicta de 50 vitórias 1v1', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'tit_excl_100q', name: '100 Perguntas Certas', categoryKey: 'exclusivo', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Responder acertadamente a 100 perguntas', rarity: 'Comum', badgeColor: getTitleRarityBadge('Comum') },
  { id: 'tit_excl_1000q', name: '1.000 Perguntas Certas', categoryKey: 'conquistas', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Responder acertadamente a 1.000 perguntas', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'tit_excl_mestre_todas', name: 'Mestre de Todas as Categorias', categoryKey: 'conquistas', categoryTitle: 'Conquistas', group: 'exclusivo', price: null, requirement: 'Alcançar nível máximo nas 18 categorias', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },

  // ============================================================================
  // TÍTULOS EXCLUSIVOS VIP 2.0 (€ REAL) (6 TÍTULOS)
  // ============================================================================
  { id: 'AP-VIP-TITLE-001', name: 'Imperador do Desafio', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'AP-VIP-TITLE-002', name: 'Campeão Eterno', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'AP-VIP-TITLE-003', name: 'Lenda de Portugal', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
  { id: 'AP-VIP-TITLE-004', name: 'Senhor do Desafio', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'AP-VIP-TITLE-005', name: 'Mestre Lusitano', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Épico', badgeColor: getTitleRarityBadge('Épico') },
  { id: 'AP-VIP-TITLE-006', name: 'Cérebro Nacional', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Raro', badgeColor: getTitleRarityBadge('Raro') },
  // Aliases Legados
  { id: 'vip_title_001', name: 'Imperador do Desafio (Legado)', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Mítico', badgeColor: getTitleRarityBadge('Mítico') },
  { id: 'vip_title_002', name: 'Campeão Eterno (Legado)', categoryKey: 'vip', categoryTitle: 'Exclusivos VIP', group: 'exclusivo', price: null, requirement: 'Exclusivo VIP (€ Real)', rarity: 'Lendário', badgeColor: getTitleRarityBadge('Lendário') },
]
