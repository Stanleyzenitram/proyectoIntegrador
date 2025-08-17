// Utilidad para migrar preferencias del formato legacy al nuevo formato de categorías

import { supabase } from '../services/supabase';
import { PreferenciasCategorizadas } from './preferenciasCategorias';

interface PreferenciaLegacy {
    id: number;
    idClientes: number;
    categorias_favoritas?: string;
    materiales_favoritos?: string;
    estilos_favoridos?: string;
    colores_preferidos?: string;
    rango_precio?: string;
    precMin?: number;
    precMax?: number;
    usoEspecifico?: string;
    fecha_actualizacion?: string;
}

/**
 * Migrar preferencias de un cliente específico del formato legacy al nuevo formato
 */
export async function migrarPreferenciasCliente(clienteId: number): Promise<boolean> {
    try {
        console.log(`Migrando preferencias para cliente ${clienteId}...`);

        // Verificar si ya tiene preferencias en el nuevo formato
        const { data: preferenciasCategorias } = await supabase
            .from('preferencias_categorias')
            .select('id')
            .eq('idclientes', clienteId)
            .single();

        if (preferenciasCategorias) {
            console.log(`Cliente ${clienteId} ya tiene preferencias categorizadas.`);
            return true;
        }

        // Obtener preferencias legacy
        const { data: preferenciaLegacy, error: errorLegacy } = await supabase
            .from('preferencias')
            .select('*')
            .eq('idClientes', clienteId)
            .single();

        if (errorLegacy || !preferenciaLegacy) {
            console.log(`Cliente ${clienteId} no tiene preferencias legacy para migrar.`);
            return false;
        }

        // Convertir al nuevo formato
        const preferenciasNuevas = convertirPreferenciasLegacy(preferenciaLegacy);

        // Insertar en la nueva tabla
        const { error: errorInsertar } = await supabase
            .from('preferencias_categorias')
            .insert([preferenciasNuevas]);

        if (errorInsertar) {
            console.error(`Error al insertar preferencias para cliente ${clienteId}:`, errorInsertar);
            return false;
        }

        console.log(`✅ Preferencias migradas exitosamente para cliente ${clienteId}`);
        return true;

    } catch (error) {
        console.error(`Error al migrar preferencias para cliente ${clienteId}:`, error);
        return false;
    }
}

/**
 * Migrar todas las preferencias legacy al nuevo formato
 */
export async function migrarTodasLasPreferencias(): Promise<{ exito: number; fallos: number; total: number }> {
    try {
        console.log('Iniciando migración masiva de preferencias...');

        // Obtener todas las preferencias legacy
        const { data: preferenciasLegacy, error } = await supabase
            .from('preferencias')
            .select('*');

        if (error) {
            console.error('Error al obtener preferencias legacy:', error);
            return { exito: 0, fallos: 0, total: 0 };
        }

        if (!preferenciasLegacy || preferenciasLegacy.length === 0) {
            console.log('No hay preferencias legacy para migrar.');
            return { exito: 0, fallos: 0, total: 0 };
        }

        let exito = 0;
        let fallos = 0;
        const total = preferenciasLegacy.length;

        // Migrar cada preferencia
        for (const pref of preferenciasLegacy) {
            const resultado = await migrarPreferenciasCliente(pref.idClientes);
            if (resultado) {
                exito++;
            } else {
                fallos++;
            }
        }

        console.log(`Migración completada: ${exito} exitosas, ${fallos} fallidas de ${total} total`);
        return { exito, fallos, total };

    } catch (error) {
        console.error('Error en migración masiva:', error);
        return { exito: 0, fallos: 0, total: 0 };
    }
}

/**
 * Convertir preferencias del formato legacy al nuevo formato categorizado
 */
