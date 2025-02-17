import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import type { Producto } from "../../types/index";

import { Search, } from "lucide-react";




export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");

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

    
                            {/*Como se comportaran los efectos del renderizado  */}
    useEffect(() => {

        fetchProductos();
        fetchCategories();
        fetchMaterials();
        fetchEstilos();
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [selectedCategory, selectedMaterial, selectedEstilo, minPrice, maxPrice, orderAsc]);



                            {/* Controla el renderizado de la barra de busqueda por medio de la tabla producto, es la tabla principak   */}
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Navigation Bar con gradiente y sombra */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1 max-w-xl mt-32">
                        <div className="relative">
                            
                                <input
                                    type="text"
                                    placeholder={`${productos.length} productos encontrados`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            fetchProductos(); 
                                        }
                                    }}
                                    className="pr-10 pl-4 h-12 text-lg shadow-sm border border-gray-300 rounded-md focus:border-amber-500 focus:ring-amber-500 w-full"
                                />
                                <button
                                    onClick={fetchProductos} // 🔹 Ejecuta la búsqueda al hacer clic en el icono
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    <Search className="h-6 w-6" />
                                </button>
                            

                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <button
                            onClick={() => setOrderAsc(!orderAsc)}
                            className="h-12 px-4 bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 text-gray-700 font-medium transition"
                        >
                            Precio - {orderAsc ? "Ascendente ↑" : "Descendente ↓"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <div className="flex gap-8">

                </div>
            </div>


            {/* Search Bar con diseño mejorado */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`${productos.length} productos encontrados`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        fetchProductos();
                                    }
                                }}
                                className="pl-10 pr-10 h-12 text-lg shadow-sm border border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-md w-full"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* boton de asc y desc cambia cuando se clickea   */}

                    <div className="ml-4">
                        <button
                            onClick={() => setOrderAsc(!orderAsc)}

                            className="h-12 bg-white shadow-sm hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-md px-4"
                        >
                            Precio - {orderAsc ? "Ascendente ↑" : "Descendente ↓"}
                        </button>

                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <div className="flex gap-8">
                    {/* Sidebar diseño */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            {/* Price Range */}
                            <div className="mb-8">
                                <h3 className="font-bold mb-4 text-gray-900">Rango de precio</h3>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-24 border border-gray-200 rounded-md px-2 py-1 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-24 border border-gray-200 rounded-md px-2 py-1 focus:ring-amber-500 focus:border-amber-500"
                                    />

                                </div>
                            </div>


                            {/* Categoria  con diseño de check  */}
                            <div className="mb-8">
                                <h3 className="font-bold mb-4 text-gray-900">Categorías</h3>
                                <ul className="space-y-3">
                                    {categories.map((category) => (
                                        <li key={category.id_categoria}>
                                            <label className="flex items-center space-x-3 text-gray-700 hover:text-amber-600 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategory === category.id_categoria}
                                                    onChange={() =>
                                                        setSelectedCategory(prev => (prev === category.id_categoria ? "" : category.id_categoria))
                                                    }
                                                    className="border-gray-300 checked:bg-amber-500 checked:border-amber-500"
                                                />
                                                <span className="text-sm font-medium">{category.nombre_categoria}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Materials con diseño de check  */}
                            <div className="mb-8">
                                <h3 className="font-bold mb-4 text-gray-900">Material</h3>
                                <ul className="space-y-3">
                                    {materials.map((material) => (
                                        <li key={material.id_materiales}>
                                            <label className="flex items-center space-x-3 text-gray-700 hover:text-amber-600 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMaterial === material.id_materiales}
                                                    onChange={() =>
                                                        setSelectedMaterial(prev => (prev === material.id_materiales ? "" : material.id_materiales))
                                                    }
                                                    className="border-gray-300 checked:bg-amber-500 checked:border-amber-500"
                                                />
                                                <span className="text-sm font-medium">{material.nombre_materiales}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>


                            <div className="mb-8">
                                <h3 className="font-bold mb-4 text-gray-900">Estilo</h3>
                                <ul className="space-y-3">
                                    {estilos.map((estilo) => (
                                        <li key={estilo.id_estilo}>
                                            <label className="flex items-center space-x-3 text-gray-700 hover:text-amber-600 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEstilo === estilo.id_estilo}
                                                    onChange={() =>
                                                        setSelectedEstilo(prev => (prev === estilo.id_estilo ? "" : estilo.id_estilo))
                                                    }
                                                    className="border-gray-300 checked:bg-amber-500 checked:border-amber-500"
                                                />

                                                <span className="text-sm font-medium">{estilo.nombre_estilo}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {productos.map((producto) => (
                                <div key={producto.id_producto} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                    {producto.imagen && (
                                        <div className="relative overflow-hidden"> {/*  caracteristicas de la imagen que se usa  */}
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre_producto}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}

                                    {/* Aqui puedes agregar las caracteristicas de los productos  solo hace un div y copixar la class */}
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                                            {producto.nombre_producto}
                                        </h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-amber-600">
                                                RD${producto.precio.toFixed(2)}
                                            </span>
                                            <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                Disponible   {/* corregir esto despues */}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
