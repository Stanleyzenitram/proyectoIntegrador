-- Script para verificar las categorías existentes y sus IDs
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar categorías existentes
SELECT 
    id_categoria,
    nombre_categoria,
    descripcion
FROM public.categorias
ORDER BY id_categoria;

-- Verificar estilos existentes
SELECT 
    id_estilo,
    nombre_estilo,
    descripcion
FROM public.estilos
ORDER BY id_estilo;

-- Verificar materiales existentes
SELECT 
    id_materiales,
    nombre_materiales,
    uso_materiales
FROM public.materiales
ORDER BY id_materiales;

-- Contar productos existentes
SELECT COUNT(*) as total_productos FROM public.productos; 