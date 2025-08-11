import { useState, useEffect } from 'react';
import { useRecomendaciones } from '../hooks/useRecomendaciones';
import { FaStar, FaHeart, FaShoppingCart, FaEye, FaLightbulb, FaInfoCircle, FaCheck, FaRedo } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

interface ProductosRecomendadosProps {
    categoriaId?: number;
    productoId?: number;
    titulo?: string;
    maxProductos?: number;
    mostrarPrecios?: boolean;
    mostrarAcciones?: boolean;
    variante?: 'horizontal' | 'grid' | 'carousel';
}

export default function ProductosRecomendados({
    categoriaId,
    productoId,
    titulo = 'Productos Recomendados',
    maxProductos = 6,
    mostrarPrecios = true,
    mostrarAcciones = true,
    variante = 'grid'
}: ProductosRecomendadosProps) {
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addItem } = useCart();

    const {
        obtenerRecomendacionesPorCategoria,
        obtenerRecomendacionesSimilares,
        generarRecomendaciones
    } = useRecomendaciones();

    useEffect(() => {
        cargarRecomendaciones();
    }, [categoriaId, productoId]);

    const cargarRecomendaciones = async () => {
        try {
            setLoading(true);
            setError(null);

            let recomendaciones: any[] = [];

            if (productoId) {
                // Obtener productos similares al producto actual
                recomendaciones = await obtenerRecomendacionesSimilares(productoId);
            } else if (categoriaId) {
                // Obtener recomendaciones por categoría
                recomendaciones = await obtenerRecomendacionesPorCategoria(categoriaId);
            } else {
                // Obtener recomendaciones generales
                await generarRecomendaciones();
                return; // El hook maneja el estado
            }

            // Limitar el número de productos
            setProductos(recomendaciones.slice(0, maxProductos));

        } catch (error) {
            console.error('Error al cargar recomendaciones:', error);
            setError('No se pudieron cargar las recomendaciones');
        } finally {
            setLoading(false);
        }
    };

    const agregarAlCarrito = (producto: any) => {
        // Validar que el producto tenga los datos necesarios
        if (!producto.id_producto || !producto.nombre_producto || !producto.precio) {
            console.error('Producto inválido:', producto);
            return;
        }

        addItem({
            id_producto: producto.id_producto,
            nombre_producto: producto.nombre_producto,
            precio: producto.precio,
            imagen: producto.imagen || '',
            stock_actual: producto.stock_actual || 0,
            metros_por_caja: producto.metros_por_caja || 0,
            descripcion: producto.descripcion || '',
            id_categoria: producto.id_categoria || 1,
            id_estilo: producto.id_estilo || 1,
            id_materiales: producto.id_materiales || 1,
            formato: producto.formato || 'Rectangular',
            piezas_por_caja: producto.piezas_por_caja || 1,
            superficie: producto.superficie || 'Lisa',
            durabilidad: producto.durabilidad || 5,
            disponibilidad: producto.disponibilidad !== false,
            colorDom: producto.colorDom || 'Blanco',
            descuento: producto.descuento || 0
        }, 1); // Agregar con cantidad 1 por defecto
    };

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(precio);
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm">Cargando recomendaciones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                    <button 
                        onClick={cargarRecomendaciones}
                        className="mt-2 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors cursor-pointer text-xs"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (productos.length === 0) {
        return null; // No mostrar nada si no hay productos
    }

    const renderProducto = (producto: any) => (
        <div key={producto.id_producto} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="relative">
                <img
                    src={producto.imagen || '/placeholder-image.svg'}
                    alt={producto.nombre_producto}
                    className="w-full h-32 object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {producto.score_recomendacion && (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <FaStar className="mr-1" />
                            {producto.score_recomendacion}
                        </div>
                    )}
                    {producto.descuento && producto.descuento > 0 && (
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            -{producto.descuento}%
                        </div>
                    )}
                </div>

                {/* Botón de información */}
                <button
                    className="absolute top-2 right-2 bg-white/80 text-gray-600 p-1 rounded-full hover:bg-white transition-colors"
                    title="Ver información"
                >
                    <FaInfoCircle className="w-4 h-4" />
                </button>
            </div>

            <div className="p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                    {producto.nombre_producto}
                </h4>
                
                {mostrarPrecios && (
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-amber-600">
                            {formatearPrecio(producto.precio)}
                        </span>
                        <span className="text-xs text-gray-500">
                            Stock: {producto.stock_actual}
                        </span>
                    </div>
                )}

                {/* Información adicional */}
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                    {producto.colorDom && <p>Color: {producto.colorDom}</p>}
                    {producto.superficie && <p>Superficie: {producto.superficie}</p>}
                    {producto.durabilidad && <p>Durabilidad: PEI {producto.durabilidad}</p>}
                    {producto.razon_recomendacion && (
                        <p className="text-blue-600 font-medium">
                            {producto.razon_recomendacion}
                        </p>
                    )}
                </div>

                {mostrarAcciones && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => agregarAlCarrito(producto)}
                            className="flex-1 bg-amber-600 text-white py-2 px-3 rounded-md hover:bg-amber-700 transition-colors text-xs flex items-center justify-center"
                        >
                            <FaShoppingCart className="mr-1" />
                            Agregar
                        </button>
                        <button className="bg-gray-100 text-gray-600 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-xs flex items-center justify-center">
                            <FaEye className="mr-1" />
                            Ver
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    if (variante === 'horizontal') {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-4">
                    <FaLightbulb className="text-blue-500 text-lg mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
                </div>
                
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    {productos.map(renderProducto)}
                </div>
            </div>
        );
    }

    if (variante === 'carousel') {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <FaLightbulb className="text-blue-500 text-lg mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
                    </div>
                    
                    <button
                        onClick={cargarRecomendaciones}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Actualizar recomendaciones"
                    >
                        <FaRedo className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productos.map(renderProducto)}
                </div>
            </div>
        );
    }

    // Variante grid (por defecto)
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <FaLightbulb className="text-blue-500 text-lg mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
                </div>
                
                <button
                    onClick={cargarRecomendaciones}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Actualizar recomendaciones"
                >
                                            <FaRedo className="w-4 h-4" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productos.map(renderProducto)}
            </div>
        </div>
    );
}
