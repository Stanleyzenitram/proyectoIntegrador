import { supabase } from "../services/supabase";
import type { Producto } from "../types/index";

/**
 * Sube una imagen a Supabase Storage y retorna la URL pública
 */
export const uploadImage = async (file: File): Promise<string> => {
    try {
        // Validar el archivo
        if (!file) {
            throw new Error('No se seleccionó ningún archivo');
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            throw new Error('El archivo debe ser una imagen');
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('La imagen debe ser menor a 5MB');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `productos/${fileName}`;

        console.log('🔄 Subiendo imagen:', fileName);

        console.log('🔄 Intentando subir imagen a bucket "imagenes"...');
        
        const { error: uploadError, data } = await supabase.storage
            .from('imagenes')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Error al subir:', uploadError);
            
            // Mensajes de error más específicos
            if (uploadError.message.includes('row-level security policy')) {
                throw new Error('Error de permisos: Las políticas de seguridad están bloqueando la subida. Contacta al administrador.');
            } else if (uploadError.message.includes('bucket')) {
                throw new Error('Error: El bucket de imágenes no existe o no está configurado correctamente.');
            } else {
                throw new Error(`Error al subir la imagen: ${uploadError.message}`);
            }
        }

        console.log('✅ Imagen subida exitosamente:', data?.path);

        const { data: { publicUrl } } = supabase.storage
            .from('imagenes')
            .getPublicUrl(filePath);

        console.log('🔗 URL pública generada:', publicUrl);

        return publicUrl;
    } catch (error: any) {
        console.error('❌ Error en uploadImage:', error.message);
        throw error;
    }
};

/**
 * Obtiene la lista de productos desde la base de datos.
 */
export const fetchProductos = async () => {
    try {
        const { data, error } = await supabase
            .from("productos")
            .select(`
                *,
                estilo:estilos(nombre_estilo),
                material:materiales(nombre_materiales),
                categoria:categorias(nombre_categoria)
            `);

        if (error) {
            console.error("❌ Error al obtener productos:", error.message);
            throw new Error("No se pudo obtener la lista de productos.");
        }

        return data || [];
    } catch (err: any) {
        console.error("🚨 Error en fetchProductos:", err.message || err);
        throw err;
    }
};

/**
 * Crea un nuevo producto en la base de datos.
 */
export const crearProducto = async (producto: Producto) => {
    try {
        const { data, error } = await supabase
            .from("productos")
            .insert([
                {
                    nombre_producto: producto.nombre_producto,
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    stock_actual: producto.stock_actual,
                    imagen: producto.imagen,
                    descuento: producto.descuento,
                    metros_por_caja: producto.metros_por_caja,
                    disponibilidad: producto.disponibilidad,
                    formato: producto.formato,
                    piezas_por_caja: producto.piezas_por_caja,
                    id_estilo: producto.id_estilo,
                    id_materiales: producto.id_materiales,
                    id_categoria: producto.id_categoria
                }
            ])
            .select();

        if (error) {
            console.error("❌ Error al crear producto:", error.message);
            throw new Error("No se pudo crear el producto.");
        }

        return data;
    } catch (err: any) {
        console.error("🚨 Error en crearProducto:", err.message || err);
        throw err;
    }
};

/**
 * Actualiza un producto existente en la base de datos.
 */
export const actualizarProducto = async (producto: Producto) => {
    try {
        const { data, error } = await supabase
            .from("productos")
            .update({
                nombre_producto: producto.nombre_producto,
                descripcion: producto.descripcion,
                precio: producto.precio,
                stock_actual: producto.stock_actual,
                imagen: producto.imagen,
                descuento: producto.descuento,
                metros_por_caja: producto.metros_por_caja,
                disponibilidad: producto.disponibilidad,
                formato: producto.formato,
                piezas_por_caja: producto.piezas_por_caja,
                id_estilo: producto.id_estilo,
                id_materiales: producto.id_materiales,
                id_categoria: producto.id_categoria
            })
            .eq('id_producto', producto.id_producto)
            .select();

        if (error) {
            console.error("❌ Error al actualizar producto:", error.message);
            throw new Error("No se pudo actualizar el producto.");
        }

        return data;
    } catch (err: any) {
        console.error("🚨 Error en actualizarProducto:", err.message || err);
        throw err;
    }
}; 