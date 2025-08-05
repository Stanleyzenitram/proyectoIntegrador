-- Script para actualizar la tabla preferencias_usuarios con campos más personalizados
-- Ejecuta este script en Supabase SQL Editor

-- 1. Agregar nuevas columnas para preferencias personalizadas
ALTER TABLE preferencias_usuarios 
ADD COLUMN IF NOT EXISTS tipos_piso TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipos_pared TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipos_bano TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipos_cocina TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS materiales_exterior TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS acabados TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS colores TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS proyecto_actual VARCHAR(50),
ADD COLUMN IF NOT EXISTS tiempo_proyecto VARCHAR(50);

-- 2. Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'preferencias_usuarios'
AND column_name IN ('tipos_piso', 'tipos_pared', 'tipos_bano', 'tipos_cocina', 
                    'materiales_exterior', 'acabados', 'colores', 
                    'proyecto_actual', 'tiempo_proyecto')
ORDER BY column_name;

-- 3. Crear índices para las nuevas columnas (opcional, para mejor rendimiento)
CREATE INDEX IF NOT EXISTS idx_preferencias_tipos_piso ON preferencias_usuarios USING GIN (tipos_piso);
CREATE INDEX IF NOT EXISTS idx_preferencias_tipos_pared ON preferencias_usuarios USING GIN (tipos_pared);
CREATE INDEX IF NOT EXISTS idx_preferencias_tipos_bano ON preferencias_usuarios USING GIN (tipos_bano);
CREATE INDEX IF NOT EXISTS idx_preferencias_tipos_cocina ON preferencias_usuarios USING GIN (tipos_cocina);
CREATE INDEX IF NOT EXISTS idx_preferencias_materiales_exterior ON preferencias_usuarios USING GIN (materiales_exterior);
CREATE INDEX IF NOT EXISTS idx_preferencias_acabados ON preferencias_usuarios USING GIN (acabados);
CREATE INDEX IF NOT EXISTS idx_preferencias_colores ON preferencias_usuarios USING GIN (colores);
CREATE INDEX IF NOT EXISTS idx_preferencias_proyecto_actual ON preferencias_usuarios(proyecto_actual);
CREATE INDEX IF NOT EXISTS idx_preferencias_tiempo_proyecto ON preferencias_usuarios(tiempo_proyecto);

-- 4. Verificar la estructura final de la tabla
SELECT 'Estructura final de la tabla:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'preferencias_usuarios'
ORDER BY ordinal_position;

-- 5. Mostrar un ejemplo de cómo se verían los datos
SELECT 'Ejemplo de datos personalizados:' as info;
SELECT 
    'Ejemplo de preferencias personalizadas' as descripcion,
    '{"interior", "exterior"}'::TEXT[] as tipos_piso,
    '{"interior", "bano"}'::TEXT[] as tipos_pared,
    '{"ducha", "lavabo"}'::TEXT[] as tipos_bano,
    '{"cocina", "isla"}'::TEXT[] as tipos_cocina,
    '{"gres_porcelanico", "piedra_natural"}'::TEXT[] as materiales_exterior,
    '{"pulido", "mate"}'::TEXT[] as acabados,
    '{"blanco", "gris"}'::TEXT[] as colores,
    'remodelacion' as proyecto_actual,
    '3_meses' as tiempo_proyecto;

-- 6. Confirmar actualización exitosa
SELECT '✅ Tabla actualizada exitosamente con preferencias personalizadas' as resultado; 