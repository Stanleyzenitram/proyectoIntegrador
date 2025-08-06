-- Script para insertar datos de ejemplo de comportamiento del usuario
-- Esto permitirá probar el sistema de recomendaciones con datos reales

-- Insertar datos de ejemplo en historial_productos_vistos
-- (Reemplaza 'tu-user-id-aqui' con un UUID real de usuario)
INSERT INTO historial_productos_vistos (usuario_id, producto_id, tiempo_vista, fecha_vista, relevancia_calculada) VALUES
-- Usuario ve muchos pisos (categoría frecuente)
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE nombre_producto LIKE '%piso%' LIMIT 1), 120, NOW() - INTERVAL '2 days', 85),
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE nombre_producto LIKE '%piso%' LIMIT 1 OFFSET 1), 180, NOW() - INTERVAL '1 day', 90),
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE nombre_producto LIKE '%piso%' LIMIT 1 OFFSET 2), 95, NOW() - INTERVAL '12 hours', 75),

-- Usuario ve productos de porcelanato (material frecuente)
('tu-user-id-aqui', (SELECT p.id_producto FROM productos p JOIN materiales m ON p.id_materiales = m.id_materiales WHERE m.nombre_materiales LIKE '%porcelanato%' LIMIT 1), 200, NOW() - INTERVAL '3 days', 88),
('tu-user-id-aqui', (SELECT p.id_producto FROM productos p JOIN materiales m ON p.id_materiales = m.id_materiales WHERE m.nombre_materiales LIKE '%porcelanato%' LIMIT 1 OFFSET 1), 150, NOW() - INTERVAL '2 days', 82),

-- Usuario ve productos de cerámica
('tu-user-id-aqui', (SELECT p.id_producto FROM productos p JOIN materiales m ON p.id_materiales = m.id_materiales WHERE m.nombre_materiales LIKE '%cerámica%' LIMIT 1), 90, NOW() - INTERVAL '1 day', 70),

-- Usuario ve productos con descuento
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE descuento > 0 LIMIT 1), 110, NOW() - INTERVAL '6 hours', 78);

-- Insertar datos de ejemplo en historial_busquedas
INSERT INTO historial_busquedas (usuario_id, termino_busqueda, fecha_busqueda, resultados_encontrados) VALUES
-- Búsquedas relacionadas con pisos
('tu-user-id-aqui', 'piso', NOW() - INTERVAL '2 days', 15),
('tu-user-id-aqui', 'pisos cerámica', NOW() - INTERVAL '1 day', 8),
('tu-user-id-aqui', 'piso porcelanato', NOW() - INTERVAL '12 hours', 12),

-- Búsquedas relacionadas con materiales
('tu-user-id-aqui', 'porcelanato', NOW() - INTERVAL '3 days', 20),
('tu-user-id-aqui', 'cerámica', NOW() - INTERVAL '2 days', 18),

-- Búsquedas relacionadas con estilos
('tu-user-id-aqui', 'moderno', NOW() - INTERVAL '1 day', 25),
('tu-user-id-aqui', 'clásico', NOW() - INTERVAL '6 hours', 22);

-- Insertar datos de ejemplo en historial_clics
INSERT INTO historial_clics (usuario_id, producto_id, tipo_clic, fecha_clic) VALUES
-- Clics en productos de pisos (alta interacción)
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE nombre_producto LIKE '%piso%' LIMIT 1), 'detalle', NOW() - INTERVAL '2 days'),
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE nombre_producto LIKE '%piso%' LIMIT 1), 'detalle', NOW() - INTERVAL '1 day'),
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE nombre_producto LIKE '%piso%' LIMIT 1 OFFSET 1), 'detalle', NOW() - INTERVAL '12 hours'),

-- Clics en productos de porcelanato
('tu-user-id-aqui', (SELECT p.id_producto FROM productos p JOIN materiales m ON p.id_materiales = m.id_materiales WHERE m.nombre_materiales LIKE '%porcelanato%' LIMIT 1), 'detalle', NOW() - INTERVAL '3 days'),
('tu-user-id-aqui', (SELECT p.id_producto FROM productos p JOIN materiales m ON p.id_materiales = m.id_materiales WHERE m.nombre_materiales LIKE '%porcelanato%' LIMIT 1 OFFSET 1), 'detalle', NOW() - INTERVAL '2 days'),

-- Clics en productos con descuento
('tu-user-id-aqui', (SELECT id_producto FROM productos WHERE descuento > 0 LIMIT 1), 'detalle', NOW() - INTERVAL '6 hours');

-- Verificar los datos insertados
SELECT 
  'historial_productos_vistos' as tabla,
  COUNT(*) as total_registros
FROM historial_productos_vistos 
WHERE usuario_id = 'tu-user-id-aqui'

UNION ALL

SELECT 
  'historial_busquedas' as tabla,
  COUNT(*) as total_registros
FROM historial_busquedas 
WHERE usuario_id = 'tu-user-id-aqui'

UNION ALL

SELECT 
  'historial_clics' as tabla,
  COUNT(*) as total_registros
FROM historial_clics 
WHERE usuario_id = 'tu-user-id-aqui';

-- Mostrar resumen de comportamiento
SELECT 
  'Categorías más vistas' as tipo,
  c.nombre_categoria,
  COUNT(*) as frecuencia
FROM historial_productos_vistos hpv
JOIN productos p ON hpv.producto_id = p.id_producto
JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE hpv.usuario_id = 'tu-user-id-aqui'
GROUP BY c.nombre_categoria
ORDER BY frecuencia DESC
LIMIT 3; 