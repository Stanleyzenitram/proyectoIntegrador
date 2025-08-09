import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FaStar, FaHeart, FaShoppingCart, FaEye, FaLightbulb } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

interface ProductoRecomendado {
    id_producto: number;
    nombre_producto: string;
    imagen: string;
    precio: number;
    stock_actual: number;
    metros_por_caja: number;
    descripcion?: string;
    categoria_id?: number;
    estilo_id?: number;
    material_id?: number;
    descuento?: number;
    score_recomendacion?: number;
    razon_recomendacion?: string;
}

interface Preferencia {
    id?: string;
    idClientes: number;
    idEstilo?: number;
    color?: string;
    idMaterial?: number;
    idCategoria?: number;
    durabilidad?: number;
    superficie?: string;
    enTendencia?: boolean;
    precMin?: number;
    precMax?: number;
    usoEspecifico?: string;
}

export default function RecomendacionesInteligentes() {
    const [productosRecomendados, setProductosRecomendados] = useState<ProductoRecomendado[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const { user } = useAuth();
    const { addItem } = useCart();

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
                .eq('uuid', user.id)
                .single();

            if (!clienteData) return;

            const clienteId = clienteData.id_cliente;

            // Obtener preferencias del cliente
            const { data: preferencias } = await supabase
                .from('preferenciasProd')
                .select('*')
                .eq('idClientes', clienteId);

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
                const { data: detallesCompra } = await supabase
                    .from('detalle_facturas')
                    .select(`
                        id_producto,
                        cantidad,
                        productos (
                            id_producto,
                            nombre_producto,
                            categoria_id,
                            estilo_id,
                            material_id
                        )
                    `)
                    .in('id_factura', facturasIds);

                productosComprados = detallesCompra || [];
            }

            // Generar recomendaciones basadas en preferencias y historial
            const recomendaciones = await generarRecomendacionesPersonalizadas(
                preferencias || [],
                productosComprados,
                clienteId
            );

            setProductosRecomendados(recomendaciones);

        } catch (error) {
            console.error('Error al generar recomendaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const generarRecomendacionesPersonalizadas = async (
        preferencias: Preferencia[],
        productosComprados: any[],
        clienteId: number
    ): Promise<ProductoRecomendado[]> => {
        try {
            let query = supabase
                .from('productos')
                .select(`
                    id_producto,
                    nombre_producto,
                    imagen,
                    precio,
                    stock_actual,
                    metros_por_caja,
                    descripcion,
                    categoria_id,
                    estilo_id,
                    material_id,
                    descuento
                `)
                .eq('estado', true)
                .gt('stock_actual', 0);

            // Aplicar filtros basados en preferencias
            if (preferencias.length > 0) {
                const preferencia = preferencias[0]; // Usar la primera preferencia como principal
                
                if (preferencia.idCategoria) {
                    query = query.eq('categoria_id', preferencia.idCategoria);
                }
                if (preferencia.idEstilo) {
                    query = query.eq('estilo_id', preferencia.idEstilo);
                }
                if (preferencia.idMaterial) {
                    query = query.eq('material_id', preferencia.idMaterial);
                }
                if (preferencia.precMin && preferencia.precMax) {
                    query = query.gte('precio', preferencia.precMin).lte('precio', preferencia.precMax);
                }
                if (preferencia.durabilidad) {
                    query = query.eq('durabilidad', preferencia.durabilidad);
                }
                if (preferencia.color) {
                    query = query.ilike('color', `%${preferencia.color}%`);
                }
                if (preferencia.superficie) {
                    query = query.ilike('superficie', `%${preferencia.superficie}%`);
                }
            }

            // Obtener productos base
            const { data: productosBase } = await query.limit(20);

            if (!productosBase) return [];

            // Obtener productos relacionados
            const productosRelacionados = await obtenerProductosRelacionados(productosComprados);

            // Combinar y puntuar productos
            const productosPuntuados = productosBase.map(producto => {
                let score = 0;
                let razones: string[] = [];

                // Puntuar por preferencias
                if (preferencias.length > 0) {
                    score += 50;
                    razones.push('Basado en tus preferencias');
                }

                // Puntuar por productos relacionados
                if (productosRelacionados.includes(producto.id_producto)) {
                    score += 30;
                    razones.push('Relacionado con compras anteriores');
                }

                // Puntuar por descuento
                if (producto.descuento && producto.descuento > 0) {
                    score += 20;
                    razones.push('Producto en oferta');
                }

                // Puntuar por tendencia (si está marcado en preferencias)
                if (preferencias.some(p => p.enTendencia)) {
                    score += 15;
                    razones.push('Producto en tendencia');
                }

                return {
                    ...producto,
                    score_recomendacion: score,
                    razon_recomendacion: razones.join(', ')
                };
            });

            // Ordenar por score y tomar los mejores
            return productosPuntuados
                .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                .slice(0, 12);

        } catch (error) {
            console.error('Error al generar recomendaciones personalizadas:', error);
            return [];
        }
    };

    const obtenerProductosRelacionados = async (productosComprados: any[]): Promise<number[]> => {
        try {
            const productosIds = productosComprados.map(p => p.productos?.id_producto).filter(Boolean);
            
            if (productosIds.length === 0) return [];

            const { data: relacionados } = await supabase
                .from('productosRelacionados')
                .select('idProdAsoc')
                .in('idProdBase', productosIds);

            return relacionados?.map(r => r.idProdAsoc) || [];

        } catch (error) {
            console.error('Error al obtener productos relacionados:', error);
            return [];
        }
    };

    const agregarAlCarrito = (producto: ProductoRecomendado) => {
        addItem({
            id: producto.id_producto,
            name: producto.nombre_producto,
            price: producto.precio,
            image: producto.imagen,
            quantity: 1,
            stock: producto.stock_actual,
            metros_por_caja: producto.metros_por_caja
        });
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === productosRecomendados.length - 4 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? productosRecomendados.length - 4 : prevIndex - 1
        );
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-900"></div>
                    <span className="ml-3 text-gray-600">Generando recomendaciones...</span>
                </div>
            </div>
        );
    }

    if (productosRecomendados.length === 0) {
        return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-8">
                <div className="text-center py-8">
                    <FaLightbulb className="text-4xl mx-auto mb-4 text-amber-400" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No hay recomendaciones disponibles
                    </h3>
                    <p className="text-gray-600">
                        Configura tus preferencias para recibir recomendaciones personalizadas
                    </p>
                </div>
            </div>
        );
    }

    const productosVisibles = showAll 
        ? productosRecomendados 
        : productosRecomendados.slice(currentIndex, currentIndex + 4);

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <FaLightbulb className="text-2xl text-amber-600 mr-3" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Recomendaciones Inteligentes
                        </h2>
                        <p className="text-sm text-gray-600">
                            Productos seleccionados especialmente para ti
                        </p>
                    </div>
                </div>
                
                {!showAll && (
                    <div className="flex space-x-2">
                        <button
                            onClick={prevSlide}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            disabled={currentIndex === 0}
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            disabled={currentIndex >= productosRecomendados.length - 4}
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {productosVisibles.map((producto) => (
                    <div key={producto.id_producto} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Badge de recomendación */}
                        {producto.score_recomendacion && producto.score_recomendacion > 70 && (
                            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                <FaStar className="mr-1" />
                                Top
                            </div>
                        )}

                        {/* Imagen del producto */}
                        <div className="relative h-48 bg-gray-100">
                            {producto.imagen ? (
                                <img
                                    src={producto.imagen}
                                    alt={producto.nombre_producto}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.svg';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src="/placeholder-image.svg"
                                        alt="Sin imagen"
                                        className="w-16 h-16 opacity-50"
                                    />
                                </div>
                            )}
                            
                            {/* Overlay de acciones */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => agregarAlCarrito(producto)}
                                        className="p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
                                        title="Agregar al carrito"
                                    >
                                        <FaShoppingCart />
                                    </button>
                                    <button
                                        className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Ver detalles"
                                    >
                                        <FaEye />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Información del producto */}
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                                {producto.nombre_producto}
                            </h3>
                            
                            {/* Razón de recomendación */}
                            {producto.razon_recomendacion && (
                                <div className="mb-2">
                                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                        {producto.razon_recomendacion}
                                    </span>
                                </div>
                            )}

                            {/* Precio */}
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    {producto.descuento && producto.descuento > 0 ? (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold text-red-600">
                                                RD${(producto.precio * (1 - producto.descuento / 100)).toFixed(2)}
                                            </span>
                                            <span className="text-sm text-gray-500 line-through">
                                                RD${producto.precio}
                                            </span>
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                -{producto.descuento}%
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-lg font-bold text-gray-900">
                                            RD${producto.precio}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stock y metros */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                <span>Stock: {producto.stock_actual}</span>
                                <span>{producto.metros_por_caja} m²/caja</span>
                            </div>

                            {/* Botón de agregar al carrito */}
                            <button
                                onClick={() => agregarAlCarrito(producto)}
                                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors text-sm font-medium flex items-center justify-center"
                            >
                                <FaShoppingCart className="mr-2" />
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón para mostrar todas las recomendaciones */}
            {productosRecomendados.length > 4 && (
                <div className="text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
                    >
                        {showAll ? 'Mostrar Menos' : `Ver Todas (${productosRecomendados.length})`}
                    </button>
                </div>
            )}
        </div>
    );
}
