-- Script para crear la tabla direcciones_pedidos si no existe
CREATE TABLE IF NOT EXISTS direcciones_pedidos (
    id_direccion_pedido SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    calle VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    referencia TEXT,
    pais VARCHAR(100) DEFAULT 'República Dominicana',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_direccion_pedido 
        FOREIGN KEY (id_pedido) 
        REFERENCES pedidos(id_pedido) 
        ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_direcciones_pedidos_pedido 
    ON direcciones_pedidos(id_pedido);

-- Agregar comentarios a la tabla
COMMENT ON TABLE direcciones_pedidos IS 'Tabla para almacenar las direcciones de entrega de los pedidos';
COMMENT ON COLUMN direcciones_pedidos.id_direccion_pedido IS 'Identificador único de la dirección del pedido';
COMMENT ON COLUMN direcciones_pedidos.id_pedido IS 'Referencia al pedido al que pertenece esta dirección';
COMMENT ON COLUMN direcciones_pedidos.calle IS 'Calle y número de la dirección de entrega';
COMMENT ON COLUMN direcciones_pedidos.ciudad IS 'Ciudad de la dirección de entrega';
COMMENT ON COLUMN direcciones_pedidos.provincia IS 'Provincia de la dirección de entrega';
COMMENT ON COLUMN direcciones_pedidos.codigo_postal IS 'Código postal de la dirección de entrega';
COMMENT ON COLUMN direcciones_pedidos.referencia IS 'Referencias adicionales para la ubicación';
COMMENT ON COLUMN direcciones_pedidos.pais IS 'País de la dirección de entrega'; 