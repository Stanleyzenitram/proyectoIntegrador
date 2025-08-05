-- Script para insertar productos completos de baño, cocina y exteriores (VERSIÓN CORREGIDA)
-- Ejecuta este script en el SQL Editor de Supabase

-- ========================================
-- 1. INSERTAR CATEGORÍAS PRINCIPALES
-- ========================================

-- Categorías de Baño
INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Sanitarios', 'Inodoros, bidés, urinarios y accesorios de baño'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Sanitarios');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Duchas y Bañeras', 'Duchas, bañeras, mamparas y accesorios de ducha'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Duchas y Bañeras');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Lavamanos', 'Lavamanos, lavabos y accesorios de lavado'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Lavamanos');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Grifería', 'Llaves, mezcladoras y accesorios de grifería'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Grifería');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Muebles de Baño', 'Vanitorios, espejos, gabinetes y muebles de baño'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Muebles de Baño');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Accesorios de Baño', 'Toalleros, porta papel, dispensadores y accesorios'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Accesorios de Baño');

-- Categorías de Cocina
INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Fregaderos', 'Fregaderos de cocina y accesorios'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Fregaderos');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Grifería de Cocina', 'Llaves y grifería específica para cocina'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Grifería de Cocina');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Muebles de Cocina', 'Gabinetes, encimeras y muebles de cocina'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Muebles de Cocina');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Electrodomésticos', 'Cocinas, hornos, campanas y electrodomésticos'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Electrodomésticos');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Accesorios de Cocina', 'Organizadores, accesorios y complementos de cocina'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Accesorios de Cocina');

-- Categorías de Exterior
INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Pisos Exteriores', 'Cerámica, porcelanato y pisos para exterior'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Pisos Exteriores');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Revestimientos Exteriores', 'Fachaletas, paneles y revestimientos para muros exteriores'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Revestimientos Exteriores');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Piscinas y Áreas Húmedas', 'Materiales específicos para piscinas y áreas húmedas'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Piscinas y Áreas Húmedas');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Materiales de Instalación', 'Pegamentos, selladores y materiales de instalación'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Materiales de Instalación');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Accesorios Decorativos', 'Bancas, macetas, fuentes y accesorios decorativos'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Accesorios Decorativos');

-- Categorías Generales
INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Iluminación', 'Lámparas, spots y sistemas de iluminación'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Iluminación');

INSERT INTO public.categorias (nombre_categoria, descripcion) 
SELECT 'Ventilación', 'Extractores, ventiladores y sistemas de ventilación'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias WHERE nombre_categoria = 'Ventilación');

-- ========================================
-- 2. INSERTAR ESTILOS
-- ========================================

-- Estilos para sanitarios y baño
INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Moderno', 'Estilo moderno y contemporáneo'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Moderno');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Clásico', 'Estilo clásico y tradicional'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Clásico');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Minimalista', 'Estilo minimalista y funcional'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Minimalista');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Rústico', 'Estilo rústico y natural'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Rústico');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Industrial', 'Estilo industrial y urbano'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Industrial');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Luxury', 'Estilo de lujo y alta gama'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Luxury');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Ecológico', 'Estilo ecológico y sostenible'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Ecológico');

-- ========================================
-- 3. INSERTAR MATERIALES (CORREGIDO)
-- ========================================

-- Materiales para sanitarios (usando uso_materiales en lugar de descripcion)
INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Porcelana Sanitaria', 'Porcelana de alta calidad para sanitarios'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Porcelana Sanitaria');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Acero Inoxidable', 'Acero inoxidable resistente y duradero'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Acero Inoxidable');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Acrílico', 'Material acrílico ligero y resistente'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Acrílico');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Fibra de Vidrio', 'Fibra de vidrio reforzada'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Fibra de Vidrio');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Hierro Fundido', 'Hierro fundido tradicional'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Hierro Fundido');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Vidrio Templado', 'Vidrio templado de seguridad'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Vidrio Templado');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Granito', 'Granito natural de alta calidad'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Granito');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Cuarzo', 'Cuarzo sintético de alta resistencia'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Cuarzo');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Mármol', 'Mármol natural elegante'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Mármol');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Madera', 'Madera natural y tratada'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Madera');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Melamina', 'Melamina resistente y versátil'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Melamina');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'PVC', 'PVC resistente y económico'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'PVC');

