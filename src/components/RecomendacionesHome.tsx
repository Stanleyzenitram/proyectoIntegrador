import React from 'react';
import { Star, Eye, Loader2 } from 'lucide-react';
import { useRecomendacionesHome } from '../hooks/useRecomendacionesHome';
import { useNavigate } from 'react-router-dom';
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

interface RecomendacionesHomeProps {
  onProductClick: (product: Producto) => void;
  filters?: Filters;
  numRecomendaciones?: number;
}

const RecomendacionesHome: React.FC<RecomendacionesHomeProps> = ({ onProductClick, filters, numRecomendaciones = 12 }) => {
  const { recomendaciones, loading, error } = useRecomendacionesHome(numRecomendaciones, filters);
  const navigate = useNavigate();

  const calcularPrecioConDescuento = (precio: number, descuento?: number) => {
    if (!descuento) return precio;
    return precio * (1 - descuento / 100);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Sin stock', color: 'text-red-600' };
    if (stock <= 3) return { text: 'Stock bajo', color: 'text-yellow-600' };
    return { text: 'Disponible', color: 'text-green-600' };
  };

  const renderEstrellas = (score: number) => {
    const estrellas = Math.round((score / 100) * 5);
    return (
      <div className="flex text-amber-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-xs ${i < estrellas ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200 mb-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amber-600 mr-2" />
          <span className="text-gray-600">Cargando recomendaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border border-red-200 mb-6">
        <div className="flex items-center justify-center py-8">
          <span className="text-red-600">Error al cargar recomendaciones</span>
        </div>
      </div>
    );
  }

  if (recomendaciones.length === 0) {
    // Si no hay recomendaciones personalizadas, mostrar mensaje informativo
    const hasFilters = filters && Object.values(filters).some(value => 
      typeof value === 'string' ? value !== '' : value === true
    );

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {hasFilters ? 'No se encontraron recomendaciones' : '¡Comienza a explorar!'}
            </h3>
            <p className="text-sm text-blue-700">
              {hasFilters 
                ? 'Intenta ajustar los filtros o explorar más productos para recibir recomendaciones personalizadas.'
                : 'Ve productos, realiza búsquedas y haz clic en lo que te interese para recibir recomendaciones personalizadas.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200 mb-6">
             <div className="flex items-center justify-between mb-4">
         <div className="flex items-center">
           <Star className="h-6 w-6 text-amber-600 mr-2" />
           <h2 className="text-xl font-bold text-amber-900">Recomendados para ti</h2>
           <span className="ml-2 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
             {recomendaciones.length} productos
           </span>
         </div>
         <button
           onClick={() => navigate('/recomendaciones')}
           className="text-sm text-amber-700 hover:text-amber-900 font-medium"
         >
           Ver todas →
         </button>
       </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4`}>
        {recomendaciones.map((recomendacion, index) => {
          const producto = recomendacion.producto;
          const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);
          const stockStatus = getStockStatus(producto.stock_actual);

          return (
            <div 
              key={producto.id_producto} 
              className="bg-white p-3 rounded-lg shadow-sm flex flex-col h-full justify-between hover:shadow-md transition-shadow"
            >
              {/* Badge de posición */}
              <div className="relative">
                <div className="absolute top-1 left-1 bg-amber-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
                  #{index + 1}
                </div>
                <div className="absolute top-1 right-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {recomendacion.score.toFixed(0)}
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
                  className="text-xs font-medium mb-2 cursor-pointer hover:text-orange-500 line-clamp-2"
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

                {/* Score de relevancia */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Relevancia:</span>
                  {renderEstrellas(recomendacion.score)}
                </div>

                                 {/* Razones */}
                 {recomendacion.razones.length > 0 && (
                   <div className="mb-2">
                     {recomendacion.razones.map((razon, idx) => (
                       <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded mb-1 flex items-center">
                         <Star className="h-2 w-2 text-yellow-500 mr-1" />
                         {razon}
                       </div>
                     ))}
                   </div>
                 )}

                <button
                  onClick={() => onProductClick(producto)}
                  disabled={producto.stock_actual === 0}
                  className={`w-full py-1.5 px-2 rounded text-xs ${
                    producto.stock_actual > 0
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
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
          Basado en tu historial de navegación y preferencias
        </p>
      </div>
    </div>
  );
};

export default RecomendacionesHome; 