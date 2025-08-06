import React, { useState } from 'react';
import { Settings, Save, RotateCcw, BarChart3, TrendingUp, Eye, DollarSign, Tag, Zap } from 'lucide-react';
import { supabase } from '../../services/supabase';

// Configuración por defecto estática
const configuracionPorDefecto = {
  pesos: {
    busqueda: 30,
    historial: 25,
    stock: 15,
    precio: 10,
    descuentos: 10,
    otros: 10
  },
  configuracionAvanzada: {
    tiempoRespuesta: 2.5,
    precisionMinima: 85,
    maxResultados: 50,
    maxRecomendacionesHome: 6,
    actualizacionAutomatica: true,
    loggingDetallado: false
  }
};

const ConfiguracionRelevancia: React.FC = () => {
  const [pesos, setPesos] = useState(configuracionPorDefecto.pesos);
  const [configuracionAvanzada, setConfiguracionAvanzada] = useState(configuracionPorDefecto.configuracionAvanzada);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Calcular total de pesos
  const totalPesos = Object.values(pesos).reduce((sum, peso) => sum + peso, 0);
  const pesosValidos = totalPesos === 100;

  const handlePesoChange = (factor: keyof typeof pesos, valor: number) => {
    setPesos(prev => ({
      ...prev,
      [factor]: valor
    }));
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      setMessage(null);

      console.log('💾 Guardando configuración en Supabase:', { pesos, configuracionAvanzada });

      // Verificar si ya existe una configuración
      const { data: configExistente } = await supabase
        .from('configuracion_relevancia')
        .select('id_configuracion')
        .eq('activo', true)
        .eq('nombre_configuracion', 'configuracion_default')
        .single();

      const configuracionCompleta = {
        nombre_configuracion: 'configuracion_default',
        descripcion: 'Configuración por defecto del sistema de relevancia',
        configuracion: {
          pesos,
          configuracionAvanzada
        },
        activo: true,
        fecha_actualizacion: new Date().toISOString()
      };

      let resultado;
      if (configExistente) {
        // Actualizar configuración existente
        console.log('🔄 Actualizando configuración existente...');
        const { error } = await supabase
          .from('configuracion_relevancia')
          .update(configuracionCompleta)
          .eq('id_configuracion', configExistente.id_configuracion);
        
        resultado = !error;
      } else {
        // Crear nueva configuración
        console.log('🆕 Creando nueva configuración...');
        const { error } = await supabase
          .from('configuracion_relevancia')
          .insert([configuracionCompleta]);
        
        resultado = !error;
      }

      if (resultado) {
        console.log('✅ Configuración guardada exitosamente en la base de datos');
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente en la base de datos' });
      } else {
        console.log('❌ Error al guardar la configuración');
        setMessage({ type: 'error', text: 'Error al guardar la configuración' });
      }

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurar = () => {
    setPesos(configuracionPorDefecto.pesos);
    setConfiguracionAvanzada(configuracionPorDefecto.configuracionAvanzada);
    setMessage({ type: 'success', text: 'Configuración restaurada a valores por defecto' });
    setTimeout(() => setMessage(null), 3000);
  };

  const renderBarraProgreso = (valor: number, color: string) => {
    const porcentaje = valor;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${porcentaje}%` }}
        ></div>
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
              <Settings className="h-8 w-8 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900">Configuración de Relevancia</h1>
            </div>
            <div className="flex items-center space-x-4">
              {message && (
                <div className={`px-4 py-2 rounded-lg text-sm ${
                  message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}
              <button
                onClick={handleGuardar}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleRestaurar}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel Principal de Pesos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Pesos de Factores de Relevancia</h2>
              </div>

              {/* Total de Pesos */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total de pesos:</span>
                  <span className={`text-lg font-bold ${pesosValidos ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPesos}%
                  </span>
                </div>
                {!pesosValidos && (
                  <p className="text-sm text-red-600 mt-1">
                    El total debe ser 100%. Se normalizarán automáticamente al guardar.
                  </p>
                )}
              </div>

              {/* Factores de Relevancia */}
              <div className="space-y-6">
                {/* Coincidencia de Búsqueda */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">Coincidencia de búsqueda</span>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">{pesos.busqueda}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={pesos.busqueda}
                    onChange={(e) => handlePesoChange('busqueda', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: 'linear-gradient(to right, #f59e0b 0%, #f59e0b 50%, #e5e7eb 50%, #e5e7eb 100%)'
                    }}
                  />
                  {renderBarraProgreso(pesos.busqueda, 'bg-blue-500')}
                  <p className="text-sm text-gray-600 mt-2">
                    Peso asignado a la coincidencia exacta con los términos de búsqueda del usuario.
                  </p>
                </div>

                {/* Historial de Usuario */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">Historial de usuario</span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">{pesos.historial}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={pesos.historial}
                    onChange={(e) => handlePesoChange('historial', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: 'linear-gradient(to right, #f59e0b 0%, #f59e0b 50%, #e5e7eb 50%, #e5e7eb 100%)'
                    }}
                  />
                  {renderBarraProgreso(pesos.historial, 'bg-green-500')}
                  <p className="text-sm text-gray-600 mt-2">
                    Peso basado en el comportamiento previo del usuario (compras, vistas, clics).
                  </p>
                </div>

                {/* Stock/Disponibilidad */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-gray-900">Stock/Disponibilidad</span>
                    </div>
                    <span className="text-lg font-semibold text-yellow-600">{pesos.stock}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={pesos.stock}
                    onChange={(e) => handlePesoChange('stock', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: 'linear-gradient(to right, #f59e0b 0%, #f59e0b 50%, #e5e7eb 50%, #e5e7eb 100%)'
                    }}
                  />
                  {renderBarraProgreso(pesos.stock, 'bg-yellow-500')}
                  <p className="text-sm text-gray-600 mt-2">
                    Peso asignado a productos con stock disponible y buena disponibilidad.
                  </p>
                </div>

                {/* Precio */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">Precio</span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">{pesos.precio}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={pesos.precio}
                    onChange={(e) => handlePesoChange('precio', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: 'linear-gradient(to right, #f59e0b 0%, #f59e0b 50%, #e5e7eb 50%, #e5e7eb 100%)'
                    }}
                  />
                  {renderBarraProgreso(pesos.precio, 'bg-green-500')}
                  <p className="text-sm text-gray-600 mt-2">
                    Peso asignado a productos con precios competitivos o en el rango preferido.
                  </p>
                </div>

                {/* Descuentos */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-red-600 mr-2" />
                      <span className="font-medium text-gray-900">Descuentos</span>
                    </div>
                    <span className="text-lg font-semibold text-red-600">{pesos.descuentos}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={pesos.descuentos}
                    onChange={(e) => handlePesoChange('descuentos', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: 'linear-gradient(to right, #f59e0b 0%, #f59e0b 50%, #e5e7eb 50%, #e5e7eb 100%)'
                    }}
                  />
                  {renderBarraProgreso(pesos.descuentos, 'bg-red-500')}
                  <p className="text-sm text-gray-600 mt-2">
                    Peso asignado a productos con descuentos o promociones activas.
                  </p>
                </div>

                {/* Otros Factores */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-medium text-gray-900">Otros factores</span>
                    </div>
                    <span className="text-lg font-semibold text-purple-600">{pesos.otros}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={pesos.otros}
                    onChange={(e) => handlePesoChange('otros', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: 'linear-gradient(to right, #f59e0b 0%, #f59e0b 50%, #e5e7eb 50%, #e5e7eb 100%)'
                    }}
                  />
                  {renderBarraProgreso(pesos.otros, 'bg-purple-500')}
                  <p className="text-sm text-gray-600 mt-2">
                    Peso para factores adicionales como popularidad, valoraciones, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="lg:col-span-1">
            {/* Configuración Avanzada */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración Avanzada</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo máximo de respuesta (segundos)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={configuracionAvanzada.tiempoRespuesta}
                    onChange={(e) => setConfiguracionAvanzada(prev => ({
                      ...prev,
                      tiempoRespuesta: Number(e.target.value)
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precisión mínima (%)
                  </label>
                  <input
                    type="number"
                    value={configuracionAvanzada.precisionMinima}
                    onChange={(e) => setConfiguracionAvanzada(prev => ({
                      ...prev,
                      precisionMinima: Number(e.target.value)
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de resultados
                  </label>
                  <input
                    type="number"
                    value={configuracionAvanzada.maxResultados}
                    onChange={(e) => setConfiguracionAvanzada(prev => ({
                      ...prev,
                      maxResultados: Number(e.target.value)
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recomendaciones en Home
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={configuracionAvanzada.maxRecomendacionesHome}
                    onChange={(e) => setConfiguracionAvanzada(prev => ({
                      ...prev,
                      maxRecomendacionesHome: Number(e.target.value)
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número máximo de productos recomendados a mostrar en el home principal (1-12)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={configuracionAvanzada.actualizacionAutomatica}
                    onChange={(e) => setConfiguracionAvanzada(prev => ({
                      ...prev,
                      actualizacionAutomatica: e.target.checked
                    }))}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Actualización automática de pesos
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={configuracionAvanzada.loggingDetallado}
                    onChange={(e) => setConfiguracionAvanzada(prev => ({
                      ...prev,
                      loggingDetallado: e.target.checked
                    }))}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Logging detallado
                  </label>
                </div>
              </div>
            </div>

            {/* Vista Previa */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Efecto de los cambios</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Los productos se ordenarán según los nuevos pesos configurados.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Los cambios se aplicarán en las próximas búsquedas de los usuarios.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    El sistema mantendrá un registro de la efectividad de esta configuración.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionRelevancia; 