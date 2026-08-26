"use strict";
/**
 * Modelo Oficial de Questões do Quiz do Acorda Portugal — Desafio Nacional
 * Schema canónico unificado e compatível com todos os modos de jogo, validação e pipeline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.difficultyLevelToText = difficultyLevelToText;
exports.difficultyTextToLevel = difficultyTextToLevel;
/**
 * Converte nível numérico (1 a 5) para dificuldade textual oficial
 */
function difficultyLevelToText(lvl) {
    if (lvl <= 1)
        return 'facil';
    if (lvl === 2 || lvl === 3)
        return 'media';
    if (lvl === 4)
        return 'dificil';
    return 'especialista';
}
/**
 * Converte dificuldade textual oficial para nível numérico (1 a 5)
 */
function difficultyTextToLevel(diff) {
    var clean = String(diff || '').toLowerCase().trim();
    if (clean === 'facil' || clean === 'fácil' || clean === '1')
        return 1;
    if (clean === 'normal' || clean === '2')
        return 2;
    if (clean === 'media' || clean === 'médio' || clean === 'medio' || clean === '3')
        return 3;
    if (clean === 'dificil' || clean === 'difícil' || clean === '4')
        return 4;
    if (clean === 'especialista' || clean === 'mestre' || clean === 'insano' || clean === '5')
        return 5;
    return 2;
}
