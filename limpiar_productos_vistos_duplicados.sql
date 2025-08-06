-- Script para limpiar productos vistos duplicados
-- Consolidar el tiempo de vista y relevancia de productos duplicados

-- 1. Crear una tabla temporal con los productos vistos consolidados
CREATE TEMP TABLE productos_vistos_consolidados AS
SELECT 
    usuario_id,
    producto_id,
    SUM(tiempo_vista) as tiempo_total_vista,
    AVG(relevancia_calculada) as relevancia_promedio,
    MAX(fecha_vista) as ultima_vista,
    metadata
FROM historial_productos_vistos
GROUP BY usuario_id, producto_id;

-- 2. Mostrar cuántos duplicados se van a eliminar
SELECT 
    'Productos vistos totales' as tipo,
    COUNT(*) as cantidad
FROM historial_productos_vistos
UNION ALL
SELECT 
    'Productos únicos vistos' as tipo,
    COUNT(*) as cantidad
FROM productos_vistos_consolidados;

-- 3. Crear backup de la tabla original (opcional)
-- CREATE TABLE historial_productos_vistos_backup AS SELECT * FROM historial_productos_vistos;

-- 4. Limpiar la tabla original
DELETE FROM historial_productos_vistos;

-- 5. Reinsertar solo los productos vistos consolidados
INSERT INTO historial_productos_vistos (
    usuario_id,
    producto_id,
    tiempo_vista,
    relevancia_calculada,
    fecha_vista,
    metadata
)
SELECT 
    usuario_id,
    producto_id,
    tiempo_total_vista,
    relevancia_promedio,
    ultima_vista,
             metadata
FROM productos_vistos_consolidados;

-- 6. Verificar el resultado
SELECT 
    'Productos vistos después de limpieza' as tipo,
    COUNT(*) as cantidad
FROM historial_productos_vistos;

-- 7. Mostrar algunos ejemplos de productos vistos consolidados
SELECT 
    usuario_id,
    producto_id,
    tiempo_vista,
    relevancia_calculada,
    fecha_vista
FROM historial_productos_vistos
ORDER BY fecha_vista DESC
LIMIT 10;

-- 8. Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_productos_vistos_usuario_producto 
ON historial_productos_vistos(usuario_id, producto_id);

-- 9. Mostrar estadísticas de tiempo de vista consolidado
SELECT 
    'Tiempo total de vista' as tipo,
    SUM(tiempo_vista) as segundos
FROM historial_productos_vistos
UNION ALL
SELECT 
    'Promedio tiempo por producto' as tipo,
    AVG(tiempo_vista) as segundos
FROM historial_productos_vistos; 