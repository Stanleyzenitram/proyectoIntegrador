import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import type { Producto } from "../../types/index";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);

    // 🔹 Estados para los filtros
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedEstilo, setSelectedEstilo] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    
    // Estado para el rango de precios
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Estado para orden ascendente/descendente
    const [orderAsc, setOrderAsc] = useState(true);

    // Estado para los datos de materiales, estilos y categorías
    const [materials, setMaterials] = useState<{ id_materiales: string; nombre_materiales: string }[]>([]);
    const [estilos, setEstilos] = useState<{ id_estilo: string; nombre_estilo: string }[]>([]);
    const [categories, setCategories] = useState<{ id_categoria: string; nombre_categoria: string }[]>([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem("searchHistory");
        if (storedHistory) setSearchHistory(JSON.parse(storedHistory));

        fetchProductos();
        fetchCategories();
        fetchMaterials();
        fetchEstilos();
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [selectedCategory, selectedMaterial, selectedEstilo, minPrice, maxPrice, orderAsc]);

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

    const handleSearch = () => {
        fetchProductos();
        if (searchTerm.trim()) updateSearchHistory(searchTerm);
    };

    const updateSearchHistory = (term: string) => {
        const updatedHistory = [...new Set([term, ...searchHistory])].slice(0, 5);
        setSearchHistory(updatedHistory);
        localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Buscar Productos</h1>

            {/* 🔹 Buscador */}
            <div className="flex mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto..."
                    className="p-2 border rounded w-full"
                />
                <button onClick={handleSearch} className="ml-2 p-2 bg-blue-500 text-white rounded">
                    Buscar
                </button>
            </div>

            {/* 🔹 Botón de ordenamiento */}
            <button 
                onClick={() => setOrderAsc(!orderAsc)} 
                className="mb-4 p-2 bg-gray-700 text-white rounded"
            >
                Ordenar por precio: {orderAsc ? "Ascendente 🔼" : "Descendente 🔽"}
            </button>

            {/* 🔹 Filtro por categorías */}
            <div className="mb-4">
                <label htmlFor="category" className="mr-2">Filtrar por Categoría:</label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">Todas</option>
                    {categories.map((category) => (
                        <option key={category.id_categoria} value={category.id_categoria}>
                            {category.nombre_categoria}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🔹 Filtro por precio */}
            <div className="mb-4 flex space-x-2">
                <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Precio mínimo"
                    className="p-2 border rounded w-1/2"
                />
                <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Precio máximo"
                    className="p-2 border rounded w-1/2"
                />
            </div>

            {/* 🔹 Filtro por Material */}
            <div className="mb-4">
                <label htmlFor="material" className="mr-2">Filtrar por Material:</label>
                <select
                    id="material"
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">Todos</option>
                    {materials.map((material) => (
                        <option key={material.id_materiales} value={material.id_materiales}>
                            {material.nombre_materiales}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🔹 Filtro por Estilo */}
            <div className="mb-4">
                <label htmlFor="estilo" className="mr-2">Filtrar por Estilo:</label>
                <select
                    id="estilo"
                    value={selectedEstilo}
                    onChange={(e) => setSelectedEstilo(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">Todos</option>
                    {estilos.map((estilo) => (
                        <option key={estilo.id_estilo} value={estilo.id_estilo}>
                            {estilo.nombre_estilo}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🔹 Historial de búsqueda */}
            {searchHistory.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Historial de búsqueda</h2>
                    <ul>
                        {searchHistory.map((term, index) => (
                            <li key={index} className="text-blue-600 cursor-pointer" onClick={() => setSearchTerm(term)}>
                                {term}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 🔹 Resultados de la búsqueda */}
            <div>
                <h2 className="text-lg font-semibold">Resultados</h2>
                {productos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {productos.map((producto) => (
                            <div key={producto.id_producto} className="border p-2 mb-2">
                                {producto.imagen && (
                                    <img
                                        src={producto.imagen}
                                        alt={producto.nombre_producto}
                                        className="w-full h-40 object-cover rounded"
                                    />
                                )}
                                <p className="font-bold">{producto.nombre_producto}</p>
                                <p>{producto.descripcion}</p>
                                <p className="text-sm text-gray-600">Precio: RD${producto.precio}</p>
                                <p className="text-sm text-gray-600">Stock: {producto.stock_actual}</p>
                                <p className="text-sm text-gray-600">Material: {producto.material?.nombre_materiales || "N/A"}</p>
                                <p className="text-sm text-gray-600">Estilo: {producto.estilo?.nombre_estilo || "N/A"}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No se encontraron productos.</p>
                )}
            </div>
        </div>
    );
}
