import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faSave, faCheck, faHome, faDollarSign } from '@fortawesome/free-solid-svg-icons';

interface Preferencia {
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
        idEstilo: 0,
        color: '',
        idMaterial: 0,
        idCategoria: 0,
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

    // Opciones predefinidas para los combo boxes
    const coloresPredefinidos = [
        'Blanco', 'Negro', 'Gris', 'Beige', 'Marrón', 'Rojo', 'Azul', 'Verde', 
        'Amarillo', 'Naranja', 'Púrpura', 'Rosa', 'Multicolor', 'Natural'
    ];

    const superficiesPredefinidas = [
        'Mate', 'Brillante', 'Semi-brillante', 'Texturizada', 'Lisa', 'Rústica', 
        'Pulida', 'Antideslizante', 'Decorativa'
    ];

    const rangosPrecio = [
        { label: 'Económico (RD$ 0 - 500)', min: 0, max: 500 },
        { label: 'Accesible (RD$ 500 - 1,500)', min: 500, max: 1500 },
        { label: 'Medio (RD$ 1,500 - 3,000)', min: 1500, max: 3000 },
        { label: 'Alto (RD$ 3,000 - 5,000)', min: 3000, max: 5000 },
        { label: 'Premium (RD$ 5,000 - 10,000)', min: 5000, max: 10000 },
        { label: 'Lujo (RD$ 10,000+)', min: 10000, max: 50000 }
    ];

    const nivelesDurabilidad = [
        { valor: 0, label: 'Seleccionar Durabilidad' },
        { valor: 1, label: 'Baja - PEI 1' },
        { valor: 2, label: 'Ligera - PEI 2' },
        { valor: 3, label: 'Moderada - PEI 3' },
        { valor: 4, label: 'Alta - PEI 4' },
        { valor: 5, label: 'Muy Alta - PEI 5' }
    ];

    useEffect(() => {
        if (user) {
            fetchPreferencias();
            fetchOpciones();
        }
    }, [user]);

