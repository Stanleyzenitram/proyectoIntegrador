-- Script para insertar productos completos de baño, cocina y exteriores (VERSIÓN FINAL)
-- Ejecuta este script en el SQL Editor de Supabase

-- ========================================
-- INSERTAR PRODUCTOS USANDO IDs CORRECTOS
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
-- ========================================
-- PRODUCTOS DE SANITARIOS (id_categoria = 47)
-- ========================================
('Inodoro de Una Pieza Moderno', 'Inodoro de una pieza con diseño moderno y descarga eficiente. Fácil limpieza y mantenimiento.', 15999.99, 25, 0, 1, true, 'Una Pieza', 1, 47, 1, 6),
('Inodoro de Dos Piezas Clásico', 'Inodoro de dos piezas estilo clásico. Tanque separado para fácil mantenimiento.', 12999.99, 30, 5, 1, true, 'Dos Piezas', 1, 47, 2, 6),
('Inodoro Suspendido de Pared', 'Inodoro suspendido de pared con sistema de descarga oculto. Ideal para baños modernos.', 18999.99, 15, 0, 1, true, 'Suspendido', 1, 47, 1, 6),
('Inodoro Ecológico Dual Flush', 'Inodoro con descarga dual ecológica. Ahorra agua con dos opciones de descarga.', 21999.99, 20, 0, 1, true, 'Dual Flush', 1, 47, 6, 6),
('Bidé Clásico de Pared', 'Bidé clásico de pared con grifería integrada. Acabado elegante y funcional.', 8999.99, 18, 0, 1, true, 'Pared', 1, 47, 2, 6),
('Urinario de Pared', 'Urinario de pared para baños públicos o comerciales. Fácil instalación y mantenimiento.', 6999.99, 35, 0, 1, true, 'Pared', 1, 47, 1, 6),
('Tapa de Inodoro Soft Close', 'Tapa de inodoro con cierre suave automático. Evita ruidos molestos.', 2999.99, 50, 0, 1, true, 'Soft Close', 1, 47, 1, 6),

-- ========================================
-- PRODUCTOS DE DUCHAS Y BAÑERAS (id_categoria = 48)
-- ========================================
('Bañera Acrílica 170cm', 'Bañera acrílica de 170cm con acabado suave y resistente. Ideal para relajación.', 15999.99, 12, 0, 1, true, '170cm', 1, 48, 1, 8),
('Bañera con Hidromasaje', 'Bañera con sistema de hidromasaje integrado. 6 jets de masaje relajante.', 45999.99, 8, 0, 1, true, 'Hidromasaje', 1, 48, 6, 8),
('Ducha Tipo Teléfono', 'Ducha tipo teléfono con mango ajustable. Ideal para baños modernos.', 3999.99, 40, 5, 1, true, 'Teléfono', 1, 48, 1, 6),
('Ducha Empotrada', 'Ducha empotrada con sistema de lluvia. Instalación oculta y elegante.', 5999.99, 25, 0, 1, true, 'Empotrada', 1, 48, 1, 6),
('Regadera Tipo Lluvia', 'Regadera tipo lluvia con cabeza grande. Experiencia de ducha relajante.', 4999.99, 30, 0, 1, true, 'Lluvia', 1, 48, 1, 6),
('Panel de Ducha con Hidromasaje', 'Panel de ducha con hidromasaje y múltiples funciones. Experiencia spa en casa.', 25999.99, 10, 0, 1, true, 'Panel', 1, 48, 6, 8),
('Tina de Baño Independiente', 'Tina de baño independiente estilo freestanding. Diseño elegante y moderno.', 32999.99, 6, 0, 1, true, 'Independiente', 1, 48, 6, 8),
('Mampara de Ducha Vidrio Templado', 'Mampara de ducha de vidrio templado con puerta corredera. Segura y elegante.', 12999.99, 20, 0, 1, true, 'Mampara', 1, 48, 1, 9),
('Cortina de Baño con Barra', 'Cortina de baño con barra telescópica. Fácil instalación y mantenimiento.', 1999.99, 60, 0, 1, true, 'Cortina', 1, 48, 1, 6),

