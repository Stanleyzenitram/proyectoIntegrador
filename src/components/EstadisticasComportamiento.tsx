import React, { useState, useEffect } from 'react';
import { Eye, Search, MousePointer, TrendingUp, Clock, Star } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

interface EstadisticasComportamientoProps {
  onRefresh?: () => void;
}

const EstadisticasComportamiento: React.FC<EstadisticasComportamientoProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVistas: 0,
    totalBusquedas: 0,
    totalClics: 0,
    categoriasFrecuentes: [] as { categoria: string; count: number }[],
    materialesFrecuentes: [] as { material: string; count: number }[],
    tiempoPromedioVista: 0,
    ultimaActividad: null as string | null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEstadisticas();
    }
  }, [user]);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);

      if (!user) return;

      // Obtener historial del usuario
      const [historialVistos, historialBusquedas, historialClics] = await Promise.all([
        supabase.from('historial_productos_vistos').select('producto_id, tiempo_vista, fecha_vista').eq('usuario_id', user.id),
        supabase.from('historial_busquedas').select('termino_busqueda, fecha_busqueda').eq('usuario_id', user.id),
        supabase.from('historial_clics').select('producto_id, fecha_clic').eq('usuario_id', user.id)
      ]);

      // Obtener productos vistos para analizar categorías y materiales
      const productosVistosIds = historialVistos.data?.map(h => h.producto_id) || [];
      const { data: productosVistos } = await supabase
        .from('productos')
        .select(`
          id_producto,
          categorias(id_categoria, nombre_categoria),
          materiales(id_materiales, nombre_materiales)
        `)
        .in('id_producto', productosVistosIds);

      // Calcular estadísticas
      const totalVistas = historialVistos.data?.length || 0;
      const totalBusquedas = historialBusquedas.data?.length || 0;
      const totalClics = historialClics.data?.length || 0;

      // Calcular tiempo promedio de vista
      const tiempoTotal = historialVistos.data?.reduce((sum, h) => sum + (h.tiempo_vista || 0), 0) || 0;
      const tiempoPromedioVista = totalVistas > 0 ? tiempoTotal / totalVistas : 0;

      // Calcular categorías frecuentes
      const categoriasCount: Record<string, number> = {};
      productosVistos?.forEach(p => {
        const categoria = p.categorias?.nombre_categoria;
        if (categoria) {
          categoriasCount[categoria] = (categoriasCount[categoria] || 0) + 1;
        }
      });

      const categoriasFrecuentes = Object.entries(categoriasCount)
        .map(([categoria, count]) => ({ categoria, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Calcular materiales frecuentes
      const materialesCount: Record<string, number> = {};
      productosVistos?.forEach(p => {
        const material = p.materiales?.nombre_materiales;
        if (material) {
          materialesCount[material] = (materialesCount[material] || 0) + 1;
        }
      });

      const materialesFrecuentes = Object.entries(materialesCount)
        .map(([material, count]) => ({ material, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Obtener última actividad
      const todasLasFechas = [
        ...(historialVistos.data?.map(h => h.fecha_vista) || []),
        ...(historialBusquedas.data?.map(h => h.fecha_busqueda) || []),
        ...(historialClics.data?.map(h => h.fecha_clic) || [])
      ].filter(Boolean);

      const ultimaActividad = todasLasFechas.length > 0 
        ? new Date(Math.max(...todasLasFechas.map(f => new Date(f).getTime()))).toLocaleDateString()
        : null;

      setStats({
        totalVistas,
        totalBusquedas,
        totalClics,
        categoriasFrecuentes,
        materialesFrecuentes,
        tiempoPromedioVista,
        ultimaActividad
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Analizando tu comportamiento...</span>
        </div>
      </div>
    );
  }

  if (stats.totalVistas === 0 && stats.totalBusquedas === 0 && stats.totalClics === 0) {
    return null; // No mostrar si no hay actividad
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-sm font-semibold text-green-900">Tu Comportamiento</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-green-700 hover:text-green-900"
          >
            Actualizar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Eye className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-lg font-bold text-blue-600">{stats.totalVistas}</span>
          </div>
          <span className="text-xs text-gray-600">Vistas</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Search className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-lg font-bold text-purple-600">{stats.totalBusquedas}</span>
          </div>
          <span className="text-xs text-gray-600">Búsquedas</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <MousePointer className="h-4 w-4 text-orange-600 mr-1" />
            <span className="text-lg font-bold text-orange-600">{stats.totalClics}</span>
          </div>
          <span className="text-xs text-gray-600">Clics</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-lg font-bold text-green-600">{Math.round(stats.tiempoPromedioVista)}s</span>
          </div>
          <span className="text-xs text-gray-600">Promedio</span>
        </div>
      </div>

      {(stats.categoriasFrecuentes.length > 0 || stats.materialesFrecuentes.length > 0) && (
        <div className="space-y-2">
          {stats.categoriasFrecuentes.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-700">Categorías frecuentes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.categoriasFrecuentes.map((cat, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {cat.categoria} ({cat.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.materialesFrecuentes.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-700">Materiales frecuentes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.materialesFrecuentes.map((mat, idx) => (
                  <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {mat.material} ({mat.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {stats.ultimaActividad && (
        <div className="mt-2 text-xs text-gray-600">
          Última actividad: {stats.ultimaActividad}
        </div>
      )}

      <div className="mt-3 p-2 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-700">
          <Star className="h-3 w-3 text-yellow-500 inline mr-1" />
          Estas estadísticas influyen en tus recomendaciones personalizadas
        </p>
      </div>
    </div>
  );
};

export default EstadisticasComportamiento; 