-- ========================================
-- 4. INSERTAR PRODUCTOS DE SANITARIOS
-- ========================================

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
-- INODOROS
('Inodoro de Una Pieza Moderno', 'Inodoro de una pieza con diseño moderno y descarga eficiente. Fácil limpieza y mantenimiento.', 15999.99, 25, 0, 1, true, 'Una Pieza', 1, 6, 1, 1),
('Inodoro de Dos Piezas Clásico', 'Inodoro de dos piezas estilo clásico. Tanque separado para fácil mantenimiento.', 12999.99, 30, 5, 1, true, 'Dos Piezas', 1, 6, 2, 1),
('Inodoro Suspendido de Pared', 'Inodoro suspendido de pared con sistema de descarga oculto. Ideal para baños modernos.', 18999.99, 15, 0, 1, true, 'Suspendido', 1, 6, 1, 1),
('Inodoro Ecológico Dual Flush', 'Inodoro con descarga dual ecológica. Ahorra agua con dos opciones de descarga.', 21999.99, 20, 0, 1, true, 'Dual Flush', 1, 6, 7, 1),
('Bidé Clásico de Pared', 'Bidé clásico de pared con grifería integrada. Acabado elegante y funcional.', 8999.99, 18, 0, 1, true, 'Pared', 1, 6, 2, 1),
('Urinario de Pared', 'Urinario de pared para baños públicos o comerciales. Fácil instalación y mantenimiento.', 6999.99, 35, 0, 1, true, 'Pared', 1, 6, 1, 1),
('Tapa de Inodoro Soft Close', 'Tapa de inodoro con cierre suave automático. Evita ruidos molestos.', 2999.99, 50, 0, 1, true, 'Soft Close', 1, 6, 1, 1),

-- ========================================
-- 5. INSERTAR PRODUCTOS DE DUCHAS Y BAÑERAS
-- ========================================

('Bañera Acrílica 170cm', 'Bañera acrílica de 170cm con acabado suave y resistente. Ideal para relajación.', 15999.99, 12, 0, 1, true, '170cm', 1, 7, 1, 3),
('Bañera con Hidromasaje', 'Bañera con sistema de hidromasaje integrado. 6 jets de masaje relajante.', 45999.99, 8, 0, 1, true, 'Hidromasaje', 1, 7, 6, 3),
('Ducha Tipo Teléfono', 'Ducha tipo teléfono con mango ajustable. Ideal para baños modernos.', 3999.99, 40, 5, 1, true, 'Teléfono', 1, 7, 1, 1),
('Ducha Empotrada', 'Ducha empotrada con sistema de lluvia. Instalación oculta y elegante.', 5999.99, 25, 0, 1, true, 'Empotrada', 1, 7, 1, 1),
('Regadera Tipo Lluvia', 'Regadera tipo lluvia con cabeza grande. Experiencia de ducha relajante.', 4999.99, 30, 0, 1, true, 'Lluvia', 1, 7, 1, 1),
('Panel de Ducha con Hidromasaje', 'Panel de ducha con hidromasaje y múltiples funciones. Experiencia spa en casa.', 25999.99, 10, 0, 1, true, 'Panel', 1, 7, 6, 3),
('Tina de Baño Independiente', 'Tina de baño independiente estilo freestanding. Diseño elegante y moderno.', 32999.99, 6, 0, 1, true, 'Independiente', 1, 7, 6, 3),
('Mampara de Ducha Vidrio Templado', 'Mampara de ducha de vidrio templado con puerta corredera. Segura y elegante.', 12999.99, 20, 0, 1, true, 'Mampara', 1, 7, 1, 6),
('Cortina de Baño con Barra', 'Cortina de baño con barra telescópica. Fácil instalación y mantenimiento.', 1999.99, 60, 0, 1, true, 'Cortina', 1, 7, 1, 1),

