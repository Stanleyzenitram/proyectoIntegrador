import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { FaSearch, FaFilter, FaShoppingCart, FaEye, FaHeart, FaStar, FaSort, FaTimes } from 'react-icons/fa';
import ProductosRecomendados from '../components/ProductosRecomendados';

interface Producto {
    id_producto: number;
    nombre_producto: string;
    imagen: string;
    precio: number;
    stock_actual: number;
    metros_por_caja: number;
    descripcion: string;
    id_categoria: number;
    id_estilo: number;
    id_materiales: number;
    descuento: number;
    colorDom: string;
    superficie: string;
    durabilidad: number;
    disponibilidad: boolean;
}

interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
}

interface Estilo {
    id_estilo: number;
    nombre_estilo: string;
}

interface Material {
    id_material: number;
    nombre_material: string;
}

export default function Productos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [estilos, setEstilos] = useState<Estilo[]>([]);
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estados de filtros
    const [busqueda, setBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
    const [estiloSeleccionado, setEstiloSeleccionado] = useState<number | null>(null);
    const [materialSeleccionado, setMaterialSeleccionado] = useState<number | null>(null);
    const [precioMin, setPrecioMin] = useState<number | ''>('');
    const [precioMax, setPrecioMax] = useState<number | ''>('');
    const [durabilidad, setDurabilidad] = useState<number | ''>('');
    const [ordenamiento, setOrdenamiento] = useState<'nombre' | 'precio' | 'durabilidad'>('nombre');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    
    // Estados de paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [productosPorPagina] = useState(12);
    
    const { user } = useAuth();
    const { addItem } = useCart();

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [productos, busqueda, categoriaSeleccionada, estiloSeleccionado, materialSeleccionado, precioMin, precioMax, durabilidad, ordenamiento]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar productos
            const { data: productosData, error: productosError } = await supabase
                .from('productos')
                .select('*')
                .eq('disponibilidad', true)
                .gt('stock_actual', 0);

            if (productosError) throw productosError;
            setProductos(productosData || []);

            // Cargar categorías
            const { data: categoriasData, error: categoriasError } = await supabase
                .from('categorias')
                .select('*')
                .order('nombre_categoria');

            if (categoriasError) throw categoriasError;
            setCategorias(categoriasData || []);

            // Cargar estilos
            const { data: estilosData, error: estilosError } = await supabase
                .from('estilos')
                .select('*')
                .order('nombre_estilo');

            if (estilosError) throw estilosError;
            setEstilos(estilosData || []);

            // Cargar materiales
            const { data: materialesData, error: materialesError } = await supabase
                .from('materiales')
                .select('*')
                .order('nombre_material');

            if (materialesError) throw materialesError;
            setMateriales(materialesData || []);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            setError('No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let productosFiltrados = [...productos];

        // Filtro de búsqueda
        if (busqueda) {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
                producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                producto.colorDom.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        // Filtro de categoría
        if (categoriaSeleccionada) {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.id_categoria === categoriaSeleccionada
            );
        }

        // Filtro de estilo
        if (estiloSeleccionado) {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.id_estilo === estiloSeleccionado
            );
        }

        // Filtro de material
        if (materialSeleccionado) {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.id_materiales === materialSeleccionado
            );
        }

        // Filtro de precio mínimo
        if (precioMin !== '') {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.precio >= precioMin
            );
        }

        // Filtro de precio máximo
        if (precioMax !== '') {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.precio <= precioMax
            );
        }

        // Filtro de durabilidad
        if (durabilidad !== '') {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.durabilidad >= durabilidad
            );
        }

        // Ordenamiento
        productosFiltrados.sort((a, b) => {
            switch (ordenamiento) {
                case 'nombre':
                    return a.nombre_producto.localeCompare(b.nombre_producto);
                case 'precio':
                    return a.precio - b.precio;
                case 'durabilidad':
                    return b.durabilidad - a.durabilidad;
                default:
                    return 0;
            }
        });

        setProductosFiltrados(productosFiltrados);
        setPaginaActual(1); // Resetear a la primera página
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setCategoriaSeleccionada(null);
        setEstiloSeleccionado(null);
        setMaterialSeleccionado(null);
        setPrecioMin('');
        setPrecioMax('');
        setDurabilidad('');
        setOrdenamiento('nombre');
    };

    const agregarAlCarrito = (producto: Producto) => {
        addItem({
            id: producto.id_producto,
            name: producto.nombre_producto,
            price: producto.precio,
            image: producto.imagen,
            quantity: 1,
            stock: producto.stock_actual,
            metros_por_caja: producto.metros_por_caja
        });
    };

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(precio);
    };

    const obtenerCategoriaNombre = (idCategoria: number) => {
        return categorias.find(cat => cat.id_categoria === idCategoria)?.nombre_categoria || '';
    };

    const obtenerEstiloNombre = (idEstilo: number) => {
        return estilos.find(est => est.id_estilo === idEstilo)?.nombre_estilo || '';
    };

    const obtenerMaterialNombre = (idMaterial: number) => {
        return materiales.find(mat => mat.id_material === idMaterial)?.nombre_material || '';
    };

    // Calcular productos de la página actual
    const indiceInicio = (paginaActual - 1) * productosPorPagina;
    const indiceFin = indiceInicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(indiceInicio, indiceFin);
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando productos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-800">{error}</p>
                            <button 
                                onClick={cargarDatos}
                                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
                    <p className="text-gray-600">Descubre nuestra amplia selección de cerámicas de alta calidad</p>
                </div>

                {/* Recomendaciones */}
                {user && (
                    <div className="mb-8">
                        <ProductosRecomendados 
                            titulo="Recomendados para ti"
                            variante="carousel"
                            maxProductos={8}
                        />
                    </div>
                )}

                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h2>
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                        >
                            <FaFilter />
                            <span>{mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros</span>
                        </button>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="relative mb-4">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos por nombre, descripción o color..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {/* Filtros expandibles */}
                    {mostrarFiltros && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    value={categoriaSeleccionada || ''}
                                    onChange={(e) => setCategoriaSeleccionada(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map(categoria => (
                                        <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                            {categoria.nombre_categoria}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Estilo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estilo</label>
                                <select
                                    value={estiloSeleccionado || ''}
                                    onChange={(e) => setEstiloSeleccionado(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">Todos los estilos</option>
                                    {estilos.map(estilo => (
                                        <option key={estilo.id_estilo} value={estilo.id_estilo}>
                                            {estilo.nombre_estilo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Material */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                                <select
                                    value={materialSeleccionado || ''}
                                    onChange={(e) => setMaterialSeleccionado(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">Todos los materiales</option>
                                    {materiales.map(material => (
                                        <option key={material.id_material} value={material.id_material}>
                                            {material.nombre_material}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ordenamiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                <select
                                    value={ordenamiento}
                                    onChange={(e) => setOrdenamiento(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="nombre">Nombre</option>
                                    <option value="precio">Precio</option>
                                    <option value="durabilidad">Durabilidad</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Filtros adicionales */}
                    {mostrarFiltros && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Precio mínimo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio mínimo</label>
                                <input
                                    type="number"
                                    placeholder="RD$ 0"
                                    value={precioMin}
                                    onChange={(e) => setPrecioMin(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            {/* Precio máximo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
                                <input
                                    type="number"
                                    placeholder="RD$ 10000"
                                    value={precioMax}
                                    onChange={(e) => setPrecioMax(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            {/* Durabilidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durabilidad mínima (PEI)</label>
                                <select
                                    value={durabilidad || ''}
                                    onChange={(e) => setDurabilidad(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">Cualquier durabilidad</option>
                                    <option value="1">PEI 1 - Tráfico muy ligero</option>
                                    <option value="2">PEI 2 - Tráfico ligero</option>
                                    <option value="3">PEI 3 - Tráfico moderado</option>
                                    <option value="4">PEI 4 - Tráfico intenso</option>
                                    <option value="5">PEI 5 - Tráfico muy intenso</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {productosFiltrados.length} productos encontrados
                            </span>
                            {(categoriaSeleccionada || estiloSeleccionado || materialSeleccionado || precioMin || precioMax || durabilidad) && (
                                <button
                                    onClick={limpiarFiltros}
                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm"
                                >
                                    <FaTimes />
                                    <span>Limpiar filtros</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid de productos */}
                {productosPagina.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {productosPagina.map((producto) => (
                                <div key={producto.id_producto} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={producto.imagen || '/placeholder-image.svg'}
                                            alt={producto.nombre_producto}
                                            className="w-full h-48 object-cover"
                                        />
                                        
                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col space-y-1">
                                            {producto.descuento && producto.descuento > 0 && (
                                                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    -{producto.descuento}%
                                                </div>
                                            )}
                                            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                PEI {producto.durabilidad}
                                            </div>
                                        </div>

                                        {/* Botón de favorito */}
                                        <button className="absolute top-2 right-2 bg-white/80 text-gray-600 p-2 rounded-full hover:bg-white hover:text-red-500 transition-colors">
                                            <FaHeart className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                                            {producto.nombre_producto}
                                        </h3>
                                        
                                        {/* Información del producto */}
                                        <div className="text-xs text-gray-600 space-y-1 mb-3">
                                            <p>Categoría: {obtenerCategoriaNombre(producto.id_categoria)}</p>
                                            <p>Estilo: {obtenerEstiloNombre(producto.id_estilo)}</p>
                                            <p>Material: {obtenerMaterialNombre(producto.id_materiales)}</p>
                                            {producto.colorDom && <p>Color: {producto.colorDom}</p>}
                                            {producto.superficie && <p>Superficie: {producto.superficie}</p>}
                                        </div>

                                        {/* Precio */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                {producto.descuento && producto.descuento > 0 ? (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg font-bold text-red-600">
                                                            {formatearPrecio(producto.precio * (1 - producto.descuento / 100))}
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            {formatearPrecio(producto.precio)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-bold text-amber-600">
                                                        {formatearPrecio(producto.precio)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                Stock: {producto.stock_actual}
                                            </span>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => agregarAlCarrito(producto)}
                                                className="flex-1 bg-amber-600 text-white py-2 px-3 rounded-md hover:bg-amber-700 transition-colors text-sm flex items-center justify-center"
                                            >
                                                <FaShoppingCart className="mr-1" />
                                                Agregar
                                            </button>
                                            <button className="bg-gray-100 text-gray-600 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center justify-center">
                                                <FaEye className="mr-1" />
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Paginación */}
                        {totalPaginas > 1 && (
                            <div className="flex items-center justify-center space-x-2 mb-8">
                                <button
                                    onClick={() => setPaginaActual(paginaActual - 1)}
                                    disabled={paginaActual === 1}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Anterior
                                </button>
                                
                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                                    <button
                                        key={numero}
                                        onClick={() => setPaginaActual(numero)}
                                        className={`px-3 py-2 border rounded-md text-sm ${
                                            paginaActual === numero
                                                ? 'bg-amber-600 text-white border-amber-600'
                                                : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {numero}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => setPaginaActual(paginaActual + 1)}
                                    disabled={paginaActual === totalPaginas}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <FaSearch className="mx-auto h-16 w-16" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                        <p className="text-gray-600 mb-4">
                            Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas.
                        </p>
                        <button
                            onClick={limpiarFiltros}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
    