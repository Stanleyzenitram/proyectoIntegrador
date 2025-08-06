import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Star, Eye, Search, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface PreferenciasRelevancia {
  peso_tiempo_vista: number;
  peso_busquedas: number;
  peso_clics: number;
  peso_preferencias_usuario: number;
  peso_categoria: number;
  peso_precio: number;
  peso_popularidad: number;
  tiempo_respuesta_maximo: number;
  max_resultados: number;
  factor_decaimiento_tiempo: number;
}

const MisPreferenciasRelevancia: React.FC = () => {
  const [preferencias, setPreferencias] = useState<PreferenciasRelevancia>({
    peso_tiempo_vista: 25,
    peso_busquedas: 20,
    peso_clics: 15,
    peso_preferencias_usuario: 20,
    peso_categoria: 10,
    peso_precio: 5,
    peso_popularidad: 5,
    tiempo_respuesta_maximo: 2000,
    max_resultados: 50,
    factor_decaimiento_tiempo: 0.1
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Cargar preferencias del usuario
  const cargarPreferencias = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMensaje('Debes iniciar sesión para configurar preferencias');
        return;
      }

      // Buscar preferencias existentes del usuario
      const { data, error } = await supabase
        .from('configuracion_relevancia')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (data && !error) {
        setPreferencias({
          peso_tiempo_vista: data.peso_tiempo_vista || 25,
          peso_busquedas: data.peso_busquedas || 20,
          peso_clics: data.peso_clics || 15,
          peso_preferencias_usuario: data.peso_preferencias_usuario || 20,
          peso_categoria: data.peso_categoria || 10,
          peso_precio: data.peso_precio || 5,
          peso_popularidad: data.peso_popularidad || 5,
          tiempo_respuesta_maximo: data.tiempo_respuesta_maximo || 2000,
          max_resultados: data.max_resultados || 50,
          factor_decaimiento_tiempo: data.factor_decaimiento_tiempo || 0.1
        });
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
      setMensaje('Error al cargar preferencias');
    } finally {
      setCargando(false);
    }
  };

  // Guardar preferencias
  const guardarPreferencias = async () => {
    try {
      setGuardando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMensaje('Debes iniciar sesión para guardar preferencias');
        return;
      }

      // Validar que los pesos sumen 100%
      const sumaPesos = preferencias.peso_tiempo_vista + 
                       preferencias.peso_busquedas + 
                       preferencias.peso_clics + 
                       preferencias.peso_preferencias_usuario + 
                       preferencias.peso_categoria + 
                       preferencias.peso_precio + 
                       preferencias.peso_popularidad;

      if (Math.abs(sumaPesos - 100) > 1) {
        setMensaje('Los pesos deben sumar 100%');
        return;
      }

      // Guardar o actualizar preferencias
      const { error } = await supabase
        .from('configuracion_relevancia')
        .upsert({
          usuario_id: user.id,
          ...preferencias,
          fecha_actualizacion: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setMensaje('Preferencias guardadas exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      setMensaje('Error al guardar preferencias');
    } finally {
      setGuardando(false);
    }
  };

  // Restablecer valores por defecto
  const restablecerValores = () => {
    setPreferencias({
      peso_tiempo_vista: 25,
      peso_busquedas: 20,
      peso_clics: 15,
      peso_preferencias_usuario: 20,
      peso_categoria: 10,
      peso_precio: 5,
      peso_popularidad: 5,
      tiempo_respuesta_maximo: 2000,
      max_resultados: 50,
      factor_decaimiento_tiempo: 0.1
    });
    setMensaje('Valores restablecidos');
    setTimeout(() => setMensaje(''), 3000);
  };

  // Calcular suma de pesos
  const sumaPesos = preferencias.peso_tiempo_vista + 
                   preferencias.peso_busquedas + 
                   preferencias.peso_clics + 
                   preferencias.peso_preferencias_usuario + 
                   preferencias.peso_categoria + 
                   preferencias.peso_precio + 
                   preferencias.peso_popularidad;

  useEffect(() => {
    cargarPreferencias();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-gray-600">Cargando preferencias...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Preferencias de Relevancia</h1>
        <p className="text-gray-600">Configura cómo se calcula la relevancia de los productos para ti</p>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg ${
          mensaje.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {mensaje}
        </div>
      )}

      {/* Configuración de Pesos */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Pesos de Relevancia</h2>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              Math.abs(sumaPesos - 100) <= 1 ? 'text-green-600' : 'text-red-600'
            }`}>
              Total: {sumaPesos.toFixed(1)}%
            </span>
            {Math.abs(sumaPesos - 100) <= 1 && (
              <span className="text-green-500">✓</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tiempo de Vista */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-amber-600" />
              <label className="text-sm font-medium text-gray-700">Tiempo de Vista</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="50"
                value={preferencias.peso_tiempo_vista}
                onChange={(e) => setPreferencias({
                  ...preferencias,
                  peso_tiempo_vista: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{preferencias.peso_tiempo_vista}%</span>
            </div>
          </div>

          {/* Búsquedas */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">Búsquedas</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="50"
                value={preferencias.peso_busquedas}
                onChange={(e) => setPreferencias({
                  ...preferencias,
                  peso_busquedas: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{preferencias.peso_busquedas}%</span>
            </div>
          </div>

          {/* Clics */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <label className="text-sm font-medium text-gray-700">Clics en Productos</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="50"
                value={preferencias.peso_clics}
                onChange={(e) => setPreferencias({
                  ...preferencias,
                  peso_clics: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{preferencias.peso_clics}%</span>
            </div>
          </div>

          {/* Preferencias de Usuario */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <label className="text-sm font-medium text-gray-700">Preferencias Personales</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="50"
                value={preferencias.peso_preferencias_usuario}
                onChange={(e) => setPreferencias({
                  ...preferencias,
                  peso_preferencias_usuario: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{preferencias.peso_preferencias_usuario}%</span>
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Categoría</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="30"
                value={preferencias.peso_categoria}
                onChange={(e) => setPreferencias({
                  ...preferencias,
                  peso_categoria: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{preferencias.peso_categoria}%</span>
            </div>
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Precio</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="20"
                value={preferencias.peso_precio}
                onChange={(e) => setPreferencias({
                  ...preferencias,
                  peso_precio: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{preferencias.peso_precio}%</span>
            </div>
          </div>

          {/* Popularidad */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Popularidad</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="20"
                value={preferencias.peso_popularidad}
                onChange={(e) => setPreferencias({
                  ...preferencias,
                  peso_popularidad: Number(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{preferencias.peso_popularidad}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración Avanzada */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración Avanzada</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tiempo de Respuesta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tiempo de Respuesta Máximo (ms)</label>
            <input
              type="number"
              min="500"
              max="10000"
              step="100"
              value={preferencias.tiempo_respuesta_maximo}
              onChange={(e) => setPreferencias({
                ...preferencias,
                tiempo_respuesta_maximo: Number(e.target.value)
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Máximo de Resultados */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Máximo de Resultados</label>
            <input
              type="number"
              min="10"
              max="200"
              step="10"
              value={preferencias.max_resultados}
              onChange={(e) => setPreferencias({
                ...preferencias,
                max_resultados: Number(e.target.value)
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Factor de Decaimiento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Factor de Decaimiento</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={preferencias.factor_decaimiento_tiempo}
              onChange={(e) => setPreferencias({
                ...preferencias,
                factor_decaimiento_tiempo: Number(e.target.value)
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={guardarPreferencias}
          disabled={guardando || Math.abs(sumaPesos - 100) > 1}
          className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{guardando ? 'Guardando...' : 'Guardar Preferencias'}</span>
        </button>

        <button
          onClick={restablecerValores}
          className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Restablecer Valores</span>
        </button>
      </div>

      {/* Información Adicional */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">¿Cómo funciona?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Tiempo de Vista:</strong> Productos que has visto por más tiempo tienen mayor relevancia</li>
          <li>• <strong>Búsquedas:</strong> Términos que buscas frecuentemente aumentan la relevancia</li>
          <li>• <strong>Clics:</strong> Productos en los que haces clic son considerados más relevantes</li>
          <li>• <strong>Preferencias Personales:</strong> Basado en tu onboarding y preferencias guardadas</li>
          <li>• <strong>Categoría:</strong> Productos de categorías que prefieres</li>
          <li>• <strong>Precio:</strong> Productos en tu rango de precio preferido</li>
          <li>• <strong>Popularidad:</strong> Productos populares entre otros usuarios</li>
        </ul>
      </div>
    </div>
  );
};

export default MisPreferenciasRelevancia; 