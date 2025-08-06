-- Script para actualizar la configuración de relevancia existente
-- con el nuevo campo de límite de recomendaciones para el home

-- Actualizar configuraciones existentes que no tengan el campo max_recomendaciones_home
UPDATE configuracion_relevancia 
SET max_recomendaciones_home = 6 
WHERE max_recomendaciones_home IS NULL;

-- Actualizar la configuración JSON para incluir el nuevo campo
UPDATE configuracion_relevancia 
SET configuracion = jsonb_set(
  COALESCE(configuracion, '{}'::jsonb),
  '{configuracionAvanzada, maxRecomendacionesHome}',
  '6'::jsonb
)
WHERE configuracion IS NOT NULL 
AND NOT (configuracion->'configuracionAvanzada' ? 'maxRecomendacionesHome');

-- Verificar las configuraciones actualizadas
SELECT 
  id_configuracion,
  nombre_configuracion,
  max_recomendaciones_home,
  configuracion->'configuracionAvanzada'->'maxRecomendacionesHome' as max_recomendaciones_json
FROM configuracion_relevancia
ORDER BY id_configuracion; 