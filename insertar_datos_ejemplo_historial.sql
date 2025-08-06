-- Script para insertar datos de ejemplo en las tablas de historial
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear las tablas

-- Primero, obtener un UUID de usuario existente para las pruebas
-- Reemplaza 'tu-user-id-aqui' con un UUID real de tu tabla auth.users

-- Insertar productos vistos de ejemplo
INSERT INTO historial_productos_vistos (usuario_id, producto_id, tiempo_vista, relevancia_calculada, metadata)
VALUES 
    ('tu-user-id-aqui', 1, 120, 95, '{"categoria": "baño", "precio": 150.00}'),
    ('tu-user-id-aqui', 2, 60, 87, '{"categoria": "cocina", "precio": 200.00}'),
    ('tu-user-id-aqui', 3, 180, 92, '{"categoria": "piso", "precio": 180.00}'),
    ('tu-user-id-aqui', 4, 90, 78, '{"categoria": "pared", "precio": 120.00}'),
    ('tu-user-id-aqui', 5, 150, 88, '{"categoria": "baño", "precio": 250.00}');

-- Insertar búsquedas de ejemplo
INSERT INTO historial_busquedas (usuario_id, termino_busqueda, resultados_encontrados, filtros_aplicados, categoria_filtrada, rango_precio)
VALUES 
    ('tu-user-id-aqui', 'cerámica baño', 45, '{"categoria": "baño", "precio_min": "100", "precio_max": "300"}', 'baño', '$100-$300'),
    ('tu-user-id-aqui', 'porcelana blanca', 23, '{"material": "porcelana", "color": "blanco"}', null, null),
    ('tu-user-id-aqui', 'mármol gris', 18, '{"material": "mármol", "color": "gris"}', null, null),
    ('tu-user-id-aqui', 'gres porcelánico', 32, '{"material": "gres", "tipo": "porcelánico"}', null, null),
    ('tu-user-id-aqui', 'cerámica cocina', 28, '{"categoria": "cocina"}', 'cocina', null);

-- Insertar clics de ejemplo
INSERT INTO historial_clics (usuario_id, producto_id, tipo_clic, origen_clic, metadata)
VALUES 
    ('tu-user-id-aqui', 1, 'producto', 'lista_productos', '{"posicion": 1, "categoria": "baño"}'),
    ('tu-user-id-aqui', 2, 'producto', 'busqueda', '{"termino": "porcelana blanca", "posicion": 3}'),
    ('tu-user-id-aqui', 3, 'producto', 'categoria', '{"categoria": "piso", "filtro": "precio"}'),
    ('tu-user-id-aqui', 4, 'producto', 'recomendacion', '{"algoritmo": "relevancia", "score": 0.85}'),
    ('tu-user-id-aqui', 5, 'producto', 'lista_productos', '{"posicion": 5, "categoria": "baño"}');

-- Insertar compras de ejemplo
INSERT INTO historial_compras (usuario_id, producto_id, precio_unitario, cantidad, total_compra, orden_id, estado_compra)
VALUES 
    ('tu-user-id-aqui', 1, 150.00, 2, 300.00, 'ORD-001', 'completada'),
    ('tu-user-id-aqui', 2, 200.00, 1, 200.00, 'ORD-002', 'completada'),
    ('tu-user-id-aqui', 3, 180.00, 3, 540.00, 'ORD-003', 'completada');

-- Verificar que los datos se insertaron correctamente
SELECT 'Productos vistos:' as tipo, COUNT(*) as cantidad FROM historial_productos_vistos
UNION ALL
SELECT 'Búsquedas:' as tipo, COUNT(*) as cantidad FROM historial_busquedas
UNION ALL
SELECT 'Clics:' as tipo, COUNT(*) as cantidad FROM historial_clics
UNION ALL
SELECT 'Compras:' as tipo, COUNT(*) as cantidad FROM historial_compras;

-- Mostrar estadísticas de ejemplo
SELECT 
    (SELECT COUNT(*) FROM historial_productos_vistos) as total_productos_vistos,
    (SELECT COUNT(*) FROM historial_busquedas) as total_busquedas,
    (SELECT COUNT(*) FROM historial_compras) as total_compras,
    (SELECT COUNT(*) FROM historial_clics) as total_clics,
    CASE 
        WHEN (SELECT COUNT(*) FROM historial_productos_vistos) > 0 
        THEN ROUND(((SELECT COUNT(*) FROM historial_compras)::DECIMAL / (SELECT COUNT(*) FROM historial_productos_vistos)::DECIMAL) * 100, 2)
        ELSE 0 
    END as tasa_conversion;

-- Mostrar las búsquedas más recientes
SELECT 
    termino_busqueda,
    fecha_busqueda,
    resultados_encontrados,
    categoria_filtrada
FROM historial_busquedas 
ORDER BY fecha_busqueda DESC 
LIMIT 5;

-- Mostrar los productos más vistos
SELECT 
    p.nombre_producto,
    COUNT(hpv.id) as veces_visto,
    AVG(hpv.tiempo_vista) as tiempo_promedio,
    AVG(hpv.relevancia_calculada) as relevancia_promedio
FROM historial_productos_vistos hpv
JOIN productos p ON hpv.producto_id = p.id_producto
GROUP BY p.id_producto, p.nombre_producto
ORDER BY veces_visto DESC
LIMIT 5; 