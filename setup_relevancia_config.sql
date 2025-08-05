-- Script para configurar el sistema de relevancia en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar que la tabla configuracion_relevancia existe
-- Si no existe, la migración ya la creó, pero verificamos la estructura

-- 2. Insertar configuración inicial si no existe
INSERT INTO public.configuracion_relevancia (nombre_configuracion, descripcion, configuracion, activo) 
VALUES (
    'configuracion_default',
    'Configuración por defecto del sistema de relevancia',
    '{
        "pesos": {
            "busqueda": 30,
            "historial": 25,
            "stock": 15,
            "precio": 10,
            "descuentos": 10,
            "otros": 10
        },
        "configuracionAvanzada": {
            "tiempoRespuesta": 2.5,
            "precisionMinima": 85,
            "maxResultados": 50,
            "actualizacionAutomatica": true,
            "loggingDetallado": false
        }
    }',
    true
) ON CONFLICT (nombre_configuracion) DO NOTHING;

-- 3. Verificar que se insertó correctamente
SELECT 
    id_configuracion,
    nombre_configuracion,
    descripcion,
    configuracion,
    activo,
    fecha_creacion,
    fecha_actualizacion
FROM public.configuracion_relevancia 
WHERE nombre_configuracion = 'configuracion_default';

-- 4. Crear índices adicionales para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_configuracion_relevancia_activo 
ON public.configuracion_relevancia(activo);

CREATE INDEX IF NOT EXISTS idx_configuracion_relevancia_nombre 
ON public.configuracion_relevancia(nombre_configuracion);

-- 5. Verificar que todas las tablas del sistema de relevancia existen
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'configuracion_relevancia',
    'preferencias_usuario',
    'interacciones_usuario',
    'busquedas_usuario',
    'recomendaciones',
    'metricas_relevancia',
    'onboarding_usuarios'
)
ORDER BY table_name;

-- 6. Mostrar estadísticas de las tablas (corregido)
SELECT 
    schemaname,
    relname as table_name,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE relname IN (
    'configuracion_relevancia',
    'preferencias_usuario',
    'interacciones_usuario',
    'busquedas_usuario',
    'recomendaciones',
    'metricas_relevancia',
    'onboarding_usuarios'
)
ORDER BY relname; 