import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faSave, faCheck, faHome, faPalette, faRuler, faDollarSign } from '@fortawesome/free-solid-svg-icons';

interface Preferencia {
    id_preferencia?: number;
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

export default function Preferencias() {
    const { user } = useAuth();
    const [preferencias, setPreferencias] = useState<Preferencia>({
        idClientes: 0,
        idEstilo: undefined,
        color: '',
        idMaterial: undefined,
        idCategoria: undefined,
        durabilidad: 0,
        superficie: '',
        enTendencia: false,
        precMin: 0,
        precMax: 10000,
        usoEspecifico: ''
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
                .from('preferencias_usuario')
                .select('*')
                .eq('usuario_id', user?.id)
                .single();

            if (prefData) {
                setPreferencias({
                    ...preferencias,
                    idClientes: clienteData.id_cliente,
                    idCategoria: prefData.categorias_favoritas?.[0] || undefined,
                    idMaterial: prefData.materiales_favoritos?.[0] || undefined,
                    idEstilo: prefData.estilos_preferidos?.[0] || undefined,
                    precMin: prefData.rango_precio_min || undefined,
                    precMax: prefData.rango_precio_max || undefined,
                    color: prefData.color_preferido || undefined
                });
            } else {
                setPreferencias({
                    ...preferencias,
                    idClientes: clienteData.id_cliente
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
            
            // Preparar datos para la tabla preferencias_usuario
            const datosPreferencias = {
                usuario_id: user?.id,
                categorias_favoritas: preferencias.idCategoria ? [preferencias.idCategoria] : [],
                estilos_preferidos: preferencias.idEstilo ? [preferencias.idEstilo] : [],
                materiales_favoritos: preferencias.idMaterial ? [preferencias.idMaterial] : [],
                rango_precio_min: preferencias.precMin,
                rango_precio_max: preferencias.precMax,
                color_preferido: preferencias.color,
                fecha_actualizacion: new Date().toISOString()
            };
            
            // Verificar si ya existen preferencias para este usuario
            const { data: prefExistente } = await supabase
                .from('preferencias_usuario')
                .select('id')
                .eq('usuario_id', user?.id)
                .single();

            if (prefExistente) {
                // Actualizar preferencias existentes
                const { error } = await supabase
                    .from('preferencias_usuario')
                    .update(datosPreferencias)
                    .eq('usuario_id', user?.id);
                
                if (error) throw error;
            } else {
                // Crear nuevas preferencias
                const { error } = await supabase
                    .from('preferencias_usuario')
                    .insert([datosPreferencias]);
                
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
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando preferencias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center mb-8">
                            <FontAwesomeIcon icon={faHeart} className="text-amber-500 text-3xl mr-4" />
                            <h1 className="text-3xl font-bold text-gray-800">Mis Preferencias de Cerámicas</h1>
                        </div>

                        <p className="text-gray-600 mb-8">
                            Configura tus preferencias específicas para recibir recomendaciones personalizadas de cerámicas que se adapten a tu proyecto.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Uso específico - MOVIDO ARRIBA */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faHome} className="mr-2 text-amber-500" />
                                    Uso específico
                                </label>
                                <select
                                    value={preferencias.usoEspecifico || ''}
                                    onChange={(e) => setPreferencias({...preferencias, usoEspecifico: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar uso específico</option>
                                    <option value="Piso de baño">Piso de baño</option>
                                    <option value="Pared de baño">Pared de baño</option>
                                    <option value="Piso de cocina">Piso de cocina</option>
                                    <option value="Pared de cocina">Pared de cocina</option>
                                    <option value="Piso de sala">Piso de sala</option>
                                    <option value="Piso de comedor">Piso de comedor</option>
                                    <option value="Piso de habitación">Piso de habitación</option>
                                    <option value="Piso de terraza">Piso de terraza</option>
                                    <option value="Piso de balcón">Piso de balcón</option>
                                    <option value="Piso de entrada">Piso de entrada</option>
                                    <option value="Piso de garaje">Piso de garaje</option>
                                    <option value="Piso comercial">Piso comercial</option>
                                    <option value="Piso industrial">Piso industrial</option>
                                    <option value="Pared exterior">Pared exterior</option>
                                    <option value="Pared interior">Pared interior</option>
                                    <option value="Escaleras">Escaleras</option>
                                    <option value="Zócalos">Zócalos</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            {/* Categoría preferida */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría preferida
                                </label>
                                <select
                                    value={preferencias.idCategoria || ''}
                                    onChange={(e) => setPreferencias({...preferencias, idCategoria: e.target.value ? Number(e.target.value) : undefined})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                                    value={preferencias.idMaterial || ''}
                                    onChange={(e) => setPreferencias({...preferencias, idMaterial: e.target.value ? Number(e.target.value) : undefined})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                                    value={preferencias.idEstilo || ''}
                                    onChange={(e) => setPreferencias({...preferencias, idEstilo: e.target.value ? Number(e.target.value) : undefined})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                                    value={preferencias.color || ''}
                                    onChange={(e) => setPreferencias({...preferencias, color: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Ej: Blanco, Gris, Beige..."
                                />
                            </div>

                            {/* Durabilidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Durabilidad (1-10)
                                </label>
                                <input
                                    type="number"
                                    value={preferencias.durabilidad || ''}
                                    onChange={(e) => setPreferencias({...preferencias, durabilidad: Number(e.target.value)})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="1-10"
                                    min="1"
                                    max="10"
                                />
                            </div>

                            {/* Superficie */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Superficie preferida
                                </label>
                                <input
                                    type="text"
                                    value={preferencias.superficie || ''}
                                    onChange={(e) => setPreferencias({...preferencias, superficie: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Ej: Mate, Brillante, Texturizado..."
                                />
                            </div>

                            {/* En tendencia */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ¿Te gustan las tendencias?
                                </label>
                                <select
                                    value={preferencias.enTendencia ? 'true' : 'false'}
                                    onChange={(e) => setPreferencias({...preferencias, enTendencia: e.target.value === 'true'})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="false">No</option>
                                    <option value="true">Sí</option>
                                </select>
                            </div>

                            {/* Precio mínimo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-amber-500" />
                                    Precio mínimo (RD$)
                                </label>
                                <input
                                    type="number"
                                    value={preferencias.precMin || ''}
                                    onChange={(e) => setPreferencias({...preferencias, precMin: Number(e.target.value)})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            {/* Precio máximo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-amber-500" />
                                    Precio máximo (RD$)
                                </label>
                                <input
                                    type="number"
                                    value={preferencias.precMax || ''}
                                    onChange={(e) => setPreferencias({...preferencias, precMax: Number(e.target.value)})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="10000"
                                    min="0"
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
                                            : 'bg-amber-600 hover:bg-amber-700'
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
