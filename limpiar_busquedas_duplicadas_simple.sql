-- Script simple para limpiar búsquedas duplicadas existentes
-- Mantener solo la búsqueda más reciente de cada término por usuario

-- 1. Crear una tabla temporal con las búsquedas únicas más recientes
CREATE TEMP TABLE busquedas_unicas AS
SELECT DISTINCT ON (usuario_id, LOWER(termino_busqueda))
    id,
    usuario_id,
    termino_busqueda,
    resultados_encontrados,
    filtros_aplicados,
    categoria_filtrada,
    rango_precio,
    fecha_busqueda
FROM historial_busquedas
ORDER BY usuario_id, LOWER(termino_busqueda), fecha_busqueda DESC;

-- 2. Mostrar cuántos duplicados se van a eliminar
SELECT 
    'Búsquedas totales' as tipo,
    COUNT(*) as cantidad
FROM historial_busquedas
UNION ALL
SELECT 
    'Búsquedas únicas' as tipo,
    COUNT(*) as cantidad
FROM busquedas_unicas;

-- 3. Limpiar la tabla original
DELETE FROM historial_busquedas;

-- 4. Reinsertar solo las búsquedas únicas
INSERT INTO historial_busquedas (
    id,
    usuario_id,
    termino_busqueda,
    resultados_encontrados,
    filtros_aplicados,
    categoria_filtrada,
    rango_precio,
    fecha_busqueda
)
SELECT 
    id,
    usuario_id,
    termino_busqueda,
    resultados_encontrados,
    filtros_aplicados,
    categoria_filtrada,
    rango_precio,
    fecha_busqueda
FROM busquedas_unicas;

-- 5. Verificar el resultado
SELECT 
    'Búsquedas después de limpieza' as tipo,
    COUNT(*) as cantidad
FROM historial_busquedas;

-- 6. Mostrar algunos ejemplos de búsquedas únicas
SELECT 
    usuario_id,
    termino_busqueda,
    fecha_busqueda,
    resultados_encontrados
FROM historial_busquedas
ORDER BY fecha_busqueda DESC
LIMIT 10;

-- 7. Crear índice para mejorar el rendimiento de búsquedas únicas
CREATE INDEX IF NOT EXISTS idx_historial_busquedas_usuario_termino 
ON historial_busquedas(usuario_id, LOWER(termino_busqueda)); 