-- ========================================
-- PRODUCTOS DE LAVAMANOS (id_categoria = 49)
-- ========================================
('Lavamanos de Pedestal Clásico', 'Lavamanos de pedestal estilo clásico. Elegante y funcional.', 7999.99, 25, 0, 1, true, 'Pedestal', 1, 49, 2, 6),
('Lavamanos de Sobreponer', 'Lavamanos de sobreponer moderno. Fácil instalación sobre mueble.', 5999.99, 30, 5, 1, true, 'Sobreponer', 1, 49, 1, 6),
('Lavamanos Bajo Cubierta', 'Lavamanos bajo cubierta con instalación empotrada. Diseño limpio y moderno.', 6999.99, 22, 0, 1, true, 'Bajo Cubierta', 1, 49, 1, 6),
('Lavamanos Tipo Bowl', 'Lavamanos tipo bowl sobre encimera. Diseño contemporáneo y elegante.', 8999.99, 18, 0, 1, true, 'Bowl', 1, 49, 1, 6),
('Lavamanos con Mueble Vanitorio', 'Lavamanos con mueble vanitorio incluido. Solución completa para baño.', 15999.99, 15, 0, 1, true, 'Con Mueble', 1, 49, 1, 14),
('Lavamanos Doble', 'Lavamanos doble para baños compartidos. Práctico y funcional.', 18999.99, 12, 0, 1, true, 'Doble', 1, 49, 1, 6),

-- ========================================
-- PRODUCTOS DE GRIFERÍA (id_categoria = 50)
-- ========================================
('Llave Monomando Lavamanos', 'Llave monomando para lavamanos con diseño moderno. Control de temperatura fácil.', 3999.99, 45, 0, 1, true, 'Monomando', 1, 50, 1, 7),
('Llave Bimando Lavamanos', 'Llave bimando para lavamanos estilo clásico. Control independiente de frío y caliente.', 2999.99, 50, 5, 1, true, 'Bimando', 1, 50, 2, 7),
('Grifería para Ducha', 'Grifería completa para ducha con termostato. Control preciso de temperatura.', 8999.99, 25, 0, 1, true, 'Ducha', 1, 50, 1, 7),
('Grifería para Bañera', 'Grifería para bañera con desviador. Ideal para baños con bañera.', 6999.99, 20, 0, 1, true, 'Bañera', 1, 50, 1, 7),
('Mezcladora Empotrada', 'Mezcladora empotrada para instalación oculta. Diseño minimalista.', 12999.99, 15, 0, 1, true, 'Empotrada', 1, 50, 3, 7),
('Llave de Paso', 'Llave de paso para control de agua. Instalación fácil y segura.', 1999.99, 80, 0, 1, true, 'Paso', 1, 50, 1, 7),
('Duchador Manual', 'Duchador manual con mango ergonómico. Ideal para baños tradicionales.', 2499.99, 60, 0, 1, true, 'Manual', 1, 50, 2, 7),
('Kit Completo Grifería Baño', 'Kit completo de grifería para baño. Incluye llave lavamanos y ducha.', 15999.99, 18, 0, 1, true, 'Kit Completo', 1, 50, 1, 7),

