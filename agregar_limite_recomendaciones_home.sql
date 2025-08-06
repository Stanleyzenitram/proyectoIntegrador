-- Script para agregar la columna de límite de recomendaciones para el home
-- a la tabla configuracion_relevancia

-- Agregar columna para límite de recomendaciones en el home
ALTER TABLE configuracion_relevancia 
ADD COLUMN IF NOT EXISTS max_recomendaciones_home INTEGER DEFAULT 6;

-- Actualizar registros existentes con el valor por defecto
UPDATE configuracion_relevancia 
SET max_recomendaciones_home = 6 
WHERE max_recomendaciones_home IS NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN configuracion_relevancia.max_recomendaciones_home IS 'Número máximo de recomendaciones a mostrar en el home principal';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'configuracion_relevancia' 
AND column_name = 'max_recomendaciones_home'; 