import React, { useState } from 'react';
import { useRecomendaciones } from '../hooks/useRecomendaciones';
import { ProductoConScore } from '../types/recomendaciones';
import { FaStar, FaHeart, FaShoppingCart, FaEye, FaFilter, FaSort } from 'react-icons/fa';

interface ProductosRecomendadosProps {
    limit?: number;
    showFilters?: boolean;
    className?: string;
}

const ProductosRecomendados: React.FC<ProductosRecomendadosProps> = ({ 
    limit = 8, 
    showFilters = true,
    className = ''
}) => {
    const { 
        recomendaciones, 
        loadingRecomendaciones, 
        marcarRecomendacionVista,
        marcarRecomendacionClickeada,
        registrarComportamiento
    } = useRecomendaciones();

    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [ordenamiento, setOrdenamiento] = useState<'score' | 'precio' | 'nombre'>('score');
    const [mostrarFiltros, setMostrarFiltros] = useState(showFilters);

    // Filtrar recomendaciones
    const recomendacionesFiltradas = recomendaciones
        .filter(rec => {
            if (filtroTipo === 'todos') return true;
            return rec.tipo_recomendacion === filtroTipo;
        })
        .sort((a, b) => {
            switch (ordenamiento) {
                case 'score':
                    return b.score - a.score;
                case 'precio':
                    return (a.producto.precio || 0) - (b.producto.precio || 0);
                case 'nombre':
                    return (a.producto.nombre || '').localeCompare(b.producto.nombre || '');
                default:
                    return 0;
            }
        })
        .slice(0, limit);

    // Manejar vista de producto
    const handleVerProducto = async (producto: any) => {
        try {
            // Registrar vista
            await registrarComportamiento({
                producto_id: producto.id_producto,
                accion: 'vista',
                cantidad: 1,
                precio_unitario: producto.precio || 0
            });

            // Marcar recomendación como vista si existe
            const recomendacion = recomendaciones.find(r => r.producto.id_producto === producto.id_producto);
            if (recomendacion) {
                await marcarRecomendacionVista(recomendacion.id!);
            }
        } catch (error) {
            console.error('Error al registrar vista:', error);
        }
    };

    // Manejar agregar al carrito
    const handleAgregarAlCarrito = async (producto: any) => {
        try {
            await registrarComportamiento({
                producto_id: producto.id_producto,
                accion: 'agregado_carrito',
                cantidad: 1,
                precio_unitario: producto.precio || 0
            });

            // Marcar recomendación como clickeada si existe
            const recomendacion = recomendaciones.find(r => r.producto.id_producto === producto.id_producto);
            if (recomendacion) {
                await marcarRecomendacionClickeada(recomendacion.id!);
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
        }
    };

    // Manejar favorito
    const handleFavorito = async (producto: any) => {
        try {
            await registrarComportamiento({
                producto_id: producto.id_producto,
                accion: 'favorito',
                cantidad: 1,
                precio_unitario: producto.precio || 0
            });
        } catch (error) {
            console.error('Error al marcar favorito:', error);
        }
    };

    // Obtener color del score
    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        if (score >= 0.4) return 'text-orange-600';
        return 'text-red-600';
    };

    // Obtener texto del tipo de recomendación
    const getTipoRecomendacionText = (tipo: string) => {
        switch (tipo) {
            case 'alta_preferencia': return 'Alta Preferencia';
            case 'media_preferencia': return 'Media Preferencia';
            case 'categoria': return 'Por Categoría';
            case 'estilo': return 'Por Estilo';
            case 'material': return 'Por Material';
            case 'colaborativo': return 'Colaborativo';
            case 'popular': return 'Popular';
            default: return 'General';
        }
    };

    if (loadingRecomendaciones) {
        return (
            <div className={`flex justify-center items-center p-8 ${className}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (recomendacionesFiltradas.length === 0) {
        return (
            <div className={`text-center p-8 ${className}`}>
                <div className="text-gray-500 mb-4">
                    <FaHeart className="mx-auto h-16 w-16 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay recomendaciones disponibles
                </h3>
                <p className="text-gray-500">
                    Configura tus preferencias para recibir recomendaciones personalizadas.
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Header con filtros */}
            {mostrarFiltros && (
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                            >
                                <FaFilter />
                                <span>Filtros</span>
                            </button>
                            
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="todos">Todos los tipos</option>
                                <option value="alta_preferencia">Alta Preferencia</option>
                                <option value="media_preferencia">Media Preferencia</option>
                                <option value="categoria">Por Categoría</option>
                                <option value="estilo">Por Estilo</option>
                                <option value="material">Por Material</option>
                                <option value="colaborativo">Colaborativo</option>
                                <option value="popular">Popular</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <FaSort className="text-gray-400" />
                            <select
                                value={ordenamiento}
                                onChange={(e) => setOrdenamiento(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="score">Por Relevancia</option>
                                <option value="precio">Por Precio</option>
                                <option value="nombre">Por Nombre</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recomendacionesFiltradas.map((recomendacion) => {
                    const producto = recomendacion.producto;
                    
                    return (
                        <div 
                            key={producto.id_producto} 
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                        >
                            {/* Imagen del producto */}
                            <div className="relative">
                                <img
                                    src={producto.imagen_url || '/placeholder-image.svg'}
                                    alt={producto.nombre}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.svg';
                                    }}
                                />
                                
                                {/* Badge de score */}
                                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow-md">
                                    <div className={`flex items-center space-x-1 text-xs font-semibold ${getScoreColor(recomendacion.score)}`}>
                                        <FaStar className="w-3 h-3" />
                                        <span>{(recomendacion.score * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {/* Badge de tipo de recomendación */}
                                <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-md">
                                    {getTipoRecomendacionText(recomendacion.tipo_recomendacion)}
                                </div>
                            </div>

                            {/* Información del producto */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {producto.nombre}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {producto.descripcion}
                                </p>

                                {/* Razón de la recomendación */}
                                <div className="mb-3 p-2 bg-blue-50 rounded-md">
                                    <p className="text-xs text-blue-700">
                                        {recomendacion.razon}
                                    </p>
                                </div>

                                {/* Precio */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-bold text-amber-600">
                                        ${producto.precio?.toFixed(2) || '0.00'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Stock: {producto.stock || 0}
                                    </span>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleVerProducto(producto)}
                                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <FaEye className="w-3 h-3" />
                                        <span>Ver</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => handleAgregarAlCarrito(producto)}
                                        className="flex-1 bg-amber-600 text-white px-3 py-2 rounded-md text-sm hover:bg-amber-700 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <FaShoppingCart className="w-3 h-3" />
                                        <span>Carrito</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => handleFavorito(producto)}
                                        className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                                        title="Agregar a favoritos"
                                    >
                                        <FaHeart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Información adicional */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                    Las recomendaciones se basan en tus preferencias, historial de navegación y comportamiento de compra.
                </p>
            </div>
        </div>
    );
};

export default ProductosRecomendados;
