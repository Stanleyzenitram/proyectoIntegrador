import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Upload, X, Check } from 'lucide-react';

interface Producto {
    id_producto: number;
    nombre_producto: string;
    precio: number;
    stock_actual: number;
}

interface Proveedor {
    id_proveedor: number;
    nombre_proveedor: string;
}

interface CompraProducto {
    id_compra?: number;
    id_producto: number;
    id_proveedor: number;
    cantidad: number;
    precio_unitario: number;
    fecha_compra: string;
    comprobante_url?: string;
    numero_factura: string;
}

export default function CompraProductos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success' | ''; texto: string }>({ tipo: '', texto: '' });
    const [comprobante, setComprobante] = useState<File | null>(null);
    
    const [compra, setCompra] = useState<CompraProducto>({
        id_producto: 0,
        id_proveedor: 0,
        cantidad: 0,
        precio_unitario: 0,
        fecha_compra: new Date().toISOString().split('T')[0],
        numero_factura: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            // Cargar productos
            const { data: productosData, error: productosError } = await supabase
                .from('productos')
                .select('id_producto, nombre_producto, precio, stock_actual');
            
            if (productosError) throw productosError;
            setProductos(productosData || []);

            // Cargar proveedores
            const { data: proveedoresData, error: proveedoresError } = await supabase
                .from('proveedores')
                .select('id_proveedor, nombre_proveedor');
            
            if (proveedoresError) throw proveedoresError;
            setProveedores(proveedoresData || []);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            setMensaje({ tipo: 'error', texto: 'Error al cargar los datos' });
        } finally {
            setLoading(false);
        }
    };

    const handleComprobanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setComprobante(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            if (!comprobante) {
                throw new Error('Debe adjuntar un comprobante');
            }

            // 1. Subir el comprobante
            const fileExt = comprobante.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `comprobantes/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('comprobantes')
                .upload(filePath, comprobante);

            if (uploadError) throw uploadError;

            // 2. Obtener la URL del comprobante
            const { data: { publicUrl } } = supabase.storage
                .from('comprobantes')
                .getPublicUrl(filePath);

            // 3. Registrar la compra
            const { error: compraError } = await supabase
                .from('compras')
                .insert([{
                    ...compra,
                    comprobante_url: publicUrl
                }]);

            if (compraError) throw compraError;

            // 4. Actualizar el stock del producto
            const productoActual = productos.find(p => p.id_producto === compra.id_producto);
            if (productoActual) {
                const nuevoStock = productoActual.stock_actual + compra.cantidad;
                const { error: updateError } = await supabase
                    .from('productos')
                    .update({ stock_actual: nuevoStock })
                    .eq('id_producto', compra.id_producto);

                if (updateError) throw updateError;
            }

            setMensaje({ tipo: 'success', texto: 'Compra registrada exitosamente' });
            // Resetear el formulario
            setCompra({
                id_producto: 0,
                id_proveedor: 0,
                cantidad: 0,
                precio_unitario: 0,
                fecha_compra: new Date().toISOString().split('T')[0],
                numero_factura: ''
            });
            setComprobante(null);
            cargarDatos(); // Recargar datos actualizados

        } catch (error: any) {
            console.error('Error al procesar la compra:', error);
            setMensaje({ tipo: 'error', texto: error.message || 'Error al procesar la compra' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Registro de Compras</h1>

            {mensaje.tipo && (
                <div className={`p-4 mb-4 rounded-lg ${
                    mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    <div className="flex items-center">
                        {mensaje.tipo === 'error' ? <X className="w-5 h-5 mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                        {mensaje.texto}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Producto
                        </label>
                        <select
                            value={compra.id_producto}
                            onChange={(e) => setCompra({...compra, id_producto: parseInt(e.target.value)})}
                            className="w-full p-2 border rounded-lg"
                            required
                        >
                            <option value="">Seleccione un producto</option>
                            {productos.map((producto) => (
                                <option key={producto.id_producto} value={producto.id_producto}>
                                    {producto.nombre_producto} (Stock actual: {producto.stock_actual})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Proveedor
                        </label>
                        <select
                            value={compra.id_proveedor}
                            onChange={(e) => setCompra({...compra, id_proveedor: parseInt(e.target.value)})}
                            className="w-full p-2 border rounded-lg"
                            required
                        >
                            <option value="">Seleccione un proveedor</option>
                            {proveedores.map((proveedor) => (
                                <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                                    {proveedor.nombre_proveedor}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad
                        </label>
                        <input
                            type="number"
                            value={compra.cantidad}
                            onChange={(e) => setCompra({...compra, cantidad: parseInt(e.target.value)})}
                            className="w-full p-2 border rounded-lg"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Unitario
                        </label>
                        <input
                            type="number"
                            value={compra.precio_unitario}
                            onChange={(e) => setCompra({...compra, precio_unitario: parseFloat(e.target.value)})}
                            className="w-full p-2 border rounded-lg"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Compra
                        </label>
                        <input
                            type="date"
                            value={compra.fecha_compra}
                            onChange={(e) => setCompra({...compra, fecha_compra: e.target.value})}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número de Factura
                        </label>
                        <input
                            type="text"
                            value={compra.numero_factura}
                            onChange={(e) => setCompra({...compra, numero_factura: e.target.value})}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comprobante de Pago
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500">
                                        <span>Subir comprobante</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            onChange={handleComprobanteChange}
                                            accept="image/*,.pdf"
                                            required
                                        />
                                    </label>
                                </div>
                                {comprobante && (
                                    <p className="text-sm text-gray-500">
                                        Archivo seleccionado: {comprobante.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Procesando...' : 'Registrar Compra'}
                    </button>
                </div>
            </form>
        </div>
    );
} 