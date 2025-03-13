import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface Cliente {
    id_cliente: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    sector: string;
    detalles_direccion: string;
}

export default function Clientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('*');

            if (error) throw error;
            setClientes(data || []);
        } catch (error) {
            console.error('Error cargando clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="pt-32 text-center">Cargando...</div>;

    return (
        <div className="container mx-auto px-4 pt-32">
            <h1 className="text-2xl font-bold text-amber-900 mb-6">Gestión de Clientes</h1>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-amber-500 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left">Nombre</th>
                            <th className="px-6 py-3 text-left">Email</th>
                            <th className="px-6 py-3 text-left">Teléfono</th>
                            <th className="px-6 py-3 text-left">Dirección</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {clientes.map((cliente) => (
                            <tr key={cliente.id_cliente}>
                                <td className="px-6 py-4">
                                    {cliente.nombre} {cliente.apellido}
                                </td>
                                <td className="px-6 py-4">{cliente.email}</td>
                                <td className="px-6 py-4">{cliente.telefono}</td>
                                <td className="px-6 py-4">
                                    {cliente.detalles_direccion}, {cliente.sector}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 