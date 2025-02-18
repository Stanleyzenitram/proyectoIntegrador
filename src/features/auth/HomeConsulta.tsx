import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import type { Producto } from "../../types/index";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedEstilo, setSelectedEstilo] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [orderAsc, setOrderAsc] = useState(true);
    const [materials, setMaterials] = useState<{ id_materiales: string; nombre_materiales: string }[]>([]);
    const [estilos, setEstilos] = useState<{ id_estilo: string; nombre_estilo: string }[]>([]);
    const [categories, setCategories] = useState<{ id_categoria: string; nombre_categoria: string }[]>([]);
    const [searchInput, setSearchInput] = useState("");

    const { user } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();

    const calcularPrecioConDescuento = (precio: number, descuento?: number) => {
        if (!descuento) return precio;
        return precio * (1 - descuento / 100);
    };

    useEffect(() => {
        fetchProductos();
        fetchCategories();
        fetchMaterials();
        fetchEstilos();
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [selectedCategory, selectedMaterial, selectedEstilo, minPrice, maxPrice, orderAsc, searchTerm]);

    const fetchProductos = async () => {
        let query = supabase
            .from("productos")
            .select("*, categorias(nombre_categoria), estilos(nombre_estilo), materiales(nombre_materiales)")
            .order("precio", { ascending: orderAsc });

        if (selectedCategory) query = query.eq("id_categoria", selectedCategory);
        if (selectedMaterial) query = query.eq("id_materiales", selectedMaterial);
        if (selectedEstilo) query = query.eq("id_estilo", selectedEstilo);
        if (searchTerm.trim()) query = query.ilike("nombre_producto", `%${searchTerm}%`);
        if (minPrice) query = query.gte("precio", parseFloat(minPrice));
        if (maxPrice) query = query.lte("precio", parseFloat(maxPrice));

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

    return (
        <div className="pt-32">
            <div className="container mx-auto px-4">
                {/* Barra superior con búsqueda y ordenamiento */}
                <div className="flex justify-between items-center mb-4">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
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
                        className="ml-4 p-2 border rounded-lg bg-gray-100 text-amber-900"
                    >
                        <option value="asc">Precio - Ascendente</option>
                        <option value="desc">Precio - Descendente</option>
                    </select>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar de filtros */}
                    <div className="w-64 bg-gray-100 p-4">
                        <div className="mb-6">
                            <h3 className="text-amber-900 font-medium mb-2">Ordenar por</h3>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-amber-900 font-medium mb-2">Rango de precio</h3>
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

                        <div className="mb-6">
                            <h3 className="text-amber-900 font-medium mb-2">Categorías</h3>
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

                        <div className="mb-6">
                            <h3 className="text-amber-900 font-medium mb-2">Material</h3>
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

                        <div className="mb-6">
                            <h3 className="text-amber-900 font-medium mb-2">Estilo</h3>
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
                    </div>

                    {/* Grid de productos */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {productos.map((producto) => {
                                const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);

                                return (
                                    <div key={producto.id_producto} className="bg-white p-4 rounded-lg shadow-sm">
                                        {producto.imagen && (
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre_producto}
                                                className="w-full h-40 object-cover mb-2"
                                            />
                                        )}
                                        <h3 className="text-sm font-medium mb-2">{producto.nombre_producto}</h3>
                                        
                                        {/* Contenedor de precio y disponibilidad con altura fija */}
                                        <div className="h-[60px] mb-2"> {/* Altura fija para mantener alineación */}
                                            <div className="flex justify-between items-start">
                                                {producto.descuento ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-500 line-through text-sm">
                                                            RD${producto.precio.toFixed(2)}
                                                        </span>
                                                        <span className="font-bold text-red-600">
                                                            RD${precioFinal.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-green-600 font-medium">
                                                            {producto.descuento}% OFF
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold">
                                                        RD${producto.precio.toFixed(2)}
                                                    </span>
                                                )}
                                                <span className="text-sm text-green-600">
                                                    {producto.stock_actual > 0 ? 'Disponible' : 'No disponible'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botón de agregar al carrito */}
                                        <button
                                            onClick={() => {
                                                if (producto.stock_actual <= 0) {
                                                    alert('Producto fuera de stock');
                                                    return;
                                                }
                                                addItem(producto);
                                            }}
                                            disabled={producto.stock_actual <= 0}
                                            className={`w-full py-2 rounded-lg transition-colors ${
                                                producto.stock_actual > 0
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {producto.stock_actual > 0 ? 'Agregar al carrito' : 'Fuera de stock'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
