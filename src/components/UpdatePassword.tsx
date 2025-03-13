import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export default function UpdatePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        
        e.preventDefault();
       
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
                
            });

            if (error) throw error;
            await supabase.auth.signOut();
            setMessage('Contraseña actualizada exitosamente. Por favor, inicia sesión con tu nueva contraseña.');
            setError('');
            // Redirigir al login después de 3 segundos
            setTimeout(() => navigate('/login'), 1000);
        } catch (err: any) {
            setError(err.message);
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2.5 flex-col items-center mx-auto shadow-lg p-5 mt-15 bg-gray-100 rounded-lg max-w-md">
            <h2 className="uppercase text-amber-900 font-medium text-2xl">
                Actualizar Contraseña
            </h2>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3.5 w-80">
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none"
                    placeholder="Nueva contraseña"
                    required
                    minLength={6}
                />

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none"
                    placeholder="Confirmar contraseña"
                    required
                    minLength={6}
                />

                <button
                    type="submit"
                    className="bg-amber-400 text-amber-900 font-medium text-2xl py-2 rounded-lg uppercase
                    hover:bg-amber-500 hover:cursor-pointer disabled:bg-amber-300"
                    disabled={loading}
                >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
            </form>

            {message && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded w-full text-center">
                    {message}
                </div>
            )}
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded w-full text-center">
                    {error}
                </div>
            )}
        </div>
    );
} 