-- ========================================
-- PRODUCTOS DE MUEBLES DE BAÑO (id_categoria = 51)
-- ========================================
('Vanitorio 60cm', 'Vanitorio de 60cm con espejo y repisa. Mueble funcional para baño.', 12999.99, 20, 0, 1, true, '60cm', 1, 51, 1, 14),
('Espejo con Repisa', 'Espejo con repisa integrada. Práctico para organizar accesorios.', 3999.99, 35, 0, 1, true, 'Con Repisa', 1, 51, 1, 6),
('Espejo con Luz LED', 'Espejo con iluminación LED integrada. Iluminación perfecta para el maquillaje.', 7999.99, 25, 0, 1, true, 'Con LED', 1, 51, 1, 6),
('Gabinete de Baño Alto', 'Gabinete alto para baño con múltiples compartimentos. Almacenamiento organizado.', 8999.99, 18, 5, 1, true, 'Alto', 1, 51, 1, 14),
('Mueble Columna de Baño', 'Mueble columna para baño. Ideal para espacios estrechos.', 6999.99, 22, 0, 1, true, 'Columna', 1, 51, 1, 14),
('Estantes Flotantes', 'Estantes flotantes para baño. Diseño moderno y funcional.', 2999.99, 40, 0, 1, true, 'Flotantes', 1, 51, 3, 14),

-- ========================================
-- PRODUCTOS DE ACCESORIOS DE BAÑO (id_categoria = 52)
-- ========================================
('Porta Papel Higiénico', 'Porta papel higiénico de pared. Instalación fácil y práctica.', 1499.99, 100, 0, 1, true, 'Pared', 1, 52, 1, 7),
('Toallero de Barra', 'Toallero de barra para toallas. Diseño clásico y funcional.', 1999.99, 80, 0, 1, true, 'Barra', 1, 52, 2, 7),
('Toallero Eléctrico', 'Toallero eléctrico con calefacción. Seca toallas rápidamente.', 8999.99, 15, 0, 1, true, 'Eléctrico', 1, 52, 1, 7),
('Portacepillos', 'Portacepillos de pared. Organiza el cepillo de dientes.', 999.99, 120, 0, 1, true, 'Pared', 1, 52, 1, 7),
('Dispensador de Jabón', 'Dispensador de jabón automático. Higiene sin contacto.', 3999.99, 45, 0, 1, true, 'Automático', 1, 52, 1, 7),
('Jabonería de Pared', 'Jabonería de pared tradicional. Instalación sencilla.', 1499.99, 90, 0, 1, true, 'Pared', 1, 52, 2, 7),
('Ganchos para Toalla', 'Ganchos para toalla de pared. Múltiples opciones de instalación.', 799.99, 150, 0, 1, true, 'Ganchos', 1, 52, 1, 7),
('Basurero de Baño', 'Basurero de baño con tapa. Mantiene el baño organizado.', 1999.99, 70, 0, 1, true, 'Con Tapa', 1, 52, 1, 7),
('Alfombra Antideslizante', 'Alfombra antideslizante para baño. Seguridad y confort.', 2499.99, 60, 0, 1, true, 'Antideslizante', 1, 52, 1, 6),

-- ========================================
-- PRODUCTOS DE FREGADEROS (id_categoria = 53)
-- ========================================
('Fregadero Acero Inoxidable Una Tina', 'Fregadero de acero inoxidable una tina. Resistente y duradero.', 8999.99, 30, 0, 1, true, 'Una Tina', 1, 53, 1, 7),
('Fregadero Acero Inoxidable Dos Tinas', 'Fregadero de acero inoxidable dos tinas. Ideal para cocinas grandes.', 12999.99, 25, 0, 1, true, 'Dos Tinas', 1, 53, 1, 7),
('Fregadero de Granito', 'Fregadero de granito sintético. Resistente a rayones y manchas.', 15999.99, 20, 0, 1, true, 'Granito', 1, 53, 1, 4),
('Fregadero Bajo Cubierta', 'Fregadero bajo cubierta con instalación empotrada. Diseño limpio.', 11999.99, 18, 0, 1, true, 'Bajo Cubierta', 1, 53, 1, 7),
('Fregadero con Escurridor', 'Fregadero con escurridor integrado. Práctico para lavar platos.', 13999.99, 22, 0, 1, true, 'Con Escurridor', 1, 53, 1, 7),
('Fregadero con Triturador', 'Fregadero con triturador de basura integrado. Elimina residuos orgánicos.', 18999.99, 12, 0, 1, true, 'Con Triturador', 1, 53, 1, 7),

