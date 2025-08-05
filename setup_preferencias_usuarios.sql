-- Crear tabla para preferencias de usuarios
CREATE TABLE IF NOT EXISTS preferencias_usuarios (
    id_preferencia SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    categorias TEXT[] DEFAULT '{}',
    materiales TEXT[] DEFAULT '{}',
    rango_precio VARCHAR(50),
    experiencia VARCHAR(50),
    completado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_preferencias_usuario_id ON preferencias_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_preferencias_completado ON preferencias_usuarios(completado);

-- Crear política RLS (Row Level Security)
ALTER TABLE preferencias_usuarios ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver y modificar sus propias preferencias
CREATE POLICY "Usuarios pueden ver sus propias preferencias" ON preferencias_usuarios
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar sus propias preferencias" ON preferencias_usuarios
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propias preferencias" ON preferencias_usuarios
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_preferencias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
CREATE TRIGGER trigger_actualizar_fecha_preferencias
    BEFORE UPDATE ON preferencias_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_preferencias();

-- Insertar datos de ejemplo (opcional)
INSERT INTO preferencias_usuarios (usuario_id, categorias, materiales, rango_precio, experiencia, completado)
VALUES 
    ('00000000-0000-0000-0000-000000000000', ARRAY['bano', 'cocina'], ARRAY['porcelana', 'gres'], 'medio', 'intermedio', true)
ON CONFLICT (usuario_id) DO NOTHING;

-- Comentarios sobre la estructura
COMMENT ON TABLE preferencias_usuarios IS 'Tabla para almacenar las preferencias de los usuarios del sistema de relevancia';
COMMENT ON COLUMN preferencias_usuarios.usuario_id IS 'ID del usuario de auth.users';
COMMENT ON COLUMN preferencias_usuarios.categorias IS 'Array de categorías seleccionadas por el usuario';
COMMENT ON COLUMN preferencias_usuarios.materiales IS 'Array de materiales preferidos por el usuario';
COMMENT ON COLUMN preferencias_usuarios.rango_precio IS 'Rango de precios preferido: economico, medio, premium, luxury';
COMMENT ON COLUMN preferencias_usuarios.experiencia IS 'Nivel de experiencia: principiante, intermedio, experto';
COMMENT ON COLUMN preferencias_usuarios.completado IS 'Indica si el usuario ha completado el onboarding'; 