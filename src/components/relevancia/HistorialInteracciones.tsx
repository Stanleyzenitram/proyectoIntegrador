import React, { useState } from 'react';
import { History, Eye, ShoppingCart, Search, Trash2, Calendar, Filter, Download } from 'lucide-react';

const HistorialInteracciones: React.FC = () => {
  const [tabActivo, setTabActivo] = useState('vistos');
  const [filtroFecha, setFiltroFecha] = useState('30dias');

  const [productosVistos] = useState([
    {
      id: 1,
      nombre: 'Cerámica Porcelana Blanca',
      fecha: '2024-01-15 14:30',
      tiempo: '2 minutos',
      relevancia: 95
    },
    {
      id: 2,
      nombre: 'Cerámica Mármol Gris',
      fecha: '2024-01-15 14:25',
      tiempo: '1 minuto',
      relevancia: 87
    },
    {
      id: 3,
      nombre: 'Cerámica Gres Antracita',
      fecha: '2024-01-15 14:20',
      tiempo: '3 minutos',
      relevancia: 92
    }
  ]);

  const [productosComprados] = useState([
    {
      id: 4,
      nombre: 'Cerámica Porcelana Blanca',
      fecha: '2024-01-14 16:45',
      precio: 150.00,
      cantidad: 2
    },
    {
      id: 5,
      nombre: 'Cerámica Mármol Gris',
      fecha: '2024-01-12 11:20',
      precio: 200.00,
      cantidad: 1
    }
  ]);

  const [busquedasRealizadas] = useState([
    {
      id: 6,
      termino: 'cerámica baño',
      fecha: '2024-01-15 14:25',
      resultados: 45
    },
    {
      id: 7,
      termino: 'porcelana blanca',
      fecha: '2024-01-15 14:20',
      resultados: 23
    },
    {
      id: 8,
      termino: 'mármol gris',
      fecha: '2024-01-14 16:40',
      resultados: 18
    }
  ]);

  const handleLimpiarHistorial = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer.')) {
      console.log('Historial limpiado');
      alert('Historial limpiado exitosamente');
    }
  };

  const handleExportar = () => {
    console.log('Exportando historial...');
    alert('Historial exportado exitosamente');
  };

  const renderEstrellas = (porcentaje: number) => {
    const estrellas = Math.round((porcentaje / 100) * 5);
    return (
      <div className="flex text-amber-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-xs ${i < estrellas ? 'text-yellow-400' : 'text-gray-300'}`}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <History className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900">Historial de Interacciones</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="7dias">Últimos 7 días</option>
                <option value="30dias">Últimos 30 días</option>
                <option value="90dias">Últimos 90 días</option>
                <option value="1año">Último año</option>
              </select>
              <button
                onClick={handleExportar}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </button>
              <button
                onClick={handleLimpiarHistorial}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Pestañas */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setTabActivo('vistos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  tabActivo === 'vistos'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="h-4 w-4 mr-2" />
                Productos vistos
              </button>
              <button
                onClick={() => setTabActivo('comprados')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  tabActivo === 'comprados'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Productos comprados
              </button>
              <button
                onClick={() => setTabActivo('busquedas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  tabActivo === 'busquedas'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Búsquedas realizadas
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="bg-white rounded-lg shadow-sm border">
          
          {/* Productos Vistos */}
          {tabActivo === 'vistos' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Productos Vistos</h2>
                <span className="text-sm text-gray-500">{productosVistos.length} productos</span>
              </div>
              
              <div className="space-y-4">
                {productosVistos.map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">🖼️</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{producto.nombre}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {producto.fecha}
                          </span>
                          <span>Tiempo: {producto.tiempo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {renderEstrellas(producto.relevancia)}
                          <span className="text-sm text-gray-600">{producto.relevancia}% relevante</span>
                        </div>
                      </div>
                      <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                        Ver producto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Productos Comprados */}
          {tabActivo === 'comprados' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Productos Comprados</h2>
                <span className="text-sm text-gray-500">{productosComprados.length} productos</span>
              </div>
              
              <div className="space-y-4">
                {productosComprados.map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{producto.nombre}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {producto.fecha}
                          </span>
                          <span>Cantidad: {producto.cantidad}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-amber-600">${producto.precio.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Total: ${(producto.precio * producto.cantidad).toFixed(2)}</p>
                      </div>
                      <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                        Ver factura
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Búsquedas Realizadas */}
          {tabActivo === 'busquedas' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Búsquedas Realizadas</h2>
                <span className="text-sm text-gray-500">{busquedasRealizadas.length} búsquedas</span>
              </div>
              
              <div className="space-y-4">
                {busquedasRealizadas.map((busqueda) => (
                  <div key={busqueda.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Search className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">"{busqueda.termino}"</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {busqueda.fecha}
                          </span>
                          <span>{busqueda.resultados} resultados encontrados</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                        Repetir búsqueda
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas del Historial */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Historial</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{productosVistos.length}</div>
              <div className="text-sm text-gray-600">Productos vistos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{productosComprados.length}</div>
              <div className="text-sm text-gray-600">Productos comprados</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{busquedasRealizadas.length}</div>
              <div className="text-sm text-gray-600">Búsquedas realizadas</div>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {productosComprados.length > 0 ? Math.round((productosComprados.length / productosVistos.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Tasa de conversión</div>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Categorías más visitadas</h4>
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
              <h4 className="font-medium text-gray-900 mb-2">Rango de precios preferido</h4>
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
      </div>
    </div>
  );
};

export default HistorialInteracciones; 