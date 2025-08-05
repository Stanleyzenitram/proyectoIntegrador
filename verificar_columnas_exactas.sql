-- Script para verificar las columnas exactas de la tabla productos
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar todas las columnas de la tabla productos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- También verificar con una consulta directa
SELECT * FROM public.productos LIMIT 0; 