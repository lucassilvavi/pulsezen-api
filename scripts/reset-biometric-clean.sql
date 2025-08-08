-- Script para limpar sistema biométrico
-- Execute este script no PostgreSQL

-- 1. Limpar todas as tabelas biométricas (ordem importa por causa das foreign keys)
DELETE FROM backup_codes;
DELETE FROM auth_logs;
DELETE FROM device_trust_scores;
DELETE FROM biometric_tokens;
DELETE FROM user_devices;

-- 2. Limpar refresh tokens (podem ter referências)
DELETE FROM refresh_tokens;

-- 3. Limpar perfis de usuário (opcional - se quiser manter dados básicos, comente esta linha)
DELETE FROM user_profiles;

-- 4. Limpar usuários (opcional - se quiser manter usuários, comente esta linha)
-- DELETE FROM users;

-- 5. Resetar sequences (para IDs auto-incrementais)
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;

-- Verificar se as tabelas estão vazias
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'user_devices' as tabela, COUNT(*) as registros FROM user_devices
UNION ALL
SELECT 'biometric_tokens' as tabela, COUNT(*) as registros FROM biometric_tokens
UNION ALL
SELECT 'device_trust_scores' as tabela, COUNT(*) as registros FROM device_trust_scores
UNION ALL
SELECT 'auth_logs' as tabela, COUNT(*) as registros FROM auth_logs
UNION ALL
SELECT 'backup_codes' as tabela, COUNT(*) as registros FROM backup_codes
UNION ALL
SELECT 'refresh_tokens' as tabela, COUNT(*) as registros FROM refresh_tokens;

-- Script concluído com sucesso!
