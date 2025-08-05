import React, { useState } from 'react';
import { ArrowLeft, Star, Heart, ShoppingCart, Eye, Tag, Package, Palette, MapPin } from 'lucide-react';

interface DetalleProductoProps {
  onVolver: () => void;
}

const DetalleProducto: React.FC<DetalleProductoProps> = ({ onVolver }) => {
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);

  const producto = {
    id: 1,
    nombre: 'Cerámica Porcelana Blanca',
    descripcion: 'Cerámica de porcelana blanca de alta calidad, perfecta para baños y cocinas. Material resistente y fácil de limpiar, con acabado brillante que mantiene su belleza por años.',
    precio: 150.00,
    precioOriginal: 180.00,
    stock: 25,
    categoria: 'Baño',
    material: 'Porcelana',
    estilo: 'Moderno',
    formato: '30x60 cm',
    metrosPorCaja: 1.08,
    piezasPorCaja: 6,
    relevancia: 95,
    razonesRelevancia: [
      'Coincide con tu búsqueda "cerámica baño"',
      'Similar a productos que has visto anteriormente',
      'En tu rango de precio preferido ($100-$200)',
      'Material que prefieres (Porcelana)',
      'Estilo que te interesa (Moderno)'
    ],
    imagenes: [
      'imagen-principal',
      'imagen-detalle-1',
      'imagen-detalle-2',
      'imagen-detalle-3'
    ],
    especificaciones: {
      'Resistencia al desgaste': 'PEI III',
      'Absorción de agua': '< 0.5%',
      'Resistencia a la flexión': '≥ 35 N/mm²',
      'Resistencia al impacto': '≥ 2.0 J',
      'Resistencia a las manchas': 'Clase 4',
      'Resistencia a los ácidos': 'Clase 4'
    }
  };

  const productosSimilares = [
    {
      id: 2,
      nombre: 'Cerámica Porcelana Gris',
      precio: 160.00,
      relevancia: 88,
      imagen: 'similar-1'
    },
    {
      id: 3,
      nombre: 'Cerámica Porcelana Beige',
      precio: 145.00,
      relevancia: 85,
      imagen: 'similar-2'
    },
    {
      id: 4,
      nombre: 'Cerámica Porcelana Negra',
      precio: 170.00,
      relevancia: 82,
      imagen: 'similar-3'
    }
  ];

  const renderEstrellas = (porcentaje: number) => {
    const estrellas = Math.round((porcentaje / 100) * 5);
    return (
      <div className="flex text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < estrellas ? 'fill-current' : ''}`}
          />
        ))}
      </div>
    );
  };

  const handleAgregarAlCarrito = () => {
    console.log('Agregando al carrito:', { producto, cantidad });
    alert('Producto agregado al carrito exitosamente');
  };

  const handleVerSimilares = () => {
    console.log('Ver productos similares');
    // Aquí iría la navegación a productos similares
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onVolver}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver a resultados
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Heart className="h-6 w-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Eye className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Imágenes del Producto */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="bg-gray-200 h-96 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500 text-lg">{producto.imagenes[imagenActiva]}</span>
              </div>
              
              {/* Miniaturas */}
              <div className="grid grid-cols-4 gap-2">
                {producto.imagenes.map((imagen, index) => (
                  <button
                    key={index}
                    onClick={() => setImagenActiva(index)}
                    className={`h-20 bg-gray-200 rounded-lg flex items-center justify-center text-xs ${
                      imagenActiva === index ? 'ring-2 ring-amber-500' : ''
                    }`}
                  >
                    {imagen}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Información del Producto */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{producto.nombre}</h1>
              
              {/* Información de Relevancia */}
              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {renderEstrellas(producto.relevancia)}
                    <span className="text-lg font-semibold text-amber-800">
                      {producto.relevancia}% relevante para ti
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-amber-900 mb-2">Por qué es relevante:</h3>
                <ul className="space-y-1">
                  {producto.razonesRelevancia.map((razon, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      {razon}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Precio */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-amber-600">${producto.precio.toFixed(2)}</span>
                  {producto.precioOriginal > producto.precio && (
                    <span className="text-lg text-gray-500 line-through">${producto.precioOriginal.toFixed(2)}</span>
                  )}
                  {producto.precioOriginal > producto.precio && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                      {Math.round(((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Información Básica */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Categoría: {producto.categoria}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Material: {producto.material}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Estilo: {producto.estilo}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Formato: {producto.formato}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock disponible:</span>
                  <span className={`text-sm font-medium ${producto.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {producto.stock} unidades
                  </span>
                </div>
                {producto.stock <= 10 && (
                  <p className="text-xs text-orange-600 mt-1">¡Últimas unidades disponibles!</p>
                )}
              </div>

              {/* Cantidad y Acciones */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{cantidad}</span>
                    <button
                      onClick={() => setCantidad(cantidad + 1)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAgregarAlCarrito}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Agregar al carrito
                  </button>
                  <button
                    onClick={handleVerSimilares}
                    className="flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Ver similares
                  </button>
                </div>
              </div>
            </div>

            {/* Especificaciones Técnicas */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(producto.especificaciones).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Metros por caja:</span>
                  <span className="text-sm font-medium text-gray-900">{producto.metrosPorCaja} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Piezas por caja:</span>
                  <span className="text-sm font-medium text-gray-900">{producto.piezasPorCaja} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cajas necesarias para 10m²:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.ceil(10 / producto.metrosPorCaja)} cajas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos Similares */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Productos Similares</h2>
            <button className="text-amber-600 hover:text-amber-700 font-medium">
              Ver todos
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productosSimilares.map((producto) => (
              <div key={producto.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">{producto.imagen}</span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2">{producto.nombre}</h3>
                
                <div className="flex items-center mb-2">
                  {renderEstrellas(producto.relevancia)}
                  <span className="ml-2 text-sm text-gray-600">{producto.relevancia}% relevante</span>
                </div>
                
                <p className="text-lg font-semibold text-amber-600 mb-3">${producto.precio.toFixed(2)}</p>
                
                <button className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors">
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto; 