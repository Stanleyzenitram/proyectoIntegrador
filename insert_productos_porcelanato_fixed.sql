-- Script para insertar productos reales de porcelanato y cerámicas (VERSIÓN CORREGIDA)
-- Ejecuta este script en el SQL Editor de Supabase

-- Primero, asegurarnos de que tenemos las categorías, estilos y materiales necesarios
-- Insertar categorías si no existen (sin ON CONFLICT)
INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Porcelanato', 'Porcelanato de alta calidad para pisos y paredes'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Porcelanato');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Cerámica', 'Cerámica tradicional para revestimientos'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Cerámica');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Gres Porcelánico', 'Gres porcelánico de alta resistencia'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Gres Porcelánico');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Mosaicos', 'Mosaicos decorativos para detalles especiales'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Mosaicos');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Bordes y Molduras', 'Bordes y molduras para acabados profesionales'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Bordes y Molduras');

-- Insertar estilos si no existen
INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Mármol', 'Simulación de mármol natural'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Mármol');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Madera', 'Simulación de madera natural'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Madera');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Cemento', 'Estilo cemento industrial'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Cemento');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Geométrico', 'Patrones geométricos modernos'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Geométrico');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Clásico', 'Estilo clásico y elegante'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Clásico');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Rústico', 'Estilo rústico y natural'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Rústico');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Minimalista', 'Estilo minimalista y moderno'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Minimalista');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Vintage', 'Estilo vintage y retro'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Vintage');

-- Insertar materiales si no existen
INSERT INTO public.materiales (nombre_materiales, descripcion) 
SELECT 'Porcelanato', 'Material de alta densidad y resistencia'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Porcelanato');

INSERT INTO public.materiales (nombre_materiales, descripcion) 
SELECT 'Cerámica', 'Material tradicional de arcilla cocida'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Cerámica');

INSERT INTO public.materiales (nombre_materiales, descripcion) 
SELECT 'Gres Porcelánico', 'Material de alta resistencia al desgaste'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Gres Porcelánico');

INSERT INTO public.materiales (nombre_materiales, descripcion) 
SELECT 'Porcelana', 'Material de alta calidad y durabilidad'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Porcelana');

INSERT INTO public.materiales (nombre_materiales, descripcion) 
SELECT 'Gres', 'Material resistente y versátil'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Gres');

-- Ahora insertar productos reales de porcelanato y cerámicas
INSERT INTO public.productos (
    nombre_producto,
    descripcion,
    precio,
    stock_actual,
    descuento,
    metros_por_caja,
    disponibilidad,
    formato,
    piezas_por_caja,
    id_categoria,
    id_estilo,
    id_materiales
) VALUES
-- PORCELANATO SIMULACIÓN MÁRMOL
('Porcelanato Mármol Carrara 60x60', 'Porcelanato que simula el mármol Carrara, perfecto para espacios elegantes y modernos. Alta resistencia y fácil mantenimiento.', 2899.99, 50, 0, 1.44, true, '60x60', 4, 1, 1, 1),
('Porcelanato Mármol Negro 60x60', 'Porcelanato negro con vetas blancas que simula mármol negro. Ideal para contrastes dramáticos en interiores.', 3199.99, 35, 5, 1.44, true, '60x60', 4, 1, 1, 1),
('Porcelanato Mármol Beige 60x60', 'Porcelanato beige con vetas sutiles que simula mármol natural. Perfecto para espacios cálidos y acogedores.', 2699.99, 40, 0, 1.44, true, '60x60', 4, 1, 1, 1),

-- PORCELANATO SIMULACIÓN MADERA
('Porcelanato Madera Roble 20x120', 'Porcelanato que simula tablas de roble natural. Ideal para crear ambientes cálidos y naturales.', 1899.99, 60, 10, 2.4, true, '20x120', 10, 1, 2, 1),
('Porcelanato Madera Nogal 20x120', 'Porcelanato que simula madera de nogal. Color oscuro y elegante para espacios sofisticados.', 2199.99, 45, 0, 2.4, true, '20x120', 10, 1, 2, 1),
('Porcelanato Madera Pino 20x120', 'Porcelanato que simula madera de pino. Color claro y natural para espacios luminosos.', 1699.99, 55, 5, 2.4, true, '20x120', 10, 1, 2, 1),

