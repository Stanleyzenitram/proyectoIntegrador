import React, { useState, useEffect } from 'react';
import { useRecomendaciones } from '../hooks/useRecomendaciones';
import { PreferenciasUsuario as PreferenciasUsuarioType } from '../types/recomendaciones';
import { supabase } from '../services/supabase';
import { FaSave, FaHeart, FaPalette, FaLayerGroup, FaDollarSign, FaCheck } from 'react-icons/fa';

interface Categoria {
    id_categoria: number;
    nombre: string;
}

interface Estilo {
    id_estilo: number;
    nombre: string;
}

interface Material {
    id_material: number;
    nombre: string;
}

const PreferenciasUsuario: React.FC = () => {
    const { preferencias, guardarPreferencias, loadingPreferencias } = useRecomendaciones();
    
    // Estados para las opciones disponibles
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [estilos, setEstilos] = useState<Estilo[]>([]);
    const [materiales, setMateriales] = useState<Material[]>([]);
    
    // Estados para las preferencias del usuario
    const [preferenciasForm, setPreferenciasForm] = useState<PreferenciasUsuarioType>({
        usuario_id: '',
        categorias_favoritas: [],
        estilos_preferidos: [],
        materiales_favoritos: [],
        rango_precio_min: undefined,
        rango_precio_max: undefined,
        color_preferido: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Cargar opciones disponibles
    useEffect(() => {
        const cargarOpciones = async () => {
            try {
                const [categoriasRes, estilosRes, materialesRes] = await Promise.all([
                    supabase.from('categorias').select('*').eq('activo', true),
                    supabase.from('estilos').select('*').eq('activo', true),
                    supabase.from('materiales').select('*').eq('activo', true)
                ]);

                if (categoriasRes.data) setCategorias(categoriasRes.data);
                if (estilosRes.data) setEstilos(estilosRes.data);
                if (materialesRes.data) setMateriales(materialesRes.data);
            } catch (error) {
                console.error('Error al cargar opciones:', error);
            }
        };

        cargarOpciones();
    }, []);

    // Sincronizar formulario con preferencias existentes
    useEffect(() => {
        if (preferencias) {
            setPreferenciasForm(preferencias);
        }
    }, [preferencias]);

    // Manejar cambios en el formulario
    const handleChange = (field: keyof PreferenciasUsuarioType, value: any) => {
        setPreferenciasForm(prev => ({
            ...prev,
            [field]: value
        }));
        setSaved(false);
    };

    // Manejar selección múltiple
    const handleMultiSelect = (field: 'categorias_favoritas' | 'estilos_preferidos' | 'materiales_favoritos', value: number) => {
        setPreferenciasForm(prev => {
            const currentValues = prev[field] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            
            return {
                ...prev,
                [field]: newValues
            };
        });
        setSaved(false);
    };

    // Guardar preferencias
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const success = await guardarPreferencias(preferenciasForm);
            if (success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
        } finally {
            setLoading(false);
        }
    };

    // Colores disponibles
    const coloresDisponibles = [
        'Blanco', 'Negro', 'Gris', 'Beige', 'Marrón', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Rosa', 'Púrpura', 'Naranja'
    ];

    if (loadingPreferencias) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <FaHeart className="text-amber-600 mr-3" />
                    Mis Preferencias de Cerámica
                </h2>
                <p className="text-gray-600">
                    Configura tus preferencias para recibir recomendaciones personalizadas de productos.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Categorías Favoritas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaLayerGroup className="mr-2" />
                        Categorías Favoritas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categorias.map(categoria => (
                            <label key={categoria.id_categoria} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferenciasForm.categorias_favoritas?.includes(categoria.id_categoria)}
                                    onChange={() => handleMultiSelect('categorias_favoritas', categoria.id_categoria)}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-gray-700">{categoria.nombre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Estilos Preferidos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaPalette className="mr-2" />
                        Estilos Preferidos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {estilos.map(estilo => (
                            <label key={estilo.id_estilo} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferenciasForm.estilos_preferidos?.includes(estilo.id_estilo)}
                                    onChange={() => handleMultiSelect('estilos_preferidos', estilo.id_estilo)}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-gray-700">{estilo.nombre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Materiales Favoritos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaLayerGroup className="mr-2" />
                        Materiales Favoritos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {materiales.map(material => (
                            <label key={material.id_material} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferenciasForm.materiales_favoritos?.includes(material.id_material)}
                                    onChange={() => handleMultiSelect('materiales_favoritos', material.id_material)}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-gray-700">{material.nombre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rango de Precios */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaDollarSign className="mr-2" />
                        Rango de Precios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio Mínimo
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={preferenciasForm.rango_precio_min || ''}
                                onChange={(e) => handleChange('rango_precio_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio Máximo
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={preferenciasForm.rango_precio_max || ''}
                                onChange={(e) => handleChange('rango_precio_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="999.99"
                            />
                        </div>
                    </div>
                </div>

                {/* Color Preferido */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <FaPalette className="mr-2" />
                        Color Preferido
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {coloresDisponibles.map(color => (
                            <label key={color} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="color_preferido"
                                    value={color}
                                    checked={preferenciasForm.color_preferido === color}
                                    onChange={(e) => handleChange('color_preferido', e.target.value)}
                                    className="border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-gray-700">{color}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Botón de Guardar */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-medium text-white flex items-center space-x-2 transition-colors ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Guardando...</span>
                            </>
                        ) : saved ? (
                            <>
                                <FaCheck className="text-green-400" />
                                <span>¡Guardado!</span>
                            </>
                        ) : (
                            <>
                                <FaSave />
                                <span>Guardar Preferencias</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Información adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">¿Cómo funcionan las recomendaciones?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Las categorías, estilos y materiales que selecciones se usarán para filtrar productos</li>
                    <li>• El rango de precios te ayudará a encontrar productos dentro de tu presupuesto</li>
                    <li>• El color preferido se considerará al mostrar productos similares</li>
                    <li>• También analizamos tu historial de navegación y compras para mejorar las recomendaciones</li>
                </ul>
            </div>
        </div>
    );
};

export default PreferenciasUsuario;
