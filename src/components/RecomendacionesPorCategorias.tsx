import React from 'react';
import { useRecomendacionesCategorias } from '../hooks/useRecomendacionesCategorias';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart, faShoppingCart, faEye } from '@fortawesome/free-solid-svg-icons';

interface RecomendacionesPorCategoriasProps {
    className?: string;
    limite?: number;
    mostrarTitulo?: boolean;
}

const RecomendacionesPorCategorias: React.FC<RecomendacionesPorCategoriasProps> = ({
    className = '',
    limite = 8,
    mostrarTitulo = true
}) => {
    const { 
        productosRecomendados, 
        loading, 
        error,
        preferencias 
    } = useRecomendacionesCategorias();

    if (loading) {
        return (
            <div className={`${className}`}>
                {mostrarTitulo && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Recomendaciones Personalizadas
                        </h2>
                        <p className="text-gray-600">Basado en tus preferencias de categorías</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: limite }).map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                            <div className="w-full h-48 bg-gray-300"></div>
                            <div className="p-4">
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${className}`}>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold mb-2">Error al cargar recomendaciones</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!productosRecomendados || productosRecomendados.length === 0) {
        return (
            <div className={`${className}`}>
                {mostrarTitulo && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Recomendaciones Personalizadas
                        </h2>
                        <p className="text-gray-600">Basado en tus preferencias de categorías</p>
                    </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <FontAwesomeIcon icon={faHeart} className="text-blue-500 text-3xl mb-4" />
                    <h3 className="text-blue-800 font-semibold mb-2">¡Configura tus preferencias!</h3>
                    <p className="text-blue-600 text-sm mb-4">
                        Para obtener recomendaciones personalizadas, configura tus preferencias de colores, estilos, materiales y presupuesto.
                    </p>
                    <a 
                        href="/preferencias"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        Configurar Preferencias
                    </a>
                </div>
            </div>
        );
    }

    const productosLimitados = productosRecomendados.slice(0, limite);

    return (
        <div className={`${className}`}>
            {mostrarTitulo && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Recomendaciones Personalizadas
                    </h2>
                    <p className="text-gray-600">
                        Basado en tus preferencias de categorías
                        {preferencias && (
                            <span className="text-amber-600 font-medium ml-1">
                                ({Object.keys(preferencias).filter(key => 
                                    key.startsWith('categoria_') && 
                                    preferencias[key as keyof typeof preferencias]
                                ).length} categorías configuradas)
                            </span>
                        )}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {productosLimitados.map((producto) => (
                    <div 
                        key={producto.id_producto} 
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                    >
                        {/* Imagen del producto */}
                        <div className="relative overflow-hidden">
                            <img
                                src={producto.imagen || '/placeholder-image.svg'}
                                alt={producto.nombre_producto}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.svg';
                                }}
                            />
                            
                            {/* Badge de descuento */}
                            {producto.descuento && producto.descuento > 0 && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    -{producto.descuento}%
                                </div>
                            )}

                            {/* Score de recomendación */}
                            {producto.score_recomendacion && producto.score_recomendacion > 50 && (
                                <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                                    <FontAwesomeIcon icon={faStar} className="mr-1" />
                                    Top
                                </div>
                            )}

                            {/* Overlay de acciones */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                                <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                </button>
                                <button className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700 transition-colors">
                                    <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4" />
                                </button>
                                <button className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                                    <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Información del producto */}
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                {producto.nombre_producto}
                            </h3>
                            
                            {/* Precio */}
                            <div className="mb-2">
                                {producto.descuento && producto.descuento > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg font-bold text-red-600">
                                            RD$ {(producto.precio * (1 - producto.descuento / 100)).toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-500 line-through">
                                            RD$ {producto.precio.toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-lg font-bold text-gray-800">
                                        RD$ {producto.precio.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Razón de recomendación */}
                            {producto.razon_recomendacion && (
                                <div className="mb-3">
                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                        {producto.razon_recomendacion}
                                    </span>
                                </div>
                            )}

                            {/* Información adicional */}
                            <div className="text-xs text-gray-500 space-y-1">
                                {producto.metros_por_caja && (
                                    <div>
                                        Rendimiento: {producto.metros_por_caja} m²/caja
                                    </div>
                                )}
                                {producto.stock_actual && (
                                    <div className={producto.stock_actual > 10 ? 'text-green-600' : 'text-orange-600'}>
                                        Stock: {producto.stock_actual} unidades
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mensaje adicional si hay más productos */}
            {productosRecomendados.length > limite && (
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm mb-3">
                        Mostrando {limite} de {productosRecomendados.length} recomendaciones
                    </p>
                    <button className="text-amber-600 hover:text-amber-700 font-medium text-sm underline">
                        Ver todas las recomendaciones
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecomendacionesPorCategorias;
