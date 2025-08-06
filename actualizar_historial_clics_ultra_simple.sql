-- Script ultra simple para actualizar la tabla historial_clics para evitar duplicados
-- Agregar columnas para cantidad de clics y último clic

-- 1. Agregar columnas nuevas a la tabla historial_clics
ALTER TABLE historial_clics 
ADD COLUMN IF NOT EXISTS cantidad_clics INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ultimo_clic TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Actualizar registros existentes para consolidar duplicados
-- Usar una subconsulta simple para obtener el metadata del registro más reciente
WITH clics_consolidados AS (
    SELECT 
        usuario_id,
        producto_id,
        tipo_clic,
        origen_clic,
        COUNT(*) as cantidad_clics,
        MAX(fecha_clic) as ultimo_clic,
        -- Obtener el metadata del registro más reciente usando subconsulta
        (SELECT metadata 
         FROM historial_clics h2 
         WHERE h2.usuario_id = historial_clics.usuario_id 
         AND h2.producto_id = historial_clics.producto_id 
         AND h2.tipo_clic = historial_clics.tipo_clic
         AND h2.origen_clic = historial_clics.origen_clic
         AND h2.fecha_clic = MAX(historial_clics.fecha_clic)
         LIMIT 1) as metadata
    FROM historial_clics
    GROUP BY usuario_id, producto_id, tipo_clic, origen_clic
)
-- Limpiar y reinsertar
DELETE FROM historial_clics;

INSERT INTO historial_clics (
    usuario_id,
    producto_id,
    tipo_clic,
    origen_clic,
    cantidad_clics,
    ultimo_clic,
    metadata
)
SELECT 
    usuario_id,
    producto_id,
    tipo_clic,
    origen_clic,
    cantidad_clics,
    ultimo_clic,
    metadata
FROM clics_consolidados;

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_clics_usuario_producto 
ON historial_clics(usuario_id, producto_id);

CREATE INDEX IF NOT EXISTS idx_historial_clics_ultimo_clic 
ON historial_clics(ultimo_clic);

-- 4. Verificar que los cambios se aplicaron correctamente
SELECT 
    'Registros consolidados' as tipo,
    COUNT(*) as cantidad
FROM historial_clics
UNION ALL
SELECT 
    'Total clics' as tipo,
    SUM(cantidad_clics) as cantidad
FROM historial_clics;

-- 5. Mostrar algunos ejemplos de los datos consolidados
SELECT 
    usuario_id,
    producto_id,
    tipo_clic,
    cantidad_clics,
    ultimo_clic
FROM historial_clics
ORDER BY ultimo_clic DESC
LIMIT 10; 