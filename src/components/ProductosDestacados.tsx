import React, { useState, useEffect } from 'react';
import { Star, Eye, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Producto } from '../types/index';

interface ProductosDestacadosProps {
  onProductClick: (product: Producto) => void;
}

const ProductosDestacados: React.FC<ProductosDestacadosProps> = ({ onProductClick }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductosDestacados();
  }, []);

  const fetchProductosDestacados = async () => {
    try {
      setLoading(true);
      
      // Obtener productos con descuento o populares
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias(id_categoria, nombre_categoria),
          estilos(id_estilo, nombre_estilo),
          materiales(id_materiales, nombre_materiales)
        `)
        .eq('disponibilidad', true)
        .or('descuento.gt.0,stock_actual.gt.10')
        .order('descuento', { ascending: false })
        .order('stock_actual', { ascending: false })
        .limit(6); // Este límite se puede hacer dinámico también si es necesario

      if (error) {
        console.error('Error al obtener productos destacados:', error);
        setProductos([]);
      } else {
        setProductos(data || []);
      }
    } catch (err) {
      console.error('Error al obtener productos destacados:', err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularPrecioConDescuento = (precio: number, descuento?: number) => {
    if (!descuento) return precio;
    return precio * (1 - descuento / 100);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Sin stock', color: 'text-red-600' };
    if (stock <= 3) return { text: 'Stock bajo', color: 'text-yellow-600' };
    return { text: 'Disponible', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Cargando productos destacados...</span>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
      <div className="flex items-center mb-4">
        <Star className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-blue-900">Productos Destacados</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {productos.map((producto, index) => {
          const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);
          const stockStatus = getStockStatus(producto.stock_actual);

          return (
            <div 
              key={producto.id_producto} 
              className="bg-white p-3 rounded-lg shadow-sm flex flex-col h-full justify-between hover:shadow-md transition-shadow"
            >
              {/* Badge de destacado */}
              <div className="relative">
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
                  #{index + 1}
                </div>
                {producto.descuento && (
                  <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    -{producto.descuento}%
                  </div>
                )}
              </div>

              <div>
                {producto.imagen && (
                  <div 
                    onClick={() => onProductClick(producto)}
                    className="cursor-pointer transition-opacity hover:opacity-80 mb-2"
                  >
                    <img
                      src={producto.imagen}
                      alt={producto.nombre_producto}
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                )}
                
                <h3 
                  onClick={() => onProductClick(producto)}
                  className="text-xs font-medium mb-2 cursor-pointer hover:text-blue-500 line-clamp-2"
                >
                  {producto.nombre_producto}
                </h3>
              </div>
              
              <div>
                <div className="mb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      {producto.descuento ? (
                        <>
                          <span className="text-gray-500 line-through text-xs">
                            RD${producto.precio.toFixed(2)}
                          </span>
                          <span className="font-bold text-red-600 text-sm">
                            RD${precioFinal.toFixed(2)}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            {producto.descuento}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-sm">
                          RD${producto.precio.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onProductClick(producto)}
                  disabled={producto.stock_actual === 0}
                  className={`w-full py-1.5 px-2 rounded text-xs ${
                    producto.stock_actual > 0
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {producto.stock_actual > 0 ? 'Ver Detalles' : 'Sin Stock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Productos con descuentos especiales y alta disponibilidad
        </p>
      </div>
    </div>
  );
};

export default ProductosDestacados; 