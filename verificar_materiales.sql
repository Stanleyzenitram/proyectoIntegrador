-- Script para verificar materiales existentes y sus IDs
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar materiales existentes
SELECT 
    id_materiales,
    nombre_materiales,
    uso_materiales
FROM public.materiales
ORDER BY id_materiales;

-- Verificar estilos existentes
SELECT 
    id_estilo,
    nombre_estilo,
    descripcion
FROM public.estilos
ORDER BY id_estilo;

-- Contar productos existentes
SELECT COUNT(*) as total_productos FROM public.productos; 