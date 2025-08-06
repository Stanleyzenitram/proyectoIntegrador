-- Script para agregar las columnas de pesos de relevancia a la tabla configuracion_relevancia
-- Este script debe ejecutarse ANTES de actualizar_configuracion_relevancia_usuarios.sql

-- Agregar columnas de pesos de relevancia si no existen
DO $$ 
BEGIN
    -- Peso para tiempo de vista
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'peso_tiempo_vista') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN peso_tiempo_vista DECIMAL(3,2) DEFAULT 0.25;
    END IF;

    -- Peso para búsquedas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'peso_busquedas') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN peso_busquedas DECIMAL(3,2) DEFAULT 0.30;
    END IF;

    -- Peso para clics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'peso_clics') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN peso_clics DECIMAL(3,2) DEFAULT 0.25;
    END IF;

    -- Peso para preferencias del usuario
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'peso_preferencias') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN peso_preferencias DECIMAL(3,2) DEFAULT 0.20;
    END IF;

    -- Factor de decaimiento temporal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'factor_decaimiento') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN factor_decaimiento DECIMAL(3,2) DEFAULT 0.95;
    END IF;

    -- Tiempo de respuesta objetivo (en segundos)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'tiempo_respuesta_objetivo') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN tiempo_respuesta_objetivo INTEGER DEFAULT 500;
    END IF;

    -- Número máximo de recomendaciones
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'max_recomendaciones') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN max_recomendaciones INTEGER DEFAULT 10;
    END IF;

    -- Umbral mínimo de relevancia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'umbral_relevancia') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN umbral_relevancia DECIMAL(3,2) DEFAULT 0.10;
    END IF;

    -- Habilitar/deshabilitar sistema de relevancia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'sistema_activo') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN sistema_activo BOOLEAN DEFAULT true;
    END IF;

    -- Modo de configuración (global o personalizado)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'configuracion_relevancia' 
                   AND column_name = 'modo_configuracion') THEN
        ALTER TABLE configuracion_relevancia ADD COLUMN modo_configuracion VARCHAR(20) DEFAULT 'global';
    END IF;

END $$;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'configuracion_relevancia' 
AND column_name IN (
    'peso_tiempo_vista',
    'peso_busquedas', 
    'peso_clics',
    'peso_preferencias',
    'factor_decaimiento',
    'tiempo_respuesta_objetivo',
    'max_recomendaciones',
    'umbral_relevancia',
    'sistema_activo',
    'modo_configuracion'
)
ORDER BY column_name;

-- Mostrar la estructura completa de la tabla
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'configuracion_relevancia'
ORDER BY ordinal_position; 