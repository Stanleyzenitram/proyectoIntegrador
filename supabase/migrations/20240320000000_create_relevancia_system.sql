-- Migración para Sistema de Relevancia y Expansión de Productos
-- Fecha: 2024-03-20

-- 1. Expandir tabla de categorías para incluir más tipos de productos
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS tipo_producto character varying DEFAULT 'ceramica';
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS icono character varying;
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;

-- 2. Crear tabla de tipos de productos
CREATE TABLE IF NOT EXISTS public.tipos_producto (
    id_tipo_producto integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_tipo character varying NOT NULL UNIQUE,
    descripcion text,
    icono character varying,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Expandir tabla de productos para incluir más tipos de artículos
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS id_tipo_producto integer;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS marca character varying;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS modelo character varying;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS dimensiones character varying;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS peso numeric;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS garantia_meses integer;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS caracteristicas_especiales text[];
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS rating_promedio numeric DEFAULT 0;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS total_valoraciones integer DEFAULT 0;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS popularidad integer DEFAULT 0;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS fecha_lanzamiento date;
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;

-- 4. Crear tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS public.preferencias_usuario (
    id_preferencia integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente integer NOT NULL,
    id_categoria integer,
    id_estilo integer,
    id_materiales integer,
    id_tipo_producto integer,
    peso_preferencia numeric DEFAULT 1.0 CHECK (peso_preferencia >= 0 AND peso_preferencia <= 10),
    fecha_creacion timestamp with time zone DEFAULT now(),
    fecha_actualizacion timestamp with time zone DEFAULT now(),
    activo boolean DEFAULT true,
    CONSTRAINT fk_preferencias_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente),
    CONSTRAINT fk_preferencias_categoria FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria),
    CONSTRAINT fk_preferencias_estilo FOREIGN KEY (id_estilo) REFERENCES public.estilos(id_estilo),
    CONSTRAINT fk_preferencias_materiales FOREIGN KEY (id_materiales) REFERENCES public.materiales(id_materiales),
    CONSTRAINT fk_preferencias_tipo_producto FOREIGN KEY (id_tipo_producto) REFERENCES public.tipos_producto(id_tipo_producto)
);

-- 5. Crear tabla de interacciones de usuario
CREATE TABLE IF NOT EXISTS public.interacciones_usuario (
    id_interaccion integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente integer NOT NULL,
    id_producto integer NOT NULL,
    tipo_interaccion character varying NOT NULL CHECK (tipo_interaccion IN ('vista', 'busqueda', 'favorito', 'compra', 'valoracion', 'comentario')),
    valoracion integer CHECK (valoracion >= 1 AND valoracion <= 5),
    comentario text,
    tiempo_vista_segundos integer,
    fecha_interaccion timestamp with time zone DEFAULT now(),
    metadata jsonb,
    CONSTRAINT fk_interacciones_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente),
    CONSTRAINT fk_interacciones_producto FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto)
);

-- 6. Crear tabla de búsquedas de usuario
CREATE TABLE IF NOT EXISTS public.busquedas_usuario (
    id_busqueda integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente integer,
    termino_busqueda character varying NOT NULL,
    filtros_aplicados jsonb,
    resultados_obtenidos integer,
    productos_vistos integer[],
    fecha_busqueda timestamp with time zone DEFAULT now(),
    tiempo_busqueda_ms integer,
    exito boolean DEFAULT true,
    CONSTRAINT fk_busquedas_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente)
);

-- 7. Crear tabla de configuración del sistema de relevancia
CREATE TABLE IF NOT EXISTS public.configuracion_relevancia (
    id_configuracion integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_configuracion character varying NOT NULL UNIQUE,
    descripcion text,
    configuracion jsonb NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp with time zone DEFAULT now(),
    fecha_actualizacion timestamp with time zone DEFAULT now()
);