-- ========================================
-- 6. INSERTAR PRODUCTOS DE LAVAMANOS
-- ========================================

('Lavamanos de Pedestal Clásico', 'Lavamanos de pedestal estilo clásico. Elegante y funcional.', 7999.99, 25, 0, 1, true, 'Pedestal', 1, 8, 2, 1),
('Lavamanos de Sobreponer', 'Lavamanos de sobreponer moderno. Fácil instalación sobre mueble.', 5999.99, 30, 5, 1, true, 'Sobreponer', 1, 8, 1, 1),
('Lavamanos Bajo Cubierta', 'Lavamanos bajo cubierta con instalación empotrada. Diseño limpio y moderno.', 6999.99, 22, 0, 1, true, 'Bajo Cubierta', 1, 8, 1, 1),
('Lavamanos Tipo Bowl', 'Lavamanos tipo bowl sobre encimera. Diseño contemporáneo y elegante.', 8999.99, 18, 0, 1, true, 'Bowl', 1, 8, 1, 1),
('Lavamanos con Mueble Vanitorio', 'Lavamanos con mueble vanitorio incluido. Solución completa para baño.', 15999.99, 15, 0, 1, true, 'Con Mueble', 1, 8, 1, 11),
('Lavamanos Doble', 'Lavamanos doble para baños compartidos. Práctico y funcional.', 18999.99, 12, 0, 1, true, 'Doble', 1, 8, 1, 1),

-- ========================================
-- 7. INSERTAR PRODUCTOS DE GRIFERÍA
-- ========================================

('Llave Monomando Lavamanos', 'Llave monomando para lavamanos con diseño moderno. Control de temperatura fácil.', 3999.99, 45, 0, 1, true, 'Monomando', 1, 9, 1, 2),
('Llave Bimando Lavamanos', 'Llave bimando para lavamanos estilo clásico. Control independiente de frío y caliente.', 2999.99, 50, 5, 1, true, 'Bimando', 1, 9, 2, 2),
('Grifería para Ducha', 'Grifería completa para ducha con termostato. Control preciso de temperatura.', 8999.99, 25, 0, 1, true, 'Ducha', 1, 9, 1, 2),
('Grifería para Bañera', 'Grifería para bañera con desviador. Ideal para baños con bañera.', 6999.99, 20, 0, 1, true, 'Bañera', 1, 9, 1, 2),
('Mezcladora Empotrada', 'Mezcladora empotrada para instalación oculta. Diseño minimalista.', 12999.99, 15, 0, 1, true, 'Empotrada', 1, 9, 3, 2),
('Llave de Paso', 'Llave de paso para control de agua. Instalación fácil y segura.', 1999.99, 80, 0, 1, true, 'Paso', 1, 9, 1, 2),
('Duchador Manual', 'Duchador manual con mango ergonómico. Ideal para baños tradicionales.', 2499.99, 60, 0, 1, true, 'Manual', 1, 9, 2, 2),
('Kit Completo Grifería Baño', 'Kit completo de grifería para baño. Incluye llave lavamanos y ducha.', 15999.99, 18, 0, 1, true, 'Kit Completo', 1, 9, 1, 2),

-- ========================================
-- 8. INSERTAR PRODUCTOS DE MUEBLES DE BAÑO
-- ========================================

('Vanitorio 60cm', 'Vanitorio de 60cm con espejo y repisa. Mueble funcional para baño.', 12999.99, 20, 0, 1, true, '60cm', 1, 10, 1, 11),
('Espejo con Repisa', 'Espejo con repisa integrada. Práctico para organizar accesorios.', 3999.99, 35, 0, 1, true, 'Con Repisa', 1, 10, 1, 1),
('Espejo con Luz LED', 'Espejo con iluminación LED integrada. Iluminación perfecta para el maquillaje.', 7999.99, 25, 0, 1, true, 'Con LED', 1, 10, 1, 1),
('Gabinete de Baño Alto', 'Gabinete alto para baño con múltiples compartimentos. Almacenamiento organizado.', 8999.99, 18, 5, 1, true, 'Alto', 1, 10, 1, 11),
('Mueble Columna de Baño', 'Mueble columna para baño. Ideal para espacios estrechos.', 6999.99, 22, 0, 1, true, 'Columna', 1, 10, 1, 11),
('Estantes Flotantes', 'Estantes flotantes para baño. Diseño moderno y funcional.', 2999.99, 40, 0, 1, true, 'Flotantes', 1, 10, 3, 11),

