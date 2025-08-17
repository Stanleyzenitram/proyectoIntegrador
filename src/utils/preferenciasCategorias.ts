// Mapeo de categorías de preferencias del usuario a valores reales de la base de datos

export interface CategoriaPreferencia {
    id: string;
    nombre: string;
    descripcion: string;
    mapeo: {
        campo: 'color' | 'precio' | 'id_categoria' | 'id_estilo' | 'id_materiales';
        valores?: string[] | number[];
        rango?: { min: number; max: number };
        condicion?: string;
    };
}

// Definición de categorías de colores
export const CATEGORIAS_COLORES: CategoriaPreferencia[] = [
    {
        id: 'colores_calidos',
        nombre: 'Colores Cálidos',
        descripcion: 'Rojos, amarillos, naranjas y tonos tierra',
        mapeo: {
            campo: 'color',
            valores: ['Rojo', 'Amarillo', 'Naranja', 'Marrón', 'Beige', 'Rosa']
        }
    },
    {
        id: 'colores_frios',
        nombre: 'Colores Fríos',
        descripcion: 'Azules, verdes y tonos frescos',
        mapeo: {
            campo: 'color',
            valores: ['Azul', 'Verde', 'Púrpura']
        }
    },
    {
        id: 'colores_neutros',
        nombre: 'Colores Neutros',
        descripcion: 'Blancos, grises, negros y tonos naturales',
        mapeo: {
            campo: 'color',
            valores: ['Blanco', 'Negro', 'Gris', 'Natural']
        }
    }
];

// Definición de categorías de estilos - usando nombres dinámicos
export const CATEGORIAS_ESTILOS: CategoriaPreferencia[] = [
    {
        id: 'estilo_rustico',
        nombre: 'Rústico',
        descripcion: 'Estilo natural y tradicional',
        mapeo: {
            campo: 'nombre_estilo', // Usar nombre en lugar de ID para mayor flexibilidad
            valores: ['rustico', 'rural', 'tradicional', 'natural', 'madera'] // Buscar por nombre
        }
    },
    {
        id: 'estilo_moderno',
        nombre: 'Moderno',
        descripcion: 'Estilo contemporáneo y minimalista',
        mapeo: {
            campo: 'nombre_estilo',
            valores: ['moderno', 'contemporaneo', 'minimalista', 'actual', 'simple']
        }
    },
    {
        id: 'estilo_ejecutivo',
        nombre: 'Ejecutivo',
        descripcion: 'Estilo elegante y profesional',
        mapeo: {
            campo: 'nombre_estilo',
            valores: ['ejecutivo', 'elegante', 'profesional', 'corporativo', 'formal']
        }
    },
    {
        id: 'estilo_clasico',
        nombre: 'Clásico',
        descripcion: 'Estilo tradicional y atemporal',
        mapeo: {
            campo: 'nombre_estilo',
            valores: ['clasico', 'tradicional', 'vintage', 'retro', 'atemporal']
        }
    }
];

// Definición de rangos de precio
export const CATEGORIAS_PRECIO: CategoriaPreferencia[] = [
    {
        id: 'economico',
        nombre: 'Económico',
        descripcion: 'Productos accesibles y de buen valor',
        mapeo: {
            campo: 'precio',
            rango: { min: 0, max: 999 }
        }
    },
    {
        id: 'medio',
        nombre: 'Rango Medio',
        descripcion: 'Balance entre calidad y precio',
        mapeo: {
            campo: 'precio',
            rango: { min: 1000, max: 5000 }
        }
    },
    {
        id: 'premium',
        nombre: 'Premium',
        descripcion: 'Productos de alta calidad',
        mapeo: {
            campo: 'precio',
            rango: { min: 5000, max: 15000 }
        }
    },
    {
        id: 'lujo',
        nombre: 'Lujo',
        descripcion: 'Productos exclusivos y de máxima calidad',
        mapeo: {
            campo: 'precio',
            rango: { min: 15000, max: 999999 }
        }
    }
];

// Definición de categorías de materiales - usando nombres dinámicos
export const CATEGORIAS_MATERIALES: CategoriaPreferencia[] = [
    {
        id: 'ceramica_natural',
        nombre: 'Cerámica Natural',
        descripcion: 'Materiales de cerámica tradicional',
        mapeo: {
            campo: 'nombre_materiales', // Usar nombre en lugar de ID
            valores: ['ceramica', 'ceramico', 'natural', 'tradicional', 'terracota']
        }
    },
    {
        id: 'porcelanato',
        nombre: 'Porcelanato',
        descripcion: 'Material porcelánico de alta resistencia',
        mapeo: {
            campo: 'nombre_materiales',
            valores: ['porcelanato', 'porcelanico', 'porcelana']
        }
    },
    {
        id: 'gres',
        nombre: 'Gres',
        descripcion: 'Material de gres cerámico',
        mapeo: {
            campo: 'nombre_materiales',
            valores: ['gres', 'gress']
        }
    }
];

