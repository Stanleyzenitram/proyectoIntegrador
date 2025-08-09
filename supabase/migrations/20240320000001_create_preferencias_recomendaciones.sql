-- Migración para el sistema de recomendaciones
-- Crear tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS public.preferencias_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    categorias_favoritas INTEGER[], -- IDs de categorías favoritas
    estilos_preferidos INTEGER[], -- IDs de estilos preferidos
    materiales_favoritos INTEGER[], -- IDs de materiales favoritos
    rango_precio_min DECIMAL(10,2),
    rango_precio_max DECIMAL(10,2),
    color_preferido VARCHAR(50),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de historial de navegación
CREATE TABLE IF NOT EXISTS public.historial_navegacion (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES public.productos(id_producto) ON DELETE CASCADE,
    fecha_vista TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tiempo_vista INTEGER, -- tiempo en segundos que estuvo viendo el producto
    accion VARCHAR(50) -- 'vista', 'click', 'favorito', 'carrito'
);

-- Crear tabla de comportamiento de compra
CREATE TABLE IF NOT EXISTS public.comportamiento_compra (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES public.productos(id_producto) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL, -- 'agregado_carrito', 'comprado', 'favorito', 'comparado'
    fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10,2)
);

-- Crear tabla de productos recomendados
CREATE TABLE IF NOT EXISTS public.productos_recomendados (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES public.productos(id_producto) ON DELETE CASCADE,
    score_recomendacion DECIMAL(5,4) NOT NULL, -- puntuación de 0.0000 a 1.0000
    tipo_recomendacion VARCHAR(50) NOT NULL, -- 'categoria', 'estilo', 'material', 'colaborativo', 'popular'
    fecha_recomendacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visto BOOLEAN DEFAULT false,
    clickeado BOOLEAN DEFAULT false
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_preferencias_usuario_id ON public.preferencias_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_navegacion_usuario ON public.historial_navegacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_navegacion_producto ON public.historial_navegacion(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_navegacion_fecha ON public.historial_navegacion(fecha_vista);
CREATE INDEX IF NOT EXISTS idx_comportamiento_compra_usuario ON public.comportamiento_compra(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comportamiento_compra_producto ON public.comportamiento_compra(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_recomendados_usuario ON public.productos_recomendados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_productos_recomendados_score ON public.productos_recomendados(score_recomendacion DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.preferencias_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_navegacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comportamiento_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_recomendados ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para preferencias_usuario
CREATE POLICY "Usuarios pueden ver sus propias preferencias" ON public.preferencias_usuario
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden modificar sus propias preferencias" ON public.preferencias_usuario
    FOR ALL USING (usuario_id = auth.uid());

-- Políticas de seguridad para historial_navegacion
CREATE POLICY "Usuarios pueden ver su propio historial" ON public.historial_navegacion
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden insertar en su historial" ON public.historial_navegacion
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Políticas de seguridad para comportamiento_compra
CREATE POLICY "Usuarios pueden ver su propio comportamiento" ON public.comportamiento_compra
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden insertar su comportamiento" ON public.comportamiento_compra
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Políticas de seguridad para productos_recomendados
CREATE POLICY "Usuarios pueden ver sus recomendaciones" ON public.productos_recomendados
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus recomendaciones" ON public.productos_recomendados
    FOR UPDATE USING (usuario_id = auth.uid());

-- Permitir inserción de recomendaciones por el sistema
CREATE POLICY "Sistema puede insertar recomendaciones" ON public.productos_recomendados
    FOR INSERT WITH CHECK (true);
