import React, { useState, useEffect } from 'react';
import { History, Eye, ShoppingCart, Search, Trash2, Calendar, Filter, Download, Loader2 } from 'lucide-react';
import { interaccionesService, ProductoVisto, BusquedaRealizada, ProductoComprado, EstadisticasUsuario } from '../../services/interaccionesService';

const HistorialInteracciones: React.FC = () => {
  const [tabActivo, setTabActivo] = useState('vistos');
  const [filtroFecha, setFiltroFecha] = useState('30dias');
  const [cargando, setCargando] = useState(true);
  const [limpiando, setLimpiando] = useState(false);
  const [exportando, setExportando] = useState(false);

  const [productosVistos, setProductosVistos] = useState<ProductoVisto[]>([]);
  const [busquedasRealizadas, setBusquedasRealizadas] = useState<BusquedaRealizada[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasUsuario>({
    total_productos_vistos: 0,
    total_busquedas: 0,
    total_compras: 0,
    total_clics: 0,
    tasa_conversion: 0,
    categoria_mas_visitada: 'N/A',
    rango_precio_preferido: 'N/A'
  });

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

      const [vistos, busquedas, stats] = await Promise.all([
        interaccionesService.obtenerProductosVistos(dias),
        interaccionesService.obtenerBusquedas(dias),
        interaccionesService.obtenerEstadisticas()
      ]);

      setProductosVistos(vistos);
      setBusquedasRealizadas(busquedas);
      setEstadisticas(stats);
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

  const handleLimpiarHistorial = async () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer.')) {
      try {
        setLimpiando(true);
        await interaccionesService.limpiarHistorial();
        alert('Historial limpiado exitosamente');
        // Recargar datos
        await cargarHistorial();
      } catch (error) {
        console.error('Error al limpiar historial:', error);
        alert('Error al limpiar el historial');
      } finally {
        setLimpiando(false);
      }
    }
  };

  const handleExportar = async () => {
    try {
      setExportando(true);
      await interaccionesService.exportarHistorial();
      alert('Historial exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar historial:', error);
      alert('Error al exportar el historial');
    } finally {
      setExportando(false);
    }
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
                disabled={exportando}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                {exportando ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                {exportando ? 'Exportando...' : 'Exportar'}
              </button>
              <button
                onClick={handleLimpiarHistorial}
                disabled={limpiando}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                {limpiando ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                {limpiando ? 'Limpiando...' : 'Limpiar'}
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
          
          {/* Loading state */}
          {cargando && (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
              <p className="text-gray-600">Cargando historial...</p>
            </div>
          )}

          {/* Productos Vistos */}
          {!cargando && tabActivo === 'vistos' && (
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

          {/* Productos Comprados - Deshabilitado */}
          {!cargando && tabActivo === 'comprados' && (
            <div className="p-6">
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Registro de Compras Deshabilitado</h2>
                <p className="text-gray-500">El registro de compras ha sido deshabilitado temporalmente.</p>
              </div>
            </div>
          )}

          {/* Búsquedas Realizadas */}
          {!cargando && tabActivo === 'busquedas' && (
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
        {!cargando && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Historial</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{estadisticas.total_productos_vistos}</div>
                <div className="text-sm text-gray-600">Productos vistos</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{estadisticas.total_clics}</div>
                <div className="text-sm text-gray-600">Clics en productos</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{estadisticas.total_busquedas}</div>
                <div className="text-sm text-gray-600">Búsquedas realizadas</div>
              </div>
              
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {estadisticas.tasa_conversion}%
                </div>
                <div className="text-sm text-gray-600">Tasa de conversión</div>
              </div>
            </div>
          </div>
        )}

        {/* Información Adicional */}
        {!cargando && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Categorías más visitadas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{estadisticas.categoria_mas_visitada}</span>
                    <span className="text-sm font-medium text-gray-900">Más visitada</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total clics</span>
                    <span className="text-sm font-medium text-gray-900">{estadisticas.total_clics}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Rango de precios preferido</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rango preferido</span>
                    <span className="text-sm font-medium text-gray-900">{estadisticas.rango_precio_preferido}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tasa de conversión</span>
                    <span className="text-sm font-medium text-gray-900">{estadisticas.tasa_conversion}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialInteracciones; 