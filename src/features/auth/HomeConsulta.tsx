import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import type { Producto } from "../../types/index";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categories, setCategories] = useState<{ id_categoria: string; nombre_categoria: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    // 🔹 Estados para el rango de precios
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    useEffect(() => {
        const storedHistory = localStorage.getItem("searchHistory");
        if (storedHistory) {
            setSearchHistory(JSON.parse(storedHistory));
        }

        fetchProductos();
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [selectedCategory, minPrice, maxPrice]); // 🔹 Se actualiza al cambiar categoría o precio

    const fetchProductos = async () => {
        let query = supabase
            .from("productos")
            .select("*, categorias(nombre_categoria)");

        if (selectedCategory) {
            query = query.eq("id_categoria", selectedCategory);
        }

        if (searchTerm.trim()) {
            query = query.ilike("nombre_producto", `%${searchTerm}%`);
        }

        // 🔹 Filtrar por precio
        if (minPrice) {
            query = query.gte("precio", parseFloat(minPrice)); // Precio mayor o igual
        }
        if (maxPrice) {
            query = query.lte("precio", parseFloat(maxPrice)); // Precio menor o igual
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error en la consulta:", error.message);
            return;
        }

        setProductos(data || []);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase.from("categorias").select("id_categoria, nombre_categoria");

        if (error) {
            console.error(" Error al cargar categorías:", error.message);
            return;
        }

        setCategories(data || []);
    };

    const handleSearch = () => {
        fetchProductos();

        if (searchTerm.trim()) {
            updateSearchHistory(searchTerm);
        }
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
                <button
                    onClick={handleSearch}
                    className="ml-2 p-2 bg-blue-500 text-white rounded"
                >
                    Buscar
                </button>
            </div>

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
                                <p className="text-sm text-gray-600">Cantidad de producto: {producto.stock_actual}</p>
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
