import { supabase } from '../services/supabase';
import {
  TipoProducto,
  PreferenciaUsuario,
  InteraccionUsuario,
  BusquedaUsuario,
  ConfiguracionRelevancia,
  MetricaRelevancia,
  Recomendacion,
  OnboardingUsuario,
  ProductoExpandido,
  FiltrosBusqueda,
  ResultadoBusqueda,
  MetricasRendimiento,
  ApiResponse,
  PaginatedResponse
} from '../types/relevancia';

// Servicio para el Sistema de Relevancia
export class RelevanciaService {
  // ===== TIPOS DE PRODUCTO =====
  static async getTiposProducto(): Promise<TipoProducto[]> {
    const { data, error } = await supabase
      .from('tipos_producto')
      .select('*')
      .eq('activo', true)
      .order('nombre_tipo');

    if (error) throw error;
    return data || [];
  }

  static async createTipoProducto(tipo: Omit<TipoProducto, 'id_tipo_producto' | 'created_at'>): Promise<TipoProducto> {
    const { data, error } = await supabase
      .from('tipos_producto')
      .insert(tipo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== PREFERENCIAS DE USUARIO =====
  static async getPreferenciasUsuario(idCliente: number): Promise<PreferenciaUsuario[]> {
    const { data, error } = await supabase
      .from('preferencias_usuario')
      .select('*')
      .eq('id_cliente', idCliente)
      .eq('activo', true);

    if (error) throw error;
    return data || [];
  }

  static async savePreferenciaUsuario(preferencia: Omit<PreferenciaUsuario, 'id_preferencia' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<PreferenciaUsuario> {
    const { data, error } = await supabase
      .from('preferencias_usuario')
      .upsert({
        ...preferencia,
        fecha_actualizacion: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== INTERACCIONES DE USUARIO =====
  static async registrarInteraccion(interaccion: Omit<InteraccionUsuario, 'id_interaccion' | 'fecha_interaccion'>): Promise<InteraccionUsuario> {
    const { data, error } = await supabase
      .from('interacciones_usuario')
      .insert(interaccion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getInteraccionesUsuario(idCliente: number, limite: number = 50): Promise<InteraccionUsuario[]> {
    const { data, error } = await supabase
      .from('interacciones_usuario')
      .select(`
        *,
        productos:productos(*)
      `)
      .eq('id_cliente', idCliente)
      .order('fecha_interaccion', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  // ===== BÚSQUEDAS DE USUARIO =====
  static async registrarBusqueda(busqueda: Omit<BusquedaUsuario, 'id_busqueda' | 'fecha_busqueda'>): Promise<BusquedaUsuario> {
    const { data, error } = await supabase
      .from('busquedas_usuario')
      .insert(busqueda)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getHistorialBusquedas(idCliente: number): Promise<BusquedaUsuario[]> {
    const { data, error } = await supabase
      .from('busquedas_usuario')
      .select('*')
      .eq('id_cliente', idCliente)
      .order('fecha_busqueda', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // ===== CONFIGURACIÓN DE RELEVANCIA =====
  static async getConfiguracionRelevancia(nombre: string = 'configuracion_default'): Promise<ConfiguracionRelevancia> {
    const { data, error } = await supabase
      .from('configuracion_relevancia')
      .select('*')
      .eq('nombre_configuracion', nombre)
      .eq('activo', true)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateConfiguracionRelevancia(configuracion: Partial<ConfiguracionRelevancia>): Promise<ConfiguracionRelevancia> {
    const { data, error } = await supabase
      .from('configuracion_relevancia')
      .update({
        ...configuracion,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id_configuracion', configuracion.id_configuracion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== RECOMENDACIONES =====
  static async generarRecomendaciones(idCliente: number, limite: number = 10): Promise<Recomendacion[]> {
    // Llamar a la función SQL para generar recomendaciones
    const { data, error } = await supabase
      .rpc('generar_recomendaciones', {
        p_id_cliente: idCliente,
        p_limite: limite
      });

    if (error) throw error;
    return data || [];
  }

  static async getRecomendacionesUsuario(idCliente: number): Promise<Recomendacion[]> {
    const { data, error } = await supabase
      .from('recomendaciones')
      .select(`
        *,
        productos:productos(*)
      `)
      .eq('id_cliente', idCliente)
      .order('score_relevancia', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  static async marcarRecomendacionMostrada(idRecomendacion: number): Promise<void> {
    const { error } = await supabase
      .from('recomendaciones')
      .update({ mostrada: true })
      .eq('id_recomendacion', idRecomendacion);

    if (error) throw error;
  }

  static async marcarRecomendacionClickeada(idRecomendacion: number): Promise<void> {
    const { error } = await supabase
      .from('recomendaciones')
      .update({ clickeada: true })
      .eq('id_recomendacion', idRecomendacion);

    if (error) throw error;
  }

  // ===== BÚSQUEDA AVANZADA =====
  static async buscarProductos(filtros: FiltrosBusqueda): Promise<ResultadoBusqueda> {
    const inicio = Date.now();
    let query = supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias(*),
        estilo:estilos(*),
        material:materiales(*),
        tipo_producto:tipos_producto(*)
      `, { count: 'exact' });

    // Aplicar filtros
    if (filtros.termino) {
      query = query.or(`nombre_producto.ilike.%${filtros.termino}%,descripcion.ilike.%${filtros.termino}%`);
    }

    if (filtros.categorias?.length) {
      query = query.in('id_categoria', filtros.categorias);
    }

    if (filtros.estilos?.length) {
      query = query.in('id_estilo', filtros.estilos);
    }

    if (filtros.materiales?.length) {
      query = query.in('id_materiales', filtros.materiales);
    }

    if (filtros.tipos_producto?.length) {
      query = query.in('id_tipo_producto', filtros.tipos_producto);
    }

    if (filtros.precio_min !== undefined) {
      query = query.gte('precio', filtros.precio_min);
    }

    if (filtros.precio_max !== undefined) {
      query = query.lte('precio', filtros.precio_max);
    }

    if (filtros.stock_disponible) {
      query = query.gt('stock_actual', 0);
    }

    if (filtros.solo_activos !== false) {
      query = query.eq('activo', true).eq('disponibilidad', true);
    }

    // Aplicar ordenamiento
    const ordenarPor = filtros.ordenar_por || 'relevancia';
    const orden = filtros.orden || 'desc';

    switch (ordenarPor) {
      case 'precio':
        query = query.order('precio', { ascending: orden === 'asc' });
        break;
      case 'popularidad':
        query = query.order('popularidad', { ascending: orden === 'asc' });
        break;
      case 'rating':
        query = query.order('rating_promedio', { ascending: orden === 'asc' });
        break;
      case 'fecha':
        query = query.order('fecha_lanzamiento', { ascending: orden === 'asc' });
        break;
      default:
        // Por relevancia (popularidad + rating)
        query = query.order('popularidad', { ascending: false });
    }

    // Aplicar paginación
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 20;
    const desde = (pagina - 1) * limite;

    query = query.range(desde, desde + limite - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const tiempo_busqueda_ms = Date.now() - inicio;

    return {
      productos: data || [],
      total: count || 0,
      pagina,
      limite,
      filtros_aplicados: filtros,
      tiempo_busqueda_ms
    };
  }

  // ===== MÉTRICAS Y REPORTES =====
  static async getMetricasRendimiento(): Promise<MetricasRendimiento> {
    // Obtener métricas de rendimiento del sistema
    const { data: metricas, error: errorMetricas } = await supabase
      .from('metricas_relevancia')
      .select('*')
      .order('fecha_metrica', { ascending: false })
      .limit(30);

    if (errorMetricas) throw errorMetricas;

    // Obtener productos más vistos
    const { data: productosVistos, error: errorProductos } = await supabase
      .from('productos')
      .select('*')
      .order('popularidad', { ascending: false })
      .limit(10);

    if (errorProductos) throw errorProductos;

    // Calcular métricas
    const precision = metricas?.find(m => m.tipo_metrica === 'precision')?.valor_metrica || 0;
    const tiempoRespuesta = metricas?.find(m => m.tipo_metrica === 'tiempo_respuesta')?.valor_metrica || 0;
    const tasaConversion = metricas?.find(m => m.tipo_metrica === 'tasa_conversion')?.valor_metrica || 0;
    const satisfaccion = metricas?.find(m => m.tipo_metrica === 'satisfaccion')?.valor_metrica || 0;

    return {
      precision_recomendaciones: precision,
      tiempo_respuesta_promedio: tiempoRespuesta,
      tasa_conversion: tasaConversion,
      satisfaccion_usuario: satisfaccion,
      productos_mas_vistos: productosVistos || [],
      categorias_populares: [] // TODO: Implementar consulta de categorías populares
    };
  }

  // ===== ONBOARDING =====
  static async iniciarOnboarding(idCliente: number): Promise<OnboardingUsuario> {
    const { data, error } = await supabase
      .from('onboarding_usuarios')
      .insert({
        id_cliente: idCliente,
        paso_completado: 0,
        completado: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarOnboarding(idOnboarding: number, paso: number, preferencias?: Record<string, any>): Promise<OnboardingUsuario> {
    const { data, error } = await supabase
      .from('onboarding_usuarios')
      .update({
        paso_completado: paso,
        preferencias_seleccionadas: preferencias,
        completado: paso >= 3 // Asumiendo 3 pasos en el onboarding
      })
      .eq('id_onboarding', idOnboarding)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getOnboardingUsuario(idCliente: number): Promise<OnboardingUsuario | null> {
    const { data, error } = await supabase
      .from('onboarding_usuarios')
      .select('*')
      .eq('id_cliente', idCliente)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  // ===== PRODUCTOS EXPANDIDOS =====
  static async getProductoExpandido(idProducto: number): Promise<ProductoExpandido> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias(*),
        estilo:estilos(*),
        material:materiales(*),
        tipo_producto:tipos_producto(*)
      `)
      .eq('id_producto', idProducto)
      .single();

    if (error) throw error;
    return data;
  }

  static async getProductosSimilares(idProducto: number, limite: number = 6): Promise<ProductoExpandido[]> {
    // Obtener el producto base
    const producto = await this.getProductoExpandido(idProducto);
    
    // Buscar productos similares basados en categoría, estilo y material
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias(*),
        estilo:estilos(*),
        material:materiales(*),
        tipo_producto:tipos_producto(*)
      `)
      .or(`id_categoria.eq.${producto.id_categoria},id_estilo.eq.${producto.id_estilo || 0},id_materiales.eq.${producto.id_materiales || 0}`)
      .neq('id_producto', idProducto)
      .eq('activo', true)
      .eq('disponibilidad', true)
      .order('popularidad', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  }
}

// Exportar instancia del servicio
export const relevanciaService = new RelevanciaService(); 