-- ========================================
-- PRODUCTOS DE GRIFERÍA DE COCINA (id_categoria = 54)
-- ========================================
('Llave Monomando Alta Cocina', 'Llave monomando alta para cocina. Alcance cómodo para ollas grandes.', 5999.99, 35, 0, 1, true, 'Monomando Alta', 1, 54, 1, 7),
('Llave Extraíble Tipo Ducha', 'Llave extraíble tipo ducha para cocina. Versátil para diferentes usos.', 7999.99, 28, 0, 1, true, 'Extraíble', 1, 54, 1, 7),
('Llave con Sensor Automática', 'Llave con sensor automático. Ahorra agua y es higiénica.', 15999.99, 15, 0, 1, true, 'Con Sensor', 1, 54, 1, 7),
('Llave de Pared Cocina', 'Llave de pared para cocina. Instalación tradicional.', 3999.99, 40, 0, 1, true, 'De Pared', 1, 54, 2, 7),
('Llave Bimando Cocina', 'Llave bimando para cocina. Control independiente de temperatura.', 4999.99, 32, 0, 1, true, 'Bimando', 1, 54, 2, 7),
('Llave con Filtro de Agua', 'Llave con filtro de agua integrado. Agua purificada directamente.', 12999.99, 18, 0, 1, true, 'Con Filtro', 1, 54, 1, 7),

-- ========================================
-- PRODUCTOS DE MUEBLES DE COCINA (id_categoria = 55)
-- ========================================
('Módulo Bajo 60cm', 'Módulo bajo de cocina 60cm. Gabinete base con puerta.', 8999.99, 25, 0, 1, true, '60cm', 1, 55, 1, 14),
('Módulo Alto 60cm', 'Módulo alto de cocina 60cm. Gabinete colgante.', 7999.99, 30, 0, 1, true, '60cm Alto', 1, 55, 1, 14),
('Isla de Cocina', 'Isla de cocina con barra. Espacio adicional para preparación.', 45999.99, 8, 0, 1, true, 'Isla', 1, 55, 1, 14),
('Despensa Torre', 'Despensa torre para cocina. Almacenamiento vertical organizado.', 15999.99, 15, 0, 1, true, 'Torre', 1, 55, 1, 14),
('Mueble para Horno', 'Mueble para horno empotrable. Instalación profesional.', 12999.99, 12, 0, 1, true, 'Horno', 1, 55, 1, 14),
('Encimera de Granito', 'Encimera de granito natural. Durabilidad y elegancia.', 29999.99, 10, 0, 1, true, 'Granito', 1, 55, 6, 4),
('Encimera de Cuarzo', 'Encimera de cuarzo sintético. Resistente y sin mantenimiento.', 25999.99, 12, 0, 1, true, 'Cuarzo', 1, 55, 1, 10),

-- ========================================
-- PRODUCTOS DE ELECTRODOMÉSTICOS (id_categoria = 56)
-- ========================================
('Cocina Encimera 4 Quemadores', 'Cocina encimera de 4 quemadores a gas. Eficiente y práctica.', 29999.99, 15, 0, 1, true, '4 Quemadores', 1, 56, 1, 7),
('Horno Empotrable 60cm', 'Horno empotrable de 60cm. Múltiples funciones de cocción.', 39999.99, 12, 0, 1, true, '60cm', 1, 56, 1, 7),
('Campana Extractora 60cm', 'Campana extractora de 60cm. Elimina olores y humo.', 19999.99, 18, 0, 1, true, '60cm', 1, 56, 1, 7),
('Microondas Empotrable', 'Microondas empotrable para cocina. Instalación integrada.', 15999.99, 20, 0, 1, true, 'Empotrable', 1, 56, 1, 7),
('Lavavajillas 60cm', 'Lavavajillas de 60cm. Ahorra tiempo y agua.', 45999.99, 10, 0, 1, true, '60cm', 1, 56, 1, 7),
('Refrigerador Empotrable', 'Refrigerador empotrable para cocina. Diseño integrado.', 89999.99, 8, 0, 1, true, 'Empotrable', 1, 56, 1, 7),