-- ========================================
-- 9. INSERTAR PRODUCTOS DE ACCESORIOS DE BAÑO
-- ========================================

('Porta Papel Higiénico', 'Porta papel higiénico de pared. Instalación fácil y práctica.', 1499.99, 100, 0, 1, true, 'Pared', 1, 11, 1, 2),
('Toallero de Barra', 'Toallero de barra para toallas. Diseño clásico y funcional.', 1999.99, 80, 0, 1, true, 'Barra', 1, 11, 2, 2),
('Toallero Eléctrico', 'Toallero eléctrico con calefacción. Seca toallas rápidamente.', 8999.99, 15, 0, 1, true, 'Eléctrico', 1, 11, 1, 2),
('Portacepillos', 'Portacepillos de pared. Organiza el cepillo de dientes.', 999.99, 120, 0, 1, true, 'Pared', 1, 11, 1, 2),
('Dispensador de Jabón', 'Dispensador de jabón automático. Higiene sin contacto.', 3999.99, 45, 0, 1, true, 'Automático', 1, 11, 1, 2),
('Jabonería de Pared', 'Jabonería de pared tradicional. Instalación sencilla.', 1499.99, 90, 0, 1, true, 'Pared', 1, 11, 2, 2),
('Ganchos para Toalla', 'Ganchos para toalla de pared. Múltiples opciones de instalación.', 799.99, 150, 0, 1, true, 'Ganchos', 1, 11, 1, 2),
('Basurero de Baño', 'Basurero de baño con tapa. Mantiene el baño organizado.', 1999.99, 70, 0, 1, true, 'Con Tapa', 1, 11, 1, 2),
('Alfombra Antideslizante', 'Alfombra antideslizante para baño. Seguridad y confort.', 2499.99, 60, 0, 1, true, 'Antideslizante', 1, 11, 1, 1),

-- ========================================
-- 10. INSERTAR PRODUCTOS DE FREGADEROS
-- ========================================

('Fregadero Acero Inoxidable Una Tina', 'Fregadero de acero inoxidable una tina. Resistente y duradero.', 8999.99, 30, 0, 1, true, 'Una Tina', 1, 12, 1, 2),
('Fregadero Acero Inoxidable Dos Tinas', 'Fregadero de acero inoxidable dos tinas. Ideal para cocinas grandes.', 12999.99, 25, 0, 1, true, 'Dos Tinas', 1, 12, 1, 2),
('Fregadero de Granito', 'Fregadero de granito sintético. Resistente a rayones y manchas.', 15999.99, 20, 0, 1, true, 'Granito', 1, 12, 1, 7),
('Fregadero Bajo Cubierta', 'Fregadero bajo cubierta con instalación empotrada. Diseño limpio.', 11999.99, 18, 0, 1, true, 'Bajo Cubierta', 1, 12, 1, 2),
('Fregadero con Escurridor', 'Fregadero con escurridor integrado. Práctico para lavar platos.', 13999.99, 22, 0, 1, true, 'Con Escurridor', 1, 12, 1, 2),
('Fregadero con Triturador', 'Fregadero con triturador de basura integrado. Elimina residuos orgánicos.', 18999.99, 12, 0, 1, true, 'Con Triturador', 1, 12, 1, 2),

-- ========================================
-- 11. INSERTAR PRODUCTOS DE GRIFERÍA DE COCINA
-- ========================================

