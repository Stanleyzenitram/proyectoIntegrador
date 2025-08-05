-- Solución rápida para permitir subida de imágenes
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Deshabilitar RLS en storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que RLS está deshabilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 3. Verificar que el bucket existe y es público
SELECT 
    id, 
    name, 
    public, 
    created_at 
FROM storage.buckets 
WHERE id = 'imagenes';

-- NOTA: Esto hace que el almacenamiento sea completamente público
-- Solo usar para desarrollo/testing
-- Para producción, configurar políticas específicas después 