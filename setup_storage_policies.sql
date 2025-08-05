-- Configurar políticas de acceso para el bucket de imágenes
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Política para permitir subir imágenes (INSERT)
CREATE POLICY "Permitir subir imágenes" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'imagenes' AND
    auth.role() = 'authenticated'
);

-- 2. Política para permitir ver imágenes (SELECT)
CREATE POLICY "Permitir ver imágenes" ON storage.objects
FOR SELECT USING (
    bucket_id = 'imagenes'
);

-- 3. Política para permitir actualizar imágenes (UPDATE)
CREATE POLICY "Permitir actualizar imágenes" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'imagenes' AND
    auth.role() = 'authenticated'
);

-- 4. Política para permitir eliminar imágenes (DELETE)
CREATE POLICY "Permitir eliminar imágenes" ON storage.objects
FOR DELETE USING (
    bucket_id = 'imagenes' AND
    auth.role() = 'authenticated'
);

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'; 