-- 8. Crear tabla de métricas de relevancia
CREATE TABLE IF NOT EXISTS public.metricas_relevancia (
    id_metrica integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente integer,
    tipo_metrica character varying NOT NULL,
    valor_metrica numeric NOT NULL,
    fecha_metrica date NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fk_metricas_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente)
);

-- 9. Crear tabla de recomendaciones generadas
CREATE TABLE IF NOT EXISTS public.recomendaciones (
    id_recomendacion integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente integer NOT NULL,
    id_producto integer NOT NULL,
    score_relevancia numeric NOT NULL CHECK (score_relevancia >= 0 AND score_relevancia <= 1),
    tipo_recomendacion character varying NOT NULL CHECK (tipo_recomendacion IN ('personalizada', 'similar', 'popular', 'tendencia')),
    razones_recomendacion text[],
    fecha_generacion timestamp with time zone DEFAULT now(),
    fecha_expiracion timestamp with time zone,
    mostrada boolean DEFAULT false,
    clickeada boolean DEFAULT false,
    CONSTRAINT fk_recomendaciones_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente),
    CONSTRAINT fk_recomendaciones_producto FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto)
);

-- 10. Crear tabla de historial de onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_usuarios (
    id_onboarding integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente integer NOT NULL,
    paso_completado integer DEFAULT 0,
    preferencias_seleccionadas jsonb,
    fecha_inicio timestamp with time zone DEFAULT now(),
    fecha_completado timestamp with time zone,
    completado boolean DEFAULT false,
    CONSTRAINT fk_onboarding_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente)
);

-- 11. Crear índices para optimizar consultas de relevancia
CREATE INDEX IF NOT EXISTS idx_interacciones_cliente_fecha ON public.interacciones_usuario(id_cliente, fecha_interaccion DESC);
CREATE INDEX IF NOT EXISTS idx_interacciones_producto_tipo ON public.interacciones_usuario(id_producto, tipo_interaccion);
CREATE INDEX IF NOT EXISTS idx_busquedas_cliente_fecha ON public.busquedas_usuario(id_cliente, fecha_busqueda DESC);
CREATE INDEX IF NOT EXISTS idx_preferencias_cliente ON public.preferencias_usuario(id_cliente);
CREATE INDEX IF NOT EXISTS idx_recomendaciones_cliente ON public.recomendaciones(id_cliente, score_relevancia DESC);
CREATE INDEX IF NOT EXISTS idx_productos_popularidad ON public.productos(popularidad DESC);
CREATE INDEX IF NOT EXISTS idx_productos_rating ON public.productos(rating_promedio DESC);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON public.productos(id_tipo_producto);

-- 12. Insertar tipos de productos básicos
INSERT INTO public.tipos_producto (nombre_tipo, descripcion, icono) VALUES
('ceramica', 'Cerámicas y porcelanatos para pisos y paredes', '🏠'),
('sanitario', 'Sanitarios, inodoros y accesorios de baño', '🚽'),
('griferia', 'Grifos, duchas y accesorios de plomería', '🚿'),
('accesorios', 'Accesorios y complementos para baño y cocina', '🛁'),
('herramientas', 'Herramientas y materiales de instalación', '🔧'),
('decoracion', 'Elementos decorativos y ornamentales', '🎨')
ON CONFLICT (nombre_tipo) DO NOTHING;

-- 13. Insertar configuración inicial del sistema de relevancia
INSERT INTO public.configuracion_relevancia (nombre_configuracion, descripcion, configuracion) VALUES
('configuracion_default', 'Configuración por defecto del sistema de relevancia', '{
  "pesos": {
    "historial_compras": 0.3,
    "historial_vistas": 0.2,
    "preferencias_usuario": 0.25,
    "popularidad_producto": 0.15,
    "valoraciones": 0.1
  },
  "limites": {
    "max_recomendaciones": 20,
    "min_score": 0.1,
    "dias_historial": 365
  },
  "filtros": {
    "incluir_agotados": false,
    "solo_activos": true
  }
}'),
('configuracion_nuevos_usuarios', 'Configuración especial para usuarios nuevos', '{
  "pesos": {
    "popularidad_producto": 0.4,
    "tendencias": 0.3,
    "categoria_general": 0.3
  },
  "limites": {
    "max_recomendaciones": 10,
    "min_score": 0.05
  }
}')
ON CONFLICT (nombre_configuracion) DO NOTHING;

