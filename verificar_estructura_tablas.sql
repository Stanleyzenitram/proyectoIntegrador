-- Script para verificar la estructura de las tablas de historial
-- Esto nos ayudará a identificar qué columnas existen en cada tabla

-- 1. Verificar estructura de historial_busquedas
SELECT 
    'historial_busquedas' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_busquedas'
ORDER BY ordinal_position;

-- 2. Verificar estructura de historial_productos_vistos
SELECT 
    'historial_productos_vistos' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_productos_vistos'
ORDER BY ordinal_position;

-- 3. Verificar estructura de historial_clics
SELECT 
    'historial_clics' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_clics'
ORDER BY ordinal_position;

-- 4. Mostrar algunos registros de ejemplo para ver la estructura real
SELECT 'historial_busquedas - ejemplo:' as info;
SELECT * FROM historial_busquedas LIMIT 1;

SELECT 'historial_productos_vistos - ejemplo:' as info;
SELECT * FROM historial_productos_vistos LIMIT 1;

SELECT 'historial_clics - ejemplo:' as info;
SELECT * FROM historial_clics LIMIT 1; 