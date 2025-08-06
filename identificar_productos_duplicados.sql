-- Script para identificar productos duplicados en la base de datos
-- Esto nos ayudará a encontrar productos con el mismo nombre pero diferentes IDs

-- 1. Identificar productos duplicados por nombre
SELECT 
    nombre_producto,
    COUNT(*) as cantidad_duplicados,
    STRING_AGG(id_producto::text, ', ') as ids_productos,
    STRING_AGG(precio::text, ', ') as precios,
    STRING_AGG(descuento::text, ', ') as descuentos
FROM productos
GROUP BY nombre_producto
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC, nombre_producto;

-- 2. Mostrar detalles de productos duplicados específicos
WITH productos_duplicados AS (
    SELECT nombre_producto
    FROM productos
    GROUP BY nombre_producto
    HAVING COUNT(*) > 1
)
SELECT 
    p.id_producto,
    p.nombre_producto,
         p.precio,
     p.descuento,
     p.disponibilidad,
     p.stock_actual,
     c.nombre_categoria,
     m.nombre_materiales,
     e.nombre_estilo
FROM productos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
LEFT JOIN materiales m ON p.id_materiales = m.id_materiales
LEFT JOIN estilos e ON p.id_estilo = e.id_estilo
WHERE p.nombre_producto IN (SELECT nombre_producto FROM productos_duplicados)
ORDER BY p.nombre_producto, p.id_producto;

-- 3. Verificar si hay productos duplicados en el historial
SELECT 
    'Productos en historial de vistas' as tipo,
    COUNT(DISTINCT producto_id) as productos_unicos,
    COUNT(*) as total_vistas
FROM historial_productos_vistos
UNION ALL
SELECT 
    'Productos en historial de clics' as tipo,
    COUNT(DISTINCT producto_id) as productos_unicos,
    COUNT(*) as total_clics
FROM historial_clics;

-- 4. Mostrar productos más vistos para verificar duplicados
SELECT 
    p.nombre_producto,
    p.id_producto,
    COUNT(hpv.producto_id) as veces_visto,
    p.precio,
    p.descuento
FROM productos p
LEFT JOIN historial_productos_vistos hpv ON p.id_producto = hpv.producto_id
GROUP BY p.id_producto, p.nombre_producto, p.precio, p.descuento
ORDER BY veces_visto DESC
LIMIT 20;

-- 5. Verificar productos con nombres similares (posibles variaciones)
SELECT 
    p1.nombre_producto as producto1,
    p1.id_producto as id1,
    p2.nombre_producto as producto2,
    p2.id_producto as id2,
    p1.precio as precio1,
    p2.precio as precio2
FROM productos p1
JOIN productos p2 ON p1.id_producto < p2.id_producto
WHERE 
    p1.nombre_producto ILIKE '%' || p2.nombre_producto || '%'
    OR p2.nombre_producto ILIKE '%' || p1.nombre_producto || '%'
ORDER BY p1.nombre_producto; 