-- 14. Crear función para calcular relevancia de productos
CREATE OR REPLACE FUNCTION public.calcular_relevancia_producto(
    p_id_cliente integer,
    p_id_producto integer
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    score_relevancia numeric := 0;
    config_relevancia jsonb;
    peso_historial_compras numeric := 0.3;
    peso_historial_vistas numeric := 0.2;
    peso_preferencias numeric := 0.25;
    peso_popularidad numeric := 0.15;
    peso_valoraciones numeric := 0.1;
BEGIN
    -- Obtener configuración de relevancia
    SELECT configuracion INTO config_relevancia
    FROM public.configuracion_relevancia
    WHERE nombre_configuracion = 'configuracion_default' AND activo = true;
    
    IF config_relevancia IS NOT NULL THEN
        peso_historial_compras := (config_relevancia->'pesos'->>'historial_compras')::numeric;
        peso_historial_vistas := (config_relevancia->'pesos'->>'historial_vistas')::numeric;
        peso_preferencias := (config_relevancia->'pesos'->>'preferencias_usuario')::numeric;
        peso_popularidad := (config_relevancia->'pesos'->>'popularidad_producto')::numeric;
        peso_valoraciones := (config_relevancia->'pesos'->>'valoraciones')::numeric;
    END IF;
    
    -- Calcular score basado en historial de compras
    score_relevancia := score_relevancia + (
        SELECT COUNT(*) * peso_historial_compras
        FROM public.interacciones_usuario
        WHERE id_cliente = p_id_cliente 
        AND id_producto = p_id_producto 
        AND tipo_interaccion = 'compra'
    );
    
    -- Calcular score basado en historial de vistas
    score_relevancia := score_relevancia + (
        SELECT COUNT(*) * peso_historial_vistas
        FROM public.interacciones_usuario
        WHERE id_cliente = p_id_cliente 
        AND id_producto = p_id_producto 
        AND tipo_interaccion = 'vista'
    );
    
    -- Calcular score basado en preferencias del usuario
    score_relevancia := score_relevancia + (
        SELECT COALESCE(SUM(pu.peso_preferencia), 0) * peso_preferencias
        FROM public.preferencias_usuario pu
        JOIN public.productos p ON (
            (pu.id_categoria = p.id_categoria) OR
            (pu.id_estilo = p.id_estilo) OR
            (pu.id_materiales = p.id_materiales) OR
            (pu.id_tipo_producto = p.id_tipo_producto)
        )
        WHERE pu.id_cliente = p_id_cliente AND p.id_producto = p_id_producto
    );
    
    -- Calcular score basado en popularidad del producto
    score_relevancia := score_relevancia + (
        SELECT COALESCE(popularidad / 100.0, 0) * peso_popularidad
        FROM public.productos
        WHERE id_producto = p_id_producto
    );
    
    -- Calcular score basado en valoraciones
    score_relevancia := score_relevancia + (
        SELECT COALESCE(rating_promedio / 5.0, 0) * peso_valoraciones
        FROM public.productos
        WHERE id_producto = p_id_producto
    );
    
    RETURN LEAST(score_relevancia, 1.0);
END;
$$;

-- 15. Crear función para generar recomendaciones
CREATE OR REPLACE FUNCTION public.generar_recomendaciones(
    p_id_cliente integer,
    p_limite integer DEFAULT 10
)
RETURNS TABLE(
    id_producto integer,
    score_relevancia numeric,
    tipo_recomendacion character varying,
    razones text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_producto,
        public.calcular_relevancia_producto(p_id_cliente, p.id_producto) as score_relevancia,
        CASE 
            WHEN public.calcular_relevancia_producto(p_id_cliente, p.id_producto) > 0.7 THEN 'personalizada'
            WHEN p.popularidad > 80 THEN 'popular'
            ELSE 'similar'
        END as tipo_recomendacion,
        ARRAY[
            CASE WHEN p.popularidad > 80 THEN 'Producto muy popular' END,
            CASE WHEN p.rating_promedio > 4.0 THEN 'Excelente valoración' END,
            CASE WHEN p.stock_actual > 10 THEN 'Disponible en stock' END
        ] as razones
    FROM public.productos p
    WHERE p.activo = true 
    AND p.disponibilidad = true
    AND p.stock_actual > 0
    AND public.calcular_relevancia_producto(p_id_cliente, p.id_producto) > 0.1
    ORDER BY public.calcular_relevancia_producto(p_id_cliente, p.id_producto) DESC
    LIMIT p_limite;
END;
$$;

-- 16. Crear trigger para actualizar popularidad de productos
CREATE OR REPLACE FUNCTION public.actualizar_popularidad_producto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.productos
    SET popularidad = (
        SELECT 
            (COUNT(CASE WHEN tipo_interaccion = 'compra' THEN 1 END) * 10) +
            (COUNT(CASE WHEN tipo_interaccion = 'vista' THEN 1 END) * 1) +
            (COUNT(CASE WHEN tipo_interaccion = 'favorito' THEN 1 END) * 5)
        FROM public.interacciones_usuario
        WHERE id_producto = NEW.id_producto
        AND fecha_interaccion >= CURRENT_DATE - INTERVAL '30 days'
    )
    WHERE id_producto = NEW.id_producto;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_actualizar_popularidad
    AFTER INSERT OR UPDATE ON public.interacciones_usuario
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_popularidad_producto();

-- 17. Crear trigger para actualizar rating promedio
CREATE OR REPLACE FUNCTION public.actualizar_rating_producto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.productos
    SET 
        rating_promedio = (
            SELECT AVG(valoracion)::numeric(3,2)
            FROM public.interacciones_usuario
            WHERE id_producto = NEW.id_producto
            AND tipo_interaccion = 'valoracion'
            AND valoracion IS NOT NULL
        ),
        total_valoraciones = (
            SELECT COUNT(*)
            FROM public.interacciones_usuario
            WHERE id_producto = NEW.id_producto
            AND tipo_interaccion = 'valoracion'
            AND valoracion IS NOT NULL
        )
    WHERE id_producto = NEW.id_producto;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_actualizar_rating
    AFTER INSERT OR UPDATE ON public.interacciones_usuario
    FOR EACH ROW
    WHEN (NEW.tipo_interaccion = 'valoracion')
    EXECUTE FUNCTION public.actualizar_rating_producto();

-- Comentarios para documentación
COMMENT ON TABLE public.tipos_producto IS 'Tipos de productos que vende la tienda (cerámica, sanitarios, grifería, etc.)';
COMMENT ON TABLE public.preferencias_usuario IS 'Preferencias de productos de cada cliente para el sistema de recomendaciones';
COMMENT ON TABLE public.interacciones_usuario IS 'Registro de todas las interacciones del usuario con productos';
COMMENT ON TABLE public.busquedas_usuario IS 'Historial de búsquedas realizadas por los usuarios';
COMMENT ON TABLE public.configuracion_relevancia IS 'Configuraciones del sistema de relevancia y recomendaciones';
COMMENT ON TABLE public.metricas_relevancia IS 'Métricas de rendimiento del sistema de relevancia';
COMMENT ON TABLE public.recomendaciones IS 'Recomendaciones generadas para cada usuario';
COMMENT ON TABLE public.onboarding_usuarios IS 'Proceso de onboarding y configuración inicial de preferencias'; 