    const fetchOpciones = async () => {
        try {
            const { data: catData } = await supabase
                .from('categorias')
                .select('id_categoria, nombre_categoria');
            if (catData) setCategorias(catData);

            const { data: matData } = await supabase
                .from('materiales')
                .select('id_materiales, nombre_materiales');
            if (matData) setMateriales(matData);

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

            const { data: clienteData } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user?.id)
                .single();

            if (!clienteData) return;

            const nuevasPreferencias = {
                ...preferencias,
                idClientes: clienteData.id_cliente
            };
            setPreferencias(nuevasPreferencias);
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
            if (!preferencias.usoEspecifico) {
                alert('Por favor selecciona un uso específico');
                return;
            }

            // 1️⃣ Guardar en `preferenciasProd`
            const datosPreferencias = {
                idClientes: preferencias.idClientes,
                idEstilo: preferencias.idEstilo,
                color: preferencias.color,
                idMaterial: preferencias.idMaterial,
                idCategoria: preferencias.idCategoria,
                durabilidad: preferencias.durabilidad,
                superficie: preferencias.superficie,
                enTendencia: preferencias.enTendencia,
                precMin: preferencias.precMin,
                precMax: preferencias.precMax,
            };

            const { data: prefInsertada, error: errorPref } = await supabase
                .from('preferenciasProd')
                .insert([datosPreferencias])
                .select('id')
                .single();

            if (errorPref) throw errorPref;

            // 2️⃣ Obtener o crear el uso
            let usoId;
            const { data: usoExistente } = await supabase
                .from('uso')
                .select('id')
                .eq('nombre', preferencias.usoEspecifico)
                .single();

            if (usoExistente) {
                usoId = usoExistente.id;
            } else {
                const { data: usoNuevo, error: errorUsoNuevo } = await supabase
                    .from('uso')
                    .insert([{ nombre: preferencias.usoEspecifico }])
                    .select('id')
                    .single();
                if (errorUsoNuevo) throw errorUsoNuevo;
                usoId = usoNuevo.id;
            }

            // 3️⃣ Insertar en `usoXpref`
            const { error: errorRelacion } = await supabase
                .from('usoXpref')
                .insert([{
                    idUso: usoId,
                    idPref: prefInsertada.id
                }]);

            if (errorRelacion) throw errorRelacion;

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error al guardar preferencias por uso:', error);
            alert('Error al guardar las preferencias');
        } finally {
            setSaving(false);
        }
    };

    const handleRangoPrecioChange = (rango: { min: number, max: number }) => {
        setPreferencias({
            ...preferencias,
            precMin: rango.min,
            precMax: rango.max
        });
    };

    // Función para cargar preferencias por uso
    const cargarPreferenciasPorUso = async (usoSeleccionado: string) => {
        if (!usoSeleccionado || !preferencias.idClientes) return;
        
        try {
            // Primero obtener el ID del uso
            const { data: usoData, error: errorUso } = await supabase
                .from('uso')
                .select('id')
                .eq('nombre', usoSeleccionado)
                .single();
                
            if (errorUso || !usoData) {
                console.log('No se encontró el uso:', usoSeleccionado);
                return;
            }
            
            // Ahora buscar en usoXpref usando el idUso y luego verificar que la preferencia pertenezca al cliente
            const { data: usoXprefData, error: errorUsoXpref } = await supabase
                .from('usoXpref')
                .select(`
                    idPref,
                    preferenciasProd (
                        idClientes,
                        idEstilo,
                        color,
                        idMaterial,
                        idCategoria,
                        durabilidad,
                        superficie,
                        enTendencia,
                        precMin,
                        precMax
                    )
                `)
                .eq('idUso', usoData.id);
            
            if (errorUsoXpref) {
                console.error('Error al buscar en usoXpref:', errorUsoXpref);
                return;
            }
            
            // Filtrar solo las preferencias del cliente actual
            const preferenciasCliente = usoXprefData?.filter(item => 
                item.preferenciasProd && Array.isArray(item.preferenciasProd) && 
                item.preferenciasProd.length > 0 && 
                item.preferenciasProd[0].idClientes === preferencias.idClientes
            );
            
            console.log('Datos encontrados:', preferenciasCliente);
            
            if (preferenciasCliente && preferenciasCliente.length > 0) {
                // Cargar la primera preferencia encontrada
                const pref = preferenciasCliente[0].preferenciasProd[0];
                if (pref) {
                    setPreferencias({
                        ...preferencias,
                        idEstilo: pref.idEstilo || 0,
                        color: pref.color || '',
                        idMaterial: pref.idMaterial || 0,
                        idCategoria: pref.idCategoria || 0,
                        durabilidad: pref.durabilidad || 0,
                        superficie: pref.superficie || '',
                        enTendencia: pref.enTendencia || false,
                        precMin: pref.precMin || 0,
                        precMax: pref.precMax || 10000
                    });
                }
            } else {
                // Limpiar el formulario si no hay preferencias para ese uso
                setPreferencias({
                    ...preferencias,
                    idEstilo: 0,
                    color: '',
                    idMaterial: 0,
                    idCategoria: 0,
                    durabilidad: 0,
                    superficie: '',
                    enTendencia: false,
                    precMin: 0,
                    precMax: 10000
                });
            }
        } catch (error) {
            console.error('Error al cargar preferencias por uso:', error);
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
                        <div className="flex items-center mb-6">
                            <FontAwesomeIcon icon={faHeart} className="text-amber-500 text-2xl mr-3" />
                            <h1 className="text-2xl font-bold text-gray-800">Mis Preferencias de Cerámicas</h1>
                        </div>

                        <p className="text-gray-600 mb-6 text-sm">
                            Configura tus preferencias específicas para recibir recomendaciones personalizadas de cerámicas que se adapten a tu proyecto.
                        </p>

                        {/* Formulario de preferencias */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Uso específico */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faHome} className="mr-2 text-amber-500" />
                                    Uso específico
                                </label>
                                <select
                                    value={preferencias.usoEspecifico || ''}
                                    onChange={(e) => {
                                        const usoSeleccionado = e.target.value;
                                        setPreferencias({...preferencias, usoEspecifico: usoSeleccionado});
                                        if (usoSeleccionado) {
                                            cargarPreferenciasPorUso(usoSeleccionado);
                                        }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
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
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
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
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
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
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="">Seleccionar estilo</option>
                                    {estilos.map((est) => (
                                        <option key={est.id_estilo} value={est.id_estilo}>
                                            {est.nombre_estilo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color preferido
                                </label>
                                <select
                                    value={preferencias.color || ''}
                                    onChange={(e) => setPreferencias({...preferencias, color: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="">Seleccionar color</option>
                                    {coloresPredefinidos.map((color) => (
                                        <option key={color} value={color}>
                                            {color}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Durabilidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nivel de durabilidad
                                </label>
                                <select
                                    value={preferencias.durabilidad || 0}
                                    onChange={(e) => setPreferencias({...preferencias, durabilidad: Number(e.target.value)})}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    {nivelesDurabilidad.map((nivel) => (
                                        <option key={nivel.valor} value={nivel.valor}>
                                            {nivel.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Superficie */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Superficie preferida
                                </label>
                                <select
                                    value={preferencias.superficie || ''}
                                    onChange={(e) => setPreferencias({...preferencias, superficie: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="">Seleccionar superficie</option>
                                    {superficiesPredefinidas.map((superficie) => (
                                        <option key={superficie} value={superficie}>
                                            {superficie}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* En tendencia */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ¿Te gustan las tendencias?
                                </label>
                                <select
                                    value={preferencias.enTendencia ? 'true' : 'false'}
                                    onChange={(e) => setPreferencias({...preferencias, enTendencia: e.target.value === 'true'})}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="false">No</option>
                                    <option value="true">Sí</option>
                                </select>
                            </div>

                            {/* Rango de precio */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-amber-500" />
                                    Rango de precio preferido
                                </label>
                                <select
                                    value={`${preferencias.precMin}-${preferencias.precMax}`}
                                    onChange={(e) => {
                                        const [min, max] = e.target.value.split('-').map(Number);
                                        handleRangoPrecioChange({ min, max });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm cursor-pointer"
                                >
                                    <option value="">Seleccionar rango de precio</option>
                                    {rangosPrecio.map((rango, index) => (
                                        <option key={index} value={`${rango.min}-${rango.max}`}>
                                            {rango.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center px-6 py-2 rounded-lg font-semibold text-white transition-colors text-sm cursor-pointer ${
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
                </div>
            </div>
        </div>
    );
}
