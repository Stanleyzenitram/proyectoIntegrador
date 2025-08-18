import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faSave, faTimes, faSearch, faFilter, faUser, faHeart } from '@fortawesome/free-solid-svg-icons';

interface PreferenciaCliente {
    id: number;
    idclientes: number;
    categoria_color?: string;
    categoria_estilo?: string;
    categoria_precio?: string;
    categoria_material?: string;
    fecha_actualizacion: string;
    cliente?: {
        nombre: string;
        apellido: string;
        email: string;
    };
}

export default function AdminPreferenciasUso() {
    const [preferencias, setPreferencias] = useState<PreferenciaCliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<PreferenciaCliente>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState<string>('todas');

    useEffect(() => {
        cargarPreferencias();
    }, []);

    const cargarPreferencias = async () => {
        try {
            setLoading(true);
            
            // Obtener preferencias con información del cliente
            const { data, error } = await supabase
                .from('preferencias_categorias')
                .select(`
                    *,
                    cliente:clientes(nombre, apellido, email)
                `)
                .order('fecha_actualizacion', { ascending: false });

            if (error) throw error;
            setPreferencias(data || []);
        } catch (error) {
            console.error('Error cargando preferencias:', error);
        } finally {
            setLoading(false);
        }
    };

    const iniciarEdicion = (preferencia: PreferenciaCliente) => {
        setEditingId(preferencia.id);
        setEditForm({
            categoria_color: preferencia.categoria_color || '',
            categoria_estilo: preferencia.categoria_estilo || '',
            categoria_precio: preferencia.categoria_precio || '',
            categoria_material: preferencia.categoria_material || ''
        });
    };

    const cancelarEdicion = () => {
        setEditingId(null);
        setEditForm({});
    };

    const guardarEdicion = async () => {
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('preferencias_categorias')
                .update({
                    ...editForm,
                    fecha_actualizacion: new Date().toISOString()
                })
                .eq('id', editingId);

            if (error) throw error;

            await cargarPreferencias();
            setEditingId(null);
            setEditForm({});
        } catch (error) {
            console.error('Error guardando preferencias:', error);
            alert('Error al guardar las preferencias');
        }
    };

    const eliminarPreferencia = async (id: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar estas preferencias?')) return;

        try {
            const { error } = await supabase
                .from('preferencias_categorias')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await cargarPreferencias();
        } catch (error) {
            console.error('Error eliminando preferencias:', error);
            alert('Error al eliminar las preferencias');
        }
    };

    const obtenerNombreCategoria = (tipo: string, valor: string) => {
        const categorias = {
            color: {
                'neutros': 'Colores Neutros',
                'vibrantes': 'Colores Vibrantes',
                'terrosos': 'Colores Terrosos',
                'pasteles': 'Colores Pasteles',
                'metálicos': 'Colores Metálicos'
            },
            estilo: {
                'rustico': 'Estilo Rústico',
                'moderno': 'Estilo Moderno',
                'ejecutivo': 'Estilo Ejecutivo',
                'clasico': 'Estilo Clásico'
            },
            material: {
                'ceramica_natural': 'Cerámica Natural',
                'porcelanato': 'Porcelanato',
                'gres': 'Gres'
            },
            precio: {
                'bajo': 'Económico',
                'medio': 'Intermedio',
                'alto': 'Premium'
            }
        };

        return categorias[tipo as keyof typeof categorias]?.[valor as keyof typeof categorias[keyof typeof categorias]] || valor;
    };

    const preferenciasFiltradas = preferencias.filter(pref => {
        const cumpleBusqueda = !searchTerm || 
            pref.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pref.cliente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pref.cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const cumpleFiltro = filterCategoria === 'todas' || 
            pref[`categoria_${filterCategoria}` as keyof PreferenciaCliente];

        return cumpleBusqueda && cumpleFiltro;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">👥 Administración de Preferencias por Uso</h1>
            
            {/* Filtros y búsqueda */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🔍 Buscar Cliente
                        </label>
                        <input
                            type="text"
                            placeholder="Nombre, apellido o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🏷️ Filtrar por Categoría
                        </label>
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="w-full p-2 border rounded focus:border-amber-500 focus:outline-none"
                        >
                            <option value="todas">Todas las categorías</option>
                            <option value="color">Con preferencia de color</option>
                            <option value="estilo">Con preferencia de estilo</option>
                            <option value="material">Con preferencia de material</option>
                            <option value="precio">Con preferencia de precio</option>
                        </select>
                    </div>
                    
                    <div className="flex items-end">
                        <button
                            onClick={cargarPreferencias}
                            className="w-full bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
                        >
                            🔄 Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de preferencias */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Color
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estilo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Material
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Precio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Última Actualización
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {preferenciasFiltradas.map((preferencia) => (
                                <tr key={preferencia.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faUser} className="text-amber-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {preferencia.cliente?.nombre} {preferencia.cliente?.apellido}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {preferencia.cliente?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === preferencia.id ? (
                                            <select
                                                value={editForm.categoria_color || ''}
                                                onChange={(e) => setEditForm({...editForm, categoria_color: e.target.value})}
                                                className="p-1 border rounded text-sm"
                                            >
                                                <option value="">Sin preferencia</option>
                                                <option value="neutros">Colores Neutros</option>
                                                <option value="vibrantes">Colores Vibrantes</option>
                                                <option value="terrosos">Colores Terrosos</option>
                                                <option value="pasteles">Colores Pasteles</option>
                                                <option value="metálicos">Colores Metálicos</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                preferencia.categoria_color 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {preferencia.categoria_color 
                                                    ? obtenerNombreCategoria('color', preferencia.categoria_color)
                                                    : 'Sin preferencia'
                                                }
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === preferencia.id ? (
                                            <select
                                                value={editForm.categoria_estilo || ''}
                                                onChange={(e) => setEditForm({...editForm, categoria_estilo: e.target.value})}
                                                className="p-1 border rounded text-sm"
                                            >
                                                <option value="">Sin preferencia</option>
                                                <option value="rustico">Estilo Rústico</option>
                                                <option value="moderno">Estilo Moderno</option>
                                                <option value="ejecutivo">Estilo Ejecutivo</option>
                                                <option value="clasico">Estilo Clásico</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                preferencia.categoria_estilo 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {preferencia.categoria_estilo 
                                                    ? obtenerNombreCategoria('estilo', preferencia.categoria_estilo)
                                                    : 'Sin preferencia'
                                                }
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === preferencia.id ? (
                                            <select
                                                value={editForm.categoria_material || ''}
                                                onChange={(e) => setEditForm({...editForm, categoria_material: e.target.value})}
                                                className="p-1 border rounded text-sm"
                                            >
                                                <option value="">Sin preferencia</option>
                                                <option value="ceramica_natural">Cerámica Natural</option>
                                                <option value="porcelanato">Porcelanato</option>
                                                <option value="gres">Gres</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                preferencia.categoria_material 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {preferencia.categoria_material 
                                                    ? obtenerNombreCategoria('material', preferencia.categoria_material)
                                                    : 'Sin preferencia'
                                                }
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === preferencia.id ? (
                                            <select
                                                value={editForm.categoria_precio || ''}
                                                onChange={(e) => setEditForm({...editForm, categoria_precio: e.target.value})}
                                                className="p-1 border rounded text-sm"
                                            >
                                                <option value="">Sin preferencia</option>
                                                <option value="bajo">Económico</option>
                                                <option value="medio">Intermedio</option>
                                                <option value="alto">Premium</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                preferencia.categoria_precio 
                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {preferencia.categoria_precio 
                                                    ? obtenerNombreCategoria('precio', preferencia.categoria_precio)
                                                    : 'Sin preferencia'
                                                }
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(preferencia.fecha_actualizacion).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {editingId === preferencia.id ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={guardarEdicion}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Guardar"
                                                >
                                                    <FontAwesomeIcon icon={faSave} />
                                                </button>
                                                <button
                                                    onClick={cancelarEdicion}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Cancelar"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => iniciarEdicion(preferencia)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => eliminarPreferencia(preferencia.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {preferenciasFiltradas.length === 0 && (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={faHeart} className="text-gray-400 text-4xl mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron preferencias</h3>
                        <p className="text-gray-500">
                            {searchTerm || filterCategoria !== 'todas' 
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Los clientes aún no han configurado sus preferencias'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Estadísticas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faHeart} className="text-red-500 text-2xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Preferencias</p>
                            <p className="text-lg font-semibold text-gray-900">{preferencias.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faUser} className="text-blue-500 text-2xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Set(preferencias.map(p => p.idclientes)).size}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faFilter} className="text-green-500 text-2xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Con Filtros</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {preferencias.filter(p => 
                                    p.categoria_color || p.categoria_estilo || p.categoria_material || p.categoria_precio
                                ).length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faEdit} className="text-amber-500 text-2xl" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Última Edición</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {preferencias.length > 0 
                                    ? new Date(preferencias[0].fecha_actualizacion).toLocaleDateString('es-ES')
                                    : 'N/A'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
