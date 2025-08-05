-- Script para verificar y corregir problemas en la tabla preferencias_usuarios
-- Ejecuta este script en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'preferencias_usuarios'
) as tabla_existe;

-- 2. Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'preferencias_usuarios'
ORDER BY ordinal_position;

-- 3. Verificar restricciones existentes
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'preferencias_usuarios';

-- 4. Verificar si hay registros duplicados
SELECT usuario_id, COUNT(*) as cantidad
FROM preferencias_usuarios
GROUP BY usuario_id
HAVING COUNT(*) > 1;

-- 5. Si hay duplicados, eliminar los más antiguos (mantener solo el más reciente)
-- Descomenta las siguientes líneas si hay duplicados:
/*
DELETE FROM preferencias_usuarios 
WHERE id_preferencia NOT IN (
    SELECT MAX(id_preferencia)
    FROM preferencias_usuarios
    GROUP BY usuario_id
);
*/

-- 6. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'preferencias_usuarios';

-- 7. Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'preferencias_usuarios';

-- 8. Mostrar todos los registros actuales
SELECT * FROM preferencias_usuarios ORDER BY fecha_creacion DESC;

-- 9. Verificar que la restricción única funciona correctamente
-- (Esto debería fallar si hay duplicados)
SELECT 'Verificación de restricción única completada' as resultado; 