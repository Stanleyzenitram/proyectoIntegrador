import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export default function PasswordReset() {
  console.log("PasswordReset component rendered");
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setMessage('Revisa tu correo para las instrucciones de recuperación');
      setError('');
      setTimeout(() => navigate('/login'), 5000);
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
        Recuperar Contraseña
      </h2>

      <form onSubmit={handlePasswordReset} className="flex flex-col gap-3.5 w-80">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none"
          placeholder="Correo electrónico"
          required
          autoComplete="email"
        />

        <button
          type="submit"
          className="bg-amber-400 text-amber-900 font-medium text-2xl py-2 rounded-lg uppercase
          hover:bg-amber-500 hover:cursor-pointer disabled:bg-amber-300"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Instrucciones'}
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

      <button
        onClick={() => navigate('/login')}
        className="text-amber-900 text-sm hover:text-amber-700 mt-4"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
} 