-- Script simple para crear la tabla de preferencias de usuarios
-- Ejecuta este script en Supabase SQL Editor

-- 1. Crear la tabla
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

-- 2. Agregar restricción única
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_usuario_id' 
        AND conrelid = 'preferencias_usuarios'::regclass
    ) THEN
        ALTER TABLE preferencias_usuarios ADD CONSTRAINT unique_usuario_id UNIQUE (usuario_id);
    END IF;
END $$;

-- 3. Agregar referencia a auth.users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_usuario_id' 
        AND conrelid = 'preferencias_usuarios'::regclass
    ) THEN
        ALTER TABLE preferencias_usuarios ADD CONSTRAINT fk_usuario_id 
            FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_preferencias_usuario_id ON preferencias_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_preferencias_completado ON preferencias_usuarios(completado);

-- 5. Habilitar RLS
ALTER TABLE preferencias_usuarios ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS (eliminar si existen primero)
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias preferencias" ON preferencias_usuarios;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propias preferencias" ON preferencias_usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias preferencias" ON preferencias_usuarios;

CREATE POLICY "Usuarios pueden ver sus propias preferencias" ON preferencias_usuarios
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar sus propias preferencias" ON preferencias_usuarios
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propias preferencias" ON preferencias_usuarios
    FOR UPDATE USING (auth.uid() = usuario_id);

-- 7. Crear función para actualizar fecha
CREATE OR REPLACE FUNCTION actualizar_fecha_preferencias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_preferencias ON preferencias_usuarios;
CREATE TRIGGER trigger_actualizar_fecha_preferencias
    BEFORE UPDATE ON preferencias_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_preferencias();

-- 9. Verificar que todo esté creado
SELECT 'Tabla creada exitosamente' as resultado; 