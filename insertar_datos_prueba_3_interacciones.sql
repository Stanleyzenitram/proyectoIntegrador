-- Script para insertar datos de prueba para las 3 interacciones principales
-- Ejecutar en Supabase SQL Editor

-- Obtener un user_id válido para las pruebas
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Obtener el primer usuario disponible
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No hay usuarios en la base de datos. Crea un usuario primero.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usando user_id para pruebas: %', test_user_id;
    
    -- Insertar datos de prueba en historial_productos_vistos
    INSERT INTO historial_productos_vistos (usuario_id, producto_id, tiempo_vista, relevancia_calculada, metadata)
    VALUES 
        (test_user_id, 1, 120, 95, '{"categoria": "baño", "precio": 150.00, "origen": "busqueda"}'),
        (test_user_id, 2, 60, 87, '{"categoria": "cocina", "precio": 200.00, "origen": "lista"}'),
        (test_user_id, 3, 180, 92, '{"categoria": "baño", "precio": 180.00, "origen": "categoria"}'),
        (test_user_id, 1, 45, 78, '{"categoria": "baño", "precio": 150.00, "origen": "recomendacion"}'),
        (test_user_id, 4, 90, 88, '{"categoria": "exterior", "precio": 120.00, "origen": "filtro"}');
    
    -- Insertar datos de prueba en historial_busquedas
    INSERT INTO historial_busquedas (usuario_id, termino_busqueda, resultados_encontrados, filtros_aplicados, categoria_filtrada, rango_precio)
    VALUES 
        (test_user_id, 'cerámica baño', 45, '{"categoria": "baño", "precio_min": "100", "precio_max": "200"}', 'baño', '100-200'),
        (test_user_id, 'porcelana blanca', 23, '{"material": "porcelana", "color": "blanco"}', NULL, NULL),
        (test_user_id, 'mármol gris', 18, '{"material": "mármol", "color": "gris"}', NULL, NULL),
        (test_user_id, 'pisos exteriores', 32, '{"categoria": "exterior", "resistencia": "alta"}', 'exterior', NULL),
        (test_user_id, 'azulejos cocina', 28, '{"categoria": "cocina", "tipo": "azulejo"}', 'cocina', NULL);
    
    -- Insertar datos de prueba en historial_clics
    INSERT INTO historial_clics (usuario_id, producto_id, tipo_clic, origen_clic, metadata)
    VALUES 
        (test_user_id, 1, 'producto', 'lista_productos', '{"posicion": 1, "filtro_activo": "baño", "tiempo_en_pagina": 30}'),
        (test_user_id, 2, 'producto', 'busqueda', '{"termino_busqueda": "porcelana", "resultado_numero": 3, "tiempo_busqueda": 15}'),
        (test_user_id, 3, 'producto', 'categoria', '{"categoria": "baño", "orden": "precio_asc", "filtros_aplicados": ["precio", "material"]}'),
        (test_user_id, 4, 'producto', 'lista_productos', '{"posicion": 5, "filtro_activo": "exterior", "scroll_position": 300}'),
        (test_user_id, 1, 'producto', 'recomendacion', '{"algoritmo": "relevancia", "score": 0.85, "motivo": "similar_a_visto"}');
    
    RAISE NOTICE 'Datos de prueba insertados exitosamente para las 3 interacciones principales';
    RAISE NOTICE 'Usuario: %', test_user_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al insertar datos de prueba: %', SQLERRM;
END $$;

-- Verificar que los datos se insertaron correctamente
SELECT 'Verificación de datos insertados para las 3 interacciones:' as mensaje;

SELECT 'Productos vistos:' as tabla, COUNT(*) as total FROM historial_productos_vistos
UNION ALL
SELECT 'Búsquedas:' as tabla, COUNT(*) as total FROM historial_busquedas
UNION ALL
SELECT 'Clics:' as tabla, COUNT(*) as total FROM historial_clics;

-- Mostrar ejemplos de los datos insertados
SELECT 'Ejemplos de productos vistos:' as info;
SELECT 
    hpv.id,
    hpv.producto_id,
    hpv.tiempo_vista,
    hpv.relevancia_calculada,
    p.nombre_producto,
    hpv.metadata->>'origen' as origen
FROM historial_productos_vistos hpv
LEFT JOIN productos p ON hpv.producto_id = p.id_producto
ORDER BY hpv.fecha_vista DESC
LIMIT 3;

SELECT 'Ejemplos de búsquedas:' as info;
SELECT 
    hb.id,
    hb.termino_busqueda,
    hb.resultados_encontrados,
    hb.categoria_filtrada,
    hb.rango_precio,
    hb.filtros_aplicados
FROM historial_busquedas hb
ORDER BY hb.fecha_busqueda DESC
LIMIT 3;

SELECT 'Ejemplos de clics:' as info;
SELECT 
    hc.id,
    hc.producto_id,
    hc.tipo_clic,
    hc.origen_clic,
    p.nombre_producto,
    hc.metadata
FROM historial_clics hc
LEFT JOIN productos p ON hc.producto_id = p.id_producto
ORDER BY hc.fecha_clic DESC
LIMIT 3;

-- Mostrar resumen de interacciones por tipo
SELECT 'Resumen de interacciones por tipo:' as info;
SELECT 
    'Productos vistos' as tipo_interaccion,
    COUNT(*) as total,
    AVG(tiempo_vista) as tiempo_promedio_segundos,
    AVG(relevancia_calculada) as relevancia_promedio
FROM historial_productos_vistos
UNION ALL
SELECT 
    'Búsquedas' as tipo_interaccion,
    COUNT(*) as total,
    AVG(resultados_encontrados) as resultados_promedio,
    0 as relevancia_promedio
FROM historial_busquedas
UNION ALL
SELECT 
    'Clics' as tipo_interaccion,
    COUNT(*) as total,
    COUNT(DISTINCT producto_id) as productos_unicos,
    0 as relevancia_promedio
FROM historial_clics; 