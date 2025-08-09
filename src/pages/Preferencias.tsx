import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faSave, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Preferencia {
    id_preferencia?: number;
    id_cliente: number;
    categoria_preferida?: string;
    material_preferido?: string;
    estilo_preferido?: string;
    rango_precio_min?: number;
    rango_precio_max?: number;
    color_preferido?: string;
    formato_preferido?: string;
}

export default function Preferencias() {
    const { user } = useAuth();
    const [preferencias, setPreferencias] = useState<Preferencia>({
        id_cliente: 0,
        categoria_preferida: '',
        material_preferido: '',
        estilo_preferido: '',
        rango_precio_min: 0,
        rango_precio_max: 10000,
        color_preferido: '',
        formato_preferido: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [categorias, setCategorias] = useState<Array<{id_categoria: string, nombre_categoria: string}>>([]);
    const [materiales, setMateriales] = useState<Array<{id_materiales: string, nombre_materiales: string}>>([]);
    const [estilos, setEstilos] = useState<Array<{id_estilo: string, nombre_estilo: string}>>([]);

    useEffect(() => {
        if (user) {
            fetchPreferencias();
            fetchOpciones();
        }
    }, [user]);

    const fetchOpciones = async () => {
        try {
            // Obtener categorías
            const { data: catData } = await supabase
                .from('categorias')
                .select('id_categoria, nombre_categoria');
            if (catData) setCategorias(catData);

            // Obtener materiales
            const { data: matData } = await supabase
                .from('materiales')
                .select('id_materiales, nombre_materiales');
            if (matData) setMateriales(matData);

            // Obtener estilos
            const { data: estData } = await supabase
                .from('estilos')
                .select('id_estilo, nombre_estilo');
            if (estData) setEstilos(estData);
        } catch (error) {
            console.error('Error al cargar opciones:', error);
        }
    };

    const fetchPreferencias = async () => {
        try {
            setLoading(true);
            
            // Obtener ID del cliente
            const { data: clienteData } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user?.id)
                .single();

            if (!clienteData) return;

            // Obtener preferencias existentes
            const { data: prefData } = await supabase
                .from('preferenciasProd')
                .select('*')
                .eq('idClientes', clienteData.id_cliente)
                .single();

            if (prefData) {
                setPreferencias({
                    ...preferencias,
                    ...prefData,
                    id_cliente: clienteData.id_cliente
                });
            } else {
                setPreferencias({
                    ...preferencias,
                    id_cliente: clienteData.id_cliente
                });
            }
        } catch (error) {
            console.error('Error al cargar preferencias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            if (preferencias.id_preferencia) {
                // Actualizar preferencias existentes
                const { error } = await supabase
                    .from('preferenciasProd')
                    .update(preferencias)
                    .eq('id_preferencia', preferencias.id_preferencia);
                
                if (error) throw error;
            } else {
                // Crear nuevas preferencias
                const { error } = await supabase
                    .from('preferenciasProd')
                    .insert([preferencias]);
                
                if (error) throw error;
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            alert('Error al guardar las preferencias');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando preferencias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center mb-8">
                            <FontAwesomeIcon icon={faHeart} className="text-red-500 text-3xl mr-4" />
                            <h1 className="text-3xl font-bold text-gray-800">Mis Preferencias</h1>
                        </div>

                        <p className="text-gray-600 mb-8">
                            Configura tus preferencias para recibir recomendaciones personalizadas de productos.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Categoría preferida */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría preferida
                                </label>
                                <select
                                    value={preferencias.categoria_preferida || ''}
                                    onChange={(e) => setPreferencias({...preferencias, categoria_preferida: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id_categoria} value={cat.id_categoria}>
                                            {cat.nombre_categoria}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Material preferido */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Material preferido
                                </label>
                                <select
                                    value={preferencias.material_preferido || ''}
                                    onChange={(e) => setPreferencias({...preferencias, material_preferido: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar material</option>
                                    {materiales.map((mat) => (
                                        <option key={mat.id_materiales} value={mat.id_materiales}>
                                            {mat.nombre_materiales}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Estilo preferido */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estilo preferido
                                </label>
                                <select
                                    value={preferencias.estilo_preferido || ''}
                                    onChange={(e) => setPreferencias({...preferencias, estilo_preferido: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar estilo</option>
                                    {estilos.map((est) => (
                                        <option key={est.id_estilo} value={est.id_estilo}>
                                            {est.nombre_estilo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Color preferido */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color preferido
                                </label>
                                <input
                                    type="text"
                                    value={preferencias.color_preferido || ''}
                                    onChange={(e) => setPreferencias({...preferencias, color_preferido: e.target.value})}
                                    placeholder="Ej: Blanco, Gris, Beige..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Rango de precio mínimo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio mínimo (RD$)
                                </label>
                                <input
                                    type="number"
                                    value={preferencias.rango_precio_min || ''}
                                    onChange={(e) => setPreferencias({...preferencias, rango_precio_min: Number(e.target.value)})}
                                    placeholder="0"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Rango de precio máximo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio máximo (RD$)
                                </label>
                                <input
                                    type="number"
                                    value={preferencias.rango_precio_max || ''}
                                    onChange={(e) => setPreferencias({...preferencias, rango_precio_max: Number(e.target.value)})}
                                    placeholder="10000"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Formato preferido */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Formato preferido
                                </label>
                                <input
                                    type="text"
                                    value={preferencias.formato_preferido || ''}
                                    onChange={(e) => setPreferencias({...preferencias, formato_preferido: e.target.value})}
                                    placeholder="Ej: 30x30, 60x60..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                                    saving 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : saved 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                    </>
                                ) : saved ? (
                                    <>
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                        ¡Guardado!
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                                        Guardar Preferencias
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
