import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, TrendingUp, Heart, Eye, ShoppingCart, Users, BarChart3, Sparkles, Gift, Target, Zap } from 'lucide-react';

interface RecomendacionesNuevosUsuariosProps {
  usuario: string;
}

const RecomendacionesNuevosUsuarios: React.FC<RecomendacionesNuevosUsuariosProps> = ({ usuario }) => {
  const [seccionActiva, setSeccionActiva] = useState('bienvenida');

  // Datos de ejemplo para nuevos usuarios
  const productosPopulares = [
    {
      id: 1,
      nombre: "Cerámica Porcelana Blanca",
      precio: 150.00,
      imagen: "https://via.placeholder.com/200x150/f3f4f6/6b7280?text=Cerámica+Blanca",
      categoria: "Baño",
      relevancia: 95,
      razon: "Producto más vendido en tu área"
    },
    {
      id: 2,
      nombre: "Cerámica Mármol Gris",
      precio: 180.00,
      imagen: "https://via.placeholder.com/200x150/f3f4f6/6b7280?text=Cerámica+Gris",
      categoria: "Cocina",
      relevancia: 92,
      razon: "Tendencia actual en diseño"
    },
    {
      id: 3,
      nombre: "Cerámica Gres Antracita",
      precio: 120.00,
      imagen: "https://via.placeholder.com/200x150/f3f4f6/6b7280?text=Cerámica+Antracita",
      categoria: "Piso",
      relevancia: 88,
      razon: "Excelente relación calidad-precio"
    }
  ];

  const categoriasPopulares = [
    { nombre: "Baño", porcentaje: 45, icono: "🚿" },
    { nombre: "Cocina", porcentaje: 30, icono: "🍳" },
    { nombre: "Piso", porcentaje: 25, icono: "🏠" }
  ];

  const ProductCard = ({ producto }: { producto: any }) => (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={producto.imagen} 
          alt={producto.nombre}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {producto.relevancia}% relevante
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h3>
        <p className="text-sm text-gray-600 mb-2">{producto.categoria}</p>
        <p className="text-xs text-amber-600 mb-3">✨ {producto.razon}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">${producto.precio}</span>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido a tu experiencia personalizada!</h1>
                <p className="text-sm text-gray-600">Descubre productos perfectos para ti</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">👤 {usuario}</span>
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-xs text-green-700 font-medium">Nuevo Usuario</span>
              </div>
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
                onClick={() => setSeccionActiva('bienvenida')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  seccionActiva === 'bienvenida'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Gift className="h-4 w-4 mr-2" />
                Bienvenida
              </button>
              <button
                onClick={() => setSeccionActiva('productos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  seccionActiva === 'productos'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Star className="h-4 w-4 mr-2" />
                Productos Populares
              </button>
              <button
                onClick={() => setSeccionActiva('explorar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  seccionActiva === 'explorar'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Target className="h-4 w-4 mr-2" />
                Explorar Categorías
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido de las Pestañas */}
        {seccionActiva === 'bienvenida' && (
          <div>
            {/* Mensaje de Bienvenida */}
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
              <div className="text-center">
                <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Bienvenido a tu experiencia personalizada!</h2>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Estamos emocionados de tenerte aquí. Nuestro sistema inteligente aprenderá tus preferencias 
                  para mostrarte los productos más relevantes. ¡Comienza explorando!
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Comenzar Exploración
                  </button>
                  <button className="border border-amber-500 text-amber-600 px-6 py-3 rounded-lg font-medium hover:bg-amber-50 transition-colors">
                    Ver Tutorial
                  </button>
                </div>
              </div>
            </div>

            {/* Cómo Funciona */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">¿Cómo funciona nuestro sistema?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Explora Productos</h4>
                  <p className="text-sm text-gray-600">Ve productos y nuestro sistema aprenderá tus gustos</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Interactúa</h4>
                  <p className="text-sm text-gray-600">Da like, guarda favoritos y compra productos</p>
                </div>
                <div className="text-center">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Recibe Recomendaciones</h4>
                  <p className="text-sm text-gray-600">Disfruta de sugerencias personalizadas</p>
                </div>
              </div>
            </div>

            {/* Consejos para Nuevos Usuarios */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Gift className="h-5 w-5 mr-2 text-amber-600" />
                Consejos para aprovechar al máximo tu experiencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Explora diferentes categorías</h4>
                    <p className="text-sm text-gray-600">Cuanto más explores, mejor serán tus recomendaciones</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Usa los filtros de búsqueda</h4>
                    <p className="text-sm text-gray-600">Especifica tus preferencias para resultados más precisos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Guarda tus favoritos</h4>
                    <p className="text-sm text-gray-600">Ayuda al sistema a entender mejor tus gustos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Comparte tu experiencia</h4>
                    <p className="text-sm text-gray-600">Las reseñas ayudan a otros usuarios como tú</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'productos' && (
          <div>
            {/* Productos Populares para Nuevos Usuarios */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Star className="h-6 w-6 text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Productos Populares para Comenzar</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Estos son algunos de nuestros productos más populares. ¡Explóralos para que nuestro sistema 
                comience a entender tus preferencias!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosPopulares.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            </div>

            {/* Estadísticas Básicas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lo que otros usuarios están explorando</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">1,250+</div>
                  <div className="text-sm text-gray-600">Productos disponibles</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Categorías diferentes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4.8★</div>
                  <div className="text-sm text-gray-600">Calificación promedio</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'explorar' && (
          <div>
            {/* Explorar Categorías */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Target className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Explora Nuestras Categorías</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Descubre las categorías más populares y encuentra exactamente lo que necesitas para tu proyecto.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {categoriasPopulares.map((categoria, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-center">
                      <div className="text-4xl mb-4">{categoria.icono}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{categoria.nombre}</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${categoria.porcentaje}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{categoria.porcentaje}% de usuarios exploran esta categoría</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
                  <Eye className="h-5 w-5 mr-2 text-amber-600" />
                  <span className="font-medium text-gray-900">Ver Todos los Productos</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium text-gray-900">Búsqueda Avanzada</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                  <Heart className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium text-gray-900">Mis Favoritos</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  <span className="font-medium text-gray-900">Ver Tendencias</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecomendacionesNuevosUsuarios; 