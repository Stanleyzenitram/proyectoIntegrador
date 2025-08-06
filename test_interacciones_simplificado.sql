-- Script de prueba simplificado para verificar las 3 interacciones principales
-- Ejecutar en Supabase SQL Editor

-- Verificar que las tablas principales existen
SELECT 'Verificando tablas de interacciones:' as mensaje;

SELECT 
    table_name,
    COUNT(*) as columnas
FROM information_schema.columns 
WHERE table_name IN (
    'historial_productos_vistos',
    'historial_busquedas', 
    'historial_clics'
)
GROUP BY table_name
ORDER BY table_name;

-- Verificar políticas RLS para las 3 tablas principales
SELECT 'Verificando políticas RLS:' as mensaje;

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN (
    'historial_productos_vistos',
    'historial_busquedas', 
    'historial_clics'
)
ORDER BY tablename, policyname;

-- Verificar índices para rendimiento
SELECT 'Verificando índices:' as mensaje;

SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE tablename IN (
    'historial_productos_vistos',
    'historial_busquedas', 
    'historial_clics'
)
ORDER BY tablename, indexname;

-- Mostrar estadísticas de las 3 tablas principales
SELECT 'Estadísticas de las 3 interacciones principales:' as mensaje;

SELECT 
    'historial_productos_vistos' as tabla,
    COUNT(*) as total_registros
FROM historial_productos_vistos
UNION ALL
SELECT 
    'historial_busquedas' as tabla,
    COUNT(*) as total_registros
FROM historial_busquedas
UNION ALL
SELECT 
    'historial_clics' as tabla,
    COUNT(*) as total_registros
FROM historial_clics;

-- Verificar los últimos registros de cada tabla (si existen)
SELECT 'Últimos productos vistos:' as info;
SELECT 
    id,
    usuario_id,
    producto_id,
    fecha_vista,
    tiempo_vista
FROM historial_productos_vistos 
ORDER BY fecha_vista DESC 
LIMIT 3;

SELECT 'Últimas búsquedas:' as info;
SELECT 
    id,
    usuario_id,
    termino_busqueda,
    fecha_busqueda,
    resultados_encontrados
FROM historial_busquedas 
ORDER BY fecha_busqueda DESC 
LIMIT 3;

SELECT 'Últimos clics:' as info;
SELECT 
    id,
    usuario_id,
    producto_id,
    fecha_clic,
    tipo_clic,
    origen_clic
FROM historial_clics 
ORDER BY fecha_clic DESC 
LIMIT 3;

-- Verificar que la tabla de compras existe pero no se usa
SELECT 'Verificando tabla de compras (deshabilitada):' as info;
SELECT 
    'historial_compras' as tabla,
    COUNT(*) as total_registros
FROM historial_compras;

-- Mostrar resumen final
SELECT 'RESUMEN: Sistema configurado para registrar solo 3 interacciones:' as mensaje;
SELECT 
    '✅ Productos vistos' as interaccion,
    'historial_productos_vistos' as tabla,
    'Registra cuando se abre un modal de producto' as descripcion
UNION ALL
SELECT 
    '✅ Búsquedas' as interaccion,
    'historial_busquedas' as tabla,
    'Registra términos de búsqueda y filtros aplicados' as descripcion
UNION ALL
SELECT 
    '✅ Clics en productos' as interaccion,
    'historial_clics' as tabla,
    'Registra cuando se hace clic en un producto' as descripcion
UNION ALL
SELECT 
    '❌ Compras' as interaccion,
    'historial_compras' as tabla,
    'Registro deshabilitado temporalmente' as descripcion; 