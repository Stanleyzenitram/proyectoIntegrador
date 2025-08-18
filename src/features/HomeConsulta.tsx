import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import type { Producto } from "../types/index";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Filter, ChevronDown, ChevronRight } from "lucide-react"; // Añadimos íconos para colapsar
import ProductModal from '../components/ProductModal';


export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedEstilo, setSelectedEstilo] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [orderAsc, setOrderAsc] = useState(true);
    const [showOnlyOffers, setShowOnlyOffers] = useState(false);
    const [materials, setMaterials] = useState<{ id_materiales: string; nombre_materiales: string }[]>([]);
    const [estilos, setEstilos] = useState<{ id_estilo: string; nombre_estilo: string }[]>([]);
    const [categories, setCategories] = useState<{ id_categoria: string; nombre_categoria: string }[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros en móviles
    
    // Estados para filtros colapsibles
    const [filtersCollapsed, setFiltersCollapsed] = useState({
        ordenar: false,
        precio: false,
        categorias: false,
        material: false,
        estilo: false
    });

    const { user } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.showOffers) {
            setShowOnlyOffers(true);
            navigate(location.pathname, { replace: true });
        }
    }, [location.state]);

    const calcularPrecioConDescuento = (precio: number, descuento?: number) => {
        if (!descuento) return precio;
        return precio * (1 - descuento / 100);
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Sin stock', color: 'text-red-600' };
        if (stock <= 3) return { text: 'Stock bajo', color: 'text-yellow-600' };
        return { text: 'Disponible', color: 'text-green-600' };
    };

    const calcularPiezasPorCaja = (formato: string | undefined, metrosPorCaja: number): number => {
        if (!formato) return 0;
        const [ancho, largo] = formato.split('x').map(Number);
        if (!ancho || !largo) return 0;
        const metrosPorPieza = (ancho * largo) / 10000;
        return Math.round(metrosPorCaja / metrosPorPieza);
    };

    useEffect(() => {
        fetchProductos();
        fetchCategories();
        fetchMaterials();
        fetchEstilos();
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [selectedCategory, selectedMaterial, selectedEstilo, minPrice, maxPrice, orderAsc, searchTerm, showOnlyOffers]);

    const fetchProductos = async () => {
        let query = supabase
            .from("productos")
            .select(`
                *,
                categorias(id_categoria, nombre_categoria),
                estilos(id_estilo, nombre_estilo),
                materiales(id_materiales, nombre_materiales)
            `)
            .eq("disponibilidad", true)  // Only show available products
            .order("precio", { ascending: orderAsc });

        if (selectedCategory) query = query.eq("id_categoria", selectedCategory);
        if (selectedMaterial) query = query.eq("id_materiales", selectedMaterial);
        if (selectedEstilo) query = query.eq("id_estilo", selectedEstilo);
        if (searchTerm.trim()) query = query.ilike("nombre_producto", `%${searchTerm}%`);
        if (minPrice) query = query.gte("precio", parseFloat(minPrice));
        if (maxPrice) query = query.lte("precio", parseFloat(maxPrice));
        if (showOnlyOffers) query = query.not('descuento', 'is', null).gt('descuento', 0);

        const { data, error } = await query;
        if (error) return console.error("Error en la consulta:", error.message);
        setProductos(data || []);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase.from("categorias").select("id_categoria, nombre_categoria");
        if (error) return console.error("Error al cargar categorías:", error.message);
        setCategories(data || []);
    };

    const fetchMaterials = async () => {
        const { data, error } = await supabase.from("materiales").select("id_materiales, nombre_materiales");
        if (error) return console.error("Error al cargar materiales:", error.message);
        setMaterials(data || []);
    };

    const fetchEstilos = async () => {
        const { data, error } = await supabase.from("estilos").select("id_estilo, nombre_estilo");
        if (error) return console.error("Error al cargar estilos:", error.message);
        setEstilos(data || []);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(searchInput);
    };

    const handleProductClick = (product: Producto) => {
        setSelectedProduct(product);
    };

    const toggleFilterSection = (section: keyof typeof filtersCollapsed) => {
        setFiltersCollapsed(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="h-screen w-screen">
            <div className="container mx-auto px-2">
                {/* Barra superior con búsqueda y ordenamiento */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-xl w-full">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            {productos.length} productos encontrados
                        </span>
                    </form>
                    <select
                        value={orderAsc ? "asc" : "desc"}
                        onChange={(e) => setOrderAsc(e.target.value === "asc")}
                        className="w-full md:w-auto p-2 border rounded-lg bg-gray-100 text-amber-900"
                    >
                        <option value="asc">Precio - Ascendente</option>
                        <option value="desc">Precio - Descendente</option>
                    </select>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden p-2 border rounded-lg bg-gray-100 text-amber-900 flex items-center gap-2"
                    >
                        <Filter size={20} /> Filtros
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar de filtros */}
                    <div className={`${showFilters ? 'block' : 'hidden'} md:block w-64 bg-gray-100 p-4`}>
                        {/* Sección Ordenar por */}
                        <div className="mb-4 border-b border-gray-200 pb-3">
                            <button
                                onClick={() => toggleFilterSection('ordenar')}
                                className="flex items-center justify-between w-full text-amber-900 font-medium hover:text-amber-700 transition-colors"
                            >
                                <span>Ordenar por</span>
                                {filtersCollapsed.ordenar ? (
                                    <ChevronRight size={20} />
                                ) : (
                                    <ChevronDown size={20} />
                                )}
                            </button>
                            {!filtersCollapsed.ordenar && (
                                <div className="mt-3">
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="orden"
                                                checked={orderAsc}
                                                onChange={() => setOrderAsc(true)}
                                                className="mr-2"
                                            />
                                            <span className="text-gray-700">Precio - Ascendente</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="orden"
                                                checked={!orderAsc}
                                                onChange={() => setOrderAsc(false)}
                                                className="mr-2"
                                            />
                                            <span className="text-gray-700">Precio - Descendente</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección Rango de precio */}
                        <div className="mb-4 border-b border-gray-200 pb-3">
                            <button
                                onClick={() => toggleFilterSection('precio')}
                                className="flex items-center justify-between w-full text-amber-900 font-medium hover:text-amber-700 transition-colors"
                            >
                                <span>Rango de precio</span>
                                {filtersCollapsed.precio ? (
                                    <ChevronRight size={20} />
                                ) : (
                                    <ChevronDown size={20} />
                                )}
                            </button>
                            {!filtersCollapsed.precio && (
                                <div className="mt-3">
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-20 p-2 border rounded bg-gray-200"
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-20 p-2 border rounded bg-gray-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección Categorías */}
                        <div className="mb-4 border-b border-gray-200 pb-3">
                            <button
                                onClick={() => toggleFilterSection('categorias')}
                                className="flex items-center justify-between w-full text-amber-900 font-medium hover:text-amber-700 transition-colors"
                            >
                                <span>Categorías</span>
                                {filtersCollapsed.categorias ? (
                                    <ChevronRight size={20} />
                                ) : (
                                    <ChevronDown size={20} />
                                )}
                            </button>
                            {!filtersCollapsed.categorias && (
                                <div className="mt-3">
                                    <div className="space-y-2">
                                        {categories.map((cat) => (
                                            <div key={cat.id_categoria} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`cat-${cat.id_categoria}`}
                                                    checked={selectedCategory === cat.id_categoria}
                                                    onChange={(e) => setSelectedCategory(e.target.checked ? cat.id_categoria : '')}
                                                    className="mr-2"
                                                />
                                                <label htmlFor={`cat-${cat.id_categoria}`} className="text-gray-700">
                                                    {cat.nombre_categoria}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección Material */}
                        <div className="mb-4 border-b border-gray-200 pb-3">
                            <button
                                onClick={() => toggleFilterSection('material')}
                                className="flex items-center justify-between w-full text-amber-900 font-medium hover:text-amber-700 transition-colors"
                            >
                                <span>Material</span>
                                {filtersCollapsed.material ? (
                                    <ChevronRight size={20} />
                                ) : (
                                    <ChevronDown size={20} />
                                )}
                            </button>
                            {!filtersCollapsed.material && (
                                <div className="mt-3">
                                    <div className="space-y-2">
                                        {materials.map((mat) => (
                                            <div key={mat.id_materiales} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`mat-${mat.id_materiales}`}
                                                    checked={selectedMaterial === mat.id_materiales}
                                                    onChange={(e) => setSelectedMaterial(e.target.checked ? mat.id_materiales : '')}
                                                    className="mr-2"
                                                />
                                                <label htmlFor={`mat-${mat.id_materiales}`} className="text-gray-700">
                                                    {mat.nombre_materiales}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sección Estilo */}
                        <div className="mb-4 border-b border-gray-200 pb-3">
                            <button
                                onClick={() => toggleFilterSection('estilo')}
                                className="flex items-center justify-between w-full text-amber-900 font-medium hover:text-amber-700 transition-colors"
                            >
                                <span>Estilo</span>
                                {filtersCollapsed.estilo ? (
                                    <ChevronRight size={20} />
                                ) : (
                                    <ChevronDown size={20} />
                                )}
                            </button>
                            {!filtersCollapsed.estilo && (
                                <div className="mt-3">
                                    <div className="space-y-2">
                                        {estilos.map((est) => (
                                            <div key={est.id_estilo} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`est-${est.id_estilo}`}
                                                    checked={selectedEstilo === est.id_estilo}
                                                    onChange={(e) => setSelectedEstilo(e.target.checked ? est.id_estilo : '')}
                                                    className="mr-2"
                                                />
                                                <label htmlFor={`est-${est.id_estilo}`} className="text-gray-700">
                                                    {est.nombre_estilo}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón para expandir/colapsar todos los filtros */}
                        <div className="pt-3">
                            <button
                                onClick={() => {
                                    const allCollapsed = Object.values(filtersCollapsed).every(collapsed => collapsed);
                                    setFiltersCollapsed({
                                        ordenar: allCollapsed,
                                        precio: allCollapsed,
                                        categorias: allCollapsed,
                                        material: allCollapsed,
                                        estilo: allCollapsed
                                    });
                                }}
                                className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm transition-colors"
                            >
                                {Object.values(filtersCollapsed).every(collapsed => collapsed) 
                                    ? 'Expandir todos' 
                                    : 'Colapsar todos'
                                }
                            </button>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    <div className="flex-1">

                        
                        {/* Título de todos los productos */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Todos los Productos
                                {productos.length > 0 && (
                                    <span className="text-sm text-gray-600 ml-2">
                                        ({productos.length} productos)
                                    </span>
                                )}
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {productos.map((producto) => {
                                const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);
                                const stockStatus = getStockStatus(producto.stock_actual);
                                const piezasPorCaja = calcularPiezasPorCaja(producto.formato, producto.metros_por_caja || 0);

                                return (
                                    <div 
                                        key={producto.id_producto} 
                                        className="bg-white p-4 rounded-lg shadow-sm flex flex-col h-full justify-between"
                                    >
                                        <div>
                                            {producto.imagen && (
                                                <div 
                                                    onClick={() => handleProductClick(producto)}
                                                    className="cursor-pointer transition-opacity hover:opacity-80"
                                                >
                                                    <img
                                                        src={producto.imagen}
                                                        alt={producto.nombre_producto}
                                                        className="w-full h-40 object-cover mb-2 rounded"
                                                    />
                                                </div>
                                            )}
                                            <h3 
                                                onClick={() => handleProductClick(producto)}
                                                className="text-sm font-medium mb-2 cursor-pointer hover:text-orange-500"
                                            >
                                                {producto.nombre_producto}
                                            </h3>
                                        </div>
                                        
                                        <div>
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col">
                                                        {producto.descuento ? (
                                                            <>
                                                                <span className="text-gray-500 line-through text-sm">
                                                                    RD${producto.precio.toFixed(2)}
                                                                </span>
                                                                <span className="font-bold text-red-600">
                                                                    RD${precioFinal.toFixed(2)}
                                                                </span>
                                                                <span className="text-xs text-green-600 font-medium">
                                                                    {producto.descuento}% OFF
                                                                </span>
                                                            </>
                                                        ) :
                                                            <span className="font-bold">
                                                                RD${producto.precio.toFixed(2)}
                                                            </span>
                                                        }
                                                    </div>
                                                    <span className={`text-sm ${stockStatus.color}`}>
                                                        {stockStatus.text}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleProductClick(producto)}
                                                disabled={producto.stock_actual === 0}
                                                className={`w-full py-2 px-4 rounded-lg ${
                                                    producto.stock_actual > 0
                                                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {producto.stock_actual > 0 ? 'ELEGIR CANTIDAD ›' : 'SIN STOCK'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </div>
    );
}