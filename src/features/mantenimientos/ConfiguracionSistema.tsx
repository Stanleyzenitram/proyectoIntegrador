import React, { useState, useEffect } from 'react';
import { configuracionService, type ConfiguracionSistema } from '../../services/configuracionService';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ConfiguracionSistema() {
    const [configuraciones, setConfiguraciones] = useState<ConfiguracionSistema[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'rangos' | 'colores'>('rangos');

    useEffect(() => {
        cargarConfiguraciones();
    }, []);

    const cargarConfiguraciones = async () => {
        setLoading(true);
        try {
            const data = await configuracionService.obtenerConfiguraciones();
            setConfiguraciones(data);
        } catch (error) {
            console.error('❌ Error cargando configuraciones:', error);
            await crearConfiguracionesPorDefecto();
        } finally {
            setLoading(false);
        }
    };

    const crearConfiguracionesPorDefecto = async () => {
        try {
            await configuracionService.crearConfiguracionesPorDefecto();
            await cargarConfiguraciones();
        } catch (error) {
            console.error('❌ Error creando configuraciones por defecto:', error);
        }
    };

    const actualizarRangosPrecio = async (rangos: any) => {
        try {
            await configuracionService.actualizarRangosPrecio(rangos);
            alert('✅ Rangos de precio actualizados correctamente');
            await cargarConfiguraciones();
            
            // Notificar que la configuración cambió (para que las preferencias se refresquen)
            window.dispatchEvent(new CustomEvent('configuracionActualizada', {
                detail: { tipo: 'rangos_precio', datos: rangos }
            }));
        } catch (error) {
            alert('❌ Error al actualizar los rangos de precio');
        }
    };

    const actualizarCategoriasColores = async (categorias: any) => {
        try {
            await configuracionService.actualizarCategoriasColores(categorias);
            alert('✅ Categorías de colores actualizadas correctamente');
            await cargarConfiguraciones();
            
            // Notificar que la configuración cambió (para que las preferencias se refresquen)
            window.dispatchEvent(new CustomEvent('configuracionActualizada', {
                detail: { tipo: 'categorias_colores', datos: categorias }
            }));
        } catch (error) {
            alert('❌ Error al actualizar las categorías de colores');
        }
    };

    const getRangosPrecio = () => {
        return configuraciones.find(config => config.nombre === 'rangos_precio')?.valor || {};
    };

    const getCategoriasColores = () => {
        return configuraciones.find(config => config.nombre === 'categorias_colores')?.valor || {};
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">⚙️ Configuración del Sistema</h1>
            
            {/* Tabs de navegación */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setActiveTab('rangos')}
                    className={`px-6 py-3 rounded-md transition-colors font-medium ${
                        activeTab === 'rangos'
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    💰 Rangos de Precio
                </button>
                <button
                    onClick={() => setActiveTab('colores')}
                    className={`px-6 py-3 rounded-md transition-colors font-medium ${
                        activeTab === 'colores'
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    🎨 Categorías de Colores
                </button>
            </div>

            {activeTab === 'rangos' && (
                <RangosPrecio 
                    rangos={getRangosPrecio()} 
                    onSave={actualizarRangosPrecio} 
                />
            )}

            {activeTab === 'colores' && (
                <CategoriasColores 
                    categorias={getCategoriasColores()} 
                    onSave={actualizarCategoriasColores} 
                />
            )}
        </div>
    );
}

// Componente para editar rangos de precio
function RangosPrecio({ rangos, onSave }: { rangos: any, onSave: (rangos: any) => void }) {
    const [rangosEdit, setRangosEdit] = useState(rangos);
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (categoria: string, campo: string, valor: string | number) => {
        setRangosEdit({
            ...rangosEdit,
            [categoria]: {
                ...rangosEdit[categoria],
                [campo]: campo === 'min' || campo === 'max' ? Number(valor) : valor
            }
        });
    };

    const handleSave = () => {
        onSave(rangosEdit);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setRangosEdit(rangos);
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">💰 Rangos de Precio para Productos</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        ✏️ Editar Rangos
                    </button>
                ) : (
                    <div className="space-x-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                            💾 Guardar
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            ❌ Cancelar
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(rangosEdit).map(([categoria, datos]: [string, any]) => (
                    <div key={categoria} className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold text-lg mb-3 capitalize text-gray-800">
                            {datos.nombre}
                        </h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio Mínimo ($)
                                </label>
                                <input
                                    type="number"
                                    value={datos.min}
                                    onChange={(e) => handleChange(categoria, 'min', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-2 border rounded focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio Máximo ($)
                                </label>
                                <input
                                    type="number"
                                    value={datos.max}
                                    onChange={(e) => handleChange(categoria, 'max', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-2 border rounded focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Rango
                                </label>
                                <input
                                    type="text"
                                    value={datos.nombre}
                                    onChange={(e) => handleChange(categoria, 'nombre', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-2 border rounded focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">💡 ¿Para qué sirven estos rangos?</h3>
                <p className="text-blue-800 text-sm">
                    Estos rangos se usan para categorizar automáticamente los productos por precio 
                    y mostrar recomendaciones más relevantes a los clientes según su presupuesto.
                </p>
            </div>
        </div>
    );
}

// Componente para editar categorías de colores
function CategoriasColores({ categorias, onSave }: { categorias: any, onSave: (categorias: any) => void }) {
    const [categoriasEdit, setCategoriasEdit] = useState(categorias);
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (categoria: string, campo: string, valor: string) => {
        setCategoriasEdit({
            ...categoriasEdit,
            [categoria]: {
                ...categoriasEdit[categoria],
                [campo]: valor
            }
        });
    };

    const handleColorChange = (categoria: string, index: number, nuevoColor: string) => {
        const coloresActualizados = [...categoriasEdit[categoria].colores];
        coloresActualizados[index] = nuevoColor;
        
        setCategoriasEdit({
            ...categoriasEdit,
            [categoria]: {
                ...categoriasEdit[categoria],
                colores: coloresActualizados
            }
        });
    };

    const agregarColor = (categoria: string) => {
        const coloresActualizados = [...categoriasEdit[categoria].colores, 'Nuevo Color'];
        setCategoriasEdit({
            ...categoriasEdit,
            [categoria]: {
                ...categoriasEdit[categoria],
                colores: coloresActualizados
            }
        });
    };

    const eliminarColor = (categoria: string, index: number) => {
        const coloresActualizados = categoriasEdit[categoria].colores.filter((_: any, i: number) => i !== index);
        setCategoriasEdit({
            ...categoriasEdit,
            [categoria]: {
                ...categoriasEdit[categoria],
                colores: coloresActualizados
            }
        });
    };

    const handleSave = () => {
        onSave(categoriasEdit);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCategoriasEdit(categorias);
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">🎨 Categorías de Colores para Productos</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        ✏️ Editar Categorías
                    </button>
                ) : (
                    <div className="space-x-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                            💾 Guardar
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            ❌ Cancelar
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(categoriasEdit).map(([categoria, datos]: [string, any]) => (
                    <div key={categoria} className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold text-lg mb-3 text-gray-800">
                            {datos.nombre}
                        </h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la Categoría
                                </label>
                                <input
                                    type="text"
                                    value={datos.nombre}
                                    onChange={(e) => handleChange(categoria, 'nombre', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-2 border rounded focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Colores en esta categoría
                                </label>
                                <div className="space-y-2">
                                    {datos.colores.map((color: string, index: number) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={color}
                                                onChange={(e) => handleColorChange(categoria, index, e.target.value)}
                                                disabled={!isEditing}
                                                className="flex-1 p-2 border rounded focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
                                            />
                                            {isEditing && (
                                                <button
                                                    onClick={() => eliminarColor(categoria, index)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Eliminar color"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <button
                                            onClick={() => agregarColor(categoria)}
                                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center space-x-1"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            <span>Agregar color</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">💡 ¿Para qué sirven estas categorías?</h3>
                <p className="text-blue-800 text-sm">
                    Estas categorías se usan para organizar los colores de los productos y 
                    hacer recomendaciones más precisas basadas en las preferencias de color de los clientes.
                </p>
            </div>
        </div>
    );
}
