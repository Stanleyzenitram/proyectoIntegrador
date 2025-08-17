import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faSave, faCheck, faHome, faDollarSign, faTags, faPalette, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { 
    CATEGORIAS_COLORES, 
    CATEGORIAS_ESTILOS, 
    CATEGORIAS_PRECIO, 
    CATEGORIAS_MATERIALES,
    PreferenciasCategorizadas,
    obtenerNombreCategoria
} from '../utils/preferenciasCategorias';
import { useRecomendacionesCategorias } from '../hooks/useRecomendacionesCategorias';

interface PreferenciaCompleta {
    idClientes: number;
    // Nuevas categorías simplificadas
    categoria_color?: string;
    categoria_estilo?: string; 
    categoria_precio?: string;
    categoria_material?: string;
    // Campos legacy (mantener para compatibilidad)
    categorias_favoritas?: number[];
    materiales_favoritos?: number[];
    estilos_favoridos?: number[];
    colores_preferidos?: string[];
    rango_precio?: string;
    precMin?: number;
    precMax?: number;
    usoEspecifico?: string;
}

export default function Preferencias() {
    const { user } = useAuth();
    const { 
        preferencias: preferenciasCategorias, 
        guardarPreferencias, 
        loadingPreferencias,
        cargarPreferencias 
    } = useRecomendacionesCategorias();
    
    const [preferencias, setPreferencias] = useState<PreferenciaCompleta>({
        idClientes: 0,
        categoria_color: '',
        categoria_estilo: '',
        categoria_precio: '',
        categoria_material: '',
        // Legacy fields (inicializar como arrays vacíos para compatibilidad)
        categorias_favoritas: [],
        materiales_favoritos: [],
        estilos_favoridos: [],
        colores_preferidos: [],
        rango_precio: '',
        precMin: 0,
        precMax: 15000,
        usoEspecifico: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    // Variables de estado mínimas (mantenemos algunas para compatibilidad legacy si es necesario)

    // Sincronizar con preferencias del hook
    useEffect(() => {
        if (preferenciasCategorias) {
            setPreferencias(prev => ({
                ...prev,
                idClientes: preferenciasCategorias.idclientes, // Nota: viene de BD en minúscula
                categoria_color: preferenciasCategorias.categoria_color || '',
                categoria_estilo: preferenciasCategorias.categoria_estilo || '',
                categoria_precio: preferenciasCategorias.categoria_precio || '',
                categoria_material: preferenciasCategorias.categoria_material || ''
            }));
        }
    }, [preferenciasCategorias]);

    useEffect(() => {
        if (user) {
            fetchPreferencias();
        }
    }, [user]);

    const fetchPreferencias = async () => {
        try {
            setLoading(true);

            const { data: clienteData } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user?.id)
                .single();

            if (!clienteData) return;

            // Cargar preferencias existentes o establecer ID de cliente
            await cargarPreferenciasExistentes(clienteData.id_cliente);
        } catch (error) {
            console.error('Error al cargar preferencias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validaciones básicas
            if (!preferencias.categoria_color && !preferencias.categoria_estilo && 
                !preferencias.categoria_material && !preferencias.categoria_precio) {
                alert('Por favor selecciona al menos una preferencia');
                return;
            }

            // Preparar los datos para guardar
            const datosPreferencias: PreferenciasCategorizadas = {
                idclientes: preferencias.idClientes, // Convertir a minúscula para BD
                categoria_color: preferencias.categoria_color || undefined,
                categoria_estilo: preferencias.categoria_estilo || undefined,
                categoria_precio: preferencias.categoria_precio || undefined,
                categoria_material: preferencias.categoria_material || undefined,
                fecha_actualizacion: new Date().toISOString()
            };

            // Usar el hook para guardar
            const exito = await guardarPreferencias(datosPreferencias);

            if (exito) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                alert('Error al guardar las preferencias. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            alert('Error al guardar las preferencias. Por favor intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    // Función para cargar preferencias existentes del cliente
    const cargarPreferenciasExistentes = async (clienteId: number) => {
        try {
            // Primero intentar cargar de la nueva tabla de categorías
            const { data: preferenciasCategorizadas, error: errorCategorias } = await supabase
                .from('preferencias_categorias')
                .select('*')
                .eq('idClientes', clienteId)
                .single();

            if (preferenciasCategorizadas && !errorCategorias) {
                // Cargar preferencias de la nueva estructura
                setPreferencias({
                    idClientes: clienteId,
                    categoria_color: preferenciasCategorizadas.categoria_color || '',
                    categoria_estilo: preferenciasCategorizadas.categoria_estilo || '',
                    categoria_precio: preferenciasCategorizadas.categoria_precio || '',
                    categoria_material: preferenciasCategorizadas.categoria_material || '',
                    // Mantener campos legacy vacíos
                    categorias_favoritas: [],
                    materiales_favoritos: [],
                    estilos_favoridos: [],
                    colores_preferidos: [],
                    rango_precio: '',
                    precMin: 0,
                    precMax: 15000,
                    usoEspecifico: ''
                });
            } else {
                // Si no hay preferencias en la nueva tabla, verificar la tabla legacy
                const { data: preferenciasLegacy, error: errorLegacy } = await supabase
                    .from('preferencias')
                    .select('*')
                    .eq('idClientes', clienteId)
                    .single();

                if (preferenciasLegacy && !errorLegacy) {
                    // Migrar automáticamente desde formato legacy si existe
                    setPreferencias({
                        idClientes: clienteId,
                        categoria_color: '',
                        categoria_estilo: '',
                        categoria_precio: preferenciasLegacy.rango_precio || '',
                        categoria_material: '',
                        // Mantener datos legacy para referencia
                        categorias_favoritas: preferenciasLegacy.categorias_favoritas ? JSON.parse(preferenciasLegacy.categorias_favoritas) : [],
                        materiales_favoritos: preferenciasLegacy.materiales_favoritos ? JSON.parse(preferenciasLegacy.materiales_favoritos) : [],
                        estilos_favoridos: preferenciasLegacy.estilos_favoridos ? JSON.parse(preferenciasLegacy.estilos_favoridos) : [],
                        colores_preferidos: preferenciasLegacy.colores_preferidos ? JSON.parse(preferenciasLegacy.colores_preferidos) : [],
                        rango_precio: preferenciasLegacy.rango_precio || '',
                        precMin: preferenciasLegacy.precMin || 0,
                        precMax: preferenciasLegacy.precMax || 15000,
                        usoEspecifico: preferenciasLegacy.usoEspecifico || ''
                    });
                } else {
                    // Si no hay preferencias existentes en ninguna tabla, inicializar con ID del cliente
                    setPreferencias(prev => ({
                        ...prev,
                        idClientes: clienteId
                    }));
                }
            }
        } catch (error) {
            console.error('Error al cargar preferencias existentes:', error);
            // En caso de error, solo establecer el ID del cliente
            setPreferencias(prev => ({
                ...prev,
                idClientes: clienteId
            }));
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
        <div className="min-h-screen bg-gray-50 pt-3">
            <div className="container mx-auto px-4 py-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header principal */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center mb-2">
                            <FontAwesomeIcon icon={faHeart} className="text-amber-500 text-2xl mr-3" />
                            <h1 className="text-2xl font-bold text-gray-800">Mis Preferencias de Cerámicas</h1>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Configura tus preferencias para obtener recomendaciones personalizadas según tu proyecto y presupuesto.
                        </p>
                    </div>

                    {/* Contenido principal: formulario + resumen */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Formulario de preferencias */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Sección: Preferencia de Colores */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faPalette} className="mr-2 text-amber-500" />
                                        Preferencia de Colores
                                    </h3>
                                    <p className="text-sm text-gray-600">Elige el tipo de colores que más te gustan</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {CATEGORIAS_COLORES.map((categoria) => (
                                        <label 
                                            key={categoria.id} 
                                            className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                preferencias.categoria_color === categoria.id 
                                                    ? 'border-amber-500 bg-amber-50' 
                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="categoria_color"
                                                value={categoria.id}
                                                checked={preferencias.categoria_color === categoria.id}
                                                onChange={(e) => {
                                                    setPreferencias({...preferencias, categoria_color: e.target.value});
                                                }}
                                                className="sr-only"
                                            />
                                            <span className="text-base font-semibold text-gray-800 mb-1">{categoria.nombre}</span>
                                            <span className="text-sm text-gray-600">{categoria.descripcion}</span>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Incluye: {(categoria.mapeo.valores as string[])?.join(', ')}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferencias({...preferencias, categoria_color: ''})}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Limpiar selección
                                    </button>
                                </div>
                            </div>

                            {/* Sección: Preferencia de Estilos */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faHome} className="mr-2 text-amber-500" />
                                        Estilo Decorativo
                                    </h3>
                                    <p className="text-sm text-gray-600">Selecciona el estilo que mejor refleje tu personalidad</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {CATEGORIAS_ESTILOS.map((categoria) => (
                                        <label 
                                            key={categoria.id} 
                                            className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                preferencias.categoria_estilo === categoria.id 
                                                    ? 'border-amber-500 bg-amber-50' 
                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="categoria_estilo"
                                                value={categoria.id}
                                                checked={preferencias.categoria_estilo === categoria.id}
                                                onChange={(e) => {
                                                    setPreferencias({...preferencias, categoria_estilo: e.target.value});
                                                }}
                                                className="sr-only"
                                            />
                                            <span className="text-base font-semibold text-gray-800 mb-1">{categoria.nombre}</span>
                                            <span className="text-sm text-gray-600">{categoria.descripcion}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferencias({...preferencias, categoria_estilo: ''})}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Limpiar selección
                                    </button>
                                </div>
                            </div>

                            {/* Sección: Preferencia de Materiales */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-amber-500" />
                                        Tipo de Material
                                    </h3>
                                    <p className="text-sm text-gray-600">Elige el tipo de material que prefieres</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {CATEGORIAS_MATERIALES.map((categoria) => (
                                        <label 
                                            key={categoria.id} 
                                            className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                preferencias.categoria_material === categoria.id 
                                                    ? 'border-amber-500 bg-amber-50' 
                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="categoria_material"
                                                value={categoria.id}
                                                checked={preferencias.categoria_material === categoria.id}
                                                onChange={(e) => {
                                                    setPreferencias({...preferencias, categoria_material: e.target.value});
                                                }}
                                                className="sr-only"
                                            />
                                            <span className="text-base font-semibold text-gray-800 mb-1">{categoria.nombre}</span>
                                            <span className="text-sm text-gray-600">{categoria.descripcion}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferencias({...preferencias, categoria_material: ''})}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Limpiar selección
                                    </button>
                                </div>
                            </div>

                            {/* Sección: Rango de Precio */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-amber-500" />
                                        Rango de Presupuesto
                                    </h3>
                                    <p className="text-sm text-gray-600">Selecciona el rango de precio que mejor se adapte a tu presupuesto</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {CATEGORIAS_PRECIO.map((categoria) => (
                                        <label 
                                            key={categoria.id} 
                                            className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                preferencias.categoria_precio === categoria.id 
                                                    ? 'border-amber-500 bg-amber-50' 
                                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="categoria_precio"
                                                value={categoria.id}
                                                checked={preferencias.categoria_precio === categoria.id}
                                                onChange={(e) => {
                                                    setPreferencias({...preferencias, categoria_precio: e.target.value});
                                                }}
                                                className="sr-only"
                                            />
                                            <span className="text-base font-semibold text-gray-800 mb-1">{categoria.nombre}</span>
                                            <span className="text-sm text-gray-600 mb-2">{categoria.descripcion}</span>
                                            {categoria.mapeo.rango && (
                                                <span className="text-xs font-medium text-amber-600">
                                                    RD$ {categoria.mapeo.rango.min.toLocaleString()} - RD$ {categoria.mapeo.rango.max === 999999 ? '15,000+' : categoria.mapeo.rango.max.toLocaleString()}
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferencias({...preferencias, categoria_precio: ''})}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Limpiar selección
                                    </button>
                                </div>
                            </div>

                            {/* Información útil */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faHeart} className="mr-2" />
                                        ¿Cómo funcionan las nuevas recomendaciones?
                                    </h4>
                                    <ul className="text-sm text-amber-700 space-y-1">
                                        <li>• <strong>Colores:</strong> Filtramos por familias de colores (cálidos, fríos, neutros) para encontrar productos que coincidan con tu estilo</li>
                                        <li>• <strong>Estilos:</strong> Mostramos productos que se adapten a tu preferencia decorativa (rústico, moderno, ejecutivo, clásico)</li>
                                        <li>• <strong>Materiales:</strong> Priorizamos el tipo de material que prefieres (cerámica natural, porcelanato, gres)</li>
                                        <li>• <strong>Presupuesto:</strong> Solo te sugerimos productos dentro de tu rango de precio seleccionado</li>
                                    </ul>
                                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-xs text-blue-700 font-medium">
                                            🎯 <strong>Ventaja:</strong> Ahora puedes seleccionar una sola categoría por tipo, lo que hace más fácil encontrar productos perfectos para ti.
                                        </p>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-3 font-medium">
                                        💡 Consejo: No es necesario seleccionar todas las categorías. Puedes elegir solo las que más te importen para tu proyecto.
                                    </p>
                                </div>
                            </div>

                            {/* Botón guardar (solo en móviles) */}
                            <div className="lg:hidden">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-semibold text-white transition-colors text-sm cursor-pointer ${
                                        saving 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : saved 
                                                ? 'bg-green-600 hover:bg-green-700' 
                                                : 'bg-amber-600 hover:bg-amber-700'
                                    }`}
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

                        {/* Resumen lateral */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Preferencias</h3>
                                    <div className="space-y-4 text-sm">
                                        
                                        <div>
                                            <span className="text-gray-500 block mb-1">Preferencia de Colores</span>
                                            <span className="font-medium text-gray-800 text-xs">
                                                {preferencias.categoria_color 
                                                    ? obtenerNombreCategoria('color', preferencias.categoria_color)
                                                    : 'Sin seleccionar'
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-gray-500 block mb-1">Estilo Decorativo</span>
                                            <span className="font-medium text-gray-800 text-xs">
                                                {preferencias.categoria_estilo 
                                                    ? obtenerNombreCategoria('estilo', preferencias.categoria_estilo)
                                                    : 'Sin seleccionar'
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-gray-500 block mb-1">Tipo de Material</span>
                                            <span className="font-medium text-gray-800 text-xs">
                                                {preferencias.categoria_material 
                                                    ? obtenerNombreCategoria('material', preferencias.categoria_material)
                                                    : 'Sin seleccionar'
                                                }
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-gray-500 block mb-1">Rango de Presupuesto</span>
                                            <span className="font-medium text-gray-800 text-xs">
                                                {preferencias.categoria_precio 
                                                    ? obtenerNombreCategoria('precio', preferencias.categoria_precio)
                                                    : 'Sin seleccionar'
                                                }
                                            </span>
                                            {preferencias.categoria_precio && (
                                                <div className="mt-1 text-xs text-amber-600">
                                                    {(() => {
                                                        const categoria = CATEGORIAS_PRECIO.find(c => c.id === preferencias.categoria_precio);
                                                        if (categoria?.mapeo.rango) {
                                                            return `RD$ ${categoria.mapeo.rango.min.toLocaleString()} - RD$ ${categoria.mapeo.rango.max === 999999 ? '15,000+' : categoria.mapeo.rango.max.toLocaleString()}`;
                                                        }
                                                        return '';
                                                    })()}
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={`w-full mt-6 flex justify-center items-center px-6 py-3 rounded-lg font-semibold text-white transition-colors text-sm cursor-pointer ${
                                            saving 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : saved 
                                                    ? 'bg-green-600 hover:bg-green-700' 
                                                    : 'bg-amber-600 hover:bg-amber-700'
                                        }`}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
