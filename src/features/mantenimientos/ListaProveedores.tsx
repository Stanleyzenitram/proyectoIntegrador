import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Phone, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Proveedor {
    id_proveedor: number;
    nombre_proveedor: string;
    telefono: string;
    correo: string;
    direccion: string;
    contacto: string;
}

export default function ListaProveedores() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('proveedores')
                .select('*')
                .order('nombre_proveedor', { ascending: true });

            if (error) throw error;
            setProveedores(data || []);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            alert('Error al cargar la lista de proveedores');
        } finally {
            setLoading(false);
        }
    };

    const handleProveedorClick = (proveedor: Proveedor) => {
        setSelectedProveedor(proveedor);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center">
                <button 
                    onClick={() => navigate('/inventario')}
                    className="flex items-center text-amber-600 hover:text-amber-700"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al Inventario
                </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Lista de Proveedores</h1>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando proveedores...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proveedores.map((proveedor) => (
                        <div
                            key={proveedor.id_proveedor}
                            className={`p-6 rounded-lg shadow-sm border transition-all cursor-pointer
                                ${selectedProveedor?.id_proveedor === proveedor.id_proveedor
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                                }`}
                            onClick={() => handleProveedorClick(proveedor)}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {proveedor.nombre_proveedor}
                            </h3>
                            <p className="text-gray-600 mb-1">Contacto: {proveedor.contacto}</p>
                            
                            {selectedProveedor?.id_proveedor === proveedor.id_proveedor && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <a href={`tel:${proveedor.telefono}`} className="hover:text-amber-600">
                                            {proveedor.telefono}
                                        </a>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <a href={`mailto:${proveedor.correo}`} className="hover:text-amber-600">
                                            {proveedor.correo}
                                        </a>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {proveedor.direccion}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 