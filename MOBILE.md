# 📱 ACORDA PORTUGAL — MOBILE FIRST & RESPONSIVE ARCHITECTURE

## 1. Diretrizes Mobile First
- **Resoluções Testadas**: 320px, 360px, 375px, 390px, 412px, 430px, 768px, 1024px, 1280px, 1440px.
- **Touch Targets**: Todos os botões e opções de resposta possuem área de toque $\ge 44\text{px} \times 44\text{px}$.
- **Zero Horizontal Overflow**: `overflow-x: hidden` rigoroso no body e content containers.

---

## 2. Safe Areas & Notches
- Suporte para iOS Dynamic Island, notches e status bars do Android via `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.
- Componente global `OnlineConnectionStatus` para avisos de perda e restabelecimento de ligação.

---

## 3. Prevenção de Erros no Quiz
- **Bloqueio de Duplo Toque**: Desativação imediata das opções após o primeiro clique (`isSubmittingAnswerRef`).
- **Respostas Pós-Timeout**: Bloqueio de respostas quando o tempo atinge 0.
- **Teclado Virtual**: Ajuste de padding nos formulários para não ocultar botões de submissão.
