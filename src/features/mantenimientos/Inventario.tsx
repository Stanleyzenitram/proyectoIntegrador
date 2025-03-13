import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { AlertTriangle, Package, TrendingUp, TrendingDown, ShoppingCart, Phone, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Producto {
    id_producto: number;
    nombre_producto: string;
    stock_actual: number;
    precio: number;
    imagen?: string;
    descripcion?: string;
    disponibilidad: boolean;
    estado: boolean;
}

interface Proveedor {
    id_proveedor: number;
    nombre_proveedor: string;
    telefono: string;
    correo: string;
    direccion: string;
    contacto: string;
}

interface ProductoConProveedor extends Producto {
    proveedor: Proveedor | null;
}

export default function Inventario() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState<ProductoConProveedor[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProveedores, setLoadingProveedores] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStock, setFilterStock] = useState<'todos' | 'bajo' | 'agotado'>('todos');
    const [showProveedores, setShowProveedores] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
    const STOCK_MINIMO_DEFAULT = 12;

    useEffect(() => {
        fetchInventario();
    }, []);

    const fetchProveedores = async () => {
        try {
            setLoadingProveedores(true);
            console.log('Iniciando carga de proveedores...');

            // Primero verificamos la conexión a la tabla
            const { data: testData, error: testError } = await supabase
                .from('proveedores')
                .select('count');

            if (testError) {
                console.error('Error de conexión a proveedores:', testError);
                throw testError;
            }

            console.log('Conexión exitosa a proveedores, total:', testData);

            // Ahora intentamos cargar los datos
            const { data, error } = await supabase
                .from('proveedores')
                .select('id_proveedor, nombre_proveedor, telefono, correo, direccion, contacto')
                .order('nombre_proveedor', { ascending: true });

            if (error) {
                console.error('Error al cargar datos de proveedores:', error);
                throw error;
            }

            console.log('Proveedores cargados:', data?.length || 0, 'proveedores');
            console.log('Datos de proveedores:', data);

            setProveedores(data || []);
        } catch (error) {
            console.error('Error detallado al cargar proveedores:', error);
            alert('Error al cargar la lista de proveedores. Por favor, verifica la conexión.');
        } finally {
            setLoadingProveedores(false);
        }
    };

    const fetchInventario = async () => {
        try {
            setLoading(true);
            console.log('Iniciando carga de inventario...');
            
            // Primero verificamos la conexión
            const { data: testData, error: testError } = await supabase
                .from('productos')
                .select('count');

            if (testError) {
                console.error('Error de conexión:', testError);
                throw new Error(`Error de conexión: ${testError.message}`);
            }

            console.log('Conexión exitosa, total de productos:', testData);
            
            // Ahora cargamos los productos con los campos que existen en la tabla
            const { data: productosData, error: productosError } = await supabase
                .from('productos')
                .select(`
                    id_producto,
                    nombre_producto,
                    stock_actual,
                    precio,
                    imagen,
                    descripcion,
                    disponibilidad,
                    estado
                `)
                .order('nombre_producto', { ascending: true });

            if (productosError) {
                console.error('Error al cargar productos:', productosError);
                throw new Error(`Error al cargar productos: ${productosError.message}`);
            }

            console.log('Productos cargados:', productosData?.length || 0, 'productos');

            if (productosData && productosData.length > 0) {
                // Por ahora, establecemos los productos sin información del proveedor
                const productosConProveedores: ProductoConProveedor[] = productosData.map(producto => ({
                    ...producto,
                    proveedor: null
                }));

                console.log('Productos procesados con éxito:', productosConProveedores.length);
                setProductos(productosConProveedores);
            } else {
                console.log('No se encontraron productos');
                setProductos([]);
            }
        } catch (error) {
            console.error('Error detallado:', error);
            setProductos([]);
            alert('Error al cargar el inventario. Por favor, verifica tu conexión e inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (stockActual: number) => {
        if (stockActual === 0) return { 
            color: 'text-red-600 bg-red-100', 
            text: 'Agotado', 
            icon: <AlertTriangle className="w-5 h-5" /> 
        };
        if (stockActual <= STOCK_MINIMO_DEFAULT) return { 
            color: 'text-yellow-600 bg-yellow-100', 
            text: `Stock Bajo (${stockActual} unidades)`, 
            icon: <TrendingDown className="w-5 h-5" /> 
        };
        return { 
            color: 'text-green-600 bg-green-100', 
            text: 'En Stock', 
            icon: <TrendingUp className="w-5 h-5" /> 
        };
    };

    const filteredProductos = productos.filter(producto => {
        const matchesSearch = producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase());
        
        switch (filterStock) {
            case 'bajo':
                return matchesSearch && producto.stock_actual <= STOCK_MINIMO_DEFAULT && producto.stock_actual > 0;
            case 'agotado':
                return matchesSearch && producto.stock_actual === 0;
            default:
                return matchesSearch;
        }
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Control de Inventario</h1>
                    <button
                        onClick={() => {
                            console.log('Botón de proveedores clickeado');
                            setShowProveedores(true);
                            fetchProveedores();
                        }}
                        className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Solicitar Productos
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <select
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value as 'todos' | 'bajo' | 'agotado')}
                        className="p-2 border rounded-lg bg-white"
                    >
                        <option value="todos">Todos los productos</option>
                        <option value="bajo">Stock bajo</option>
                        <option value="agotado">Agotados</option>
                    </select>
                    <button
                        onClick={fetchInventario}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        Recargar Inventario
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando inventario...</p>
                    </div>
                ) : productos.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 mb-2">No se encontraron productos en el inventario</p>
                        <p className="text-gray-500">Asegúrate de que haya productos registrados en el sistema</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProductos.map((producto) => {
                            const stockStatus = getStockStatus(producto.stock_actual);
                            return (
                                <div
                                    key={producto.id_producto}
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="relative h-48 bg-gray-200">
                                        {producto.imagen ? (
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre_producto}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-image.png';
                                                    target.onerror = null;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color} flex items-center shadow-sm`}>
                                                {stockStatus.icon}
                                                <span className="ml-1">{stockStatus.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {producto.nombre_producto}
                                                </h3>
                                                <p className="text-sm text-gray-500">ID: {producto.id_producto}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-amber-600">
                                                    RD${producto.precio?.toFixed(2)}
                                                </p>
                                                <p className="text-sm font-medium text-gray-600">
                                                    {producto.stock_actual} unidades
                                                </p>
                                            </div>
                                        </div>

                                        {producto.descripcion && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {producto.descripcion}
                                            </p>
                                        )}

                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Botón de proveedores clickeado desde producto');
                                                    setShowProveedores(true);
                                                    fetchProveedores();
                                                }}
                                                className="inline-flex items-center px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors w-full justify-center"
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Ver Proveedores
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {showProveedores && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-6xl w-[95%] max-h-[85vh] overflow-y-auto shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Lista de Proveedores
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {proveedores.length} proveedores disponibles
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        console.log('Cerrando modal de proveedores');
                                        setShowProveedores(false);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {loadingProveedores ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600 text-lg">Cargando proveedores...</p>
                                </div>
                            ) : proveedores.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-xl text-gray-600 mb-2">No se encontraron proveedores</p>
                                    <p className="text-gray-500">No hay proveedores registrados en el sistema</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {proveedores.map((proveedor) => (
                                        <div
                                            key={proveedor.id_proveedor}
                                            className={`group relative overflow-hidden rounded-xl transition-all duration-300 
                                                ${selectedProveedor?.id_proveedor === proveedor.id_proveedor
                                                    ? 'bg-amber-50 border-2 border-amber-500 shadow-lg'
                                                    : 'bg-white border border-gray-200 hover:border-amber-300 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                                                            {proveedor.nombre_proveedor}
                                                        </h3>
                                                        <p className="text-gray-600 mt-1">
                                                            Contacto: {proveedor.contacto}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedProveedor(
                                                            selectedProveedor?.id_proveedor === proveedor.id_proveedor ? null : proveedor
                                                        )}
                                                        className={`p-2 rounded-lg transition-colors
                                                            ${selectedProveedor?.id_proveedor === proveedor.id_proveedor
                                                                ? 'bg-amber-100 text-amber-600'
                                                                : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                                                            }`}
                                                    >
                                                        {selectedProveedor?.id_proveedor === proveedor.id_proveedor ? (
                                                            <X className="w-5 h-5" />
                                                        ) : (
                                                            <span className="text-sm font-medium">Ver detalles</span>
                                                        )}
                                                    </button>
                                                </div>

                                                {selectedProveedor?.id_proveedor === proveedor.id_proveedor && (
                                                    <div className="mt-6 space-y-4 bg-white rounded-lg p-4 shadow-inner">
                                                        <div className="flex items-center gap-4">
                                                            <a
                                                                href={`tel:${proveedor.telefono}`}
                                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors flex-1"
                                                            >
                                                                <Phone className="w-4 h-4" />
                                                                <span>{proveedor.telefono}</span>
                                                            </a>
                                                            <a
                                                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${proveedor.correo}&su=Solicitud de Productos - ${new Date().toLocaleDateString()}&body=Estimado ${proveedor.nombre_proveedor},%0D%0A%0D%0AEspero que este correo le encuentre bien. Me comunico con usted para solicitar información sobre los siguientes productos:%0D%0A%0D%0A[Lista de productos]%0D%0A%0D%0AAgradecería que me pudiera proporcionar:%0D%0A- Disponibilidad%0D%0A- Precios actualizados%0D%0A- Tiempo estimado de entrega%0D%0A%0D%0AQuedo atento a su respuesta.%0D%0A%0D%0ASaludos cordiales.`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-700 transition-colors flex-1"
                                                            >
                                                                <Mail className="w-4 h-4" />
                                                                <span>Enviar correo</span>
                                                            </a>
                                                        </div>
                                                        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <p className="text-gray-600 text-sm flex-1">
                                                                {proveedor.direccion}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 