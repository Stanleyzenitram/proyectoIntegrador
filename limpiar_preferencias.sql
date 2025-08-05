-- Script para limpiar la tabla preferencias_usuarios
-- Ejecuta este script en Supabase SQL Editor para probar el onboarding desde cero

-- 1. Verificar registros actuales
SELECT 'Registros actuales:' as info;
SELECT COUNT(*) as total_registros FROM preferencias_usuarios;

-- 2. Mostrar registros antes de limpiar
SELECT 'Registros existentes:' as info;
SELECT * FROM preferencias_usuarios ORDER BY fecha_creacion DESC;

-- 3. Limpiar todos los registros
DELETE FROM preferencias_usuarios;

-- 4. Verificar que la tabla esté limpia
SELECT 'Después de limpiar:' as info;
SELECT COUNT(*) as total_registros FROM preferencias_usuarios;

-- 5. Verificar que la estructura se mantiene
SELECT 'Estructura de la tabla:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'preferencias_usuarios'
ORDER BY ordinal_position;

-- 6. Verificar restricciones
SELECT 'Restricciones:' as info;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'preferencias_usuarios';

-- 7. Verificar políticas RLS
SELECT 'Políticas RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'preferencias_usuarios';

-- 8. Confirmar limpieza exitosa
SELECT '✅ Tabla limpiada exitosamente. Puedes probar el onboarding ahora.' as resultado; 