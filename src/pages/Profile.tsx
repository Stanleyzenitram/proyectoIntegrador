import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";

interface UserProfile {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    tipo_documento: string;
    numero_documento: string;
    sector: string;
    detalles_direccion: string;
    codigo_postal: string;
}

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!user) return;

            try {
                setLoading(true);
                // Primero intentamos obtener el perfil de la tabla clientes
                const { data: clientData, error: clientError } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('uuid', user.id)
                    .single();

                if (clientError) {
                    // Si no encontramos en clientes, buscamos en usuarios
                    const { data: userData, error: userError } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('uuid', user.id)
                        .single();

                    if (userError) {
                        throw new Error('No se encontró el perfil del usuario');
                    }

                    setProfile({
                        nombre: userData.nombre,
                        apellido: userData.apellido,
                        email: userData.email,
                        telefono: userData.telefono || '',
                        tipo_documento: userData.tipo_documento || '',
                        numero_documento: userData.cedula || '',
                        sector: userData.sector || '',
                        detalles_direccion: userData.direccion || '',
                        codigo_postal: userData.codigo_postal || ''
                    });
                } else {
                    setProfile(clientData);
                }
            } catch (error) {
                console.error('Error obteniendo datos del usuario:', error);
                setError('Error al cargar el perfil del usuario');
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [user]);

    if (loading) return <div className="text-center pt-32">Cargando perfil...</div>;
    if (error) return <div className="text-center pt-32 text-red-600">{error}</div>;
    if (!profile) return <div className="text-center pt-32">No se encontró el perfil</div>;

    return (
        <div className="container mx-auto px-4 pt-32">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-amber-900 mb-6">Perfil de Usuario</h1>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-700">Nombre</h3>
                        <p className="text-gray-900">{profile.nombre} {profile.apellido}</p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-gray-700">Email</h3>
                        <p className="text-gray-900">{profile.email}</p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-gray-700">Teléfono</h3>
                        <p className="text-gray-900">{profile.telefono || 'No especificado'}</p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-gray-700">Documento</h3>
                        <p className="text-gray-900">
                            {profile.tipo_documento}: {profile.numero_documento}
                        </p>
                    </div>
                    
                    <div className="col-span-2">
                        <h3 className="font-semibold text-gray-700">Dirección</h3>
                        <p className="text-gray-900">
                            {profile.detalles_direccion}, {profile.sector}
                            {profile.codigo_postal && ` - CP: ${profile.codigo_postal}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
