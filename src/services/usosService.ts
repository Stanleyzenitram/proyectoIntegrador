import { supabase } from './supabase';

export interface UsoProducto {
    id?: number;
    nombre: string;
    created_at?: string;
}

export interface PreferenciaUso {
    id?: number;
    usuario_id: string;
    uso_id: number;
    prioridad: number; // 1-5 donde 5 es más importante
    created_at?: string;
}

export interface UsoConPreferencia extends UsoProducto {
    prioridad?: number;
    seleccionado?: boolean;
}

export const usosService = {
    // Obtener todos los usos disponibles
    async obtenerUsos(): Promise<UsoProducto[]> {
        const { data, error } = await supabase
            .from('uso')
            .select('*')
            .order('nombre');

        if (error) {
            console.error('Error obteniendo usos:', error);
            throw error;
        }

        return data || [];
    },

    // Crear usos por defecto si no existen
    async crearUsosPorDefecto(): Promise<void> {
        try {
            // Verificar si la tabla uso existe
            const { data: tableExists, error: checkError } = await supabase
                .from('uso')
                .select('id')
                .limit(1);

            if (checkError && checkError.code === 'PGRST205') {
                console.log('Tabla uso no existe, no se pueden crear usos por defecto');
                return;
            }

            const usosPorDefecto = [
                { nombre: 'Gaje Rustico' },
                { nombre: 'Gaje Moderno' },
                { nombre: 'Gaje Clásico' },
                { nombre: 'Gaje Industrial' },
                { nombre: 'Gaje Mediterráneo' },
                { nombre: 'Gaje Escandinavo' },
                { nombre: 'Gaje Oriental' },
                { nombre: 'Gaje Bohemio' },
                { nombre: 'Gaje Vintage' },
                { nombre: 'Gaje Lujo' }
            ];

            for (const uso of usosPorDefecto) {
                const { error } = await supabase
                    .from('uso')
                    .upsert({
                        ...uso
                    }, {
                        onConflict: 'nombre',
                        ignoreDuplicates: false
                    });

                if (error) {
                    console.error(`Error creando uso ${uso.nombre}:`, error);
                }
            }
        } catch (error) {
            console.error('Error en crearUsosPorDefecto:', error);
        }
    },

    // Obtener preferencias de uso de un usuario usando la tabla usoXpref
    async obtenerPreferenciasUso(usuarioId: string): Promise<PreferenciaUso[]> {
        try {
            // Primero obtener el ID del cliente por UUID
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', usuarioId)
                .single();

            if (clienteError || !clienteData) {
                console.error('Error obteniendo cliente:', clienteError);
                return [];
            }

            // Obtener preferencias de uso directamente desde preferencias_uso
            const { data: usosData, error: usosError } = await supabase
                .from('preferencias_uso')
                .select(`
                    *,
                    uso (
                        id,
                        nombre
                    )
                `)
                .eq('usuario_id', usuarioId);

            if (usosError) {
                console.error('Error obteniendo usos:', usosError);
                return [];
            }

            // Convertir a formato PreferenciaUso
            return usosData.map(item => ({
                id: item.id,
                usuario_id: usuarioId,
                uso_id: item.uso.id,
                prioridad: 3, // Prioridad por defecto ya que no hay campo prioridad
                created_at: item.created_at
            }));

        } catch (error) {
            console.error('Error obteniendo preferencias de uso:', error);
            return [];
        }
    },

    // Guardar preferencias de uso de un usuario usando la estructura real de la BD
    async guardarPreferenciasUso(usuarioId: string, usos: Array<{ uso_id: number, prioridad: number }>): Promise<boolean> {
        try {
            // Primero obtener el ID del cliente por UUID
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', usuarioId)
                .single();

            if (clienteError || !clienteData) {
                console.error('Error obteniendo cliente:', clienteError);
                return false;
            }

            // Eliminar usos existentes para este usuario
            const { error: deleteError } = await supabase
                .from('preferencias_uso')
                .delete()
                .eq('usuario_id', usuarioId);

            if (deleteError) {
                console.error('Error eliminando usos anteriores:', deleteError);
                return false;
            }

            // Insertar nuevos usos
            if (usos.length > 0) {
                const usosParaInsertar = usos.map(uso => ({
                    usuario_id: usuarioId,
                    uso_id: uso.uso_id,
                    prioridad: uso.prioridad
                }));

                const { error: insertError } = await supabase
                    .from('preferencias_uso')
                    .insert(usosParaInsertar);

                if (insertError) {
                    console.error('Error insertando usos:', insertError);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error guardando preferencias de uso:', error);
            return false;
        }
    },

    // Obtener usos con información de preferencia del usuario usando la estructura real
    async obtenerUsosConPreferencia(usuarioId: string): Promise<UsoConPreferencia[]> {
        try {
            // Primero obtener todos los usos disponibles
            const usos = await this.obtenerUsos();
            
            // Luego obtener preferencias del usuario
            const preferencias = await this.obtenerPreferenciasUso(usuarioId);

            return usos.map(uso => {
                const preferencia = preferencias.find(p => p.uso_id === uso.id);
                return {
                    ...uso,
                    prioridad: preferencia?.prioridad || 0,
                    seleccionado: !!preferencia
                };
            });
        } catch (error) {
            console.error('Error obteniendo usos con preferencia:', error);
            return [];
        }
    },

    // Obtener productos recomendados por uso
    async obtenerProductosPorUso(usoId: number, limit: number = 10): Promise<any[]> {
        // Por ahora, retornamos productos generales ya que la tabla productos no tiene campo id_uso
        // En el futuro se podría implementar una lógica más sofisticada basada en categorías relacionadas
        const { data, error } = await supabase
            .from('productos')
            .select(`
                *,
                categorias(id_categoria, nombre_categoria),
                estilos(id_estilo, nombre_estilo),
                materiales(id_materiales, nombre_materiales)
            `)
            .eq('disponibilidad', true)
            .limit(limit)
            .order('precio', { ascending: true });

        if (error) {
            console.error('Error obteniendo productos por uso:', error);
            return [];
        }

        return data || [];
    }
};
