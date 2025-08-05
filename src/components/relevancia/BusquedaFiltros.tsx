import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface BusquedaFiltrosProps {
  onBuscar: (terminos: string, filtros: any) => void;
}

const BusquedaFiltros: React.FC<BusquedaFiltrosProps> = ({ onBuscar }) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    categoria: '',
    materiales: [] as string[],
    estilos: [] as string[],
    precioMin: 0,
    precioMax: 10000,
    disponibilidad: 'todos'
  });

  const categorias = ['Baño', 'Cocina', 'Piso', 'Pared', 'Decoración'];
  const materiales = ['Porcelana', 'Gres', 'Mármol', 'Granito', 'Cerámica'];
  const estilos = ['Moderno', 'Clásico', 'Rústico', 'Minimalista', 'Vintage'];

  const handleBuscar = () => {
    onBuscar(terminoBusqueda, filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoria: '',
      materiales: [],
      estilos: [],
      precioMin: 0,
      precioMax: 10000,
      disponibilidad: 'todos'
    });
    setTerminoBusqueda('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Búsqueda de Productos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filtros Laterales */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-amber-600" />
                  Filtros
                </h2>
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-gray-500 hover:text-amber-600"
                >
                  Limpiar
                </button>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categorías</h3>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Materiales */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Materiales</h3>
                <div className="space-y-2">
                  {materiales.map(material => (
                    <label key={material} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filtros.materiales.includes(material)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFiltros({
                              ...filtros,
                              materiales: [...filtros.materiales, material]
                            });
                          } else {
                            setFiltros({
                              ...filtros,
                              materiales: filtros.materiales.filter(m => m !== material)
                            });
                          }
                        }}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estilos */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Estilos</h3>
                <div className="space-y-2">
                  {estilos.map(estilo => (
                    <label key={estilo} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filtros.estilos.includes(estilo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFiltros({
                              ...filtros,
                              estilos: [...filtros.estilos, estilo]
                            });
                          } else {
                            setFiltros({
                              ...filtros,
                              estilos: filtros.estilos.filter(e => e !== estilo)
                            });
                          }
                        }}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{estilo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rango de Precio */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Rango de Precio</h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filtros.precioMin}
                      onChange={(e) => setFiltros({...filtros, precioMin: Number(e.target.value)})}
                      className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filtros.precioMax}
                      onChange={(e) => setFiltros({...filtros, precioMax: Number(e.target.value)})}
                      className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Disponibilidad</h3>
                <div className="space-y-2">
                  {['todos', 'disponible', 'agotado'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="disponibilidad"
                        value={option}
                        checked={filtros.disponibilidad === option}
                        onChange={(e) => setFiltros({...filtros, disponibilidad: e.target.value})}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Área de Búsqueda y Resultados */}
          <div className="lg:col-span-3">
            {/* Barra de Búsqueda */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleBuscar}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Área de Resultados */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Resultados de búsqueda</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Ordenar por:</span>
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-amber-500 focus:border-amber-500">
                    <option>Más relevantes</option>
                    <option>Precio: menor a mayor</option>
                    <option>Precio: mayor a menor</option>
                    <option>Más recientes</option>
                  </select>
                </div>
              </div>

              {/* Grid de Productos de Ejemplo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Imagen del producto {item}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Cerámica Porcelana {item}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-xs">⭐</span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">95% relevante</span>
                    </div>
                    <p className="text-lg font-semibold text-amber-600 mb-3">$150.00</p>
                    <button className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors">
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              <div className="flex justify-center mt-8">
                <nav className="flex space-x-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                    Anterior
                  </button>
                  <button className="px-3 py-2 bg-amber-600 text-white rounded-md text-sm">1</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">2</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">3</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusquedaFiltros; 