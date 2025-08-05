import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye, ShoppingCart, Download, Calendar, Target } from 'lucide-react';

const MetricasReportes: React.FC = () => {
  const [filtroFecha, setFiltroFecha] = useState('30dias');
  const [metricas] = useState({
    tiempoPromedio: 2.3,
    precision: 87,
    productosVistos: 45,
    conversion: 12,
    usuariosActivos: 1250,
    busquedasRealizadas: 3400
  });

  const [productosRelevantes] = useState([
    { nombre: 'Cerámica Porcelana Blanca', relevancia: 95, vistas: 120 },
    { nombre: 'Cerámica Mármol Gris', relevancia: 92, vistas: 98 },
    { nombre: 'Cerámica Gres Antracita', relevancia: 89, vistas: 85 },
    { nombre: 'Cerámica Granito Negro', relevancia: 87, vistas: 76 },
    { nombre: 'Cerámica Decorativa', relevancia: 84, vistas: 65 }
  ]);

  const [usuariosActivos] = useState([
    { nombre: 'Usuario A', interacciones: 45, relevancia: 92 },
    { nombre: 'Usuario B', interacciones: 38, relevancia: 88 },
    { nombre: 'Usuario C', interacciones: 32, relevancia: 85 },
    { nombre: 'Usuario D', interacciones: 28, relevancia: 82 },
    { nombre: 'Usuario E', interacciones: 25, relevancia: 79 }
  ]);

  const renderBarraProgreso = (valor: number, max: number, color: string) => {
    const porcentaje = (valor / max) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    );
  };

  const handleExportar = () => {
    // Aquí iría la lógica para exportar el reporte
    console.log('Exportando reporte...');
    alert('Reporte exportado exitosamente');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900">Métricas de Relevancia</h1>
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
                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo promedio</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.tiempoPromedio}s</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Precisión</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.precision}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos vistos</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.productosVistos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversión</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.conversion}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios activos</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.usuariosActivos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Búsquedas</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.busquedasRealizadas}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Gráfico: Tasa de Conversión por Relevancia */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Tasa de Conversión por Relevancia</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">90-100% relevante</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">85%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">80-89% relevante</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">72%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">70-79% relevante</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">58%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">60-69% relevante</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">45%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Menos de 60%</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">28%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico: Productos Más Relevantes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Productos Más Relevantes</h3>
            </div>
            
            <div className="space-y-4">
              {productosRelevantes.map((producto, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                    <p className="text-xs text-gray-500">{producto.vistas} vistas</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${producto.relevancia}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{producto.relevancia}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios Más Activos */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Usuarios Más Activos</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interacciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relevancia Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actividad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosActivos.map((usuario, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-amber-800">
                            {usuario.nombre.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.interacciones}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${usuario.relevancia}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{usuario.relevancia}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Hace 2 horas
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de Rendimiento */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Rendimiento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Fortalezas</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Tiempo de respuesta excelente (2.3s)</li>
                <li>• Alta precisión en recomendaciones (87%)</li>
                <li>• Buena tasa de conversión (12%)</li>
                <li>• Usuarios muy activos (1250)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">⚠️ Áreas de Mejora</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Optimizar productos con baja relevancia</li>
                <li>• Incrementar tasa de conversión</li>
                <li>• Mejorar precisión en categorías específicas</li>
                <li>• Reducir tiempo de respuesta en picos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricasReportes; 