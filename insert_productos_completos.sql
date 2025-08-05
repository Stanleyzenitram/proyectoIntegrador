-- Script completo para insertar productos con imágenes específicas
-- Ejecuta este script en el SQL Editor de Supabase

-- INSERTAR TODOS LOS PRODUCTOS EN UNA SOLA DECLARACIÓN
INSERT INTO public.productos (nombre_producto, descripcion, precio, stock_actual, id_categoria, id_materiales, id_estilo, imagen, estado, descuento, formato, metros_por_caja, disponibilidad, color, piezas_por_caja) VALUES
-- PRODUCTOS DE BAÑO - Inodoros
('Inodoro Moderno Compacto', 'Inodoro de una pieza con diseño moderno y compacto, ideal para baños pequeños', 299.99, 15, 1, 16, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Una pieza', 1.0, true, 'Blanco', 1),
('Inodoro Clásico de Dos Piezas', 'Inodoro tradicional de dos piezas con tanque separado, estilo clásico', 199.99, 20, 1, 16, 2, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Dos piezas', 1.0, true, 'Blanco', 1),
('Inodoro Luxury con Bidet Integrado', 'Inodoro de lujo con bidet integrado y asiento calefactado', 899.99, 8, 1, 16, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Una pieza', 1.0, true, 'Blanco', 1),
('Inodoro Colgante Moderno', 'Inodoro colgante con diseño minimalista y fácil limpieza', 399.99, 12, 1, 16, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Colgante', 1.0, true, 'Blanco', 1),
('Inodoro Rústico de Cerámica', 'Inodoro de cerámica con estilo rústico y natural', 249.99, 18, 1, 2, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Una pieza', 1.0, true, 'Beige', 1),

-- PRODUCTOS DE BAÑO - Lavamanos
('Lavamanos de Porcelana Moderno', 'Lavamanos de porcelana con diseño moderno y líneas limpias', 159.99, 25, 1, 27, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Sobreponer', 1.0, true, 'Blanco', 1),
('Lavamanos de Mármol Luxury', 'Lavamanos de mármol natural con acabado de lujo', 599.99, 12, 1, 3, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Empotrar', 1.0, true, 'Mármol natural', 1),
('Lavamanos Rústico de Cerámica', 'Lavamanos de cerámica con estilo rústico y natural', 129.99, 18, 1, 2, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Sobreponer', 1.0, true, 'Beige', 1),
('Lavamanos de Vidrio Templado', 'Lavamanos de vidrio templado con diseño moderno', 299.99, 15, 1, 21, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Sobreponer', 1.0, true, 'Transparente', 1),
('Lavamanos de Granito Industrial', 'Lavamanos de granito con acabado industrial', 449.99, 10, 1, 4, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Empotrar', 1.0, true, 'Negro', 1),

-- PRODUCTOS DE BAÑO - Duchas
('Ducha de Acero Inoxidable Industrial', 'Ducha de acero inoxidable con diseño industrial', 399.99, 10, 1, 17, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Cabezal + Brazo', 1.0, true, 'Acero inoxidable', 1),
('Ducha de Vidrio Templado Moderna', 'Ducha de vidrio templado con puerta corredera moderna', 299.99, 15, 1, 21, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Puerta corredera', 1.0, true, 'Transparente', 1),
('Ducha de Fibra de Vidrio Ecológica', 'Ducha de fibra de vidrio con acabado ecológico', 199.99, 20, 1, 19, 11, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Cabina completa', 1.0, true, 'Blanco', 1),
('Ducha de Lluvia Luxury', 'Ducha de lluvia de lujo con múltiples jets', 699.99, 8, 1, 17, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Panel completo', 1.0, true, 'Acero inoxidable', 1),
('Ducha de Acrílico Rústica', 'Ducha de acrílico con acabado rústico', 249.99, 16, 1, 18, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Cabina completa', 1.0, true, 'Beige', 1),

-- PRODUCTOS DE BAÑO - Bañeras
('Bañera de Hierro Fundido Clásica', 'Bañera de hierro fundido con estilo clásico y elegante', 799.99, 8, 1, 20, 2, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '170x70 cm', 1.0, true, 'Blanco', 1),
('Bañera de Acrílico Moderna', 'Bañera de acrílico con diseño moderno y ergonómico', 499.99, 12, 1, 18, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '160x70 cm', 1.0, true, 'Blanco', 1),
('Bañera de Fibra de Vidrio Rústica', 'Bañera de fibra de vidrio con acabado rústico', 349.99, 15, 1, 19, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '150x70 cm', 1.0, true, 'Beige', 1),
('Bañera de Hidromasaje Luxury', 'Bañera de hidromasaje con jets terapéuticos', 1299.99, 6, 1, 18, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '180x80 cm', 1.0, true, 'Blanco', 1),
('Bañera de Mármol Clásica', 'Bañera de mármol natural con estilo clásico', 1899.99, 4, 1, 3, 2, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '170x70 cm', 1.0, true, 'Mármol natural', 1),

-- PRODUCTOS DE COCINA - Fregaderos
('Fregadero de Acero Inoxidable Industrial', 'Fregadero de acero inoxidable con acabado industrial', 299.99, 20, 2, 17, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '60x45 cm', 1.0, true, 'Acero inoxidable', 1),
('Fregadero de Granito Luxury', 'Fregadero de granito con acabado de lujo', 599.99, 10, 2, 4, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '60x45 cm', 1.0, true, 'Negro', 1),
('Fregadero de Cuarzo Moderno', 'Fregadero de cuarzo sintético con diseño moderno', 449.99, 15, 2, 22, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '60x45 cm', 1.0, true, 'Gris', 1),
('Fregadero Doble de Acero', 'Fregadero doble de acero inoxidable', 399.99, 12, 2, 17, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '80x45 cm', 1.0, true, 'Acero inoxidable', 1),
('Fregadero de Cerámica Rústica', 'Fregadero de cerámica con estilo rústico', 199.99, 18, 2, 2, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '50x40 cm', 1.0, true, 'Beige', 1),

-- PRODUCTOS DE COCINA - Grifos
('Grifo de Acero Inoxidable Moderno', 'Grifo de acero inoxidable con diseño moderno', 199.99, 25, 2, 17, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Monocomando', 1.0, true, 'Acero inoxidable', 1),
('Grifo de Latón Clásico', 'Grifo de latón con acabado clásico y elegante', 299.99, 18, 2, 17, 2, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Doble comando', 1.0, true, 'Latón', 1),
('Grifo de Acero Inoxidable Luxury', 'Grifo de acero inoxidable con acabado de lujo', 399.99, 12, 2, 17, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Monocomando', 1.0, true, 'Acero inoxidable', 1),
('Grifo de Agua Filtrada', 'Grifo con sistema de filtración integrado', 499.99, 10, 2, 17, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Monocomando', 1.0, true, 'Acero inoxidable', 1),
('Grifo Rústico de Bronce', 'Grifo de bronce con acabado rústico', 349.99, 15, 2, 17, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Doble comando', 1.0, true, 'Bronce', 1),

-- PRODUCTOS DE COCINA - Encimeras
('Encimera de Granito Luxury', 'Encimera de granito natural con acabado de lujo', 1299.99, 8, 2, 4, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '300x60 cm', 1.0, true, 'Granito natural', 1),
('Encimera de Cuarzo Moderna', 'Encimera de cuarzo sintético con diseño moderno', 999.99, 12, 2, 22, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '300x60 cm', 1.0, true, 'Cuarzo blanco', 1),
('Encimera de Mármol Clásica', 'Encimera de mármol natural con estilo clásico', 1499.99, 6, 2, 3, 2, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '300x60 cm', 1.0, true, 'Mármol Carrara', 1),
('Encimera de Acero Inoxidable Industrial', 'Encimera de acero inoxidable con acabado industrial', 799.99, 10, 2, 17, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '300x60 cm', 1.0, true, 'Acero inoxidable', 1),
('Encimera de Madera Rústica', 'Encimera de madera natural con acabado rústico', 599.99, 14, 2, 23, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '300x60 cm', 1.0, true, 'Madera natural', 1),

-- PRODUCTOS DE EXTERIOR - Pisos
('Piso de Porcelanato Exterior', 'Piso de porcelanato de alta resistencia para exteriores', 89.99, 50, 3, 1, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '60x60 cm', 1.44, true, 'Gris', 4),
('Piso de Gres Porcelánico Industrial', 'Piso de gres porcelánico con acabado industrial', 79.99, 60, 3, 26, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '60x60 cm', 1.44, true, 'Negro', 4),
('Piso de Granito Natural Rústico', 'Piso de granito natural con acabado rústico', 129.99, 30, 3, 4, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '60x60 cm', 1.44, true, 'Granito natural', 4),
('Piso de Cerámica Antideslizante', 'Piso de cerámica con acabado antideslizante', 69.99, 45, 3, 2, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '50x50 cm', 1.0, true, 'Beige', 4),
('Piso de Gres Rústico', 'Piso de gres con acabado rústico y natural', 99.99, 35, 3, 28, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '60x60 cm', 1.44, true, 'Gres natural', 4),

-- PRODUCTOS DE EXTERIOR - Revestimientos
('Revestimiento de Cerámica Moderna', 'Revestimiento de cerámica con diseño moderno', 69.99, 40, 3, 2, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '30x60 cm', 1.8, true, 'Blanco', 6),
('Revestimiento de Gres Industrial', 'Revestimiento de gres con acabado industrial', 59.99, 45, 3, 28, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '30x60 cm', 1.8, true, 'Gris', 6),
('Revestimiento de Piedra Natural Rústica', 'Revestimiento de piedra natural con estilo rústico', 99.99, 25, 3, 4, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '30x60 cm', 1.8, true, 'Piedra natural', 6),
('Revestimiento de Porcelanato Luxury', 'Revestimiento de porcelanato de alta gama', 119.99, 20, 3, 1, 10, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '30x60 cm', 1.8, true, 'Porcelanato', 6),
('Revestimiento de Vidrio Moderno', 'Revestimiento de vidrio con acabado moderno', 149.99, 15, 3, 21, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '30x60 cm', 1.8, true, 'Transparente', 6),

-- PRODUCTOS DE EXTERIOR - Muebles
('Mesa de Exterior de Acero Inoxidable', 'Mesa de exterior de acero inoxidable resistente', 399.99, 15, 3, 17, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '120x80 cm', 1.0, true, 'Acero inoxidable', 1),
('Silla de Exterior de PVC', 'Silla de exterior de PVC resistente a la intemperie', 89.99, 30, 3, 25, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Estándar', 1.0, true, 'Blanco', 1),
('Sofá de Exterior de Fibra de Vidrio', 'Sofá de exterior de fibra de vidrio resistente', 599.99, 10, 3, 19, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '3 plazas', 1.0, true, 'Gris', 1),
('Mesa de Exterior de Madera', 'Mesa de exterior de madera tratada', 299.99, 12, 3, 23, 3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, '120x80 cm', 1.0, true, 'Madera natural', 1),
('Silla de Exterior de Rattan', 'Silla de exterior de rattan sintético', 129.99, 25, 3, 25, 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true, 0, 'Estándar', 1.0, true, 'Beige', 1);

-- Verificar la inserción
SELECT COUNT(*) as total_productos_inseridos FROM public.productos; 