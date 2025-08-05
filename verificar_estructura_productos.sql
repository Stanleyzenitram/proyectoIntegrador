-- Script para verificar la estructura de la tabla productos
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar la estructura de la tabla productos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- También verificar las columnas con \d productos si estás usando psql
-- O usar esta consulta alternativa:
SELECT * FROM public.productos LIMIT 1; 