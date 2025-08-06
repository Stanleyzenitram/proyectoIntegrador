import { supabase } from './supabase';

export interface ProductoVisto {
  id: number;
  nombre: string;
  fecha: string;
  tiempo: string;
  relevancia: number;
}

export interface BusquedaRealizada {
  id: number;
  termino: string;
  fecha: string;
  resultados: number;
}

export interface ProductoComprado {
  id: number;
  nombre: string;
  fecha: string;
  precio: number;
  cantidad: number;
}

export interface EstadisticasUsuario {
  total_productos_vistos: number;
  total_busquedas: number;
  total_compras: number;
  total_clics: number;
  tasa_conversion: number;
  categoria_mas_visitada: string;
  rango_precio_preferido: string;
}

class InteraccionesService {
  // Registrar que un usuario vio un producto (renueva si ya existe)
  async registrarProductoVisto(productoId: number, tiempoVista: number = 0, relevancia: number = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar si ya existe una vista del mismo producto
      const { data: vistaExistente } = await supabase
        .from('historial_productos_vistos')
        .select('id, tiempo_vista, relevancia_calculada')
        .eq('usuario_id', user.id)
        .eq('producto_id', productoId)
        .single();

      if (vistaExistente) {
        // Si existe, actualizar el tiempo de vista (acumular) y relevancia
        const tiempoTotal = vistaExistente.tiempo_vista + tiempoVista;
        const relevanciaPromedio = relevancia > 0 ? 
          (vistaExistente.relevancia_calculada + relevancia) / 2 : 
          vistaExistente.relevancia_calculada;

        const { error: updateError } = await supabase
          .from('historial_productos_vistos')
          .update({
            tiempo_vista: tiempoTotal,
            relevancia_calculada: relevanciaPromedio,
            fecha_vista: new Date().toISOString(),
            metadata: {
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent,
              vistas_previas: vistaExistente.tiempo_vista
            }
          })
          .eq('id', vistaExistente.id);

        if (updateError) {
          console.error('Error al actualizar producto visto:', updateError);
        } else {
          console.log('✅ Vista de producto renovada:', productoId);
        }
      } else {
        // Si no existe, crear nueva entrada
        const { error: insertError } = await supabase
          .from('historial_productos_vistos')
          .insert({
            usuario_id: user.id,
            producto_id: productoId,
            tiempo_vista: tiempoVista,
            relevancia_calculada: relevancia,
            metadata: {
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent
            }
          });

        if (insertError) {
          console.error('Error al registrar nuevo producto visto:', insertError);
        } else {
          console.log('✅ Nuevo producto visto registrado:', productoId);
        }
      }
    } catch (error) {
      console.error('Error al registrar producto visto:', error);
    }
  }

  // Registrar una búsqueda realizada (renueva si ya existe)
  async registrarBusqueda(termino: string, resultados: number = 0, filtros: any = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Normalizar el término de búsqueda para evitar duplicados por mayúsculas/minúsculas
      const terminoNormalizado = termino.toLowerCase().trim();

      // Verificar si ya existe una búsqueda con el mismo término
      const { data: busquedaExistente } = await supabase
        .from('historial_busquedas')
        .select('id, fecha_busqueda, resultados_encontrados')
        .eq('usuario_id', user.id)
        .eq('termino_busqueda', terminoNormalizado)
        .single();

      if (busquedaExistente) {
        // Si existe, actualizar la fecha y resultados
        const { error: updateError } = await supabase
          .from('historial_busquedas')
          .update({
            fecha_busqueda: new Date().toISOString(),
            resultados_encontrados: resultados,
            filtros_aplicados: filtros,
            categoria_filtrada: filtros.categoria || null,
            rango_precio: filtros.rango_precio || null
          })
          .eq('id', busquedaExistente.id);

        if (updateError) {
          console.error('Error al actualizar búsqueda existente:', updateError);
        } else {
          console.log('✅ Búsqueda renovada:', terminoNormalizado);
        }
      } else {
        // Si no existe, crear nueva entrada
        const { error: insertError } = await supabase
          .from('historial_busquedas')
          .insert({
            usuario_id: user.id,
            termino_busqueda: terminoNormalizado,
            resultados_encontrados: resultados,
            filtros_aplicados: filtros,
            categoria_filtrada: filtros.categoria || null,
            rango_precio: filtros.rango_precio || null
          });

        if (insertError) {
          console.error('Error al registrar nueva búsqueda:', insertError);
        } else {
          console.log('✅ Nueva búsqueda registrada:', terminoNormalizado);
        }
      }
    } catch (error) {
      console.error('Error al registrar búsqueda:', error);
    }
  }

  // Registrar un clic en un producto (acumula clics en lugar de duplicar)
  async registrarClic(productoId: number, tipoClic: string = 'producto', origenClic: string = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar si ya existe un clic del mismo producto
      const { data: clicExistente } = await supabase
        .from('historial_clics')
        .select('id, cantidad_clics, ultimo_clic')
        .eq('usuario_id', user.id)
        .eq('producto_id', productoId)
        .eq('tipo_clic', tipoClic)
        .single();

      if (clicExistente) {
        // Si existe, incrementar la cantidad de clics y actualizar fecha
        const nuevaCantidad = (clicExistente.cantidad_clics || 1) + 1;
        
        const { error: updateError } = await supabase
          .from('historial_clics')
          .update({
            cantidad_clics: nuevaCantidad,
            ultimo_clic: new Date().toISOString(),
            metadata: {
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent,
              url: window.location.href,
              clics_previos: clicExistente.cantidad_clics || 1
            }
          })
          .eq('id', clicExistente.id);

        if (updateError) {
          console.error('Error al actualizar clic existente:', updateError);
        } else {
          console.log('✅ Clic acumulado:', productoId, `(${nuevaCantidad} clics)`);
        }
      } else {
        // Si no existe, crear nueva entrada
        const { error: insertError } = await supabase
          .from('historial_clics')
          .insert({
            usuario_id: user.id,
            producto_id: productoId,
            tipo_clic: tipoClic,
            origen_clic: origenClic,
            cantidad_clics: 1,
            ultimo_clic: new Date().toISOString(),
            metadata: {
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent,
              url: window.location.href
            }
          });

        if (insertError) {
          console.error('Error al registrar nuevo clic:', insertError);
        } else {
          console.log('✅ Nuevo clic registrado:', productoId);
        }
      }
    } catch (error) {
      console.error('Error al registrar clic:', error);
    }
  }

  // Registrar una compra (deshabilitado)
  async registrarCompra(productoId: number, precio: number, cantidad: number, ordenId?: string) {
    // Función deshabilitada - no registramos compras por ahora
    console.log('ℹ️ Registro de compras deshabilitado para:', { productoId, precio, cantidad });
  }

  // Obtener productos vistos del usuario
  async obtenerProductosVistos(dias: number = 30): Promise<ProductoVisto[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      const { data, error } = await supabase
        .from('historial_productos_vistos')
        .select(`
          id,
          fecha_vista,
          tiempo_vista,
          relevancia_calculada,
          productos (
            id_producto,
            nombre_producto,
            precio
          )
        `)
        .eq('usuario_id', user.id)
        .gte('fecha_vista', fechaLimite.toISOString())
        .order('fecha_vista', { ascending: false });

      if (error) {
        console.error('Error al obtener productos vistos:', error);
        return [];
      }

      return data?.map(item => ({
        id: item.id,
        nombre: item.productos?.nombre_producto || 'Producto no encontrado',
        fecha: new Date(item.fecha_vista).toLocaleString('es-ES'),
        tiempo: `${Math.floor(item.tiempo_vista / 60)}:${(item.tiempo_vista % 60).toString().padStart(2, '0')}`,
        relevancia: item.relevancia_calculada
      })) || [];
    } catch (error) {
      console.error('Error al obtener productos vistos:', error);
      return [];
    }
  }

  // Obtener búsquedas realizadas del usuario
  async obtenerBusquedas(dias: number = 30): Promise<BusquedaRealizada[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      const { data, error } = await supabase
        .from('historial_busquedas')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('fecha_busqueda', fechaLimite.toISOString())
        .order('fecha_busqueda', { ascending: false });

      if (error) {
        console.error('Error al obtener búsquedas:', error);
        return [];
      }

      return data?.map(item => ({
        id: item.id,
        termino: item.termino_busqueda,
        fecha: new Date(item.fecha_busqueda).toLocaleString('es-ES'),
        resultados: item.resultados_encontrados
      })) || [];
    } catch (error) {
      console.error('Error al obtener búsquedas:', error);
      return [];
    }
  }

  // Obtener productos comprados del usuario
  async obtenerProductosComprados(dias: number = 30): Promise<ProductoComprado[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      const { data, error } = await supabase
        .from('historial_compras')
        .select(`
          id,
          fecha_compra,
          precio_unitario,
          cantidad,
          total_compra,
          productos (
            id_producto,
            nombre_producto
          )
        `)
        .eq('usuario_id', user.id)
        .gte('fecha_compra', fechaLimite.toISOString())
        .order('fecha_compra', { ascending: false });

      if (error) {
        console.error('Error al obtener productos comprados:', error);
        return [];
      }

      return data?.map(item => ({
        id: item.id,
        nombre: item.productos?.nombre_producto || 'Producto no encontrado',
        fecha: new Date(item.fecha_compra).toLocaleString('es-ES'),
        precio: item.precio_unitario,
        cantidad: item.cantidad
      })) || [];
    } catch (error) {
      console.error('Error al obtener productos comprados:', error);
      return [];
    }
  }

  // Obtener estadísticas del usuario (sin compras)
  async obtenerEstadisticas(): Promise<EstadisticasUsuario> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          total_productos_vistos: 0,
          total_busquedas: 0,
          total_compras: 0,
          total_clics: 0,
          tasa_conversion: 0,
          categoria_mas_visitada: 'N/A',
          rango_precio_preferido: 'N/A'
        };
      }

      // Obtener estadísticas manualmente (sin usar la función RPC que incluye compras)
      const [vistosResult, busquedasResult, clicsResult] = await Promise.all([
        supabase.from('historial_productos_vistos').select('id', { count: 'exact' }).eq('usuario_id', user.id),
        supabase.from('historial_busquedas').select('id', { count: 'exact' }).eq('usuario_id', user.id),
        supabase.from('historial_clics').select('id', { count: 'exact' }).eq('usuario_id', user.id)
      ]);

      const totalVistos = vistosResult.count || 0;
      const totalBusquedas = busquedasResult.count || 0;
      const totalClics = clicsResult.count || 0;

      return {
        total_productos_vistos: totalVistos,
        total_busquedas: totalBusquedas,
        total_compras: 0, // Compras deshabilitadas
        total_clics: totalClics,
        tasa_conversion: 0, // No calculamos tasa de conversión sin compras
        categoria_mas_visitada: 'N/A',
        rango_precio_preferido: 'N/A'
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        total_productos_vistos: 0,
        total_busquedas: 0,
        total_compras: 0,
        total_clics: 0,
        tasa_conversion: 0,
        categoria_mas_visitada: 'N/A',
        rango_precio_preferido: 'N/A'
      };
    }
  }

  // Limpiar historial del usuario
  async limpiarHistorial() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Limpiar productos vistos
      await supabase
        .from('historial_productos_vistos')
        .delete()
        .eq('usuario_id', user.id);

      // Limpiar búsquedas
      await supabase
        .from('historial_busquedas')
        .delete()
        .eq('usuario_id', user.id);

      // Limpiar clics
      await supabase
        .from('historial_clics')
        .delete()
        .eq('usuario_id', user.id);

      // NO limpiar compras (historial de compras se mantiene)

      console.log('Historial limpiado exitosamente');
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      throw error;
    }
  }

  // Exportar historial (sin compras)
  async exportarHistorial(): Promise<string> {
    try {
      const productosVistos = await this.obtenerProductosVistos(365);
      const busquedas = await this.obtenerBusquedas(365);
      const estadisticas = await this.obtenerEstadisticas();

      const historial = {
        fecha_exportacion: new Date().toISOString(),
        estadisticas,
        productos_vistos: productosVistos,
        busquedas,
        clics: 'Registro de clics disponible en la base de datos'
      };

      // Crear archivo JSON para descarga
      const blob = new Blob([JSON.stringify(historial, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial_interacciones_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return 'Historial exportado exitosamente';
    } catch (error) {
      console.error('Error al exportar historial:', error);
      throw error;
    }
  }
}

export const interaccionesService = new InteraccionesService(); 