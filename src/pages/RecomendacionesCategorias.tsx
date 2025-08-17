import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faCog, faInfoCircle, faChartLine } from '@fortawesome/free-solid-svg-icons';
import SeccionRecomendaciones from '../components/SeccionRecomendaciones';
import { useRecomendacionesCategorias } from '../hooks/useRecomendacionesCategorias';
import { 
    CATEGORIAS_COLORES, 
    CATEGORIAS_ESTILOS, 
    CATEGORIAS_PRECIO, 
    CATEGORIAS_MATERIALES,
    obtenerNombreCategoria 
} from '../utils/preferenciasCategorias';

const RecomendacionesCategorias: React.FC = () => {
    const { 
        preferencias, 
        loading: loadingPreferencias,
        obtenerRecomendacionesPorCategoria 
    } = useRecomendacionesCategorias();
    
    const [mostrarDemo, setMostrarDemo] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 pt-3">
            <div className="container mx-auto px-4 py-4">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center mb-4">
                            <FontAwesomeIcon icon={faRobot} className="text-amber-500 text-3xl mr-4" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">
                                    Sistema de Recomendaciones por Categorías
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Recomendaciones inteligentes basadas en tus preferencias simplificadas
                                </p>
                            </div>
                        </div>

                        {/* Estado de preferencias */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <FontAwesomeIcon icon={faCog} className="mr-2 text-gray-600" />
                                Estado de tus Preferencias
                            </h3>
                            
                            {loadingPreferencias ? (
                                <p className="text-gray-600">Cargando preferencias...</p>
                            ) : preferencias ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-3 rounded border">
                                        <div className="text-xs text-gray-500 mb-1">Colores</div>
                                        <div className="font-medium text-gray-800">
                                            {preferencias.categoria_color 
                                                ? obtenerNombreCategoria('color', preferencias.categoria_color)
                                                : 'Sin configurar'
                                            }
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                        <div className="text-xs text-gray-500 mb-1">Estilo</div>
                                        <div className="font-medium text-gray-800">
                                            {preferencias.categoria_estilo 
                                                ? obtenerNombreCategoria('estilo', preferencias.categoria_estilo)
                                                : 'Sin configurar'
                                            }
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                        <div className="text-xs text-gray-500 mb-1">Material</div>
                                        <div className="font-medium text-gray-800">
                                            {preferencias.categoria_material 
                                                ? obtenerNombreCategoria('material', preferencias.categoria_material)
                                                : 'Sin configurar'
                                            }
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                        <div className="text-xs text-gray-500 mb-1">Presupuesto</div>
                                        <div className="font-medium text-gray-800">
                                            {preferencias.categoria_precio 
                                                ? obtenerNombreCategoria('precio', preferencias.categoria_precio)
                                                : 'Sin configurar'
                                            }
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                    <p className="text-blue-800 font-medium mb-2">
                                        No tienes preferencias configuradas
                                    </p>
                                    <p className="text-blue-600 text-sm mb-3">
                                        Configura tus preferencias para obtener recomendaciones personalizadas.
                                    </p>
                                    <a 
                                        href="/preferencias"
                                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Configurar Ahora
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del sistema */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center mb-4">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-xl mr-3" />
                                <h3 className="text-lg font-semibold text-gray-800">¿Cómo Funciona?</h3>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Selecciona una categoría por tipo (color, estilo, material, precio)</li>
                                <li>• El sistema mapea tu selección a productos reales</li>
                                <li>• Genera recomendaciones personalizadas</li>
                                <li>• Puntúa productos según tus preferencias</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center mb-4">
                                <FontAwesomeIcon icon={faChartLine} className="text-green-500 text-xl mr-3" />
                                <h3 className="text-lg font-semibold text-gray-800">Ventajas</h3>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Más simple que seleccionar múltiples opciones</li>
                                <li>• Recomendaciones más precisas</li>
                                <li>• Filtrado inteligente automático</li>
                                <li>• Compatible con sistema anterior</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center mb-4">
                                <FontAwesomeIcon icon={faCog} className="text-purple-500 text-xl mr-3" />
                                <h3 className="text-lg font-semibold text-gray-800">Configuración</h3>
                            </div>
                            <div className="space-y-3">
                                <a 
                                    href="/preferencias"
                                    className="block w-full bg-amber-600 text-white text-center py-2 px-4 rounded hover:bg-amber-700 transition-colors text-sm font-medium"
                                >
                                    Configurar Preferencias
                                </a>
                                <button
                                    onClick={() => setMostrarDemo(!mostrarDemo)}
                                    className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
                                >
                                    {mostrarDemo ? 'Ocultar' : 'Mostrar'} Demo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Demo de categorías */}
                    {mostrarDemo && (
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Demo: Categorías Disponibles
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Colores */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Categorías de Colores</h4>
                                    <div className="space-y-2">
                                        {CATEGORIAS_COLORES.map(cat => (
                                            <div key={cat.id} className="bg-gray-50 p-3 rounded">
                                                <div className="font-medium text-gray-800">{cat.nombre}</div>
                                                <div className="text-sm text-gray-600">{cat.descripcion}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Incluye: {(cat.mapeo.valores as string[])?.join(', ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Estilos */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Categorías de Estilos</h4>
                                    <div className="space-y-2">
                                        {CATEGORIAS_ESTILOS.map(cat => (
                                            <div key={cat.id} className="bg-gray-50 p-3 rounded">
                                                <div className="font-medium text-gray-800">{cat.nombre}</div>
                                                <div className="text-sm text-gray-600">{cat.descripcion}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Materiales */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Categorías de Materiales</h4>
                                    <div className="space-y-2">
                                        {CATEGORIAS_MATERIALES.map(cat => (
                                            <div key={cat.id} className="bg-gray-50 p-3 rounded">
                                                <div className="font-medium text-gray-800">{cat.nombre}</div>
                                                <div className="text-sm text-gray-600">{cat.descripcion}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Precios */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Categorías de Precio</h4>
                                    <div className="space-y-2">
                                        {CATEGORIAS_PRECIO.map(cat => (
                                            <div key={cat.id} className="bg-gray-50 p-3 rounded">
                                                <div className="font-medium text-gray-800">{cat.nombre}</div>
                                                <div className="text-sm text-gray-600">{cat.descripcion}</div>
                                                {cat.mapeo.rango && (
                                                    <div className="text-xs text-amber-600 mt-1 font-medium">
                                                        RD$ {cat.mapeo.rango.min.toLocaleString()} - RD$ {cat.mapeo.rango.max === 999999 ? '15,000+' : cat.mapeo.rango.max.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recomendaciones */}
                    <SeccionRecomendaciones 
                        titulo="Todas tus Recomendaciones Personalizadas"
                        limite={16}
                        className="mb-6"
                        mostrarConfiguracion={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default RecomendacionesCategorias;