('Llave Monomando Alta Cocina', 'Llave monomando alta para cocina. Alcance cómodo para ollas grandes.', 5999.99, 35, 0, 1, true, 'Monomando Alta', 1, 13, 1, 2),
('Llave Extraíble Tipo Ducha', 'Llave extraíble tipo ducha para cocina. Versátil para diferentes usos.', 7999.99, 28, 0, 1, true, 'Extraíble', 1, 13, 1, 2),
('Llave con Sensor Automática', 'Llave con sensor automático. Ahorra agua y es higiénica.', 15999.99, 15, 0, 1, true, 'Con Sensor', 1, 13, 1, 2),
('Llave de Pared Cocina', 'Llave de pared para cocina. Instalación tradicional.', 3999.99, 40, 0, 1, true, 'De Pared', 1, 13, 2, 2),
('Llave Bimando Cocina', 'Llave bimando para cocina. Control independiente de temperatura.', 4999.99, 32, 0, 1, true, 'Bimando', 1, 13, 2, 2),
('Llave con Filtro de Agua', 'Llave con filtro de agua integrado. Agua purificada directamente.', 12999.99, 18, 0, 1, true, 'Con Filtro', 1, 13, 1, 2),

-- ========================================
-- 12. INSERTAR PRODUCTOS DE MUEBLES DE COCINA
-- ========================================

('Módulo Bajo 60cm', 'Módulo bajo de cocina 60cm. Gabinete base con puerta.', 8999.99, 25, 0, 1, true, '60cm', 1, 14, 1, 11),
('Módulo Alto 60cm', 'Módulo alto de cocina 60cm. Gabinete colgante.', 7999.99, 30, 0, 1, true, '60cm Alto', 1, 14, 1, 11),
('Isla de Cocina', 'Isla de cocina con barra. Espacio adicional para preparación.', 45999.99, 8, 0, 1, true, 'Isla', 1, 14, 1, 11),
('Despensa Torre', 'Despensa torre para cocina. Almacenamiento vertical organizado.', 15999.99, 15, 0, 1, true, 'Torre', 1, 14, 1, 11),
('Mueble para Horno', 'Mueble para horno empotrable. Instalación profesional.', 12999.99, 12, 0, 1, true, 'Horno', 1, 14, 1, 11),
('Encimera de Granito', 'Encimera de granito natural. Durabilidad y elegancia.', 29999.99, 10, 0, 1, true, 'Granito', 1, 14, 6, 7),
('Encimera de Cuarzo', 'Encimera de cuarzo sintético. Resistente y sin mantenimiento.', 25999.99, 12, 0, 1, true, 'Cuarzo', 1, 14, 1, 8),

-- ========================================
-- 13. INSERTAR PRODUCTOS DE ELECTRODOMÉSTICOS
-- ========================================

('Cocina Encimera 4 Quemadores', 'Cocina encimera de 4 quemadores a gas. Eficiente y práctica.', 29999.99, 15, 0, 1, true, '4 Quemadores', 1, 15, 1, 2),
('Horno Empotrable 60cm', 'Horno empotrable de 60cm. Múltiples funciones de cocción.', 39999.99, 12, 0, 1, true, '60cm', 1, 15, 1, 2),
('Campana Extractora 60cm', 'Campana extractora de 60cm. Elimina olores y humo.', 19999.99, 18, 0, 1, true, '60cm', 1, 15, 1, 2),
('Microondas Empotrable', 'Microondas empotrable para cocina. Instalación integrada.', 15999.99, 20, 0, 1, true, 'Empotrable', 1, 15, 1, 2),
('Lavavajillas 60cm', 'Lavavajillas de 60cm. Ahorra tiempo y agua.', 45999.99, 10, 0, 1, true, '60cm', 1, 15, 1, 2),
('Refrigerador Empotrable', 'Refrigerador empotrable para cocina. Diseño integrado.', 89999.99, 8, 0, 1, true, 'Empotrable', 1, 15, 1, 2),

-- ========================================
-- 14. INSERTAR PRODUCTOS DE PISOS EXTERIORES
-- ========================================

