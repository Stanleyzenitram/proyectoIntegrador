import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart, faShoppingCart, faEye, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Producto {
    id_producto: number;
    nombre_producto: string;
    descripcion: string;
    precio: number;
    stock_actual: number;
    imagen: string;
    id_categoria: number;
    id_materiales: number;
    id_estilo: number;
    categoria?: {
        nombre_categoria: string;
    };
    material?: {
        nombre_materiales: string;
    };
    estilo?: {
        nombre_estilo: string;
    };
    descuento?: number;
}

interface Preferencia {
    categoria_preferida?: string;
    material_preferido?: string;
    estilo_preferido?: string;
    rango_precio_min?: number;
    rango_precio_max?: number;
    color_preferido?: string;
    formato_preferido?: string;
    uso_principal?: string;
    ambiente_preferido?: string;
    acabado_preferido?: string;
    resistencia_preferida?: string;
    mantenimiento_preferido?: string;
}

export default function Recomendaciones() {
    const { user } = useAuth();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [preferencias, setPreferencias] = useState<Preferencia>({});
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        categoria: '',
        material: '',
        estilo: '',
        precioMin: '',
        precioMax: '',
        uso: '',
        ambiente: ''
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [categorias, setCategorias] = useState<Array<{id_categoria: string, nombre_categoria: string}>>([]);
    const [materiales, setMateriales] = useState<Array<{id_materiales: string, nombre_materiales: string}>>([]);
    const [estilos, setEstilos] = useState<Array<{id_estilo: string, nombre_estilo: string}>>([]);

    const usosPrincipales = [
        'Piso interior', 'Piso exterior', 'Pared interior', 'Pared exterior', 
        'Baño', 'Cocina', 'Sala', 'Comedor', 'Habitación', 'Área comercial'
    ];



    useEffect(() => {
        if (user) {
            fetchPreferencias();
            fetchOpciones();
        }
    }, [user]);

    const fetchOpciones = async () => {
        try {
            const { data: catData } = await supabase
                .from('categorias')
                .select('id_categoria, nombre_categoria');
            if (catData) setCategorias(catData);

            const { data: matData } = await supabase
                .from('materiales')
                .select('id_materiales, nombre_materiales');
            if (matData) setMateriales(matData);

            const { data: estData } = await supabase
                .from('estilos')
                .select('id_estilo, nombre_estilo');
            if (estData) setEstilos(estData);
        } catch (error) {
            console.error('Error al cargar opciones:', error);
        }
    };

    const fetchPreferencias = async () => {
        try {
            const { data: clienteData } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user?.id)
                .single();

            if (!clienteData) return;

            const { data: prefData } = await supabase
                .from('preferenciasProd')
                .select('*')
                .eq('idClientes', clienteData.id_cliente)
                .single();

            if (prefData) {
                setPreferencias(prefData);
                // Aplicar filtros automáticamente basados en preferencias
                setFiltros({
                    categoria: prefData.categoria_preferida || '',
                    material: prefData.material_preferido || '',
                    estilo: prefData.estilo_preferido || '',
                    precioMin: prefData.rango_precio_min?.toString() || '',
                    precioMax: prefData.rango_precio_max?.toString() || '',
                    uso: prefData.uso_principal || '',
                    ambiente: prefData.ambiente_preferido || ''
                });
            }
        } catch (error) {
            console.error('Error al cargar preferencias:', error);
        }
    };

    const fetchProductos = async () => {
        try {
            setLoading(true);
            
            let query = supabase
                .from('productos')
                .select(`
                    id_producto,
                    nombre_producto,
                    descripcion,
                    precio,
                    stock_actual,
                    imagen,
                    descuento,
                    id_categoria,
                    id_materiales,
                    id_estilo,
                    categorias(nombre_categoria),
                    materiales(nombre_materiales),
                    estilos(nombre_estilo)
                `)
                .eq('disponibilidad', true)
                .gte('stock_actual', 1);

            // Aplicar filtros
            if (filtros.categoria) {
                query = query.eq('id_categoria', Number(filtros.categoria));
            }
            if (filtros.material) {
                query = query.eq('id_materiales', Number(filtros.material));
            }
            if (filtros.estilo) {
                query = query.eq('id_estilo', Number(filtros.estilo));
            }
            if (filtros.precioMin) {
                query = query.gte('precio', Number(filtros.precioMin));
            }
            if (filtros.precioMax) {
                query = query.lte('precio', Number(filtros.precioMax));
            }

            const { data, error } = await query;

            if (error) throw error;

            // Mapear los datos para incluir las relaciones
            const productosMapeados = (data || []).map(producto => ({
                ...producto,
                categoria: producto.categorias,
                material: producto.materiales,
                estilo: producto.estilos
            }));

            // Ordenar por relevancia basada en preferencias
            const productosOrdenados = ordenarPorRelevancia(productosMapeados, preferencias);
            setProductos(productosOrdenados);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        } finally {
            setLoading(false);
        }
    };

    const ordenarPorRelevancia = (productos: Producto[], pref: Preferencia): Producto[] => {
        return productos.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // Puntuación por categoría
            if (pref.categoria_preferida && a.categoria?.nombre_categoria === pref.categoria_preferida) scoreA += 10;
            if (pref.categoria_preferida && b.categoria?.nombre_categoria === pref.categoria_preferida) scoreB += 10;

            // Puntuación por material
            if (pref.material_preferido && a.material?.nombre_materiales === pref.material_preferido) scoreA += 8;
            if (pref.material_preferido && b.material?.nombre_materiales === pref.material_preferido) scoreB += 8;

            // Puntuación por estilo
            if (pref.estilo_preferido && a.estilo?.nombre_estilo === pref.estilo_preferido) scoreB += 8;
            if (pref.estilo_preferido && b.estilo?.nombre_estilo === pref.estilo_preferido) scoreB += 8;

            // Puntuación por rango de precio
            if (pref.rango_precio_min && pref.rango_precio_max) {
                if (a.precio >= pref.rango_precio_min && a.precio <= pref.rango_precio_max) scoreA += 5;
                if (b.precio >= pref.rango_precio_min && b.precio <= pref.rango_precio_max) scoreB += 5;
            }

            // Puntuación por descuento
            if (a.descuento && a.descuento > 0) scoreA += 3;
            if (b.descuento && b.descuento > 0) scoreB += 3;

            return scoreB - scoreA;
        });
    };

    useEffect(() => {
        fetchProductos();
    }, [filtros]);

    const limpiarFiltros = () => {
        setFiltros({
            categoria: '',
            material: '',
            estilo: '',
            precioMin: '',
            precioMax: '',
            uso: '',
            ambiente: ''
        });
    };

    const calcularPrecioFinal = (precio: number, descuento?: number) => {
        if (!descuento) return precio;
        return precio - (precio * descuento / 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando recomendaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faStar} className="text-amber-500 text-3xl mr-4" />
                                <h1 className="text-3xl font-bold text-gray-800">Recomendaciones Personalizadas</h1>
                            </div>
                            <button
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                            </button>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Productos seleccionados especialmente para ti basados en tus preferencias y necesidades.
                        </p>

                        {mostrarFiltros && (
                            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-amber-900">Filtros Avanzados</h3>
                                    <button
                                        onClick={limpiarFiltros}
                                        className="text-amber-700 hover:text-amber-900 text-sm font-medium"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-2">Categoría</label>
                                        <select
                                            value={filtros.categoria}
                                            onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                                            className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            <option value="">Todas las categorías</option>
                                            {categorias.map((cat) => (
                                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                                    {cat.nombre_categoria}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-2">Material</label>
                                        <select
                                            value={filtros.material}
                                            onChange={(e) => setFiltros({...filtros, material: e.target.value})}
                                            className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            <option value="">Todos los materiales</option>
                                            {materiales.map((mat) => (
                                                <option key={mat.id_materiales} value={mat.id_materiales}>
                                                    {mat.nombre_materiales}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-2">Estilo</label>
                                        <select
                                            value={filtros.estilo}
                                            onChange={(e) => setFiltros({...filtros, estilo: e.target.value})}
                                            className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            <option value="">Todos los estilos</option>
                                            {estilos.map((est) => (
                                                <option key={est.id_estilo} value={est.id_estilo}>
                                                    {est.nombre_estilo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-2">Precio mínimo</label>
                                        <input
                                            type="number"
                                            value={filtros.precioMin}
                                            onChange={(e) => setFiltros({...filtros, precioMin: e.target.value})}
                                            placeholder="0"
                                            className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-2">Precio máximo</label>
                                        <input
                                            type="number"
                                            value={filtros.precioMax}
                                            onChange={(e) => setFiltros({...filtros, precioMax: e.target.value})}
                                            placeholder="10000"
                                            className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-2">Uso principal</label>
                                        <select
                                            value={filtros.uso}
                                            onChange={(e) => setFiltros({...filtros, uso: e.target.value})}
                                            className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            <option value="">Todos los usos</option>
                                            {usosPrincipales.map((uso) => (
                                                <option key={uso} value={uso}>
                                                    {uso}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {productos.length === 0 ? (
                        <div className="text-center py-12">
                            <FontAwesomeIcon icon={faStar} className="text-amber-400 text-6xl mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay productos disponibles</h3>
                            <p className="text-gray-500">Intenta ajustar los filtros o revisar más tarde.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {productos.map((producto) => (
                                <div key={producto.id_producto} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <div className="relative">
                                        <img
                                            src={producto.imagen || '/placeholder-image.svg'}
                                            alt={producto.nombre_producto}
                                            className="w-full h-48 object-cover"
                                        />
                                        {producto.descuento && producto.descuento > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                                -{producto.descuento}%
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                            <FontAwesomeIcon icon={faStar} className="mr-1" />
                                            Recomendado
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                            {producto.nombre_producto}
                                        </h3>
                                        
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {producto.descripcion}
                                        </p>
                                        
                                        <div className="space-y-2 mb-4">
                                            {producto.categoria && (
                                                <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block mr-2">
                                                    {producto.categoria.nombre_categoria}
                                                </div>
                                            )}
                                            {producto.material && (
                                                <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block mr-2">
                                                    {producto.material.nombre_materiales}
                                                </div>
                                            )}
                                            {producto.estilo && (
                                                <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block">
                                                    {producto.estilo.nombre_estilo}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                {producto.descuento && producto.descuento > 0 ? (
                                                    <div>
                                                        <span className="text-lg font-bold text-amber-600">
                                                            RD$ {calcularPrecioFinal(producto.precio, producto.descuento).toLocaleString()}
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through ml-2">
                                                            RD$ {producto.precio.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-bold text-amber-600">
                                                        RD$ {producto.precio.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Stock: {producto.stock_actual}
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <button className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center">
                                                <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                                                Agregar
                                            </button>
                                            <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                                <FontAwesomeIcon icon={faHeart} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
