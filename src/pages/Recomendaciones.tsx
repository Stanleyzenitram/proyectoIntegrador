import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart, faShoppingCart, faEye } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/ProductModal';
import type { Producto } from '../types/index';

interface ProductoRecomendado extends Producto {
    score?: number;
    razon?: string;
}

export default function Recomendaciones() {
    const { user } = useAuth();
    const { addItem } = useCart();
    const [productosRecomendados, setProductosRecomendados] = useState<ProductoRecomendado[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'preferencias' | 'historial' | 'similares'>('todos');

    useEffect(() => {
        if (user) {
            generarRecomendaciones();
        }
    }, [user]);

    const generarRecomendaciones = async () => {
        try {
            setLoading(true);
            
            // Obtener ID del cliente
            const { data: clienteData } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user?.id)
                .single();

            if (!clienteData) return;

            const clienteId = clienteData.id_cliente;

            // Obtener preferencias del cliente
            const { data: preferencias } = await supabase
                .from('preferenciasProd')
                .select('*')
                .eq('idClientes', clienteId)
                .single();

            // Obtener historial de compras del cliente
            const { data: pedidos } = await supabase
                .from('pedidos')
                .select('id_factura')
                .eq('id_cliente', clienteId)
                .not('id_factura', 'is', null);

            const facturasIds = pedidos?.map(p => p.id_factura) || [];

            // Obtener productos comprados anteriormente
            let productosComprados: any[] = [];
            if (facturasIds.length > 0) {
                const { data: facturasData } = await supabase
                    .from('detalle_factura')
                    .select('id_producto')
                    .in('id_factura', facturasIds);
                
                if (facturasData) {
                    productosComprados = facturasData.map(d => d.id_producto);
                }
            }

            // Generar recomendaciones basadas en preferencias
            let recomendaciones: ProductoRecomendado[] = [];
            
            if (preferencias) {
                let query = supabase
                    .from('productos')
                    .select(`
                        *,
                        categorias(id_categoria, nombre_categoria),
                        estilos(id_estilo, nombre_estilo),
                        materiales(id_materiales, nombre_materiales)
                    `)
                    .eq('disponibilidad', true)
                    .order('precio', { ascending: true });

                // Aplicar filtros de preferencias
                if (preferencias.categoria_preferida) {
                    query = query.eq('id_categoria', preferencias.categoria_preferida);
                }
                if (preferencias.material_preferido) {
                    query = query.eq('id_materiales', preferencias.material_preferido);
                }
                if (preferencias.estilo_preferido) {
                    query = query.eq('id_estilo', preferencias.estilo_preferido);
                }
                if (preferencias.rango_precio_min) {
                    query = query.gte('precio', preferencias.rango_precio_min);
                }
                if (preferencias.rango_precio_max) {
                    query = query.lte('precio', preferencias.rango_precio_max);
                }

                const { data: productosPref } = await query.limit(20);
                
                if (productosPref) {
                    recomendaciones = productosPref.map(p => ({
                        ...p,
                        score: 100,
                        razon: 'Basado en tus preferencias'
                    }));
                }
            }

            // Agregar productos similares a los comprados anteriormente
            if (productosComprados.length > 0) {
                const { data: productosSimilares } = await supabase
                    .from('productos')
                    .select(`
                        *,
                        categorias(id_categoria, nombre_categoria),
                        estilos(id_estilo, nombre_estilo),
                        materiales(id_materiales, nombre_materiales)
                    `)
                    .eq('disponibilidad', true)
                    .in('id_categoria', productosComprados)
                    .not('id_producto', 'in', productosComprados)
                    .limit(10);

                if (productosSimilares) {
                    const similaresConScore = productosSimilares.map(p => ({
                        ...p,
                        score: 85,
                        razon: 'Similar a productos que compraste'
                    }));
                    
                    recomendaciones = [...recomendaciones, ...similaresConScore];
                }
            }

            // Agregar productos populares (con descuento o alta calificación)
            const { data: productosPopulares } = await supabase
                .from('productos')
                .select(`
                    *,
                    categorias(id_categoria, nombre_categoria),
                    estilos(id_estilo, nombre_estilo),
                    materiales(id_materiales, nombre_materiales)
                `)
                .eq('disponibilidad', true)
                .not('descuento', 'is', null)
                .gt('descuento', 0)
                .limit(10);

            if (productosPopulares) {
                const popularesConScore = productosPopulares.map(p => ({
                    ...p,
                    score: 70,
                    razon: 'Producto en oferta'
                }));
                
                recomendaciones = [...recomendaciones, ...popularesConScore];
            }

            // Eliminar duplicados y ordenar por score
            const recomendacionesUnicas = recomendaciones.filter((producto, index, self) => 
                index === self.findIndex(p => p.id_producto === producto.id_producto)
            );

            recomendacionesUnicas.sort((a, b) => (b.score || 0) - (a.score || 0));
            
            setProductosRecomendados(recomendacionesUnicas.slice(0, 20));
        } catch (error) {
            console.error('Error al generar recomendaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product: Producto) => {
        setSelectedProduct(product);
    };

    const handleAddToCart = (product: Producto) => {
        addItem({
            id: product.id_producto,
            name: product.nombre_producto,
            price: product.precio,
            image: product.imagen || '',
            quantity: 1,
            descuento: product.descuento || 0,
            stock: product.stock_actual
        });
    };

    const filtrarRecomendaciones = (tipo: 'todos' | 'preferencias' | 'historial' | 'similares') => {
        setFiltroActivo(tipo);
    };

    const productosFiltrados = productosRecomendados.filter(producto => {
        switch (filtroActivo) {
            case 'preferencias':
                return producto.razon === 'Basado en tus preferencias';
            case 'historial':
                return producto.razon === 'Similar a productos que compraste';
            case 'similares':
                return producto.razon === 'Producto en oferta';
            default:
                return true;
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Generando recomendaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <div className="flex items-center mb-6">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-3xl mr-4" />
                            <h1 className="text-3xl font-bold text-gray-800">Recomendaciones para ti</h1>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Productos seleccionados especialmente para ti basados en tus preferencias y historial de compras.
                        </p>

                        {/* Filtros */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => filtrarRecomendaciones('todos')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filtroActivo === 'todos' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Todos ({productosRecomendados.length})
                            </button>
                            <button
                                onClick={() => filtrarRecomendaciones('preferencias')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filtroActivo === 'preferencias' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Por Preferencias ({productosRecomendados.filter(p => p.razon === 'Basado en tus preferencias').length})
                            </button>
                            <button
                                onClick={() => filtrarRecomendaciones('historial')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filtroActivo === 'historial' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Por Historial ({productosRecomendados.filter(p => p.razon === 'Similar a productos que compraste').length})
                            </button>
                            <button
                                onClick={() => filtrarRecomendaciones('similares')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filtroActivo === 'similares' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Ofertas ({productosRecomendados.filter(p => p.razon === 'Producto en oferta').length})
                            </button>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    {productosFiltrados.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {productosFiltrados.map((producto) => {
                                const precioFinal = producto.descuento 
                                    ? producto.precio * (1 - producto.descuento / 100) 
                                    : producto.precio;

                                return (
                                    <div 
                                        key={producto.id_producto} 
                                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                    >
                                        {/* Imagen del producto */}
                                        {producto.imagen && (
                                            <div 
                                                onClick={() => handleProductClick(producto)}
                                                className="cursor-pointer relative"
                                            >
                                                <img
                                                    src={producto.imagen}
                                                    alt={producto.nombre_producto}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                    {producto.score}%
                                                </div>
                                            </div>
                                        )}

                                        {/* Información del producto */}
                                        <div className="p-4">
                                            <h3 
                                                onClick={() => handleProductClick(producto)}
                                                className="font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                                            >
                                                {producto.nombre_producto}
                                            </h3>

                                            {/* Razón de la recomendación */}
                                            <p className="text-xs text-blue-600 mb-3 font-medium">
                                                {producto.razon}
                                            </p>

                                            {/* Precio */}
                                            <div className="mb-3">
                                                {producto.descuento ? (
                                                    <div>
                                                        <span className="text-gray-500 line-through text-sm">
                                                            RD${producto.precio.toFixed(2)}
                                                        </span>
                                                        <span className="block font-bold text-red-600 text-lg">
                                                            RD${precioFinal.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-green-600 font-medium">
                                                            {producto.descuento}% OFF
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-gray-800 text-lg">
                                                        RD${producto.precio.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleProductClick(producto)}
                                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => handleAddToCart(producto)}
                                                    disabled={producto.stock_actual === 0}
                                                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                                                        producto.stock_actual > 0
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                                                    {producto.stock_actual > 0 ? 'Agregar' : 'Sin Stock'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FontAwesomeIcon icon={faHeart} className="text-gray-400 text-6xl mb-4" />
                            <h3 className="text-xl font-medium text-gray-600 mb-2">
                                No hay recomendaciones disponibles
                            </h3>
                            <p className="text-gray-500">
                                Configura tus preferencias para recibir recomendaciones personalizadas.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal del producto */}
            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </div>
    );
}
