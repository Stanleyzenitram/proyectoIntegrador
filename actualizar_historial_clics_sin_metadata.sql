-- Script para actualizar la tabla historial_clics para evitar duplicados
-- Agregar columnas para cantidad de clics y último clic (sin metadata)

-- 1. Agregar columnas nuevas a la tabla historial_clics
ALTER TABLE historial_clics 
ADD COLUMN IF NOT EXISTS cantidad_clics INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ultimo_clic TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Crear una tabla temporal para almacenar los datos consolidados
CREATE TEMP TABLE clics_consolidados_temp AS
SELECT 
    usuario_id,
    producto_id,
    tipo_clic,
    origen_clic,
    COUNT(*) as cantidad_clics,
    MAX(fecha_clic) as ultimo_clic
FROM historial_clics
GROUP BY usuario_id, producto_id, tipo_clic, origen_clic;

-- 3. Limpiar la tabla original
DELETE FROM historial_clics;

-- 4. Reinsertar los datos consolidados
INSERT INTO historial_clics (
    usuario_id,
    producto_id,
    tipo_clic,
    origen_clic,
    cantidad_clics,
    ultimo_clic
)
SELECT 
    usuario_id,
    producto_id,
    tipo_clic,
    origen_clic,
    cantidad_clics,
    ultimo_clic
FROM clics_consolidados_temp;

-- 5. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_clics_usuario_producto 
ON historial_clics(usuario_id, producto_id);

CREATE INDEX IF NOT EXISTS idx_historial_clics_ultimo_clic 
ON historial_clics(ultimo_clic);

-- 6. Verificar que los cambios se aplicaron correctamente
SELECT 
    'Registros consolidados' as tipo,
    COUNT(*) as cantidad
FROM historial_clics
UNION ALL
SELECT 
    'Total clics' as tipo,
    SUM(cantidad_clics) as cantidad
FROM historial_clics;

-- 7. Mostrar algunos ejemplos de los datos consolidados
SELECT 
    usuario_id,
    producto_id,
    tipo_clic,
    cantidad_clics,
    ultimo_clic
FROM historial_clics
ORDER BY ultimo_clic DESC
LIMIT 10; 