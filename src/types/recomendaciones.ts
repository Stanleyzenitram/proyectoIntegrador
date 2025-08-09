// Interfaces para el sistema de recomendaciones

export interface PreferenciasUsuario {
    id?: number;
    usuario_id: string;
    categorias_favoritas: number[];
    estilos_preferidos: number[];
    materiales_favoritos: number[];
    rango_precio_min?: number;
    rango_precio_max?: number;
    color_preferido?: string;
    fecha_actualizacion?: string;
}

export interface HistorialNavegacion {
    id?: number;
    usuario_id: string;
    producto_id: number;
    fecha_vista: string;
    tiempo_vista?: number;
    accion: 'vista' | 'click' | 'favorito' | 'carrito';
}

export interface ComportamientoCompra {
    id?: number;
    usuario_id: string;
    producto_id: number;
    accion: 'agregado_carrito' | 'comprado' | 'favorito' | 'comparado';
    fecha_accion: string;
    cantidad: number;
    precio_unitario: number;
}

export interface ProductoRecomendado {
    id?: number;
    usuario_id: string;
    producto_id: number;
    score_recomendacion: number;
    tipo_recomendacion: 'categoria' | 'estilo' | 'material' | 'colaborativo' | 'popular';
    fecha_recomendacion: string;
    visto: boolean;
    clickeado: boolean;
}

export interface ProductoConScore {
    producto: any; // Tipo del producto (puedes usar el tipo existente)
    score: number;
    tipo_recomendacion: string;
    razon: string;
}

export interface FiltrosRecomendacion {
    categorias?: number[];
    estilos?: number[];
    materiales?: number[];
    precio_min?: number;
    precio_max?: number;
    colores?: string[];
    limit?: number;
}

export interface EstadisticasUsuario {
    total_productos_vistos: number;
    total_productos_comprados: number;
    categorias_mas_vistas: Array<{categoria_id: number, nombre: string, count: number}>;
    estilos_mas_vistos: Array<{estilo_id: number, nombre: string, count: number}>;
    materiales_mas_vistos: Array<{material_id: number, nombre: string, count: number}>;
    rango_precio_promedio: {min: number, max: number};
}
