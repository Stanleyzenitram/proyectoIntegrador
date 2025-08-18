import { supabase } from './supabase';

export interface ConfiguracionSistema {
    id?: number;
    nombre: string;
    valor: any;
    descripcion: string;
    activo: boolean;
    created_at?: string;
    updated_at?: string;
}

export const configuracionService = {
    // Obtener todas las configuraciones
    async obtenerConfiguraciones(): Promise<ConfiguracionSistema[]> {
        const { data, error } = await supabase
            .from('configuracion_sistema')
            .select('*')
            .eq('activo', true)
            .order('nombre');
        
        if (error) {
            console.error('❌ Error obteniendo configuraciones:', error);
            throw error;
        }
        
        return data || [];
    },

    // Obtener configuración por nombre
    async obtenerConfiguracionPorNombre(nombre: string): Promise<any> {
        const { data, error } = await supabase
            .from('configuracion_sistema')
            .select('valor')
            .eq('nombre', nombre)
            .eq('activo', true)
            .single();
        
        if (error) {
            console.error(`❌ Error obteniendo configuración ${nombre}:`, error);
            return null;
        }
        
        return data?.valor;
    },

    // Crear nueva configuración
    async crearConfiguracion(config: Omit<ConfiguracionSistema, 'id' | 'created_at' | 'updated_at'>): Promise<ConfiguracionSistema> {
        const { data, error } = await supabase
            .from('configuracion_sistema')
            .insert([config])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error creando configuración:', error);
            throw error;
        }
        
        return data;
    },

    // Actualizar configuración
    async actualizarConfiguracion(id: number, config: Partial<ConfiguracionSistema>): Promise<ConfiguracionSistema> {
        const { data, error } = await supabase
            .from('configuracion_sistema')
            .update(config)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error actualizando configuración:', error);
            throw error;
        }
        
        return data;
    },

    // Actualizar configuración por nombre
    async actualizarConfiguracionPorNombre(nombre: string, valor: any, descripcion?: string): Promise<boolean> {
        const { error } = await supabase
            .from('configuracion_sistema')
            .update({
                valor,
                descripcion: descripcion || undefined,
                updated_at: new Date().toISOString()
            })
            .eq('nombre', nombre);
        
        if (error) {
            console.error(`❌ Error actualizando configuración ${nombre}:`, error);
            throw error;
        }
        
        return true;
    },

    // Eliminar configuración (soft delete)
    async eliminarConfiguracion(id: number): Promise<void> {
        const { error } = await supabase
            .from('configuracion_sistema')
            .update({ activo: false })
            .eq('id', id);
        
        if (error) {
            console.error('❌ Error eliminando configuración:', error);
            throw error;
        }
    },

    // Obtener rangos de precio
    async obtenerRangosPrecio(): Promise<any> {
        return await this.obtenerConfiguracionPorNombre('rangos_precio');
    },

    // Obtener categorías de colores
    async obtenerCategoriasColores(): Promise<any> {
        return await this.obtenerConfiguracionPorNombre('categorias_colores');
    },

    // Obtener estilos decorativos
    async obtenerEstilosDecorativos(): Promise<any> {
        const estilos = await this.obtenerConfiguracionPorNombre('estilos_decorativos');
        console.log('🔍 Estilos decorativos obtenidos:', estilos);
        return estilos;
    },

    // Obtener tipos de materiales
    async obtenerTiposMateriales(): Promise<any> {
        const materiales = await this.obtenerConfiguracionPorNombre('tipos_materiales');
        console.log('🔍 Tipos de materiales obtenidos:', materiales);
        return materiales;
    },

    // Obtener rangos de precio formateados para preferencias
    async obtenerRangosPrecioFormateados(): Promise<Array<{id: string, nombre: string, descripcion: string, mapeo: {campo: string, rango: {min: number, max: number}}}>> {
        const rangos = await this.obtenerRangosPrecio();
        if (!rangos) return [];
        
        return Object.entries(rangos).map(([key, valor]: [string, any]) => ({
            id: key,
            nombre: valor.nombre,
            descripcion: `Productos entre $${valor.min} y $${valor.max}`,
            mapeo: {
                campo: 'precio',
                rango: { min: valor.min, max: valor.max }
            }
        }));
    },

    // Obtener categorías de colores formateadas para preferencias
    async obtenerCategoriasColoresFormateadas(): Promise<Array<{id: string, nombre: string, descripcion: string, mapeo: {campo: string, valores: string[]}}>> {
        const categorias = await this.obtenerCategoriasColores();
        if (!categorias) return [];
        
        return Object.entries(categorias).map(([key, valor]: [string, any]) => ({
            id: key,
            nombre: valor.nombre,
            descripcion: `Colores: ${valor.colores.join(', ')}`,
            mapeo: {
                campo: 'color',
                valores: valor.colores
            }
        }));
    },

    // Obtener estilos decorativos formateados para preferencias
    async obtenerEstilosDecorativosFormateados(): Promise<Array<{id: string, nombre: string, descripcion: string}>> {
        const estilos = await this.obtenerEstilosDecorativos();
        if (!estilos) return [];
        
        return Object.entries(estilos).map(([key, valor]: [string, any]) => ({
            id: key,
            nombre: valor.nombre,
            descripcion: valor.descripcion
        }));
    },

    // Obtener tipos de materiales formateados para preferencias
    async obtenerTiposMaterialesFormateados(): Promise<Array<{id: string, nombre: string, descripcion: string}>> {
        const materiales = await this.obtenerTiposMateriales();
        if (!materiales) return [];
        
        return Object.entries(materiales).map(([key, valor]: [string, any]) => ({
            id: key,
            nombre: valor.nombre,
            descripcion: valor.descripcion
        }));
    },

    // Obtener configuración de recomendaciones
    async obtenerConfiguracionRecomendaciones(): Promise<any> {
        return await this.obtenerConfiguracionPorNombre('configuracion_recomendaciones');
    },

    // Obtener configuración de UI
    async obtenerConfiguracionUI(): Promise<any> {
        return await this.obtenerConfiguracionPorNombre('configuracion_ui');
    },

    // Actualizar rangos de precio
    async actualizarRangosPrecio(rangos: any): Promise<boolean> {
        return await this.actualizarConfiguracionPorNombre('rangos_precio', rangos);
    },

    // Actualizar categorías de colores
    async actualizarCategoriasColores(categorias: any): Promise<boolean> {
        return await this.actualizarConfiguracionPorNombre('categorias_colores', categorias);
    },

    // Actualizar estilos decorativos
    async actualizarEstilosDecorativos(estilos: any): Promise<boolean> {
        return await this.actualizarConfiguracionPorNombre('estilos_decorativos', estilos);
    },

    // Actualizar tipos de materiales
    async actualizarTiposMateriales(materiales: any): Promise<boolean> {
        return await this.actualizarConfiguracionPorNombre('tipos_materiales', materiales);
    },

    // Actualizar configuración de recomendaciones
    async actualizarConfiguracionRecomendaciones(config: any): Promise<boolean> {
        return await this.actualizarConfiguracionPorNombre('configuracion_recomendaciones', config);
    },

    // Actualizar configuración de UI
    async actualizarConfiguracionUI(config: any): Promise<boolean> {
        return await this.actualizarConfiguracionPorNombre('configuracion_ui', config);
    },

    // Crear configuraciones por defecto si no existen
    async crearConfiguracionesPorDefecto(): Promise<void> {
        const configsPorDefecto = [
            {
                nombre: 'rangos_precio',
                valor: {
                    bajo: { min: 0, max: 50, nombre: 'Económico' },
                    medio: { min: 51, max: 150, nombre: 'Intermedio' },
                    alto: { min: 151, max: 500, nombre: 'Premium' }
                },
                descripcion: 'Rangos de precios para categorización de productos',
                activo: true
            },
            {
                nombre: 'categorias_colores',
                valor: {
                    neutros: { nombre: 'Colores Neutros', colores: ['Blanco', 'Gris', 'Beige', 'Crema'] },
                    vibrantes: { nombre: 'Colores Vibrantes', colores: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja'] },
                    terrosos: { nombre: 'Colores Terrosos', colores: ['Marrón', 'Ocre', 'Siena', 'Tierra'] },
                    pasteles: { nombre: 'Colores Pasteles', colores: ['Rosa', 'Azul Claro', 'Verde Menta', 'Lavanda'] },
                    metálicos: { nombre: 'Colores Metálicos', colores: ['Dorado', 'Plateado', 'Cobre', 'Bronce'] }
                },
                descripcion: 'Categorías de colores y sus colores asociados',
                activo: true
            },
            {
                nombre: 'estilos_decorativos',
                valor: {
                    rustico: { 
                        nombre: 'Estilo Rústico', 
                        descripcion: 'Caracterizado por texturas naturales y acabados envejecidos'
                    },
                    moderno: { 
                        nombre: 'Estilo Moderno', 
                        descripcion: 'Líneas limpias, minimalista y contemporáneo'
                    },
                    ejecutivo: { 
                        nombre: 'Estilo Ejecutivo', 
                        descripcion: 'Elegante, sofisticado y profesional'
                    },
                    clasico: { 
                        nombre: 'Estilo Clásico', 
                        descripcion: 'Tradicional, atemporal y refinado'
                    }
                },
                descripcion: 'Estilos decorativos y sus características',
                activo: true
            },
            {
                nombre: 'tipos_materiales',
                valor: {
                    ceramica_natural: { 
                        nombre: 'Cerámica Natural', 
                        descripcion: 'Materiales naturales y orgánicos'
                    },
                    porcelanato: { 
                        nombre: 'Porcelanato', 
                        descripcion: 'Materiales de alta densidad y durabilidad'
                    },
                    gres: { 
                        nombre: 'Gres', 
                        descripcion: 'Materiales resistentes y versátiles'
                    }
                },
                descripcion: 'Tipos de materiales y sus características',
                activo: true
            },
            {
                nombre: 'configuracion_recomendaciones',
                valor: {
                    limite_productos: 12,
                    peso_precio: 0.3,
                    peso_color: 0.25,
                    peso_estilo: 0.25,
                    peso_material: 0.2,
                    umbral_similitud: 0.7
                },
                descripcion: 'Configuración para el sistema de recomendaciones',
                activo: true
            },
            {
                nombre: 'configuracion_ui',
                valor: {
                    colores_primarios: ['#f97316', '#ea580c', '#c2410c'],
                    colores_secundarios: ['#64748b', '#475569', '#334155'],
                    tema: 'claro',
                    animaciones: true
                },
                descripcion: 'Configuración de la interfaz de usuario',
                activo: true
            }
        ];

        try {
            for (const config of configsPorDefecto) {
                await supabase
                    .from('configuracion_sistema')
                    .upsert([config], { onConflict: 'nombre' });
            }
        } catch (error) {
            console.error('❌ Error creando configuraciones por defecto:', error);
            throw error;
        }
    }
};