('Porcelanato Antideslizante 30x30', 'Porcelanato antideslizante para exteriores. Seguridad en áreas húmedas.', 2999.99, 80, 0, 0.9, true, '30x30', 10, 16, 1, 1),
('Cerámica Rústica Exterior', 'Cerámica rústica para exteriores. Resistente a la intemperie.', 1999.99, 100, 0, 0.9, true, '30x30', 10, 16, 4, 2),
('Baldosa Tipo Piedra', 'Baldosa que simula piedra natural. Ideal para terrazas.', 3999.99, 60, 0, 0.9, true, '30x30', 10, 16, 4, 1),
('Deck Cerámico Madera', 'Deck cerámico que simula madera. Resistente y sin mantenimiento.', 4999.99, 45, 0, 1.2, true, '20x60', 10, 16, 2, 1),
('Piedra Natural Travertino', 'Piedra natural travertino para exteriores. Elegancia natural.', 8999.99, 25, 0, 0.9, true, '30x30', 10, 16, 6, 1),
('Pizarra Natural', 'Pizarra natural para exteriores. Resistente y elegante.', 6999.99, 30, 0, 0.9, true, '30x30', 10, 16, 4, 1),

-- ========================================
-- 15. INSERTAR PRODUCTOS DE REVESTIMIENTOS EXTERIORES
-- ========================================

('Fachaleta Tipo Ladrillo', 'Fachaleta que simula ladrillo. Revestimiento exterior tradicional.', 3999.99, 70, 0, 0.9, true, '30x30', 10, 17, 4, 2),
('Cerámica Rústica Muro', 'Cerámica rústica para muros exteriores. Resistente a la intemperie.', 2999.99, 85, 0, 0.9, true, '30x30', 10, 17, 4, 2),
('Panel Concreto Decorativo', 'Panel de concreto decorativo para exteriores. Diseño moderno.', 5999.99, 40, 0, 1.2, true, '60x20', 10, 17, 5, 1),
('Piedra Natural Canto Rodado', 'Piedra natural canto rodado para muros. Textura natural.', 7999.99, 35, 0, 0.9, true, '30x30', 10, 17, 4, 1),
('Revestimiento Tipo Madera', 'Revestimiento tipo madera para exteriores. Sin mantenimiento.', 4999.99, 50, 0, 1.2, true, '20x60', 10, 17, 2, 1),
('Revestimiento 3D Exterior', 'Revestimiento 3D para exteriores. Diseño moderno y texturizado.', 6999.99, 30, 0, 0.9, true, '30x30', 10, 17, 1, 1),

-- ========================================
-- 16. INSERTAR PRODUCTOS DE PISCINAS
-- ========================================

('Cerámica Borde Piscina', 'Cerámica antideslizante para borde de piscina. Seguridad en áreas húmedas.', 4999.99, 40, 0, 0.9, true, '30x30', 10, 18, 1, 2),
('Mosaico Vítreo Piscina', 'Mosaico vítreo para interior de piscina. Resistente al cloro.', 8999.99, 25, 0, 0.9, true, '30x30', 10, 18, 1, 4),
('Cerámica Solárium', 'Cerámica tipo piedra para solárium. Resistente al sol y agua.', 3999.99, 35, 0, 0.9, true, '30x30', 10, 18, 4, 2),
('Sellador Impermeabilizante', 'Sellador impermeabilizante para exteriores. Protección contra humedad.', 2999.99, 60, 0, 1, true, '5L', 1, 18, 1, 1),
('Rejilla Drenaje Exterior', 'Rejilla de drenaje para exteriores. Evita acumulación de agua.', 1999.99, 80, 0, 1, true, '30x30', 1, 18, 1, 2),

-- ========================================
-- 17. INSERTAR PRODUCTOS DE MATERIALES DE INSTALACIÓN
-- ========================================