function convertirPreferenciasLegacy(preferenciaLegacy: PreferenciaLegacy): PreferenciasCategorizadas {
    const nuevasPreferencias: PreferenciasCategorizadas = {
        idclientes: preferenciaLegacy.idClientes, // Convertir a minúscula para BD
        fecha_actualizacion: new Date().toISOString()
    };

    // Mapear rango de precio
    if (preferenciaLegacy.rango_precio) {
        const mapeoRangos: Record<string, string> = {
            'economico': 'economico',
            'medio': 'medio', 
            'premium': 'premium',
            'lujo': 'lujo'
        };
        
        nuevasPreferencias.categoria_precio = mapeoRangos[preferenciaLegacy.rango_precio] || undefined;
    }

    // Intentar mapear colores legacy a categorías de colores
    if (preferenciaLegacy.colores_preferidos) {
        try {
            const colores = JSON.parse(preferenciaLegacy.colores_preferidos) as string[];
            nuevasPreferencias.categoria_color = categorizarColores(colores);
        } catch (error) {
            console.warn('Error al parsear colores preferidos:', error);
        }
    }

    // Intentar mapear categorías legacy (solo tomar la primera si hay múltiples)
    if (preferenciaLegacy.categorias_favoritas) {
        try {
            const categorias = JSON.parse(preferenciaLegacy.categorias_favoritas) as number[];
            // Por ahora no podemos mapear automáticamente categorías sin conocer los IDs
            // Este mapeo se puede hacer manualmente o con datos adicionales
        } catch (error) {
            console.warn('Error al parsear categorías favoritas:', error);
        }
    }

    // Intentar mapear estilos legacy
    if (preferenciaLegacy.estilos_favoridos) {
        try {
            const estilos = JSON.parse(preferenciaLegacy.estilos_favoridos) as number[];
            // Similar a categorías, necesitaríamos mapeo manual
        } catch (error) {
            console.warn('Error al parsear estilos favoritos:', error);
        }
    }

    // Intentar mapear materiales legacy
    if (preferenciaLegacy.materiales_favoritos) {
        try {
            const materiales = JSON.parse(preferenciaLegacy.materiales_favoritos) as number[];
            // Similar, necesitaríamos mapeo manual
        } catch (error) {
            console.warn('Error al parsear materiales favoritos:', error);
        }
    }

    return nuevasPreferencias;
}

/**
 * Categorizar colores individuales en familias de colores
 */
function categorizarColores(colores: string[]): string | undefined {
    const coloresCálidos = ['Rojo', 'Amarillo', 'Naranja', 'Marrón', 'Beige', 'Rosa'];
    const coloresFríos = ['Azul', 'Verde', 'Púrpura'];
    const coloresNeutros = ['Blanco', 'Negro', 'Gris', 'Natural'];

    const conteos = {
        calidos: colores.filter(c => coloresCálidos.some(cc => c.toLowerCase().includes(cc.toLowerCase()))).length,
        frios: colores.filter(c => coloresFríos.some(cf => c.toLowerCase().includes(cf.toLowerCase()))).length,
        neutros: colores.filter(c => coloresNeutros.some(cn => c.toLowerCase().includes(cn.toLowerCase()))).length
    };

    // Retornar la categoría con más coincidencias
    const max = Math.max(conteos.calidos, conteos.frios, conteos.neutros);
    
    if (max === 0) return undefined;
    
    if (conteos.calidos === max) return 'colores_calidos';
    if (conteos.frios === max) return 'colores_frios';
    if (conteos.neutros === max) return 'colores_neutros';
    
    return undefined;
}

/**
 * Verificar el estado de migración
 */
export async function verificarEstadoMigracion(): Promise<{
    totalLegacy: number;
    totalCategorias: number;
    pendientesMigracion: number;
}> {
    try {
        // Contar preferencias legacy
        const { count: totalLegacy } = await supabase
            .from('preferencias')
            .select('*', { count: 'exact', head: true });

        // Contar preferencias categorizadas
        const { count: totalCategorias } = await supabase
            .from('preferencias_categorias')
            .select('*', { count: 'exact', head: true });

        const pendientesMigracion = (totalLegacy || 0) - (totalCategorias || 0);

        return {
            totalLegacy: totalLegacy || 0,
            totalCategorias: totalCategorias || 0,
            pendientesMigracion: Math.max(0, pendientesMigracion)
        };

    } catch (error) {
        console.error('Error al verificar estado de migración:', error);
        return {
            totalLegacy: 0,
            totalCategorias: 0,
            pendientesMigracion: 0
        };
    }
}

/**
 * Función de utilidad para ejecutar migración desde la consola del navegador
 */
export async function ejecutarMigracionConsola() {
    console.log('🔄 Iniciando migración de preferencias...');
    
    const estado = await verificarEstadoMigracion();
    console.log('📊 Estado actual:', estado);
    
    if (estado.pendientesMigracion === 0) {
        console.log('✅ No hay preferencias pendientes de migración.');
        return;
    }
    
    const resultado = await migrarTodasLasPreferencias();
    console.log('📋 Resultado final:', resultado);
    
    const estadoFinal = await verificarEstadoMigracion();
    console.log('📊 Estado después de migración:', estadoFinal);
}
