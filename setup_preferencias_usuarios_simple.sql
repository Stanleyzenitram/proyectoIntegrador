-- Paso 1: Crear la tabla básica
CREATE TABLE IF NOT EXISTS preferencias_usuarios (
    id_preferencia SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL,
    categorias TEXT[] DEFAULT '{}',
    materiales TEXT[] DEFAULT '{}',
    rango_precio VARCHAR(50),
    experiencia VARCHAR(50),
    completado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 2: Agregar restricción única
ALTER TABLE preferencias_usuarios ADD CONSTRAINT unique_usuario_id UNIQUE (usuario_id);

-- Paso 3: Agregar referencia a auth.users
ALTER TABLE preferencias_usuarios ADD CONSTRAINT fk_usuario_id 
    FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Paso 4: Crear índices
CREATE INDEX IF NOT EXISTS idx_preferencias_usuario_id ON preferencias_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_preferencias_completado ON preferencias_usuarios(completado);

-- Paso 5: Habilitar RLS
ALTER TABLE preferencias_usuarios ENABLE ROW LEVEL SECURITY;

-- Paso 6: Crear políticas RLS
CREATE POLICY "Usuarios pueden ver sus propias preferencias" ON preferencias_usuarios
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar sus propias preferencias" ON preferencias_usuarios
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propias preferencias" ON preferencias_usuarios
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Paso 7: Crear función para actualizar fecha
CREATE OR REPLACE FUNCTION actualizar_fecha_preferencias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 8: Crear trigger
CREATE TRIGGER trigger_actualizar_fecha_preferencias
    BEFORE UPDATE ON preferencias_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_preferencias(); 