('Pegamento Cerámica Exterior', 'Pegamento para cerámica de exterior. Resistente a humedad y sol.', 3999.99, 50, 0, 25, true, '25kg', 1, 19, 1, 1),
('Pastina Flexible Impermeable', 'Pastina flexible e impermeable para juntas. Resistente a la intemperie.', 1999.99, 80, 0, 5, true, '5kg', 1, 19, 1, 1),
('Sellador Antihumedad', 'Sellador antihumedad y antifúngico. Protección completa.', 2999.99, 60, 0, 1, true, '1L', 1, 19, 1, 1),
('Aditivo Adherencia Exterior', 'Aditivo para adherencia en exteriores. Mejora la fijación.', 1499.99, 100, 0, 1, true, '1L', 1, 19, 1, 1),
('Crucetas Niveladoras', 'Crucetas y niveladores para cerámica gruesa. Instalación profesional.', 999.99, 150, 0, 1, true, 'Kit 100pcs', 100, 19, 1, 2),
('Mortero Autonivelante', 'Mortero autonivelante para exteriores. Base perfecta para pisos.', 5999.99, 30, 0, 25, true, '25kg', 1, 19, 1, 1),

-- ========================================
-- 18. INSERTAR PRODUCTOS DE ACCESORIOS DECORATIVOS
-- ========================================

('Banca Cerámica Jardín', 'Banca con revestimiento cerámico para jardín. Resistente y decorativa.', 15999.99, 12, 0, 1, true, 'Banca', 1, 20, 4, 2),
('Maceta Acabado Cerámico', 'Maceta con acabado cerámico. Decorativa y resistente.', 3999.99, 40, 0, 1, true, 'Maceta', 1, 20, 4, 2),
('Luminaria Empotrable Piso', 'Luminaria empotrable para piso exterior. Iluminación decorativa.', 7999.99, 25, 0, 1, true, 'Empotrable', 1, 20, 1, 2),
('Fuente Decorativa Cerámica', 'Fuente decorativa con cerámica. Elemento decorativo para jardín.', 29999.99, 8, 0, 1, true, 'Fuente', 1, 20, 6, 2),
('Pérgola Revestimiento Cerámico', 'Pérgola con revestimiento cerámico en bases. Estructura decorativa.', 45999.99, 6, 0, 1, true, 'Pérgola', 1, 20, 4, 11),

-- ========================================
-- 19. INSERTAR PRODUCTOS DE ILUMINACIÓN
-- ========================================

('Lámpara LED Baño', 'Lámpara LED para baño. Iluminación eficiente y moderna.', 3999.99, 45, 0, 1, true, 'LED Baño', 1, 21, 1, 1),
('Spot Techo Cocina', 'Spot de techo para cocina. Iluminación focalizada.', 1999.99, 80, 0, 1, true, 'Spot', 1, 21, 1, 1),
('Tira LED Bajo Alacena', 'Tira LED bajo alacena. Iluminación ambiental en cocina.', 2999.99, 60, 0, 1, true, 'Tira LED', 1, 21, 1, 1),
('Lámpara Colgante Decorativa', 'Lámpara colgante decorativa. Elemento decorativo y funcional.', 8999.99, 25, 0, 1, true, 'Colgante', 1, 21, 6, 1),
('Iluminación LED Interior', 'Iluminación LED interior para muebles. Organización iluminada.', 1999.99, 70, 0, 1, true, 'LED Interior', 1, 21, 1, 1),

-- ========================================
-- 20. INSERTAR PRODUCTOS DE VENTILACIÓN
-- ========================================

('Extractor Aire Baño', 'Extractor de aire para baño. Elimina humedad y olores.', 5999.99, 35, 0, 1, true, 'Extractor', 1, 22, 1, 2),
('Calefactor Toallero Eléctrico', 'Calefactor toallero eléctrico. Seca toallas y calienta el baño.', 12999.99, 20, 0, 1, true, 'Calefactor', 1, 22, 1, 2),
('Deshumidificador Compacto', 'Deshumidificador compacto para baño. Control de humedad.', 15999.99, 15, 0, 1, true, 'Deshumidificador', 1, 22, 1, 2),
('Extractor Cocina', 'Extractor de aire para cocina. Elimina humo y olores.', 8999.99, 25, 0, 1, true, 'Extractor Cocina', 1, 22, 1, 2),
('Campana Isla', 'Campana de isla para cocina. Extracción eficiente.', 25999.99, 12, 0, 1, true, 'Campana Isla', 1, 22, 1, 2);

-- ========================================
-- VERIFICAR PRODUCTOS INSERTADOS
-- ========================================

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
LIMIT 20; 