-- ========================================
-- PRODUCTOS DE PISOS EXTERIORES (id_categoria = 58)
-- ========================================
('Porcelanato Antideslizante 30x30', 'Porcelanato antideslizante para exteriores. Seguridad en áreas húmedas.', 2999.99, 80, 0, 0.9, true, '30x30', 10, 58, 1, 1),
('Cerámica Rústica Exterior', 'Cerámica rústica para exteriores. Resistente a la intemperie.', 1999.99, 100, 0, 0.9, true, '30x30', 10, 58, 3, 2),
('Baldosa Tipo Piedra', 'Baldosa que simula piedra natural. Ideal para terrazas.', 3999.99, 60, 0, 0.9, true, '30x30', 10, 58, 3, 1),
('Deck Cerámico Madera', 'Deck cerámico que simula madera. Resistente y sin mantenimiento.', 4999.99, 45, 0, 1.2, true, '20x60', 10, 58, 2, 1),
('Piedra Natural Travertino', 'Piedra natural travertino para exteriores. Elegancia natural.', 8999.99, 25, 0, 0.9, true, '30x30', 10, 58, 6, 3),
('Pizarra Natural', 'Pizarra natural para exteriores. Resistente y elegante.', 6999.99, 30, 0, 0.9, true, '30x30', 10, 58, 3, 1),

-- ========================================
-- PRODUCTOS DE REVESTIMIENTOS EXTERIORES (id_categoria = 59)
-- ========================================
('Fachaleta Tipo Ladrillo', 'Fachaleta que simula ladrillo. Revestimiento exterior tradicional.', 3999.99, 70, 0, 0.9, true, '30x30', 10, 59, 3, 2),
('Cerámica Rústica Muro', 'Cerámica rústica para muros exteriores. Resistente a la intemperie.', 2999.99, 85, 0, 0.9, true, '30x30', 10, 59, 3, 2),
('Panel Concreto Decorativo', 'Panel de concreto decorativo para exteriores. Diseño moderno.', 5999.99, 40, 0, 1.2, true, '60x20', 10, 59, 4, 1),
('Piedra Natural Canto Rodado', 'Piedra natural canto rodado para muros. Textura natural.', 7999.99, 35, 0, 0.9, true, '30x30', 10, 59, 3, 1),
('Revestimiento Tipo Madera', 'Revestimiento tipo madera para exteriores. Sin mantenimiento.', 4999.99, 50, 0, 1.2, true, '20x60', 10, 59, 2, 1),
('Revestimiento 3D Exterior', 'Revestimiento 3D para exteriores. Diseño moderno y texturizado.', 6999.99, 30, 0, 0.9, true, '30x30', 10, 59, 1, 1),

-- ========================================
-- PRODUCTOS DE PISCINAS (id_categoria = 60)
-- ========================================
('Cerámica Borde Piscina', 'Cerámica antideslizante para borde de piscina. Seguridad en áreas húmedas.', 4999.99, 40, 0, 0.9, true, '30x30', 10, 60, 1, 2),
('Mosaico Vítreo Piscina', 'Mosaico vítreo para interior de piscina. Resistente al cloro.', 8999.99, 25, 0, 0.9, true, '30x30', 10, 60, 1, 2),
('Cerámica Solárium', 'Cerámica tipo piedra para solárium. Resistente al sol y agua.', 3999.99, 35, 0, 0.9, true, '30x30', 10, 60, 3, 2),
('Sellador Impermeabilizante', 'Sellador impermeabilizante para exteriores. Protección contra humedad.', 2999.99, 60, 0, 1, true, '5L', 1, 60, 1, 6),
('Rejilla Drenaje Exterior', 'Rejilla de drenaje para exteriores. Evita acumulación de agua.', 1999.99, 80, 0, 1, true, '30x30', 1, 60, 1, 7),