// Estructura para guardar las preferencias seleccionadas
export interface PreferenciasCategorizadas {
    idclientes: number; // Nota: minúscula para coincidir con BD
    categoria_color?: string;  // ID de categoría seleccionada
    categoria_estilo?: string;
    categoria_precio?: string;
    categoria_material?: string;
    fecha_actualizacion: string;
}

// Función para obtener los valores reales basados en las categorías seleccionadas
export function obtenerFiltrosReales(preferencias: PreferenciasCategorizadas): {
    colores?: string[];
    estilos?: string[];
    materiales?: string[];
    precioMin?: number;
    precioMax?: number;
} {
    const filtros: any = {};

    // Procesar categoria de color
    if (preferencias.categoria_color) {
        const categoriaColor = CATEGORIAS_COLORES.find(c => c.id === preferencias.categoria_color);
        if (categoriaColor?.mapeo.valores) {
            filtros.colores = categoriaColor.mapeo.valores as string[];
        }
    }

    // Procesar categoria de estilo (ahora usando nombres)
    if (preferencias.categoria_estilo) {
        const categoriaEstilo = CATEGORIAS_ESTILOS.find(c => c.id === preferencias.categoria_estilo);
        if (categoriaEstilo?.mapeo.valores) {
            filtros.estilos = categoriaEstilo.mapeo.valores as string[];
        }
    }

    // Procesar categoria de material (ahora usando nombres)
    if (preferencias.categoria_material) {
        const categoriaMaterial = CATEGORIAS_MATERIALES.find(c => c.id === preferencias.categoria_material);
        if (categoriaMaterial?.mapeo.valores) {
            filtros.materiales = categoriaMaterial.mapeo.valores as string[];
        }
    }

    // Procesar categoria de precio
    if (preferencias.categoria_precio) {
        const categoriaPrecio = CATEGORIAS_PRECIO.find(c => c.id === preferencias.categoria_precio);
        if (categoriaPrecio?.mapeo.rango) {
            filtros.precioMin = categoriaPrecio.mapeo.rango.min;
            filtros.precioMax = categoriaPrecio.mapeo.rango.max;
        }
    }

    return filtros;
}

// Función para construir query de Supabase basado en categorías
export function construirQueryConCategorias(query: any, preferencias: PreferenciasCategorizadas): any {
    const filtros = obtenerFiltrosReales(preferencias);

    // Aplicar filtro de colores
    if (filtros.colores && filtros.colores.length > 0) {
        // Usar OR para buscar cualquiera de los colores
        const condicionesColor = filtros.colores.map(color => `colorDom.ilike.%${color}%`);
        query = query.or(condicionesColor.join(','));
    }

    // Aplicar filtro de estilos
    if (filtros.estilos && filtros.estilos.length > 0) {
        query = query.in('id_estilo', filtros.estilos);
    }

    // Aplicar filtro de materiales
    if (filtros.materiales && filtros.materiales.length > 0) {
        query = query.in('id_materiales', filtros.materiales);
    }

    // Aplicar filtro de precio
    if (filtros.precioMin !== undefined) {
        query = query.gte('precio', filtros.precioMin);
    }
    if (filtros.precioMax !== undefined) {
        query = query.lte('precio', filtros.precioMax);
    }

    return query;
}

// Función auxiliar para obtener el nombre de una categoría seleccionada
export function obtenerNombreCategoria(tipo: 'color' | 'estilo' | 'precio' | 'material', categoriaId: string): string {
    let categorias: CategoriaPreferencia[] = [];
    
    switch (tipo) {
        case 'color':
            categorias = CATEGORIAS_COLORES;
            break;
        case 'estilo':
            categorias = CATEGORIAS_ESTILOS;
            break;
        case 'precio':
            categorias = CATEGORIAS_PRECIO;
            break;
        case 'material':
            categorias = CATEGORIAS_MATERIALES;
            break;
    }

    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria?.nombre || 'Sin especificar';
}

// Función para obtener todas las categorías de un tipo
export function obtenerCategoriasPorTipo(tipo: 'color' | 'estilo' | 'precio' | 'material'): CategoriaPreferencia[] {
    switch (tipo) {
        case 'color':
            return CATEGORIAS_COLORES;
        case 'estilo':
            return CATEGORIAS_ESTILOS;
        case 'precio':
            return CATEGORIAS_PRECIO;
        case 'material':
            return CATEGORIAS_MATERIALES;
        default:
            return [];
    }
}
