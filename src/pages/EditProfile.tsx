import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { useNavigate, useLocation } from 'react-router-dom';

interface UserProfile {
    uuid: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    tipo_documento: string;
    numero_documento: string;
    sector: string;
    detalles_direccion: string;
    codigo_postal: string;
    fecha_registro: string;
}

export default function EditProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Obtener la sesión actual
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Error al obtener la sesión:', sessionError);
                    navigate('/profile');
                    return;
                }

                if (!session) {
                    console.log('No hay sesión activa');
                    navigate('/profile');
                    return;
                }

                // Cargar el perfil
                const { data: profileData, error: profileError } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('uuid', session.user.id)
                    .single();

                if (profileError) {
                    console.error('Error al cargar el perfil:', profileError);
                    setError('Error al cargar el perfil');
                    return;
                }

                if (!profileData) {
                    console.error('No se encontró el perfil');
                    setError('No se encontró el perfil');
                    return;
                }

                console.log('Perfil cargado:', profileData);
                setEditedProfile(profileData);
                setLoading(false);

            } catch (err) {
                console.error('Error de autenticación:', err);
                setError('Error al cargar el perfil');
                navigate('/profile');
            }
        };

        checkAuth();
    }, [navigate]);

    const handleSaveChanges = async () => {
        if (!editedProfile) {
            console.log('No hay perfil para guardar');
            return;
        }

        try {
            setLoading(true);
            console.log('Perfil a actualizar:', editedProfile);
            
            const updateData = {
                nombre: editedProfile.nombre,
                apellido: editedProfile.apellido,
                telefono: editedProfile.telefono,
                tipo_documento: editedProfile.tipo_documento,
                numero_documento: editedProfile.numero_documento,
                sector: editedProfile.sector,
                detalles_direccion: editedProfile.detalles_direccion,
                codigo_postal: editedProfile.codigo_postal
            };

            // Obtener la sesión actual
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                throw new Error('No hay sesión activa');
            }

            console.log('Datos a enviar:', updateData);
            console.log('UUID del usuario:', session.user.id);

            const { data, error } = await supabase
                .from('clientes')
                .update(updateData)
                .eq('uuid', session.user.id)
                .select('*');

            if (error) {
                console.error('Error de Supabase:', error);
                throw error;
            }

            console.log('Respuesta de Supabase:', data);
            
            if (data && data.length > 0) {
                setEditedProfile(data[0]);
                alert("Perfil actualizado exitosamente");
                localStorage.setItem('profileUpdated', 'true');
                navigate('/profile');
            } else {
                throw new Error('No se recibieron datos actualizados');
            }
        } catch (err) {
            console.error("Error detallado al actualizar perfil:", err);
            setError(err instanceof Error ? err.message : "Error al actualizar el perfil");
            alert("Error al actualizar el perfil. Por favor, intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 pt-32">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-amber-900 mb-6">Editar Perfil</h1>
                
                {loading ? (
                    <div>Cargando...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveChanges();
                    }} className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Nombre*</label>
                            <input
                                type="text"
                                value={editedProfile?.nombre || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, nombre: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Apellido*</label>
                            <input
                                type="text"
                                value={editedProfile?.apellido || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, apellido: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Teléfono*</label>
                            <input
                                type="tel"
                                value={editedProfile?.telefono || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, telefono: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Tipo de Documento*</label>
                            <input
                                type="text"
                                value={editedProfile?.tipo_documento || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, tipo_documento: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Número de Documento*</label>
                            <input
                                type="text"
                                value={editedProfile?.numero_documento || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, numero_documento: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Sector*</label>
                            <input
                                type="text"
                                value={editedProfile?.sector || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, sector: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Detalles de Dirección*</label>
                            <input
                                type="text"
                                value={editedProfile?.detalles_direccion || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, detalles_direccion: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">Código Postal*</label>
                            <input
                                type="text"
                                value={editedProfile?.codigo_postal || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, codigo_postal: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 