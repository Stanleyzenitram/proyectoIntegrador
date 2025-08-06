-- Script para crear las tablas de historial de interacciones
-- Ejecutar en Supabase SQL Editor

-- Tabla para registrar productos vistos
CREATE TABLE IF NOT EXISTS historial_productos_vistos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id_producto) ON DELETE CASCADE,
    fecha_vista TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tiempo_vista INTEGER DEFAULT 0,
    relevancia_calculada INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla para registrar búsquedas realizadas
CREATE TABLE IF NOT EXISTS historial_busquedas (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    termino_busqueda TEXT NOT NULL,
    fecha_busqueda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resultados_encontrados INTEGER DEFAULT 0,
    filtros_aplicados JSONB DEFAULT '{}'::jsonb,
    categoria_filtrada TEXT,
    rango_precio TEXT
);

-- Tabla para registrar productos comprados
CREATE TABLE IF NOT EXISTS historial_compras (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id_producto) ON DELETE CASCADE,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INTEGER NOT NULL,
    total_compra DECIMAL(10,2) NOT NULL,
    orden_id TEXT,
    estado_compra TEXT DEFAULT 'completada'
);

-- Tabla para registrar clics en productos
CREATE TABLE IF NOT EXISTS historial_clics (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id_producto) ON DELETE CASCADE,
    fecha_clic TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo_clic TEXT DEFAULT 'producto',
    origen_clic TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_vistos_usuario_fecha ON historial_productos_vistos(usuario_id, fecha_vista DESC);
CREATE INDEX IF NOT EXISTS idx_historial_vistos_producto ON historial_productos_vistos(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_busquedas_usuario_fecha ON historial_busquedas(usuario_id, fecha_busqueda DESC);
CREATE INDEX IF NOT EXISTS idx_historial_compras_usuario_fecha ON historial_compras(usuario_id, fecha_compra DESC);
CREATE INDEX IF NOT EXISTS idx_historial_clics_usuario_fecha ON historial_clics(usuario_id, fecha_clic DESC);

-- Políticas RLS (Row Level Security)
ALTER TABLE historial_productos_vistos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_busquedas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_clics ENABLE ROW LEVEL SECURITY;

-- Políticas para historial_productos_vistos
CREATE POLICY "Usuarios pueden ver su propio historial de productos vistos" ON historial_productos_vistos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar su propio historial de productos vistos" ON historial_productos_vistos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propio historial de productos vistos" ON historial_productos_vistos
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar su propio historial de productos vistos" ON historial_productos_vistos
    FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para historial_busquedas
CREATE POLICY "Usuarios pueden ver su propio historial de búsquedas" ON historial_busquedas
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar su propio historial de búsquedas" ON historial_busquedas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propio historial de búsquedas" ON historial_busquedas
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar su propio historial de búsquedas" ON historial_busquedas
    FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para historial_compras
CREATE POLICY "Usuarios pueden ver su propio historial de compras" ON historial_compras
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar su propio historial de compras" ON historial_compras
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propio historial de compras" ON historial_compras
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar su propio historial de compras" ON historial_compras
    FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para historial_clics
CREATE POLICY "Usuarios pueden ver su propio historial de clics" ON historial_clics
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar su propio historial de clics" ON historial_clics
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propio historial de clics" ON historial_clics
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar su propio historial de clics" ON historial_clics
    FOR DELETE USING (auth.uid() = usuario_id);

-- Función para limpiar historial antiguo
CREATE OR REPLACE FUNCTION limpiar_historial_antiguo(dias_antiguedad INTEGER DEFAULT 365)
RETURNS void AS $$
BEGIN
    DELETE FROM historial_productos_vistos 
    WHERE fecha_vista < NOW() - INTERVAL '1 day' * dias_antiguedad;
    
    DELETE FROM historial_busquedas 
    WHERE fecha_busqueda < NOW() - INTERVAL '1 day' * dias_antiguedad;
    
    DELETE FROM historial_clics 
    WHERE fecha_clic < NOW() - INTERVAL '1 day' * dias_antiguedad;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del usuario
CREATE OR REPLACE FUNCTION obtener_estadisticas_usuario(user_uuid UUID)
RETURNS TABLE (
    total_productos_vistos BIGINT,
    total_busquedas BIGINT,
    total_compras BIGINT,
    total_clics BIGINT,
    tasa_conversion DECIMAL(5,2),
    categoria_mas_visitada TEXT,
    rango_precio_preferido TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            (SELECT COUNT(*) FROM historial_productos_vistos WHERE usuario_id = user_uuid) as vistos,
            (SELECT COUNT(*) FROM historial_busquedas WHERE usuario_id = user_uuid) as busquedas,
            (SELECT COUNT(*) FROM historial_compras WHERE usuario_id = user_uuid) as compras,
            (SELECT COUNT(*) FROM historial_clics WHERE usuario_id = user_uuid) as clics
    ),
    conversion AS (
        SELECT 
            CASE 
                WHEN stats.vistos > 0 THEN 
                    ROUND((stats.compras::DECIMAL / stats.vistos::DECIMAL) * 100, 2)
                ELSE 0 
            END as tasa
        FROM stats
    )
    SELECT 
        stats.vistos,
        stats.busquedas,
        stats.compras,
        stats.clics,
        conversion.tasa,
        'Baño'::TEXT,
        '$100-$200'::TEXT
    FROM stats, conversion;
END;
$$ LANGUAGE plpgsql;

SELECT 'Tablas de historial de interacciones creadas exitosamente' as mensaje; 