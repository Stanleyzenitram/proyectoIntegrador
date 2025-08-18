import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { generarRecomendacionesPorCategorias } from '../utils/recomendacionesCategorias';

export default function TestRecomendaciones() {
    const [configuracion, setConfiguracion] = useState<any>(null);
    const [productosPorRango, setProductosPorRango] = useState<any>({});
    const [preferencias, setPreferencias] = useState<any[]>([]);
    const [recomendaciones, setRecomendaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // 1. Cargar configuración del sistema
            const { data: configData } = await supabase
                .from('configuracion_sistema')
                .select('*')
                .eq('nombre', 'rangos_precio');
            
            if (configData && configData.length > 0) {
                setConfiguracion(configData[0].valor);
            }

            // 2. Cargar productos por rango de precio
            const rangos = {
                bajo: { min: 0, max: 50 },
                medio: { min: 51, max: 150 },
                alto: { min: 151, max: 500 }
            };

            const productosPorRangoTemp: any = {};
            for (const [rango, valores] of Object.entries(rangos)) {
                const { data } = await supabase
                    .from('productos')
                    .select('id_producto, nombre_producto, precio, stock_actual')
                    .gte('precio', (valores as any).min)
                    .lte('precio', (valores as any).max)
                    .eq('disponibilidad', true)
                    .gt('stock_actual', 0)
                    .limit(5);
                
                productosPorRangoTemp[rango] = data || [];
            }
            setProductosPorRango(productosPorRangoTemp);

            // 3. Cargar preferencias de usuarios
            const { data: prefsData } = await supabase
                .from('preferencias_categorias')
                .select('*')
                .limit(10);
            
            setPreferencias(prefsData || []);

        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const probarRecomendaciones = async (clienteId: number) => {
        try {
            setLoading(true);
            const recs = await generarRecomendacionesPorCategorias(clienteId, 5);
            setRecomendaciones(recs);
        } catch (error) {
            console.error('Error generando recomendaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">🔄 Cargando datos de prueba...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Prueba del Sistema de Recomendaciones</h1>
            
            {/* Configuración del Sistema */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">📊 Configuración del Sistema</h2>
                {configuracion ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(configuracion).map(([rango, datos]: [string, any]) => (
                            <div key={rango} className="border rounded-lg p-4 bg-gray-50">
                                <h3 className="font-semibold capitalize">{datos.nombre}</h3>
                                <p className="text-sm text-gray-600">${datos.min} - ${datos.max}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-red-500">❌ No se pudo cargar la configuración</p>
                )}
            </div>

            {/* Productos por Rango de Precio */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">📦 Productos por Rango de Precio</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(productosPorRango).map(([rango, productos]: [string, any]) => (
                        <div key={rango} className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold capitalize mb-2">{rango}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                {productos.length} productos disponibles
                            </p>
                            {productos.length > 0 && (
                                <div className="space-y-1">
                                    {productos.slice(0, 3).map((p: any) => (
                                        <div key={p.id_producto} className="text-xs">
                                            {p.nombre_producto} - ${p.precio}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Preferencias de Usuarios */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">👥 Preferencias de Usuarios</h2>
                {preferencias.length > 0 ? (
                    <div className="space-y-2">
                        {preferencias.map((pref, index) => (
                            <div key={index} className="border rounded p-3 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <strong>Usuario {pref.idclientes}</strong>
                                        {pref.categoria_precio && (
                                            <span className="ml-2 text-blue-600">
                                                💰 Precio: {pref.categoria_precio}
                                            </span>
                                        )}
                                        {pref.categoria_color && (
                                            <span className="ml-2 text-green-600">
                                                🎨 Color: {pref.categoria_color}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => probarRecomendaciones(pref.idclientes)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                    >
                                        🧪 Probar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-yellow-500">⚠️ No hay preferencias configuradas</p>
                )}
            </div>

            {/* Resultados de Recomendaciones */}
            {recomendaciones.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">🏆 Recomendaciones Generadas</h2>
                    <div className="space-y-2">
                        {recomendaciones.map((rec, index) => (
                            <div key={index} className="border rounded p-3 bg-green-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <strong>{rec.nombre_producto}</strong>
                                        <span className="ml-2 text-green-600">${rec.precio}</span>
                                        {rec.score_recomendacion && (
                                            <span className="ml-2 text-blue-600">
                                                ⭐ Score: {rec.score_recomendacion}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {rec.razon_recomendacion}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Botón de Recarga */}
            <div className="mt-6 text-center">
                <button
                    onClick={cargarDatos}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
                >
                    🔄 Recargar Datos
                </button>
            </div>
        </div>
    );
}
