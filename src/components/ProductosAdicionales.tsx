import React, { useState, useEffect } from 'react';
import { Search, Loader2, Star, Eye } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Producto } from '../types/index';

interface Filters {
  searchTerm: string;
  selectedCategory: string;
  selectedMaterial: string;
  selectedEstilo: string;
  minPrice: string;
  maxPrice: string;
  orderAsc: boolean;
  showOnlyOffers: boolean;
  minRelevancia: string;
}

interface ProductosAdicionalesProps {
  onProductClick: (product: Producto) => void;
  filters: Filters;
  numProductos?: number;
}

const ProductosAdicionales: React.FC<ProductosAdicionalesProps> = ({ 
  onProductClick, 
  filters, 
  numProductos = 12 
}) => {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductosAdicionales();
  }, [filters, user]);

  const fetchProductosAdicionales = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setProductos([]);
        return;
      }

             // Obtener historial del usuario para excluir productos ya vistos
       const { data: historialVistos } = await supabase
         .from('historial_productos_vistos')
         .select('producto_id')
         .eq('usuario_id', user.id);

       // Obtener preferencias del usuario para priorizar productos similares
       const { data: preferencias } = await supabase
         .from('preferencias_usuarios')
         .select('*')
         .eq('usuario_id', user.id)
         .single();

       const productosVistos = historialVistos?.map(h => h.producto_id) || [];

      // Construir la consulta base
      let query = supabase
        .from('productos')
        .select(`
          *,
          categorias(id_categoria, nombre_categoria),
          estilos(id_estilo, nombre_estilo),
          materiales(id_materiales, nombre_materiales)
        `)
        .eq('disponibilidad', true);

      // Excluir productos ya vistos por el usuario
      if (productosVistos.length > 0) {
        query = query.not('id_producto', 'in', `(${productosVistos.join(',')})`);
      }

      // Aplicar filtros
      if (filters.searchTerm) {
        query = query.or(`nombre_producto.ilike.%${filters.searchTerm}%,descripcion.ilike.%${filters.searchTerm}%`);
      }

      if (filters.selectedCategory) {
        query = query.eq('categorias.id_categoria', filters.selectedCategory);
      }

      if (filters.selectedMaterial) {
        query = query.eq('materiales.id_materiales', filters.selectedMaterial);
      }

      if (filters.selectedEstilo) {
        query = query.eq('estilos.id_estilo', filters.selectedEstilo);
      }

      if (filters.minPrice) {
        query = query.gte('precio', parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        query = query.lte('precio', parseFloat(filters.maxPrice));
      }

      if (filters.showOnlyOffers) {
        query = query.gt('descuento', 0);
      }

             // Obtener más productos para poder filtrar y ordenar mejor
       query = query.limit(numProductos * 2);

       const { data: productosData, error: productosError } = await query;

       if (productosError) {
         console.error('Error al obtener productos adicionales:', productosError);
         setError('Error al cargar productos adicionales');
         setProductos([]);
         return;
       }

               // Función para normalizar nombres de productos
        const normalizarNombre = (nombre: string): string => {
          return nombre
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
            .replace(/[^\w\s]/g, ''); // Remover caracteres especiales
        };

        // Eliminar duplicados por ID de producto y por nombre similar
        const productosUnicos = new Map();
        const nombresNormalizados = new Set();
        
        productosData?.forEach(producto => {
          const nombreNormalizado = normalizarNombre(producto.nombre_producto);
          
          // Verificar si ya existe un producto con el mismo ID o nombre similar
          const existePorId = productosUnicos.has(producto.id_producto);
          const existePorNombre = nombresNormalizados.has(nombreNormalizado);
          
          if (!existePorId && !existePorNombre) {
            productosUnicos.set(producto.id_producto, producto);
            nombresNormalizados.add(nombreNormalizado);
          } else if (existePorId && !existePorNombre) {
            // Si existe por ID pero no por nombre, mantener el existente
            // (no debería pasar si la consulta SQL es correcta)
          } else if (!existePorId && existePorNombre) {
            // Si existe por nombre pero no por ID, verificar si es realmente el mismo producto
            // Buscar el producto existente con nombre similar
            let productoExistente = null;
            for (const [id, prod] of productosUnicos) {
              if (normalizarNombre(prod.nombre_producto) === nombreNormalizado) {
                productoExistente = prod;
                break;
              }
            }
            
                         // Si es el mismo producto (mismo precio, categoría, etc.), mantener el de mayor ID (más reciente)
             if (productoExistente && 
                 producto.precio === productoExistente.precio &&
                 producto.id_categoria === productoExistente.id_categoria) {
               // Mantener el de mayor ID (asumiendo que IDs más altos son más recientes)
               if (producto.id_producto > productoExistente.id_producto) {
                 productosUnicos.delete(productoExistente.id_producto);
                 productosUnicos.set(producto.id_producto, producto);
               }
             }
          }
        });
        
        let productosOrdenados = Array.from(productosUnicos.values());
        
                 if (preferencias) {
           productosOrdenados = productosOrdenados.sort((a, b) => {
             let scoreA = 0;
             let scoreB = 0;

             // Priorizar productos de la categoría preferida
             if (preferencias.categoria_preferida) {
               if (a.categorias?.nombre_categoria?.toLowerCase().includes(preferencias.categoria_preferida.toLowerCase())) {
                 scoreA += 10;
               }
               if (b.categorias?.nombre_categoria?.toLowerCase().includes(preferencias.categoria_preferida.toLowerCase())) {
                 scoreB += 10;
               }
             }

             // Priorizar productos en el rango de precio preferido
             if (preferencias.rango_precio_min && preferencias.rango_precio_max) {
               if (a.precio >= preferencias.rango_precio_min && a.precio <= preferencias.rango_precio_max) {
                 scoreA += 5;
               }
               if (b.precio >= preferencias.rango_precio_min && b.precio <= preferencias.rango_precio_max) {
                 scoreB += 5;
               }
             }

             // Priorizar productos con descuento
             if (a.descuento && a.descuento > 0) scoreA += 3;
             if (b.descuento && b.descuento > 0) scoreB += 3;

             // Priorizar productos con características de peso/dimensiones si hay filtros de búsqueda
             if (filters.searchTerm) {
               const terminoBusqueda = filters.searchTerm.toLowerCase();
               
               // Verificar coincidencias de peso
               if (terminoBusqueda.includes('kg') || terminoBusqueda.includes('kilo') || terminoBusqueda.includes('peso')) {
                 if (a.peso && a.peso > 0) scoreA += 4;
                 if (b.peso && b.peso > 0) scoreB += 4;
               }
               
               // Verificar coincidencias de dimensiones
               if (terminoBusqueda.includes('cm') || terminoBusqueda.includes('metro') || terminoBusqueda.includes('dimension')) {
                 if (a.dimensiones || a.metros_por_caja) scoreA += 4;
                 if (b.dimensiones || b.metros_por_caja) scoreB += 4;
               }
               
               // Verificar coincidencias en descripción
               if (a.descripcion && a.descripcion.toLowerCase().includes(terminoBusqueda)) scoreA += 2;
               if (b.descripcion && b.descripcion.toLowerCase().includes(terminoBusqueda)) scoreB += 2;
             }

             // Ordenar por score y luego por precio
             if (scoreA !== scoreB) {
               return scoreB - scoreA;
             }

             // Si los scores son iguales, ordenar por precio según la configuración
             return filters.orderAsc ? a.precio - b.precio : b.precio - a.precio;
           });
         } else {
           // Si no hay preferencias, ordenar solo por precio
           productosOrdenados = productosOrdenados.sort((a, b) => {
             return filters.orderAsc ? a.precio - b.precio : b.precio - a.precio;
           });
         }

        // Tomar solo los primeros productos según el límite
        productosOrdenados = productosOrdenados.slice(0, numProductos);

       setProductos(productosOrdenados);

    } catch (err) {
      console.error('Error al obtener productos adicionales:', err);
      setError('Error al cargar productos adicionales');
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
          <span className="text-gray-600">Buscando productos adicionales...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border border-red-200 mb-6">
        <div className="flex items-center justify-center py-8">
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Search className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos adicionales</h3>
            <p className="text-sm text-gray-700">
              Intenta ajustar los filtros para encontrar más productos que te puedan interesar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Search className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-blue-900">Productos que te pueden interesar</h2>
          <span className="ml-2 text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
            {productos.length} productos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {productos.map((producto, index) => {
          const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);
          const stockStatus = getStockStatus(producto.stock_actual);

          return (
            <div 
              key={producto.id_producto} 
              className="bg-white p-3 rounded-lg shadow-sm flex flex-col h-full justify-between hover:shadow-md transition-shadow"
            >
              {/* Badge de "Nuevo" */}
              <div className="relative">
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
                  Nuevo
                </div>
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

                {/* Información adicional */}
                <div className="mb-2">
                  {producto.categorias?.nombre_categoria && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded mb-1">
                      {producto.categorias.nombre_categoria}
                    </div>
                  )}
                  {producto.materiales?.nombre_materiales && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                      {producto.materiales.nombre_materiales}
                    </div>
                  )}
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
          Productos adicionales basados en tus filtros de búsqueda
        </p>
      </div>
    </div>
  );
};

export default ProductosAdicionales; 