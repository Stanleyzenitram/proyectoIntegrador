import React, { useState, useEffect } from 'react';
import { History, Eye, Search, Calendar, Filter, Loader2 } from 'lucide-react';
import { interaccionesService, ProductoVisto, BusquedaRealizada } from '../../services/interaccionesService';

const MiHistorial: React.FC = () => {
  const [tabActivo, setTabActivo] = useState('vistos');
  const [filtroFecha, setFiltroFecha] = useState('30dias');
  const [cargando, setCargando] = useState(true);

  const [productosVistos, setProductosVistos] = useState<ProductoVisto[]>([]);
  const [busquedasRealizadas, setBusquedasRealizadas] = useState<BusquedaRealizada[]>([]);

  // Función para obtener el número de días según el filtro
  const obtenerDias = (filtro: string): number => {
    switch (filtro) {
      case '7dias': return 7;
      case '30dias': return 30;
      case '90dias': return 90;
      case '1año': return 365;
      default: return 30;
    }
  };

  // Cargar datos del historial
  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const dias = obtenerDias(filtroFecha);

      const [vistos, busquedas] = await Promise.all([
        interaccionesService.obtenerProductosVistos(dias),
        interaccionesService.obtenerBusquedas(dias)
      ]);

      setProductosVistos(vistos);
      setBusquedasRealizadas(busquedas);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambie el filtro
  useEffect(() => {
    cargarHistorial();
  }, [filtroFecha]);

  const renderEstrellas = (porcentaje: number) => {
    const estrellas = Math.round((porcentaje / 100) * 5);
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Historial de Actividad</h1>
        <p className="text-gray-600">Revisa tus productos vistos, búsquedas y preferencias</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
            <select
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="7dias">Últimos 7 días</option>
              <option value="30dias">Últimos 30 días</option>
              <option value="90dias">Últimos 90 días</option>
              <option value="1año">Último año</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setTabActivo('vistos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tabActivo === 'vistos'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Productos Vistos</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {productosVistos.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setTabActivo('busquedas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tabActivo === 'busquedas'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Búsquedas</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {busquedasRealizadas.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Contenido de los tabs */}
        <div className="min-h-96">
          {cargando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="ml-2 text-gray-600">Cargando historial...</span>
            </div>
          ) : (
            <>
              {/* Productos Vistos */}
              {tabActivo === 'vistos' && (
                <div className="p-6">
                  {productosVistos.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No has visto productos aún</h3>
                      <p className="text-gray-500">Cuando veas productos, aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productosVistos.map((producto) => (
                        <div key={producto.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Eye className="h-5 w-5 text-amber-600" />
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
                                <span className="text-sm text-gray-500">Relevancia:</span>
                                {renderEstrellas(producto.relevancia)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Búsquedas Realizadas */}
              {tabActivo === 'busquedas' && (
                <div className="p-6">
                  {busquedasRealizadas.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No has realizado búsquedas aún</h3>
                      <p className="text-gray-500">Cuando busques productos, aparecerán aquí</p>
                    </div>
                  ) : (
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
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Estadísticas Resumidas */}
      {!cargando && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Actividad</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{productosVistos.length}</div>
              <div className="text-sm text-gray-600">Productos vistos</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{busquedasRealizadas.length}</div>
              <div className="text-sm text-gray-600">Búsquedas realizadas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiHistorial; 