-- ========================================
-- PRODUCTOS DE MATERIALES DE INSTALACIÓN (id_categoria = 61)
-- ========================================
('Pegamento Cerámica Exterior', 'Pegamento para cerámica de exterior. Resistente a humedad y sol.', 3999.99, 50, 0, 25, true, '25kg', 1, 61, 1, 6),
('Pastina Flexible Impermeable', 'Pastina flexible e impermeable para juntas. Resistente a la intemperie.', 1999.99, 80, 0, 5, true, '5kg', 1, 61, 1, 6),
('Sellador Antihumedad', 'Sellador antihumedad y antifúngico. Protección completa.', 2999.99, 60, 0, 1, true, '1L', 1, 61, 1, 6),
('Aditivo Adherencia Exterior', 'Aditivo para adherencia en exteriores. Mejora la fijación.', 1499.99, 100, 0, 1, true, '1L', 1, 61, 1, 6),
('Crucetas Niveladoras', 'Crucetas y niveladores para cerámica gruesa. Instalación profesional.', 999.99, 150, 0, 1, true, 'Kit 100pcs', 100, 61, 1, 7),
('Mortero Autonivelante', 'Mortero autonivelante para exteriores. Base perfecta para pisos.', 5999.99, 30, 0, 25, true, '25kg', 1, 61, 1, 6),

-- ========================================
-- PRODUCTOS DE ACCESORIOS DECORATIVOS (id_categoria = 62)
-- ========================================
('Banca Cerámica Jardín', 'Banca con revestimiento cerámico para jardín. Resistente y decorativa.', 15999.99, 12, 0, 1, true, 'Banca', 1, 62, 3, 2),
('Maceta Acabado Cerámico', 'Maceta con acabado cerámico. Decorativa y resistente.', 3999.99, 40, 0, 1, true, 'Maceta', 1, 62, 3, 2),
('Luminaria Empotrable Piso', 'Luminaria empotrable para piso exterior. Iluminación decorativa.', 7999.99, 25, 0, 1, true, 'Empotrable', 1, 62, 1, 7),
('Fuente Decorativa Cerámica', 'Fuente decorativa con cerámica. Elemento decorativo para jardín.', 29999.99, 8, 0, 1, true, 'Fuente', 1, 62, 6, 2),
('Pérgola Revestimiento Cerámico', 'Pérgola con revestimiento cerámico en bases. Estructura decorativa.', 45999.99, 6, 0, 1, true, 'Pérgola', 1, 62, 3, 14),

-- ========================================
-- PRODUCTOS DE ILUMINACIÓN (id_categoria = 63)
-- ========================================
('Lámpara LED Baño', 'Lámpara LED para baño. Iluminación eficiente y moderna.', 3999.99, 45, 0, 1, true, 'LED Baño', 1, 63, 1, 6),
('Spot Techo Cocina', 'Spot de techo para cocina. Iluminación focalizada.', 1999.99, 80, 0, 1, true, 'Spot', 1, 63, 1, 6),
('Tira LED Bajo Alacena', 'Tira LED bajo alacena. Iluminación ambiental en cocina.', 2999.99, 60, 0, 1, true, 'Tira LED', 1, 63, 1, 6),
('Lámpara Colgante Decorativa', 'Lámpara colgante decorativa. Elemento decorativo y funcional.', 8999.99, 25, 0, 1, true, 'Colgante', 1, 63, 6, 6),
('Iluminación LED Interior', 'Iluminación LED interior para muebles. Organización iluminada.', 1999.99, 70, 0, 1, true, 'LED Interior', 1, 63, 1, 6);

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