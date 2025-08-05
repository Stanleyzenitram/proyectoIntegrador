-- Script para insertar productos completos de baño, cocina y exteriores (VERSIÓN FINAL CORREGIDA)
-- Ejecuta este script en el SQL Editor de Supabase

-- ========================================
-- 1. INSERTAR NUEVAS CATEGORÍAS (CONTINUANDO DESDE ID 6)
-- ========================================

-- Categorías de Baño (continuando desde ID 6)
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

-- Categorías de Cocina (continuando)
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
-- 2. INSERTAR NUEVOS ESTILOS (CONTINUANDO DESDE ID 6)
-- ========================================

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Luxury', 'Estilo de lujo y alta gama'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Luxury');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Ecológico', 'Estilo ecológico y sostenible'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Ecológico');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Vintage', 'Estilo vintage y retro'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Vintage');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Geométrico', 'Patrones geométricos modernos'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Geométrico');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Cemento', 'Estilo cemento industrial'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Cemento');

INSERT INTO public.estilos (nombre_estilo, descripcion) 
SELECT 'Madera', 'Simulación de madera natural'
WHERE NOT EXISTS (SELECT 1 FROM public.estilos WHERE nombre_estilo = 'Madera');

-- ========================================
-- 3. INSERTAR NUEVOS MATERIALES (CONTINUANDO DESDE ID 6)
-- ========================================

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
SELECT 'Cuarzo', 'Cuarzo sintético de alta resistencia'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Cuarzo');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Madera', 'Madera natural y tratada'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Madera');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Melamina', 'Melamina resistente y versátil'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Melamina');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'PVC', 'PVC resistente y económico'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'PVC');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Gres Porcelánico', 'Material de alta resistencia al desgaste'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Gres Porcelánico');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Porcelana', 'Material de alta calidad y durabilidad'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Porcelana');

INSERT INTO public.materiales (nombre_materiales, uso_materiales) 
SELECT 'Gres', 'Material resistente y versátil'
WHERE NOT EXISTS (SELECT 1 FROM public.materiales WHERE nombre_materiales = 'Gres');

-- ========================================
-- 4. OBTENER IDs CORRECTOS PARA INSERTAR PRODUCTOS
-- ========================================

-- Crear tabla temporal con los IDs correctos
WITH ids_correctos AS (
    SELECT 
        -- Categorías
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Sanitarios') as id_sanitarios,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Duchas y Bañeras') as id_duchas,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Lavamanos') as id_lavamanos,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Grifería') as id_griferia,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Muebles de Baño') as id_muebles_baño,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Accesorios de Baño') as id_accesorios_baño,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Fregaderos') as id_fregaderos,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Grifería de Cocina') as id_griferia_cocina,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Muebles de Cocina') as id_muebles_cocina,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Electrodomésticos') as id_electrodomesticos,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Pisos Exteriores') as id_pisos_exterior,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Revestimientos Exteriores') as id_revestimientos,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Piscinas y Áreas Húmedas') as id_piscinas,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Materiales de Instalación') as id_materiales_inst,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Accesorios Decorativos') as id_accesorios_deco,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Iluminación') as id_iluminacion,
        (SELECT id_categoria FROM public.categorias WHERE nombre_categoria = 'Ventilación') as id_ventilacion,
        
        -- Estilos
        (SELECT id_estilo FROM public.estilos WHERE nombre_estilo = 'Moderno') as id_moderno,
        (SELECT id_estilo FROM public.estilos WHERE nombre_estilo = 'Clásico') as id_clasico,
        (SELECT id_estilo FROM public.estilos WHERE nombre_estilo = 'Minimalista') as id_minimalista,
        (SELECT id_estilo FROM public.estilos WHERE nombre_estilo = 'Rústico') as id_rustico,
        (SELECT id_estilo FROM public.estilos WHERE nombre_estilo = 'Industrial') as id_industrial,
        (SELECT id_estilo FROM public.estilos WHERE nombre_estilo = 'Luxury') as id_luxury,
        (SELECT id_estilo FROM public.estilos WHERE nombre_estilo = 'Ecológico') as id_ecologico,
        
        -- Materiales
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Porcelana Sanitaria') as id_porcelana_sanitaria,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Acero Inoxidable') as id_acero_inox,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Acrílico') as id_acrilico,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Vidrio Templado') as id_vidrio_templado,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Granito') as id_granito,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Cuarzo') as id_cuarzo,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Mármol') as id_marmol,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Madera') as id_madera,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Melamina') as id_melamina,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'PVC') as id_pvc,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Cerámica') as id_ceramica,
        (SELECT id_materiales FROM public.materiales WHERE nombre_materiales = 'Porcelanato') as id_porcelanato
)
SELECT * FROM ids_correctos; 