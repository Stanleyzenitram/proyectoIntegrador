import React, { useState } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
    const supabase = useSupabase();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [rnc, setRnc] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // 1. Crear el usuario en auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password
            });

            if (signUpError) {
                console.error('Error en signup:', signUpError);
                throw signUpError;
            }
            
            if (!data.user) {
                throw new Error('No se pudo crear el usuario');
            }

            console.log('Usuario creado:', data.user);

            // 2. Insertar en la tabla clientes
            const { error: insertError } = await supabase
                .from('clientes')
                .insert({
                    uuid: data.user.id,
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    rnc
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error detallado al insertar cliente:', insertError);
                // Si falla la inserción, eliminar el usuario creado
                await supabase.auth.admin.deleteUser(data.user.id);
                throw insertError;
            }

            alert("Registro exitoso. Por favor verifica tu correo electrónico.");
            navigate('/login');
        } catch (error) {
            console.error("Error detallado en el registro:", error);
            setError(error instanceof Error ? error.message : "Error al crear la cuenta");
        }
    };

    return (
        <div>
            {/* Renderiza el formulario de registro aquí */}
        </div>
    );
};

export default RegisterForm; 