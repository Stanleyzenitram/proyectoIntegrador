// Tipos para el Sistema de Relevancia

export interface TipoProducto {
  id_tipo_producto: number;
  nombre_tipo: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
  created_at: string;
}

export interface PreferenciaUsuario {
  id_preferencia: number;
  id_cliente: number;
  id_categoria?: number;
  id_estilo?: number;
  id_materiales?: number;
  id_tipo_producto?: number;
  peso_preferencia: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
}

export interface InteraccionUsuario {
  id_interaccion: number;
  id_cliente: number;
  id_producto: number;
  tipo_interaccion: 'vista' | 'busqueda' | 'favorito' | 'compra' | 'valoracion' | 'comentario';
  valoracion?: number;
  comentario?: string;
  tiempo_vista_segundos?: number;
  fecha_interaccion: string;
  metadata?: Record<string, any>;
}

export interface BusquedaUsuario {
  id_busqueda: number;
  id_cliente?: number;
  termino_busqueda: string;
  filtros_aplicados?: Record<string, any>;
  resultados_obtenidos?: number;
  productos_vistos?: number[];
  fecha_busqueda: string;
  tiempo_busqueda_ms?: number;
  exito: boolean;
}

export interface ConfiguracionRelevancia {
  id_configuracion: number;
  nombre_configuracion: string;
  descripcion?: string;
  configuracion: {
    pesos: {
      historial_compras: number;
      historial_vistas: number;
      preferencias_usuario: number;
      popularidad_producto: number;
      valoraciones: number;
    };
    limites: {
      max_recomendaciones: number;
      min_score: number;
      dias_historial: number;
    };
    filtros: {
      incluir_agotados: boolean;
      solo_activos: boolean;
    };
  };
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface MetricaRelevancia {
  id_metrica: number;
  id_cliente?: number;
  tipo_metrica: string;
  valor_metrica: number;
  fecha_metrica: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Recomendacion {
  id_recomendacion: number;
  id_cliente: number;
  id_producto: number;
  score_relevancia: number;
  tipo_recomendacion: 'personalizada' | 'similar' | 'popular' | 'tendencia';
  razones_recomendacion?: string[];
  fecha_generacion: string;
  fecha_expiracion?: string;
  mostrada: boolean;
  clickeada: boolean;
}

export interface OnboardingUsuario {
  id_onboarding: number;
  id_cliente: number;
  paso_completado: number;
  preferencias_seleccionadas?: Record<string, any>;
  fecha_inicio: string;
  fecha_completado?: string;
  completado: boolean;
}

// Tipos para productos expandidos
export interface ProductoExpandido {
  id_producto: number;
  nombre_producto: string;
  id_categoria: number;
  descripcion?: string;
  precio: number;
  stock_actual: number;
  descuento: number;
  estado: boolean;
  imagen?: string;
  id_estilo?: number;
  id_materiales?: number;
  formato?: string;
  metros_por_caja?: number;
  disponibilidad: boolean;
  color?: string;
  piezas_por_caja?: number;
  // Nuevos campos para expansión
  id_tipo_producto?: number;
  marca?: string;
  modelo?: string;
  dimensiones?: string;
  peso?: number;
  garantia_meses?: number;
  caracteristicas_especiales?: string[];
  tags?: string[];
  rating_promedio: number;
  total_valoraciones: number;
  popularidad: number;
  fecha_lanzamiento?: string;
  activo: boolean;
  // Relaciones
  categoria?: Categoria;
  estilo?: Estilo;
  material?: Material;
  tipo_producto?: TipoProducto;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion?: string;
  tipo_producto?: string;
  icono?: string;
  activo: boolean;
}

export interface Estilo {
  id_estilo: number;
  nombre_estilo: string;
  descripcion?: string;
}

export interface Material {
  id_materiales: number;
  nombre_materiales: string;
  uso_materiales?: string;
}

// Tipos para filtros de búsqueda
export interface FiltrosBusqueda {
  termino?: string;
  categorias?: number[];
  estilos?: number[];
  materiales?: number[];
  tipos_producto?: number[];
  precio_min?: number;
  precio_max?: number;
  stock_disponible?: boolean;
  solo_activos?: boolean;
  ordenar_por?: 'relevancia' | 'precio' | 'popularidad' | 'rating' | 'fecha';
  orden?: 'asc' | 'desc';
  pagina?: number;
  limite?: number;
}

// Tipos para resultados de búsqueda
export interface ResultadoBusqueda {
  productos: ProductoExpandido[];
  total: number;
  pagina: number;
  limite: number;
  filtros_aplicados: FiltrosBusqueda;
  tiempo_busqueda_ms: number;
}

// Tipos para métricas de rendimiento
export interface MetricasRendimiento {
  precision_recomendaciones: number;
  tiempo_respuesta_promedio: number;
  tasa_conversion: number;
  satisfaccion_usuario: number;
  productos_mas_vistos: ProductoExpandido[];
  categorias_populares: Array<{
    categoria: Categoria;
    total_vistas: number;
    total_compras: number;
  }>;
}

// Tipos para configuración de pesos
export interface PesosRelevancia {
  historial_compras: number;
  historial_vistas: number;
  preferencias_usuario: number;
  popularidad_producto: number;
  valoraciones: number;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 