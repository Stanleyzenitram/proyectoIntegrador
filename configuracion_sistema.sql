-- Crear tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_configuracion_sistema_nombre ON configuracion_sistema(nombre);
CREATE INDEX IF NOT EXISTS idx_configuracion_sistema_activo ON configuracion_sistema(activo);

-- Insertar configuraciones por defecto
INSERT INTO configuracion_sistema (nombre, valor, descripcion, activo) VALUES
(
    'rangos_precio',
    '{
        "bajo": {"min": 0, "max": 50, "nombre": "Económico"},
        "medio": {"min": 51, "max": 150, "nombre": "Intermedio"},
        "alto": {"min": 151, "max": 500, "nombre": "Premium"}
    }',
    'Rangos de precios para categorización de productos',
    true
),
(
    'categorias_colores',
    '{
        "neutros": {"nombre": "Colores Neutros", "colores": ["Blanco", "Gris", "Beige", "Crema"]},
        "vibrantes": {"nombre": "Colores Vibrantes", "colores": ["Rojo", "Azul", "Verde", "Amarillo", "Naranja"]},
        "terrosos": {"nombre": "Colores Terrosos", "colores": ["Marrón", "Ocre", "Siena", "Tierra"]},
        "pasteles": {"nombre": "Colores Pasteles", "colores": ["Rosa", "Azul Claro", "Verde Menta", "Lavanda"]},
        "metálicos": {"nombre": "Colores Metálicos", "colores": ["Dorado", "Plateado", "Cobre", "Bronce"]}
    }',
    'Categorías de colores y sus colores asociados',
    true
),
(
    'configuracion_recomendaciones',
    '{
        "limite_productos": 12,
        "peso_precio": 0.3,
        "peso_color": 0.25,
        "peso_estilo": 0.25,
        "peso_material": 0.2,
        "umbral_similitud": 0.7
    }',
    'Configuración para el sistema de recomendaciones',
    true
),
(
    'configuracion_ui',
    '{
        "colores_primarios": ["#f97316", "#ea580c", "#c2410c"],
        "colores_secundarios": ["#64748b", "#475569", "#334155"],
        "tema": "claro",
        "animaciones": true
    }',
    'Configuración de la interfaz de usuario',
    true
)
ON CONFLICT (nombre) DO UPDATE SET
    valor = EXCLUDED.valor,
    descripcion = EXCLUDED.descripcion,
    updated_at = NOW();

-- Crear función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_configuracion_sistema_updated_at 
    BEFORE UPDATE ON configuracion_sistema 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear función para obtener configuración por nombre
CREATE OR REPLACE FUNCTION obtener_configuracion(nombre_config VARCHAR)
RETURNS JSONB AS $$
DECLARE
    resultado JSONB;
BEGIN
    SELECT valor INTO resultado
    FROM configuracion_sistema
    WHERE nombre = nombre_config AND activo = true;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Crear función para actualizar configuración
CREATE OR REPLACE FUNCTION actualizar_configuracion(
    nombre_config VARCHAR,
    nuevo_valor JSONB,
    nueva_descripcion TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE configuracion_sistema
    SET valor = nuevo_valor,
        descripcion = COALESCE(nueva_descripcion, descripcion),
        updated_at = NOW()
    WHERE nombre = nombre_config;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
