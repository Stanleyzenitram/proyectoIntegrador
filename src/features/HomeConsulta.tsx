import { useState, useEffect } from "react";
import type { Producto } from "../types/index";
import { useAuth } from "../hooks/useAuth";
import ProductModal from '../components/ProductModal';
import RecomendacionesHome from '../components/RecomendacionesHome';
import ProductosAdicionales from '../components/ProductosAdicionales';
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Home() {
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedEstilo, setSelectedEstilo] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [orderAsc, setOrderAsc] = useState(true);
    const [showOnlyOffers, setShowOnlyOffers] = useState(false);
    const [minRelevancia, setMinRelevancia] = useState("");
    const [numRecomendaciones, setNumRecomendaciones] = useState(12); // Aumentado de 6 a 12
    const [categories, setCategories] = useState<{ id_categoria: string; nombre_categoria: string }[]>([]);
    const [materials, setMaterials] = useState<{ id_materiales: string; nombre_materiales: string }[]>([]);
    const [estilos, setEstilos] = useState<{ id_estilo: string; nombre_estilo: string }[]>([]);
    
    const { user } = useAuth();

    useEffect(() => {
        fetchCategories();
        fetchMaterials();
        fetchEstilos();
    }, []);

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

    const handleProductClick = (product: Producto) => {
        setSelectedProduct(product);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedMaterial("");
        setSelectedEstilo("");
        setMinPrice("");
        setMaxPrice("");
        setShowOnlyOffers(false);
        setMinRelevancia("");
        setOrderAsc(true);
        setNumRecomendaciones(12); // Resetear a 12 recomendaciones
    };

    const hasActiveFilters = () => {
        return searchTerm || selectedCategory || selectedMaterial || selectedEstilo || minPrice || maxPrice || showOnlyOffers || minRelevancia;
    };

    return (
        <div className="h-screen w-screen">
            <div className="container mx-auto px-2 py-4">
                {/* Barra superior con búsqueda y filtros */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-xl w-full">
                            <input
                                type="text"
                                placeholder="Buscar en recomendaciones..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <select
                                value={numRecomendaciones.toString()}
                                onChange={(e) => setNumRecomendaciones(parseInt(e.target.value))}
                                className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="6">6 recomendaciones</option>
                                <option value="12">12 recomendaciones</option>
                                <option value="18">18 recomendaciones</option>
                                <option value="24">24 recomendaciones</option>
                                <option value="50">Todas las disponibles</option>
                            </select>
                            
                            <select
                                value={orderAsc ? "asc" : "desc"}
                                onChange={(e) => setOrderAsc(e.target.value === "asc")}
                                className="p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="asc">Precio - Ascendente</option>
                                <option value="desc">Precio - Descendente</option>
                            </select>
                            
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <Filter size={20} />
                                Filtros
                                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Panel de filtros expandible */}
                    {showFilters && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
                                {hasActiveFilters() && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Rango de precio */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Rango de precio</h4>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                        <span className="text-gray-500">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                {/* Filtro de relevancia mínima */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Relevancia mínima</h4>
                                    <select
                                        value={minRelevancia}
                                        onChange={(e) => setMinRelevancia(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="">Cualquier relevancia</option>
                                        <option value="20">20+ puntos</option>
                                        <option value="40">40+ puntos</option>
                                        <option value="60">60+ puntos</option>
                                        <option value="80">80+ puntos</option>
                                        <option value="100">100+ puntos</option>
                                    </select>
                                </div>

                                {/* Categorías */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Categorías</h4>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id_categoria} value={cat.id_categoria}>
                                                {cat.nombre_categoria}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Materiales */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Materiales</h4>
                                    <select
                                        value={selectedMaterial}
                                        onChange={(e) => setSelectedMaterial(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="">Todos los materiales</option>
                                        {materials.map((mat) => (
                                            <option key={mat.id_materiales} value={mat.id_materiales}>
                                                {mat.nombre_materiales}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Estilos */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Estilos</h4>
                                    <select
                                        value={selectedEstilo}
                                        onChange={(e) => setSelectedEstilo(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="">Todos los estilos</option>
                                        {estilos.map((est) => (
                                            <option key={est.id_estilo} value={est.id_estilo}>
                                                {est.nombre_estilo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filtro de ofertas */}
                            <div className="mt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={showOnlyOffers}
                                        onChange={(e) => setShowOnlyOffers(e.target.checked)}
                                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Solo productos con descuento</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección de Recomendaciones Personalizadas */}
                <RecomendacionesHome 
                    onProductClick={handleProductClick}
                    filters={{
                        searchTerm,
                        selectedCategory,
                        selectedMaterial,
                        selectedEstilo,
                        minPrice,
                        maxPrice,
                        orderAsc,
                        showOnlyOffers,
                        minRelevancia
                    }}
                    numRecomendaciones={numRecomendaciones}
                />

                {/* Sección de Productos Adicionales (solo cuando hay búsqueda o filtros activos) */}
                {(searchTerm || selectedCategory || selectedMaterial || selectedEstilo || minPrice || maxPrice || showOnlyOffers) && (
                    <>
                        <div className="my-6 border-t border-gray-200"></div>
                        <ProductosAdicionales 
                            onProductClick={handleProductClick}
                            filters={{
                                searchTerm,
                                selectedCategory,
                                selectedMaterial,
                                selectedEstilo,
                                minPrice,
                                maxPrice,
                                orderAsc,
                                showOnlyOffers,
                                minRelevancia
                            }}
                            numProductos={12}
                        />
                    </>
                )}
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