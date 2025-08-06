-- Script para actualizar la relevancia de productos vistos existentes
-- Este script asigna una relevancia por defecto a productos vistos que no tienen relevancia calculada

-- Actualizar productos vistos sin relevancia calculada
UPDATE historial_productos_vistos 
SET relevancia_calculada = 50 
WHERE relevancia_calculada IS NULL OR relevancia_calculada = 0;

-- Asignar relevancia basada en tiempo de vista (más tiempo = más relevancia)
UPDATE historial_productos_vistos 
SET relevancia_calculada = 
  CASE 
    WHEN tiempo_vista >= 300 THEN 85  -- 5+ minutos = alta relevancia
    WHEN tiempo_vista >= 120 THEN 70  -- 2-5 minutos = relevancia media-alta
    WHEN tiempo_vista >= 60 THEN 55   -- 1-2 minutos = relevancia media
    ELSE 45                           -- Menos de 1 minuto = relevancia baja
  END
WHERE relevancia_calculada = 50;

-- Verificar los cambios
SELECT 
  COUNT(*) as total_productos_vistos,
  COUNT(CASE WHEN relevancia_calculada IS NOT NULL THEN 1 END) as con_relevancia,
  COUNT(CASE WHEN relevancia_calculada IS NULL THEN 1 END) as sin_relevancia,
  AVG(relevancia_calculada) as relevancia_promedio
FROM historial_productos_vistos;

-- Mostrar algunos ejemplos de productos vistos con su relevancia
SELECT 
  hpv.id,
  hpv.fecha_vista,
  hpv.tiempo_vista,
  hpv.relevancia_calculada,
  p.nombre_producto
FROM historial_productos_vistos hpv
JOIN productos p ON hpv.producto_id = p.id_producto
ORDER BY hpv.fecha_vista DESC
LIMIT 10; 