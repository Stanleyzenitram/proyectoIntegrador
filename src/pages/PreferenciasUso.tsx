import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PreferenciasUsuario from '../components/PreferenciasUsuario';
import ProductosRecomendados from '../components/ProductosRecomendados';
import { FaHeart, FaStar, FaChartBar, FaCog, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PreferenciasUso: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'preferencias' | 'recomendaciones' | 'estadisticas'>('preferencias');

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Acceso Requerido
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Debes iniciar sesión para acceder a tus preferencias y recomendaciones.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        {
            id: 'preferencias',
            name: 'Mis Preferencias',
            icon: FaCog,
            description: 'Configura tus gustos y preferencias de cerámica'
        },
        {
            id: 'recomendaciones',
            name: 'Productos Recomendados',
            icon: FaStar,
            description: 'Descubre productos personalizados para ti'
        },
        {
            id: 'estadisticas',
            name: 'Mis Estadísticas',
            icon: FaChartBar,
            description: 'Analiza tu comportamiento de compra'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Preferencias y Recomendaciones
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Personaliza tu experiencia de compra
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                                <FaHeart className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs de navegación */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-amber-500 text-amber-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Descripción del tab activo */}
                <div className="mb-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {tabs.find(t => t.id === activeTab)?.name}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {tabs.find(t => t.id === activeTab)?.description}
                        </p>
                    </div>
                </div>

                {/* Contenido del tab */}
                {activeTab === 'preferencias' && (
                    <PreferenciasUsuario />
                )}

                {activeTab === 'recomendaciones' && (
                    <div>
                        <div className="mb-6 text-center">
                            <p className="text-gray-600">
                                Estos productos han sido seleccionados especialmente para ti basándose en tus preferencias y comportamiento.
                            </p>
                        </div>
                        <ProductosRecomendados limit={12} showFilters={true} />
                    </div>
                )}

                {activeTab === 'estadisticas' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Análisis de tu Comportamiento
                            </h3>
                            <p className="text-gray-600">
                                Estadísticas basadas en tu actividad en la plataforma
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Estadísticas básicas */}
                            <div className="bg-blue-50 p-6 rounded-lg text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                                <div className="text-blue-800 font-medium">Productos Vistos</div>
                                <div className="text-blue-600 text-sm">En total</div>
                            </div>

                            <div className="bg-green-50 p-6 rounded-lg text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                                <div className="text-green-800 font-medium">Productos Comprados</div>
                                <div className="text-green-600 text-sm">En total</div>
                            </div>

                            <div className="bg-purple-50 p-6 rounded-lg text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                                <div className="text-purple-800 font-medium">Favoritos</div>
                                <div className="text-purple-600 text-sm">Guardados</div>
                            </div>

                            <div className="bg-orange-50 p-6 rounded-lg text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                                <div className="text-orange-800 font-medium">Recomendaciones</div>
                                <div className="text-orange-600 text-sm">Recibidas</div>
                            </div>
                        </div>

                        {/* Mensaje informativo */}
                        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center space-x-3">
                                <FaChartBar className="text-amber-600 w-5 h-5" />
                                <div>
                                    <h4 className="font-medium text-amber-800">
                                        Estadísticas en Desarrollo
                                    </h4>
                                    <p className="text-amber-700 text-sm">
                                        Las estadísticas se generan automáticamente mientras usas la plataforma. 
                                        Cuanto más interactúes, más precisas serán tus recomendaciones.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer informativo */}
            <div className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            ¿Cómo funcionan las recomendaciones?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">1. Configura tus Preferencias</h4>
                                <p>Selecciona tus categorías, estilos y materiales favoritos para personalizar las recomendaciones.</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">2. Navega y Compra</h4>
                                <p>Tu comportamiento en la plataforma ayuda a mejorar la precisión de las recomendaciones.</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">3. Recibe Productos Personalizados</h4>
                                <p>Disfruta de un catálogo adaptado a tus gustos y necesidades específicas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreferenciasUso;
