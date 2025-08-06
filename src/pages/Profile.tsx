import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRelevanciaStats } from "../hooks/useRelevanciaStats";
import { supabase } from "../services/supabase";
import { Cog6ToothIcon, UserIcon, ChartBarIcon, StarIcon, EyeIcon, CogIcon, ClockIcon } from "@heroicons/react/24/solid";
import { useLocation, useNavigate } from 'react-router-dom';

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
    const { stats: relevanciaStats, loading: statsLoading } = useRelevanciaStats();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfigMenu, setShowConfigMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [lastOtpRequest, setLastOtpRequest] = useState<number>(0);

    // Cerrar menú cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showConfigMenu && !target.closest('.config-menu')) {
                setShowConfigMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showConfigMenu]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const edit = searchParams.get('edit');
        const access_token = searchParams.get('access_token');
        
        if (edit === 'true' && access_token) {
            setIsEditing(true);
        }

        if (user) {
            fetchProfile();
        }

        // Verificar si venimos de una actualización
        const profileUpdated = localStorage.getItem('profileUpdated');
        if (profileUpdated) {
            localStorage.removeItem('profileUpdated');
            fetchProfile(); // Recargar el perfil
        }
    }, [user, location.search]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .eq('uuid', user?.id)
                .single();

            if (error) throw error;

            setProfile(data);
            setEditedProfile(data);
        } catch (err) {
            console.error('Error al cargar el perfil:', err);
            setError('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = async () => {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(
                user?.email || '',
                { 
                    redirectTo: `${window.location.origin}/update-password`
                }
            );
            
            if (error) throw error;
            
            alert("Se ha enviado un correo de verificación. Por favor, verifica tu correo para actualizar tu perfil.");
        } catch (err) {
            console.error("Error al enviar correo de verificación:", err);
            setError("Error al enviar correo de verificación");
        }
    };

    const handleSaveChanges = async () => {
        if (!editedProfile || !user) return;

        try {
            const { error } = await supabase
                .from('clientes')
                .update({
                    nombre: editedProfile.nombre,
                    apellido: editedProfile.apellido,
                    telefono: editedProfile.telefono,
                    tipo_documento: editedProfile.tipo_documento,
                    numero_documento: editedProfile.numero_documento,
                    sector: editedProfile.sector,
                    detalles_direccion: editedProfile.detalles_direccion,
                    codigo_postal: editedProfile.codigo_postal,
                })
                .eq('uuid', user.id);

            if (error) throw error;
            
            setProfile(editedProfile);
            setIsEditing(false);
            alert("Perfil actualizado exitosamente");
            // Redirigir al perfil después de guardar
            navigate('/profile');
        } catch (err) {
            console.error("Error al actualizar perfil:", err);
            setError("Error al actualizar el perfil");
        }
    };

    const handlePasswordChange = async () => {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(
                user?.email || '',
                { 
                    redirectTo: `${window.location.origin}/update-password`
                }
            );
            
            if (error) throw error;
            
            alert("Se ha enviado un correo para cambiar tu contraseña. Por favor, revisa tu bandeja de entrada.");
        } catch (err) {
            console.error("Error al enviar correo de cambio de contraseña:", err);
            setError("Error al enviar correo de verificación");
        }
    };

    const handleProfileEdit = async () => {
        try {
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar el tiempo transcurrido desde la última solicitud
            const now = Date.now();
            const timeSinceLastRequest = now - lastOtpRequest;
            const MIN_TIME_BETWEEN_REQUESTS = 60000; // 60 segundos en milisegundos

            if (timeSinceLastRequest < MIN_TIME_BETWEEN_REQUESTS) {
                const secondsLeft = Math.ceil((MIN_TIME_BETWEEN_REQUESTS - timeSinceLastRequest) / 1000);
                alert(`Por favor espera ${secondsLeft} segundos antes de solicitar otro código.`);
                return;
            }

            // Actualizar el tiempo de la última solicitud
            setLastOtpRequest(now);

            const { data, error } = await supabase.auth.signInWithOtp({
                email: user.email || '',
                options: {
                    shouldCreateUser: false,
                    emailRedirectTo: `${window.location.origin}/edit-profile`,
                    data: {
                        type: 'profile_edit'
                    }
                }
            });
            
            if (error) throw error;
            
            alert("Se ha enviado un enlace a tu correo. Por favor, haz clic en el enlace para editar tu perfil.");
        } catch (err) {
            if (err instanceof Error && err.message.includes('security purposes')) {
                alert('Por favor espera un momento antes de solicitar otro código.');
            } else {
                console.error("Error al enviar correo de verificación:", err);
                setError("Error al enviar correo de verificación");
            }
        }
    };

    return (
        <div className="container mx-auto px-4 pt-32">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-amber-900">Perfil de Usuario</h1>
                    <div className="relative config-menu">
                        <button 
                            onClick={() => setShowConfigMenu(!showConfigMenu)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <Cog6ToothIcon className="h-6 w-6" />
                        </button>
                        
                        {showConfigMenu && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                {/* Sección de Perfil */}
                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Perfil</h3>
                                </div>
                                <button
                                    onClick={handlePasswordChange}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 border-b border-gray-100"
                                >
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Cambiar Contraseña
                                </button>
                                <button
                                    onClick={handleProfileEdit}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 border-b border-gray-200"
                                >
                                    <CogIcon className="h-4 w-4 mr-2" />
                                    Actualizar Datos
                                </button>
                                
                                {/* Sección de Relevancia */}
                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sistema de Relevancia</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/mi-historial')}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 border-b border-gray-100"
                                >
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Mi Historial
                                </button>
                                <button
                                    onClick={() => navigate('/recomendaciones')}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-100 border-b border-gray-100"
                                >
                                    <StarIcon className="h-4 w-4 mr-2" />
                                    Recomendaciones
                                </button>

                            </div>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <form className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                value={editedProfile?.nombre || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, nombre: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                            <input
                                type="text"
                                value={editedProfile?.apellido || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, apellido: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="text"
                                value={editedProfile?.telefono || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, telefono: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                            <input
                                type="text"
                                value={editedProfile?.tipo_documento || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, tipo_documento: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número de Documento</label>
                            <input
                                type="text"
                                value={editedProfile?.numero_documento || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, numero_documento: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sector</label>
                            <input
                                type="text"
                                value={editedProfile?.sector || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, sector: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input
                                type="text"
                                value={editedProfile?.detalles_direccion || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, detalles_direccion: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                            <input
                                type="text"
                                value={editedProfile?.codigo_postal || ''}
                                onChange={(e) => setEditedProfile(prev => prev ? {...prev, codigo_postal: e.target.value} : null)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                            />
                        </div>
                        
                        <div className="col-span-2 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
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
                ) : (
                    <div className="space-y-6">
                        {/* Display profile information */}
                        {profile && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-amber-900 border-b border-amber-200 pb-2">Información Personal</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <p><strong>Nombre:</strong> {profile.nombre}</p>
                                    <p><strong>Apellido:</strong> {profile.apellido}</p>
                                    <p><strong>Email:</strong> {profile.email}</p>
                                    <p><strong>Teléfono:</strong> {profile.telefono}</p>
                                    <p><strong>Documento:</strong> {profile.tipo_documento} - {profile.numero_documento}</p>
                                    <p><strong>Código Postal:</strong> {profile.codigo_postal}</p>
                                </div>
                                <p><strong>Dirección:</strong> {profile.detalles_direccion}, {profile.sector}</p>
                            </div>
                        )}

                        {/* Sistema de Relevancia */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                            <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                                <StarIcon className="h-5 w-5 mr-2" />
                                Sistema de Relevancia Personalizada
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Accede a tu experiencia personalizada basada en tu actividad y preferencias.
                            </p>
                            
                            {/* Estadísticas rápidas */}
                            {!statsLoading && relevanciaStats && (
                                <div className="mb-6 p-4 bg-white rounded-lg border border-amber-200">
                                    <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center">
                                        <ClockIcon className="h-4 w-4 mr-2" />
                                        Tu Actividad Reciente
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-amber-600">{relevanciaStats.total_vistas}</div>
                                            <div className="text-xs text-gray-600">Productos Vistos</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-amber-600">{relevanciaStats.total_busquedas}</div>
                                            <div className="text-xs text-gray-600">Búsquedas</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-amber-600">{relevanciaStats.total_clics}</div>
                                            <div className="text-xs text-gray-600">Clics</div>
                                        </div>
                                        <div>
                                            <div className={`text-2xl font-bold ${relevanciaStats.tiene_preferencias ? 'text-green-600' : 'text-gray-400'}`}>
                                                {relevanciaStats.tiene_preferencias ? '✓' : '✗'}
                                            </div>
                                            <div className="text-xs text-gray-600">Preferencias</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/mi-historial')}
                                    className="flex items-center justify-center p-3 bg-white rounded-lg border border-amber-300 hover:bg-amber-50 transition-colors"
                                >
                                    <EyeIcon className="h-5 w-5 mr-2 text-amber-600" />
                                    <span className="text-sm font-medium text-amber-900">Mi Historial</span>
                                </button>
                                <button
                                    onClick={() => navigate('/recomendaciones')}
                                    className="flex items-center justify-center p-3 bg-white rounded-lg border border-amber-300 hover:bg-amber-50 transition-colors"
                                >
                                    <StarIcon className="h-5 w-5 mr-2 text-amber-600" />
                                    <span className="text-sm font-medium text-amber-900">Recomendaciones</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}