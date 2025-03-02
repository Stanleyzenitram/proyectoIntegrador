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
    direccion: string;
    rnc: string;
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
                // Verificar el email guardado
                const pendingEmail = localStorage.getItem('editProfileEmail');
                const pendingEdit = localStorage.getItem('pendingProfileEdit');

                if (!pendingEdit || !pendingEmail) {
                    console.log('No hay edición pendiente');
                    navigate('/profile');
                    return;
                }

                // Obtener la sesión actual
                const { data: { session } } = await supabase.auth.getSession();

                // Verificar que el email coincida
                if (!session || session.user.email !== pendingEmail) {
                    console.log('Sesión inválida o email no coincide');
                    navigate('/profile');
                    return;
                }

                // Limpiar el estado pendiente
                localStorage.removeItem('pendingProfileEdit');
                localStorage.removeItem('editProfileEmail');

                // Cargar el perfil
                await fetchProfile();

            } catch (err) {
                console.error('Error de autenticación:', err);
                navigate('/profile');
            }
        };

        checkAuth();
    }, []);

    const fetchProfile = async () => {
        if (!user) {
            console.log('No hay usuario para cargar el perfil');
            return;
        }

        try {
            setLoading(true);
            console.log('Intentando cargar perfil para usuario:', user.id);
            
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .eq('uuid', user.id.toString())
                .single();

            if (error) {
                console.error('Error al cargar datos:', error);
                throw error;
            }

            console.log('Perfil cargado:', data);
            setEditedProfile(data);
        } catch (err) {
            console.error('Error al cargar el perfil:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!editedProfile || !user) {
            console.log('No hay perfil para guardar o usuario no autenticado', { editedProfile, user });
            return;
        }

        try {
            console.log('Perfil a actualizar:', editedProfile);
            
            const updateData = {
                nombre: editedProfile.nombre,
                apellido: editedProfile.apellido,
                telefono: editedProfile.telefono,
                direccion: editedProfile.direccion,
                rnc: editedProfile.rnc
            };

            console.log('Datos a enviar:', updateData);
            console.log('UUID del usuario:', user.id);

            const { data, error } = await supabase
                .from('clientes')
                .update(updateData)
                .eq('uuid', user.id.toString())
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
        }
    };

    return (
        <div className="container mx-auto px-4 pt-32">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-amber-900 mb-6">Editar Perfil</h1>
                
                {loading ? (
                    <div>Cargando...</div>
                ) : (
                    <form className="grid grid-cols-1 gap-6">
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
                            <label className="block text-sm font-medium text-orange-600">Dirección*</label>
                            <input
                                type="text"
                                value={editedProfile?.direccion || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, direccion: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-orange-600">RNC*</label>
                            <input
                                type="text"
                                value={editedProfile?.rnc || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, rnc: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveChanges}
                                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
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