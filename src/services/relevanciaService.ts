import { supabase } from './supabase';

export interface ConfiguracionRelevancia {
  id_configuracion?: number;
  nombre_configuracion: string;
  descripcion?: string;
  configuracion: {
    pesos: {
      busqueda: number;
      historial: number;
      stock: number;
      precio: number;
      descuentos: number;
      otros: number;
    };
    configuracionAvanzada: {
      tiempoRespuesta: number;
      precisionMinima: number;
      maxResultados: number;
      actualizacionAutomatica: boolean;
      loggingDetallado: boolean;
    };
  };
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface PesosRelevancia {
  busqueda: number;
  historial: number;
  stock: number;
  precio: number;
  descuentos: number;
  otros: number;
}

export interface ConfiguracionAvanzada {
  tiempoRespuesta: number;
  precisionMinima: number;
  maxResultados: number;
  actualizacionAutomatica: boolean;
  loggingDetallado: boolean;
}

/**
 * Obtiene la configuración actual de relevancia
 */
export const obtenerConfiguracionRelevancia = async (): Promise<ConfiguracionRelevancia | null> => {
  console.log('🔍 [SERVICE] Iniciando obtención de configuración de relevancia');
  try {
    console.log('🔍 [SERVICE] Ejecutando consulta a Supabase...');
    const { data, error } = await supabase
      .from('configuracion_relevancia')
      .select('*')
      .eq('activo', true)
      .eq('nombre_configuracion', 'configuracion_default')
      .single();

    console.log('🔍 [SERVICE] Respuesta de Supabase:', { data, error });

    if (error) {
      console.error('❌ [SERVICE] Error al obtener configuración de relevancia:', error);
      return null;
    }

    console.log('✅ [SERVICE] Configuración obtenida exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ [SERVICE] Error al obtener configuración de relevancia:', error);
    return null;
  }
};

/**
 * Guarda la configuración de relevancia
 */
export const guardarConfiguracionRelevancia = async (
  configuracion: ConfiguracionRelevancia
): Promise<boolean> => {
  console.log('💾 [SERVICE] Iniciando guardado de configuración:', configuracion);
  try {
    // Verificar si ya existe una configuración activa
    console.log('🔍 [SERVICE] Verificando configuración existente...');
    const configuracionExistente = await obtenerConfiguracionRelevancia();
    
    if (configuracionExistente) {
      console.log('🔄 [SERVICE] Actualizando configuración existente...');
      // Actualizar configuración existente
      const { error } = await supabase
        .from('configuracion_relevancia')
        .update({
          configuracion: configuracion.configuracion,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_configuracion', configuracionExistente.id_configuracion);

      if (error) {
        console.error('❌ [SERVICE] Error al actualizar configuración de relevancia:', error);
        return false;
      }
      console.log('✅ [SERVICE] Configuración actualizada exitosamente');
    } else {
      console.log('🆕 [SERVICE] Creando nueva configuración...');
      // Crear nueva configuración
      const { error } = await supabase
        .from('configuracion_relevancia')
        .insert([{
          nombre_configuracion: 'configuracion_default',
          descripcion: 'Configuración por defecto del sistema de relevancia',
          configuracion: configuracion.configuracion,
          activo: true
        }]);

      if (error) {
        console.error('❌ [SERVICE] Error al crear configuración de relevancia:', error);
        return false;
      }
      console.log('✅ [SERVICE] Nueva configuración creada exitosamente');
    }

    return true;
  } catch (error) {
    console.error('❌ [SERVICE] Error al guardar configuración de relevancia:', error);
    return false;
  }
};

/**
 * Obtiene la configuración por defecto
 */
export const obtenerConfiguracionPorDefecto = (): ConfiguracionRelevancia => {
  console.log('📋 [SERVICE] Generando configuración por defecto');
  return {
    nombre_configuracion: 'configuracion_default',
    descripcion: 'Configuración por defecto del sistema de relevancia',
    configuracion: {
      pesos: {
        busqueda: 30,
        historial: 25,
        stock: 15,
        precio: 10,
        descuentos: 10,
        otros: 10
      },
      configuracionAvanzada: {
        tiempoRespuesta: 2.5,
        precisionMinima: 85,
        maxResultados: 50,
        actualizacionAutomatica: true,
        loggingDetallado: false
      }
    },
    activo: true
  };
};

/**
 * Valida que los pesos sumen 100%
 */
export const validarPesos = (pesos: PesosRelevancia): boolean => {
  const total = Object.values(pesos).reduce((sum, peso) => sum + peso, 0);
  console.log('🔍 [SERVICE] Validando pesos:', { pesos, total, esValido: total === 100 });
  return total === 100;
};

/**
 * Normaliza los pesos para que sumen 100%
 */
export const normalizarPesos = (pesos: PesosRelevancia): PesosRelevancia => {
  console.log('🔄 [SERVICE] Normalizando pesos:', pesos);
  const total = Object.values(pesos).reduce((sum, peso) => sum + peso, 0);
  
  if (total === 0) {
    // Si todos son 0, distribuir equitativamente
    const pesosNormalizados = {
      busqueda: 16.67,
      historial: 16.67,
      stock: 16.67,
      precio: 16.67,
      descuentos: 16.67,
      otros: 16.67
    };
    console.log('🔄 [SERVICE] Pesos normalizados (distribución equitativa):', pesosNormalizados);
    return pesosNormalizados;
  }

  // Normalizar proporcionalmente
  const factor = 100 / total;
  const pesosNormalizados = {
    busqueda: Math.round(pesos.busqueda * factor * 100) / 100,
    historial: Math.round(pesos.historial * factor * 100) / 100,
    stock: Math.round(pesos.stock * factor * 100) / 100,
    precio: Math.round(pesos.precio * factor * 100) / 100,
    descuentos: Math.round(pesos.descuentos * factor * 100) / 100,
    otros: Math.round(pesos.otros * factor * 100) / 100
  };
  console.log('🔄 [SERVICE] Pesos normalizados (proporcional):', pesosNormalizados);
  return pesosNormalizados;
}; 