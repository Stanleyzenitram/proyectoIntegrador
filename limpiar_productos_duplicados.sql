-- Script para limpiar productos duplicados en la base de datos
-- Mantener solo el producto más reciente de cada nombre duplicado

-- 1. Crear una tabla temporal con los productos únicos más recientes
CREATE TEMP TABLE productos_unicos AS
SELECT DISTINCT ON (LOWER(nombre_producto))
    id_producto,
    nombre_producto,
    descripcion,
    precio,
    stock_actual,
    descuento,
    estado,
    imagen,
    id_estilo,
    id_materiales,
    formato,
    metros_por_caja,
    disponibilidad,
    color,
    piezas_por_caja,
    id_tipo_producto,
    marca,
    modelo,
    dimensiones,
    peso,
    garantia_meses,
    caracteristicas_especiales,
    tags,
    rating_promedio,
    total_valoraciones
FROM productos
ORDER BY LOWER(nombre_producto), id_producto DESC;

-- 2. Mostrar cuántos duplicados se van a eliminar
SELECT 
    'Productos totales' as tipo,
    COUNT(*) as cantidad
FROM productos
UNION ALL
SELECT 
    'Productos únicos' as tipo,
    COUNT(*) as cantidad
FROM productos_unicos;

-- 3. Crear backup de la tabla original (opcional)
-- CREATE TABLE productos_backup AS SELECT * FROM productos;

-- 4. Obtener IDs de productos duplicados que se van a eliminar
CREATE TEMP TABLE productos_a_eliminar AS
SELECT p.id_producto
FROM productos p
LEFT JOIN productos_unicos pu ON p.id_producto = pu.id_producto
WHERE pu.id_producto IS NULL;

-- 5. Mostrar productos que se van a eliminar
SELECT 
    p.id_producto,
    p.nombre_producto,
    p.precio,
    p.stock_actual,
    p.descuento
FROM productos p
JOIN productos_a_eliminar pae ON p.id_producto = pae.id_producto
ORDER BY p.nombre_producto, p.id_producto;

-- 6. Eliminar registros del historial que referencian productos duplicados
DELETE FROM historial_productos_vistos 
WHERE producto_id IN (SELECT id_producto FROM productos_a_eliminar);

DELETE FROM historial_clics 
WHERE producto_id IN (SELECT id_producto FROM productos_a_eliminar);

-- 7. Limpiar la tabla productos
DELETE FROM productos 
WHERE id_producto IN (SELECT id_producto FROM productos_a_eliminar);

-- 8. Verificar el resultado
SELECT 
    'Productos después de limpieza' as tipo,
    COUNT(*) as cantidad
FROM productos;

-- 9. Mostrar algunos ejemplos de productos únicos
SELECT 
    id_producto,
    nombre_producto,
    precio,
    descuento,
    stock_actual,
    disponibilidad
FROM productos
ORDER BY id_producto DESC
LIMIT 10;

-- 10. Verificar que no quedan duplicados
SELECT 
    nombre_producto,
    COUNT(*) as cantidad
FROM productos
GROUP BY nombre_producto
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- 11. Crear índice único en nombre_producto para prevenir futuros duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_nombre_unico 
ON productos(LOWER(nombre_producto)); 