-- PORCELANATO ESTILO CEMENTO
('Porcelanato Cemento Gris 60x60', 'Porcelanato estilo cemento industrial en gris. Perfecto para espacios modernos y minimalistas.', 1599.99, 70, 0, 1.44, true, '60x60', 4, 1, 3, 1),
('Porcelanato Cemento Blanco 60x60', 'Porcelanato estilo cemento en blanco. Ideal para espacios luminosos y contemporáneos.', 1799.99, 65, 0, 1.44, true, '60x60', 4, 1, 3, 1),
('Porcelanato Cemento Antracita 60x60', 'Porcelanato estilo cemento en color antracita. Elegante y moderno para espacios urbanos.', 1899.99, 50, 5, 1.44, true, '60x60', 4, 1, 3, 1),

-- CERÁMICA TRADICIONAL
('Cerámica Blanca 30x30', 'Cerámica blanca tradicional de alta calidad. Perfecta para baños y cocinas.', 899.99, 100, 0, 0.9, true, '30x30', 10, 2, 5, 2),
('Cerámica Beige 30x30', 'Cerámica beige suave. Ideal para espacios cálidos y acogedores.', 999.99, 85, 0, 0.9, true, '30x30', 10, 2, 5, 2),
('Cerámica Gris 30x30', 'Cerámica gris moderna. Perfecta para espacios contemporáneos.', 1099.99, 75, 5, 0.9, true, '30x30', 10, 2, 5, 2),

-- GRES PORCELÁNICO
('Gres Porcelánico Antideslizante 30x30', 'Gres porcelánico con superficie antideslizante. Ideal para exteriores y áreas húmedas.', 1299.99, 80, 0, 0.9, true, '30x30', 10, 3, 3, 3),
('Gres Porcelánico Técnico 60x60', 'Gres porcelánico técnico de alta resistencia. Perfecto para áreas de alto tráfico.', 2499.99, 45, 0, 1.44, true, '60x60', 4, 3, 3, 3),
('Gres Porcelánico Decorativo 30x30', 'Gres porcelánico con decoración impresa. Ideal para crear ambientes únicos.', 1599.99, 60, 10, 0.9, true, '30x30', 10, 3, 4, 3),

-- MOSAICOS DECORATIVOS
('Mosaico Vidrio Azul 30x30', 'Mosaico de vidrio en tonos azules. Perfecto para detalles decorativos en baños y piscinas.', 1899.99, 40, 0, 0.9, true, '30x30', 10, 4, 4, 4),
('Mosaico Piedra Natural 30x30', 'Mosaico de piedra natural. Ideal para crear texturas naturales en espacios exteriores.', 2199.99, 30, 5, 0.9, true, '30x30', 10, 4, 6, 4),
('Mosaico Cerámico Geométrico 30x30', 'Mosaico cerámico con patrón geométrico. Moderno y versátil para cualquier espacio.', 1699.99, 50, 0, 0.9, true, '30x30', 10, 4, 4, 2),

-- FORMATOS GRANDES
('Porcelanato Mármol 80x80', 'Porcelanato mármol en formato grande. Ideal para espacios amplios y modernos.', 3899.99, 25, 0, 2.56, true, '80x80', 4, 1, 1, 1),
('Porcelanato Cemento 80x80', 'Porcelanato cemento en formato grande. Perfecto para espacios industriales y modernos.', 3299.99, 30, 5, 2.56, true, '80x80', 4, 1, 3, 1),
('Gres Porcelánico 80x80', 'Gres porcelánico en formato grande. Alta resistencia para áreas comerciales.', 3599.99, 20, 0, 2.56, true, '80x80', 4, 3, 3, 3),

-- FORMATOS RECTANGULARES
('Porcelanato Madera 20x80', 'Porcelanato madera en formato rectangular. Ideal para crear efecto de parquet.', 1599.99, 70, 0, 1.6, true, '20x80', 10, 1, 2, 1),
('Cerámica Rectangular 15x90', 'Cerámica rectangular moderna. Perfecta para revestimientos de pared.', 1299.99, 55, 5, 1.35, true, '15x90', 10, 2, 7, 2),
('Gres Porcelánico 30x60', 'Gres porcelánico rectangular. Versátil para pisos y paredes.', 1899.99, 45, 0, 1.8, true, '30x60', 10, 3, 3, 3);

-- Verificar productos insertados
SELECT 
    p.id_producto,
    p.nombre_producto,
    p.precio,
    p.stock_actual,
    c.nombre_categoria,
    e.nombre_estilo,
    m.nombre_materiales,
    p.formato,
    p.metros_por_caja
FROM public.productos p
JOIN public.categorias c ON p.id_categoria = c.id_categoria
JOIN public.estilos e ON p.id_estilo = e.id_estilo
JOIN public.materiales m ON p.id_materiales = m.id_materiales
ORDER BY p.id_producto DESC
LIMIT 10; 