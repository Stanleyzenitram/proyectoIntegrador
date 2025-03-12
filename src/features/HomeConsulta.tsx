import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import type { Producto } from "../types/index";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
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
    const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros en móvil

    const { user } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Verificar si debemos mostrar ofertas desde la navegación
        if (location.state?.showOffers) {
            setShowOnlyOffers(true);
            // Limpiar el estado para futuras navegaciones
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
        console.log("Producto seleccionado:", product);
        setSelectedProduct(product);
    };

    {productos.map((producto) => {
        const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);
    
        return (
            <div 
                key={producto.id_producto} 
                className="bg-white p-4 rounded-lg shadow-sm flex flex-col h-full justify-between"
            >
                {/* Contenedor de imagen y detalles */}
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
                
                {/* Contenedor de precio y botón */}
                <div>
                    {/* Precio y disponibilidad */}
                    <div className="mb-4">
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
                            <span className={`text-sm ${stockStatus.color}`}>
                                {stockStatus.text}
                            </span>
                        </div>
                    </div>
    
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
            </div> // <---- Aquí faltaba cerrar este div
        );
    })}
    
}