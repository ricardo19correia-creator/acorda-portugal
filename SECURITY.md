# 🔐 ACORDA PORTUGAL — SECURITY & FIRESTORE RULES ARCHITECTURE

## 1. Políticas de Acesso e Permissões

### Coleções Públicas
- `publicProfiles/{userId}`: Leitura pública (`allow read: if true;`), escrita apenas por utilizador autenticado proprietário do documento ou Admin.
- `presence/{sessionId}`: Leitura e escrita públicas para registo do heartbeat de sessão de jogadores humanos.

### Coleções Privadas / Protegidas
- `adminUsers/{adminId}`: Apenas o próprio administrador ou super-admins.
- `adminAuditLogs/{logId}`: Append-only estrito por administradores; proibida qualquer alteração ou eliminação (`allow update, delete: if false;`).
- `adminSettings/{settingId}`: Apenas o administrador.

---

## 2. Autenticação Administrativa
- Todas as rotas de Master Control em `/api/admin/*` validam o Firebase ID Token no header `Authorization: Bearer <token>` via `verifyAdminRequest()`.
- Contas autorizadas com base em claims e whitelist oficial (`ricardo19correia@gmail.com`).
