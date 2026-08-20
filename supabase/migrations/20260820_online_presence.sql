-- =========================================================================
-- MIGRAÇÃO DEFINITIVA DE PRESENÇA ONLINE (Acorda Portugal)
-- =========================================================================

-- 1. Tabela de heartbeat global
CREATE TABLE IF NOT EXISTS public.active_presence (
  client_id TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Desativar RLS nesta tabela para evitar bloqueios de leitura anónima
ALTER TABLE public.active_presence DISABLE ROW LEVEL SECURITY;

-- 3. Função atómica de ping que conta TODOS os clientes dos últimos 25-30 segundos
CREATE OR REPLACE FUNCTION public.heartbeat_online(p_client_id TEXT)
RETURNS INT 
LANGUAGE plpgsql 
SECURITY DEFINER -- Garante contagem total independentemente do utilizador
AS $$
DECLARE
  active_count INT;
BEGIN
  -- Atualiza ou insere o dispositivo atual
  INSERT INTO public.active_presence (client_id, last_seen)
  VALUES (p_client_id, NOW())
  ON CONFLICT (client_id) DO UPDATE SET last_seen = NOW();

  -- Limpa conexões mortas há mais de 30 segundos
  DELETE FROM public.active_presence WHERE last_seen < NOW() - INTERVAL '30 seconds';

  -- Conta total real de conexões ativas
  SELECT COUNT(*) INTO active_count FROM public.active_presence;

  RETURN GREATEST(active_count, 1);
END;
$$;
