import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRecomendacionesCategorias } from '../hooks/useRecomendacionesCategorias';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faRobot, 
    faHeart, 
    faShoppingCart, 
    faEye, 
    faStar,
    faCog,
    faRefresh
} from '@fortawesome/free-solid-svg-icons';

interface SeccionRecomendacionesProps {
    titulo?: string;
    limite?: number;
    mostrarConfiguracion?: boolean;
    className?: string;
}

const SeccionRecomendaciones: React.FC<SeccionRecomendacionesProps> = ({
    titulo = "Recomendaciones Personalizadas",
    limite = 8,
    mostrarConfiguracion = true,
    className = ""
}) => {
    const { user } = useAuth();
    const { 
        productosRecomendados, 
        preferencias, 
        loading, 
        error,
        generarRecomendaciones 
    } = useRecomendacionesCategorias();

    const [mostrandoTodos, setMostrandoTodos] = useState(false);

    // Generar recomendaciones al cargar si hay preferencias
    useEffect(() => {
        if (user && preferencias) {
            generarRecomendaciones(limite);
        }
    }, [user, preferencias, limite]);

    if (!user) {
        return null; // No mostrar nada si no hay usuario logueado
    }

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
                        <div className="h-6 bg-gray-300 rounded w-64"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: limite }).map((_, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="w-full h-32 bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <FontAwesomeIcon icon={faRobot} className="text-red-400 text-3xl mb-2" />
                    <h3 className="text-red-800 font-semibold mb-1">Error en Recomendaciones</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                        onClick={() => generarRecomendaciones(limite)}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                        <FontAwesomeIcon icon={faRefresh} className="mr-1" />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Si no hay preferencias configuradas
    if (!preferencias) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="text-center py-8">
                    <FontAwesomeIcon icon={faRobot} className="text-gray-400 text-4xl mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        ¡Configura tus Preferencias!
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        Para obtener recomendaciones personalizadas de cerámicas, configura tus preferencias de colores, estilos, materiales y presupuesto.
                    </p>
                    <a
                        href="/preferencias"
                        className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                    >
                        <FontAwesomeIcon icon={faCog} className="mr-2" />
                        Configurar Preferencias
                    </a>
                </div>
            </div>
        );
    }

    // Si no hay productos recomendados
    if (!productosRecomendados || productosRecomendados.length === 0) {
        return (
            <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
                <div className="text-center py-8">
                    <FontAwesomeIcon icon={faRobot} className="text-gray-400 text-4xl mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No hay recomendaciones disponibles
                    </h3>
                    <p className="text-gray-600 mb-4">
                        No encontramos productos que coincidan con tus preferencias actuales.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => generarRecomendaciones(limite)}
                            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={faRefresh} className="mr-1" />
                            Regenerar
                        </button>
                        {mostrarConfiguracion && (
                            <a
                                href="/preferencias"
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                            >
                                <FontAwesomeIcon icon={faCog} className="mr-1" />
                                Ajustar Preferencias
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const productosAMostrar = mostrandoTodos ? productosRecomendados : productosRecomendados.slice(0, limite);

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faRobot} className="text-amber-500 text-2xl mr-3" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
                        <p className="text-sm text-gray-600">
                            Basado en tus preferencias configuradas
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => generarRecomendaciones(limite)}
                        className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Regenerar recomendaciones"
                    >
                        <FontAwesomeIcon icon={faRefresh} />
                    </button>
                    {mostrarConfiguracion && (
                        <a
                            href="/preferencias"
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Configurar preferencias"
                        >
                            <FontAwesomeIcon icon={faCog} />
                        </a>
                    )}
                </div>
            </div>

            {/* Estado de preferencias */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-2 text-xs">
                    {preferencias.categoria_color && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Color: {preferencias.categoria_color.replace('colores_', '').replace('_', ' ')}
                        </span>
                    )}
                    {preferencias.categoria_estilo && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                            Estilo: {preferencias.categoria_estilo.replace('estilo_', '')}
                        </span>
                    )}
                    {preferencias.categoria_material && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            Material: {preferencias.categoria_material.replace('_', ' ')}
                        </span>
                    )}
                    {preferencias.categoria_precio && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded">
                            Precio: {preferencias.categoria_precio}
                        </span>
                    )}
                </div>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {productosAMostrar.map((producto) => (
                    <div 
                        key={producto.id_producto} 
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                    >
                        {/* Imagen del producto */}
                        <div className="relative">
                            <img
                                src={producto.imagen || '/placeholder-image.svg'}
                                alt={producto.nombre_producto}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.svg';
                                }}
                            />
                            
                            {/* Badges */}
                            {producto.descuento && producto.descuento > 0 && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                    -{producto.descuento}%
                                </div>
                            )}
                            
                            {producto.score_recomendacion && producto.score_recomendacion > 50 && (
                                <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                                    <FontAwesomeIcon icon={faStar} className="mr-1" />
                                    Ideal
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
                        <div className="p-3">
                            <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                                {producto.nombre_producto}
                            </h3>
                            
                            {/* Precio */}
                            <div className="mb-2">
                                {producto.descuento && producto.descuento > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-bold text-red-600">
                                            RD$ {(producto.precio * (1 - producto.descuento / 100)).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-500 line-through">
                                            RD$ {producto.precio.toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm font-bold text-gray-800">
                                        RD$ {producto.precio.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Razón de recomendación */}
                            {producto.razon_recomendacion && (
                                <div className="mb-2">
                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                        {producto.razon_recomendacion}
                                    </span>
                                </div>
                            )}

                            {/* Info adicional */}
                            <div className="text-xs text-gray-500">
                                {producto.metros_por_caja && (
                                    <div>Rend: {producto.metros_por_caja} m²/caja</div>
                                )}
                                {producto.stock_actual && (
                                    <div className={producto.stock_actual > 10 ? 'text-green-600' : 'text-orange-600'}>
                                        Stock: {producto.stock_actual}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer con acciones */}
            {productosRecomendados.length > limite && (
                <div className="text-center border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">
                        Mostrando {productosAMostrar.length} de {productosRecomendados.length} recomendaciones
                    </p>
                    <button
                        onClick={() => setMostrandoTodos(!mostrandoTodos)}
                        className="text-amber-600 hover:text-amber-700 font-medium text-sm underline"
                    >
                        {mostrandoTodos ? 'Mostrar menos' : 'Ver todas las recomendaciones'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeccionRecomendaciones;
