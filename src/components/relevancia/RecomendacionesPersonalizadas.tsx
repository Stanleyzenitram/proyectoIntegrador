import React, { useState, useEffect } from 'react';
import { Star, Eye, Search, Clock, Loader2, RefreshCw, Filter } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { Producto } from '../../types/index';

interface Recomendacion {
  producto: Producto;
  score: number;
  razones: string[];
  tipo: 'personalizada' | 'similar';
}

const RecomendacionesPersonalizadas: React.FC = () => {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [categorias, setCategorias] = useState<{ id_categoria: string; nombre_categoria: string }[]>([]);
  const [mostrarSimilares, setMostrarSimilares] = useState(true);

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id_categoria, nombre_categoria')
        .order('nombre_categoria');
      
      if (!error && data) {
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Calcular recomendaciones personalizadas
  const calcularRecomendaciones = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRecomendaciones([]);
        return;
      }

      // Obtener configuración de relevancia del usuario
      const { data: config } = await supabase
        .from('configuracion_relevancia')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      // Obtener historial del usuario
      const [historialVistos, historialBusquedas, historialClics, preferencias] = await Promise.all([
        supabase.from('historial_productos_vistos').select('producto_id, tiempo_vista, relevancia_calculada').eq('usuario_id', user.id),
        supabase.from('historial_busquedas').select('termino_busqueda, resultados_encontrados').eq('usuario_id', user.id),
        supabase.from('historial_clics').select('producto_id, tipo_clic').eq('usuario_id', user.id),
        supabase.from('preferencias_usuarios').select('*').eq('usuario_id', user.id).single()
      ]);

      // Obtener productos con filtros
      let query = supabase
        .from('productos')
        .select(`
          *,
          categorias(id_categoria, nombre_categoria),
          estilos(id_estilo, nombre_estilo),
          materiales(id_materiales, nombre_materiales)
        `)
        .eq('disponibilidad', true)
        .order('precio', { ascending: true });

      if (filtroCategoria) {
        query = query.eq('id_categoria', filtroCategoria);
      }

      const { data: productos, error } = await query;

      if (error || !productos) {
        console.error('Error al obtener productos:', error);
        setRecomendaciones([]);
        return;
      }

      // Calcular scores de relevancia para cada producto
      const recomendacionesConScore = productos.map(producto => {
        let score = 0;
        const razones: string[] = [];

        // Configuración por defecto si no existe
        const pesos = config || {
          peso_tiempo_vista: 25,
          peso_busquedas: 20,
          peso_clics: 15,
          peso_preferencias_usuario: 20,
          peso_categoria: 10,
          peso_precio: 5,
          peso_popularidad: 5
        };

        // 1. Score por tiempo de vista
        const vistos = historialVistos.data?.filter(h => h.producto_id === producto.id_producto) || [];
        if (vistos.length > 0) {
          const tiempoTotal = vistos.reduce((sum, v) => sum + (v.tiempo_vista || 0), 0);
          const scoreVista = Math.min(tiempoTotal / 100, 1) * pesos.peso_tiempo_vista;
          score += scoreVista;
          if (scoreVista > 0) razones.push(`Visto por ${Math.floor(tiempoTotal / 60)}m ${tiempoTotal % 60}s`);
        }

        // 2. Score por búsquedas relacionadas
        const busquedas = historialBusquedas.data || [];
        const terminosProducto = producto.nombre_producto.toLowerCase().split(' ');
        const terminosCategoria = producto.categorias?.nombre_categoria?.toLowerCase().split(' ') || [];
        
        busquedas.forEach(busqueda => {
          const terminoBusqueda = busqueda.termino_busqueda.toLowerCase();
          const coincidencias = [...terminosProducto, ...terminosCategoria].filter(termino => 
            terminoBusqueda.includes(termino) || termino.includes(terminoBusqueda)
          ).length;
          
          if (coincidencias > 0) {
            const scoreBusqueda = (coincidencias / Math.max(terminosProducto.length, 1)) * pesos.peso_busquedas;
            score += scoreBusqueda;
            razones.push(`Coincide con búsqueda: "${busqueda.termino_busqueda}"`);
          }
        });

        // 3. Score por clics
        const clics = historialClics.data?.filter(c => c.producto_id === producto.id_producto) || [];
        if (clics.length > 0) {
          const scoreClics = Math.min(clics.length * 10, pesos.peso_clics);
          score += scoreClics;
          razones.push(`Clickeado ${clics.length} veces`);
        }

        // 4. Score por preferencias de usuario
        if (preferencias?.data) {
          const pref = preferencias.data;
          
          // Categoría preferida
          if (pref.categoria_preferida && producto.categorias?.nombre_categoria?.toLowerCase().includes(pref.categoria_preferida.toLowerCase())) {
            score += pesos.peso_preferencias_usuario * 0.3;
            razones.push('Categoría de tu preferencia');
          }

          // Rango de precio
          if (pref.rango_precio_min && pref.rango_precio_max) {
            if (producto.precio >= pref.rango_precio_min && producto.precio <= pref.rango_precio_max) {
              score += pesos.peso_precio;
              razones.push('En tu rango de precio');
            }
          }
        }

        // 5. Score por popularidad (simulado)
        const popularidad = Math.random() * 20 + 80; // Simular popularidad entre 80-100
        score += (popularidad / 100) * pesos.peso_popularidad;

        // 6. Score por descuento
        if (producto.descuento && producto.descuento > 0) {
          score += 10;
          razones.push(`${producto.descuento}% de descuento`);
        }

        return {
          producto,
          score: Math.round(score * 100) / 100,
          razones: razones.slice(0, 3), // Máximo 3 razones
          tipo: 'personalizada' as const
        };
      });

      // Ordenar por score y tomar los mejores
      const mejoresRecomendaciones = recomendacionesConScore
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      // Agregar productos similares si está habilitado
      let todasLasRecomendaciones = mejoresRecomendaciones;
      
      if (mostrarSimilares && mejoresRecomendaciones.length > 0) {
        const productosSimilares = await calcularProductosSimilares(mejoresRecomendaciones, productos);
        todasLasRecomendaciones = [...mejoresRecomendaciones, ...productosSimilares];
      }

      setRecomendaciones(todasLasRecomendaciones);
    } catch (error) {
      console.error('Error al calcular recomendaciones:', error);
      setRecomendaciones([]);
    } finally {
      setCargando(false);
    }
  };

  // Función para calcular productos similares
  const calcularProductosSimilares = async (recomendaciones: Recomendacion[], todosProductos: Producto[]) => {
    const productosSimilares: Recomendacion[] = [];
    const productosYaRecomendados = new Set(recomendaciones.map(r => r.producto.id_producto));

    // Para cada recomendación, buscar productos similares
    for (const recomendacion of recomendaciones.slice(0, 3)) { // Solo las top 3
      const producto = recomendacion.producto;
      
      // Encontrar productos de la misma categoría
      const similares = todosProductos
        .filter(p => 
          p.id_producto !== producto.id_producto && 
          !productosYaRecomendados.has(p.id_producto) &&
          p.id_categoria === producto.id_categoria &&
          p.disponibilidad === true
        )
        .slice(0, 2); // Máximo 2 similares por producto

      for (const similar of similares) {
        productosYaRecomendados.add(similar.id_producto);
        
        // Calcular score de similitud
        let scoreSimilitud = 50; // Score base
        
        // Mismo material
        if (similar.id_materiales === producto.id_materiales) {
          scoreSimilitud += 20;
        }
        
        // Mismo estilo
        if (similar.id_estilo === producto.id_estilo) {
          scoreSimilitud += 15;
        }
        
        // Rango de precio similar (±20%)
        const diferenciaPrecio = Math.abs(similar.precio - producto.precio) / producto.precio;
        if (diferenciaPrecio <= 0.2) {
          scoreSimilitud += 15;
        }

        productosSimilares.push({
          producto: similar,
          score: scoreSimilitud,
          razones: [
            `Similar a "${producto.nombre_producto}"`,
            `Misma categoría: ${similar.categorias?.nombre_categoria}`,
            similar.descuento ? `${similar.descuento}% de descuento` : 'Precio competitivo'
          ],
          tipo: 'similar' as const
        });
      }
    }

    return productosSimilares;
  };

  // Refrescar recomendaciones
  const refrescarRecomendaciones = async () => {
    setRefrescando(true);
    await calcularRecomendaciones();
    setRefrescando(false);
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    calcularRecomendaciones();
  }, [filtroCategoria, mostrarSimilares]);

  const renderEstrellas = (score: number) => {
    const estrellas = Math.round((score / 100) * 5);
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

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-gray-600">Calculando recomendaciones...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recomendaciones Personalizadas</h1>
        <p className="text-gray-600">Productos seleccionados especialmente para ti basado en tu historial y preferencias</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Categoría:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mostrarSimilares"
              checked={mostrarSimilares}
              onChange={(e) => setMostrarSimilares(e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="mostrarSimilares" className="text-sm text-gray-700">
              Incluir productos similares
            </label>
          </div>

          <button
            onClick={refrescarRecomendaciones}
            disabled={refrescando}
            className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {refrescando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{refrescando ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Recomendaciones */}
      {recomendaciones.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hay recomendaciones aún</h3>
          <p className="text-gray-500 mb-4">
            Interactúa con productos para recibir recomendaciones personalizadas
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>Ve productos</span>
            </div>
            <div className="flex items-center space-x-1">
              <Search className="h-4 w-4" />
              <span>Busca términos</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span>Haz clics</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recomendaciones.map((recomendacion, index) => (
            <div key={recomendacion.producto.id_producto} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Badge de posición y tipo */}
              <div className="relative">
                <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  #{index + 1}
                </div>
                <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full ${
                  recomendacion.tipo === 'personalizada' ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                  {recomendacion.tipo === 'personalizada' ? recomendacion.score.toFixed(0) : 'Similar'}
                </div>
                {recomendacion.tipo === 'similar' && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Similar
                  </div>
                )}
              </div>

              {/* Imagen del producto */}
              <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                {recomendacion.producto.imagen_url ? (
                  <img
                    src={recomendacion.producto.imagen_url}
                    alt={recomendacion.producto.nombre_producto}
                    className="h-full w-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Star className="h-12 w-12 mx-auto mb-2" />
                    <span className="text-sm">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {recomendacion.producto.nombre_producto}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-amber-600">
                    ${recomendacion.producto.precio.toFixed(2)}
                  </span>
                  {recomendacion.producto.descuento && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      -{recomendacion.producto.descuento}%
                    </span>
                  )}
                </div>

                {/* Score de relevancia */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Relevancia:</span>
                  {renderEstrellas(recomendacion.score)}
                </div>

                {/* Razones */}
                {recomendacion.razones.length > 0 && (
                  <div className="space-y-1">
                    {recomendacion.razones.map((razon, idx) => (
                      <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {razon}
                      </div>
                    ))}
                  </div>
                )}

                {/* Categoría */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {recomendacion.producto.categorias?.nombre_categoria}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información sobre el algoritmo */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">¿Cómo se calculan las recomendaciones?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-1">Recomendaciones Personalizadas:</h4>
            <ul className="space-y-1">
              <li>• Tiempo que has visto productos</li>
              <li>• Términos que has buscado</li>
              <li>• Productos en los que has hecho clic</li>
              <li>• Tus preferencias personales</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Productos Similares:</h4>
            <ul className="space-y-1">
              <li>• Misma categoría</li>
              <li>• Materiales similares</li>
              <li>• Estilos relacionados</li>
              <li>• Rango de precio similar</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Puntuación:</h4>
            <ul className="space-y-1">
              <li>• 0-20: Baja relevancia</li>
              <li>• 21-40: Relevancia media</li>
              <li>• 41-60: Buena relevancia</li>
              <li>• 61-80: Alta relevancia</li>
              <li>• 81-100: Excelente relevancia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecomendacionesPersonalizadas; 