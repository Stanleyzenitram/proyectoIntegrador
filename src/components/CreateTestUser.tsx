import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const CreateTestUser = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const createTestUser = async () => {
        setLoading(true);
        setMessage('');

        try {
            // Crear usuario en Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: 'test@ventaceramicas.com',
                password: 'Test123!',
                options: {
                    data: {
                        name: 'Usuario',
                        lastName: 'Prueba',
                        phoneNumber: '809-555-9999',
                        rol: 'admin',
                        cedula: '999-9999999-9'
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (!data.user) {
                throw new Error('No se pudo crear el usuario');
            }

            // Esperar un momento para asegurar que el usuario de auth esté completamente creado
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Insertar en la tabla usuarios
            const { error: empleadoError } = await supabase
                .from("usuarios")
                .insert([
                    {
                        uuid: data.user.id,
                        nombre: 'Usuario',
                        apellido: 'Prueba',
                        correo: 'test@ventaceramicas.com',
                        telefono: '809-555-9999',
                        rol: 'admin',
                        estado: true,
                        cedula: '999-9999999-9',
                    },
                ]);

            if (empleadoError) {
                throw empleadoError;
            }

            setMessage('✅ Usuario de prueba creado exitosamente!');
            setMessage(prev => prev + '\n\nCredenciales de acceso:');
            setMessage(prev => prev + '\nEmail: test@ventaceramicas.com');
            setMessage(prev => prev + '\nContraseña: Test123!');
            setMessage(prev => prev + '\n\n⚠️ IMPORTANTE: Revisa tu email para confirmar la cuenta antes de iniciar sesión.');

        } catch (error: any) {
            console.error('Error:', error);
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Crear Usuario de Prueba
                </h1>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-700 mb-2">Información del usuario:</h3>
                    <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Email: test@ventaceramicas.com</li>
                        <li>• Contraseña: Test123!</li>
                        <li>• Rol: Administrador</li>
                        <li>• Nombre: Usuario Prueba</li>
                    </ul>
                </div>

                <button
                    onClick={createTestUser}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
                >
                    {loading ? 'Creando usuario...' : 'Crear Usuario de Prueba'}
                </button>

                {message && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{message}</pre>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Ir al Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTestUser; 