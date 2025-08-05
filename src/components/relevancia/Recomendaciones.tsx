import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, TrendingUp, Heart, Eye, ShoppingCart, Users, BarChart3 } from 'lucide-react';

interface RecomendacionesProps {
  usuario: string;
}

const Recomendaciones: React.FC<RecomendacionesProps> = ({ usuario }) => {
  const [seccionActiva, setSeccionActiva] = useState('recomendados');
  
  const [recomendaciones] = useState([
    {
      id: 1,
      nombre: 'Cerámica Porcelana Blanca',
      precio: 150.00,
      relevancia: 98,
      razon: 'Porque compraste cerámica similar',
      imagen: 'producto-a'
    },
    {
      id: 2,
      nombre: 'Cerámica Mármol Gris',
      precio: 200.00,
      relevancia: 92,
      razon: 'Porque buscas este estilo',
      imagen: 'producto-b'
    },
    {
      id: 3,
      nombre: 'Cerámica Gres Antracita',
      precio: 180.00,
      relevancia: 89,
      razon: 'Porque otros usuarios lo compraron',
      imagen: 'producto-c'
    }
  ]);

  const [similares] = useState([
    {
      id: 4,
      nombre: 'Cerámica Similar 1',
      precio: 160.00,
      relacion: 'Relacionado con tu última vista',
      imagen: 'similar-1'
    },
    {
      id: 5,
      nombre: 'Cerámica Similar 2',
      precio: 175.00,
      relacion: 'Relacionado con tu última vista',
      imagen: 'similar-2'
    }
  ]);

  const [tendencias] = useState([
    {
      id: 6,
      nombre: 'Cerámica Tendencia 1',
      precio: 190.00,
      popularidad: '🔥 Popular en cerámicas',
      imagen: 'tendencia-1'
    },
    {
      id: 7,
      nombre: 'Cerámica Tendencia 2',
      precio: 165.00,
      popularidad: '🔥 Popular en cerámicas',
      imagen: 'tendencia-2'
    }
  ]);

  const renderEstrellas = (porcentaje: number) => {
    const estrellas = Math.round((porcentaje / 100) * 5);
    return (
      <div className="flex items-center">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < estrellas ? 'fill-current' : ''}`}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600">{porcentaje}% relevante</span>
      </div>
    );
  };

  const ProductCard = ({ producto, tipo }: { producto: any; tipo: string }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="bg-gray-200 h-40 rounded-lg mb-4 flex items-center justify-center">
        <span className="text-gray-500 text-sm">{producto.imagen}</span>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-2">{producto.nombre}</h3>
      
      {tipo === 'recomendado' && (
        <>
          {renderEstrellas(producto.relevancia)}
          <p className="text-sm text-gray-600 mt-1 mb-2">{producto.razon}</p>
          <div className="flex space-x-2 mb-3">
            <button className="flex-1 flex items-center justify-center py-1 px-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Me gusta
            </button>
            <button className="flex-1 flex items-center justify-center py-1 px-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors">
              <ThumbsDown className="h-3 w-3 mr-1" />
              No me gusta
            </button>
          </div>
        </>
      )}
      
      {tipo === 'similar' && (
        <p className="text-sm text-gray-600 mb-2">{producto.relacion}</p>
      )}
      
      {tipo === 'tendencia' && (
        <p className="text-sm text-orange-600 mb-2 flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          {producto.popularidad}
        </p>
      )}
      
      <p className="text-lg font-semibold text-amber-600 mb-3">${producto.precio.toFixed(2)}</p>
      
      <div className="flex space-x-2">
        <button className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm">
          Ver detalles
        </button>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Heart className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Recomendaciones para ti</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">👤 {usuario}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Pestañas de Navegación */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setSeccionActiva('recomendados')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  seccionActiva === 'recomendados'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Star className="h-4 w-4 mr-2" />
                Productos Recomendados
              </button>
              <button
                onClick={() => setSeccionActiva('estadisticas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  seccionActiva === 'estadisticas'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Estadísticas y Perfil
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido de las Pestañas */}
        {seccionActiva === 'recomendados' && (
          <div>
            {/* Sección: Recomendados para ti */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Star className="h-6 w-6 text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Recomendados para ti</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recomendaciones.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} tipo="recomendado" />
                ))}
              </div>
            </div>

            {/* Sección: Productos Similares */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Eye className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Productos Similares</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {similares.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} tipo="similar" />
                ))}
              </div>
            </div>

            {/* Sección: Tendencias */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Tendencias</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tendencias.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} tipo="tendencia" />
                ))}
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'estadisticas' && (
          <div>
            {/* Estadísticas de Relevancia */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu perfil de relevancia</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">87%</div>
                  <div className="text-sm text-gray-600">Precisión de recomendaciones</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-600">Productos vistos este mes</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">Productos comprados</div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Categorías que más te interesan:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Baño</span>
                      <span className="text-sm font-medium text-gray-900">60%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cocina</span>
                      <span className="text-sm font-medium text-gray-900">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Piso</span>
                      <span className="text-sm font-medium text-gray-900">15%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Rango de precios preferido:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">$100 - $200</span>
                      <span className="text-sm font-medium text-gray-900">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">$200 - $300</span>
                      <span className="text-sm font-medium text-gray-900">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">$300+</span>
                      <span className="text-sm font-medium text-gray-900">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Viste Cerámica Porcelana Blanca</p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                  <span className="text-sm text-amber-600 font-medium">95% relevante</span>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Compraste Cerámica Mármol Gris</p>
                    <p className="text-xs text-gray-500">Hace 1 día</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">$200.00</span>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Calificaste producto con 5 estrellas</p>
                    <p className="text-xs text-gray-500">Hace 2 días</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recomendaciones; 