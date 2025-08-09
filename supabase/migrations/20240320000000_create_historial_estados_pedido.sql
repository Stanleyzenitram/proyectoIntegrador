-- Crear tabla para el historial de estados de pedidos
CREATE TABLE IF NOT EXISTS public.historial_estados_pedido (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL,
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    comentario TEXT,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_estados_pedido_id_pedido ON public.historial_estados_pedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_historial_estados_pedido_fecha ON public.historial_estados_pedido(fecha_cambio);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.historial_estados_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Los usuarios pueden ver el historial de sus propios pedidos
CREATE POLICY "Usuarios pueden ver historial de sus pedidos" ON public.historial_estados_pedido
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id_pedido = historial_estados_pedido.id_pedido
            AND p.id_cliente = auth.uid()
        )
    );

-- Los administradores pueden ver todo el historial
CREATE POLICY "Administradores pueden ver todo el historial" ON public.historial_estados_pedido
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.empleados e
            WHERE e.id_usuario = auth.uid()
            AND e.rol IN ('admin', 'gerente', 'vendedor')
        )
    );

-- Permitir inserción solo a administradores y empleados
CREATE POLICY "Solo empleados pueden insertar historial" ON public.historial_estados_pedido
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.empleados e
            WHERE e.id_usuario = auth.uid()
        )
    );
