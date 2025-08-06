-- Script para actualizar la tabla de configuración de relevancia para soportar usuarios individuales
-- Ejecutar en Supabase SQL Editor

-- Agregar columna usuario_id a la tabla configuracion_relevancia
ALTER TABLE configuracion_relevancia 
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para mejorar el rendimiento de consultas por usuario
CREATE INDEX IF NOT EXISTS idx_configuracion_relevancia_usuario 
ON configuracion_relevancia(usuario_id);

-- Actualizar políticas RLS para permitir que usuarios vean su propia configuración
DROP POLICY IF EXISTS "Usuarios pueden ver su propia configuración de relevancia" ON configuracion_relevancia;
DROP POLICY IF EXISTS "Usuarios pueden insertar su propia configuración de relevancia" ON configuracion_relevancia;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia configuración de relevancia" ON configuracion_relevancia;
DROP POLICY IF EXISTS "Usuarios pueden eliminar su propia configuración de relevancia" ON configuracion_relevancia;

-- Políticas para configuración de relevancia por usuario
CREATE POLICY "Usuarios pueden ver su propia configuración de relevancia" ON configuracion_relevancia
    FOR SELECT USING (
        auth.uid() = usuario_id OR 
        (usuario_id IS NULL AND auth.uid() IN (
            SELECT id FROM auth.users WHERE email IN (
                SELECT email FROM usuarios WHERE rol = 'admin'
            )
        ))
    );

CREATE POLICY "Usuarios pueden insertar su propia configuración de relevancia" ON configuracion_relevancia
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propia configuración de relevancia" ON configuracion_relevancia
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar su propia configuración de relevancia" ON configuracion_relevancia
    FOR DELETE USING (auth.uid() = usuario_id);

-- Función para obtener configuración de relevancia del usuario
CREATE OR REPLACE FUNCTION obtener_configuracion_relevancia_usuario(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    peso_tiempo_vista DECIMAL(3,2),
    peso_busquedas DECIMAL(3,2),
    peso_clics DECIMAL(3,2),
    peso_preferencias DECIMAL(3,2),
    factor_decaimiento DECIMAL(3,2),
    tiempo_respuesta_objetivo INTEGER,
    max_recomendaciones INTEGER,
    umbral_relevancia DECIMAL(3,2),
    sistema_activo BOOLEAN,
    modo_configuracion VARCHAR(20)
) AS $$
BEGIN
    -- Si no se proporciona usuario, usar el usuario autenticado
    IF user_uuid IS NULL THEN
        user_uuid := auth.uid();
    END IF;
    
    RETURN QUERY
    SELECT 
        cr.peso_tiempo_vista,
        cr.peso_busquedas,
        cr.peso_clics,
        cr.peso_preferencias,
        cr.factor_decaimiento,
        cr.tiempo_respuesta_objetivo,
        cr.max_recomendaciones,
        cr.umbral_relevancia,
        cr.sistema_activo,
        cr.modo_configuracion
    FROM configuracion_relevancia cr
    WHERE cr.usuario_id = user_uuid
    LIMIT 1;
    
    -- Si no hay configuración específica del usuario, retornar configuración global
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            cr.peso_tiempo_vista,
            cr.peso_busquedas,
            cr.peso_clics,
            cr.peso_preferencias,
            cr.factor_decaimiento,
            cr.tiempo_respuesta_objetivo,
            cr.max_recomendaciones,
            cr.umbral_relevancia,
            cr.sistema_activo,
            cr.modo_configuracion
        FROM configuracion_relevancia cr
        WHERE cr.usuario_id IS NULL
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para calcular relevancia de un producto para un usuario
CREATE OR REPLACE FUNCTION calcular_relevancia_producto(
    producto_id_param INTEGER,
    user_uuid UUID DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    config_record RECORD;
    score DECIMAL(5,2) := 0;
    tiempo_vista_total INTEGER := 0;
    clics_count INTEGER := 0;
    busquedas_relacionadas INTEGER := 0;
    tiene_preferencias BOOLEAN := FALSE;
BEGIN
    -- Obtener configuración del usuario
    SELECT * INTO config_record FROM obtener_configuracion_relevancia_usuario(user_uuid);
    
    -- Si no hay configuración, usar valores por defecto
    IF config_record IS NULL THEN
        config_record.peso_tiempo_vista := 0.25;
        config_record.peso_busquedas := 0.30;
        config_record.peso_clics := 0.25;
        config_record.peso_preferencias := 0.20;
    END IF;
    
    -- Calcular score por tiempo de vista
    SELECT COALESCE(SUM(tiempo_vista), 0) INTO tiempo_vista_total
    FROM historial_productos_vistos 
    WHERE producto_id = producto_id_param AND usuario_id = user_uuid;
    
    IF tiempo_vista_total > 0 THEN
        score := score + (LEAST(tiempo_vista_total / 100.0, 1.0) * config_record.peso_tiempo_vista * 100);
    END IF;
    
    -- Calcular score por clics
    SELECT COUNT(*) INTO clics_count
    FROM historial_clics 
    WHERE producto_id = producto_id_param AND usuario_id = user_uuid;
    
    IF clics_count > 0 THEN
        score := score + (LEAST(clics_count * 10.0, config_record.peso_clics * 100));
    END IF;
    
    -- Calcular score por búsquedas relacionadas (simplificado)
    SELECT COUNT(*) INTO busquedas_relacionadas
    FROM historial_busquedas 
    WHERE usuario_id = user_uuid;
    
    IF busquedas_relacionadas > 0 THEN
        score := score + (config_record.peso_busquedas * 50);
    END IF;
    
    -- Verificar si tiene preferencias
    SELECT EXISTS(
        SELECT 1 FROM preferencias_usuarios 
        WHERE usuario_id = user_uuid
    ) INTO tiene_preferencias;
    
    IF tiene_preferencias THEN
        score := score + (config_record.peso_preferencias * 100);
    END IF;
    
    RETURN LEAST(score, 100.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar la estructura actualizada
SELECT 'Verificando estructura de configuracion_relevancia:' as mensaje;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'configuracion_relevancia'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 'Verificando políticas RLS:' as mensaje;

SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'configuracion_relevancia';

-- Verificar funciones creadas
SELECT 'Verificando funciones:' as mensaje;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'obtener_configuracion_relevancia_usuario',
    'calcular_relevancia_producto'
);

-- Mostrar configuración actual
SELECT 'Configuración actual:' as mensaje;

SELECT 
    usuario_id,
    peso_tiempo_vista,
    peso_busquedas,
    peso_clics,
    peso_preferencias,
    factor_decaimiento,
    tiempo_respuesta_objetivo,
    max_recomendaciones,
    umbral_relevancia,
    sistema_activo,
    modo_configuracion
FROM configuracion_relevancia
ORDER BY usuario_id NULLS FIRST; 