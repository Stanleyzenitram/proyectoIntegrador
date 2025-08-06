import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart, ShoppingCart, Eye, Tag, Package, Palette, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useInteracciones } from '../../hooks/useInteracciones';
import type { Producto } from '../../types/index';

interface DetalleProductoProps {
  onVolver: () => void;
  producto: Producto;
}

const DetalleProducto: React.FC<DetalleProductoProps> = ({ onVolver, producto }) => {
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [productosSimilares, setProductosSimilares] = useState<Producto[]>([]);
  const [loadingSimilares, setLoadingSimilares] = useState(true);
  const [relevancia, setRelevancia] = useState<{ score: number; razones: string[] } | null>(null);
  const [loadingRelevancia, setLoadingRelevancia] = useState(true);
  
  const { user } = useAuth();
  const { registrarProductoVisto } = useInteracciones();

  // Registrar vista del producto
  useEffect(() => {
    if (user && producto) {
      registrarProductoVisto(producto.id_producto);
    }
  }, [user, producto, registrarProductoVisto]);

  // Calcular relevancia del producto
  useEffect(() => {
    if (user && producto) {
      calcularRelevancia();
    } else {
      setLoadingRelevancia(false);
    }
  }, [user, producto]);

  // Cargar productos similares
  useEffect(() => {
    if (producto) {
      cargarProductosSimilares();
    }
  }, [producto]);

  const calcularRelevancia = async () => {
    try {
      setLoadingRelevancia(true);
      
      if (!user) {
        setRelevancia({ score: 50, razones: ['Usuario no autenticado'] });
        return;
      }

      // Obtener configuración de relevancia
      const { data: config } = await supabase
        .from('configuracion_relevancia')
        .select('*')
        .single();

      if (!config) {
        setRelevancia({ score: 50, razones: ['Configuración no disponible'] });
        return;
      }

      let score = 0;
      const razones: string[] = [];

      // Obtener historial del usuario
      const { data: historialVistos } = await supabase
        .from('historial_productos_vistos')
        .select('producto_id, tiempo_vista, relevancia_calculada')
        .eq('usuario_id', user.id)
        .order('fecha_vista', { ascending: false })
        .limit(10);

      const { data: historialBusquedas } = await supabase
        .from('historial_busquedas')
        .select('termino_busqueda')
        .eq('usuario_id', user.id)
        .order('fecha_busqueda', { ascending: false })
        .limit(5);

      const { data: historialClics } = await supabase
        .from('historial_clics')
        .select('producto_id, cantidad_clics')
        .eq('usuario_id', user.id)
        .order('ultimo_clic', { ascending: false })
        .limit(10);

      // Score por categoría similar
      if (historialVistos && historialVistos.length > 0) {
        const categoriasVistas = historialVistos.map(h => h.producto_id);
        if (categoriasVistas.includes(producto.id_producto)) {
          score += config.peso_categoria * 0.8;
          razones.push('Has visto productos de esta categoría antes');
        }
      }

      // Score por material similar
      if (historialVistos && historialVistos.length > 0) {
        const materialesVistos = historialVistos.map(h => h.producto_id);
        if (materialesVistos.includes(producto.id_producto)) {
          score += config.peso_material * 0.7;
          razones.push('Te interesan productos de este material');
        }
      }

      // Score por precio similar
      if (historialVistos && historialVistos.length > 0) {
        const preciosVistos = historialVistos.map(h => h.relevancia_calculada || 0);
        const precioPromedio = preciosVistos.reduce((a, b) => a + b, 0) / preciosVistos.length;
        const diferenciaPrecio = Math.abs(producto.precio - precioPromedio) / precioPromedio;
        
        if (diferenciaPrecio <= 0.1) {
          score += config.peso_precio * 0.9;
          razones.push('Precio similar a productos que has visto');
        } else if (diferenciaPrecio <= 0.25) {
          score += config.peso_precio * 0.6;
          razones.push('Precio dentro de tu rango de interés');
        }
      }

      // Score por búsquedas recientes
      if (historialBusquedas && historialBusquedas.length > 0) {
        const terminosBusqueda = historialBusquedas.map(h => h.termino_busqueda.toLowerCase());
        const nombreProducto = producto.nombre_producto.toLowerCase();
        const descripcionProducto = producto.descripcion?.toLowerCase() || '';
        
        for (const termino of terminosBusqueda) {
          if (nombreProducto.includes(termino) || descripcionProducto.includes(termino)) {
            score += config.peso_busquedas * 0.8;
            razones.push(`Coincide con tu búsqueda "${termino}"`);
            break;
          }
        }
      }

      // Score por clics en productos similares
      if (historialClics && historialClics.length > 0) {
        const productosClickeados = historialClics.map(h => h.producto_id);
        if (productosClickeados.includes(producto.id_producto)) {
          score += config.peso_clics * 0.9;
          razones.push('Has interactuado con productos similares');
        }
      }

      // Normalizar score a 0-100
      score = Math.min(100, Math.max(0, score));
      
      setRelevancia({ score, razones: razones.slice(0, 3) });
    } catch (error) {
      console.error('Error al calcular relevancia:', error);
      setRelevancia({ score: 50, razones: ['Error al calcular relevancia'] });
    } finally {
      setLoadingRelevancia(false);
    }
  };

  const cargarProductosSimilares = async () => {
    try {
      setLoadingSimilares(true);
      
      // Obtener productos de la misma categoría
      const { data: similares, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias(id_categoria, nombre_categoria),
          estilos(id_estilo, nombre_estilo),
          materiales(id_materiales, nombre_materiales)
        `)
        .eq('id_categoria', producto.id_categoria)
        .neq('id_producto', producto.id_producto)
        .eq('disponibilidad', true)
        .limit(3);

      if (error) {
        console.error('Error al cargar productos similares:', error);
        setProductosSimilares([]);
      } else {
        setProductosSimilares(similares || []);
      }
    } catch (error) {
      console.error('Error al cargar productos similares:', error);
      setProductosSimilares([]);
    } finally {
      setLoadingSimilares(false);
    }
  };



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

  const calcularPrecioConDescuento = (precio: number, descuento?: number) => {
    if (!descuento) return precio;
    return precio * (1 - descuento / 100);
  };

  const esProductoIndividual = !producto.metros_por_caja || producto.metros_por_caja === 0;

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
                {producto.imagen ? (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre_producto}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-500 text-lg">Sin imagen</span>
                )}
              </div>
            </div>
          </div>

          {/* Información del Producto */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{producto.nombre_producto}</h1>
              
              {/* Información de Relevancia */}
              {loadingRelevancia ? (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600 mr-2" />
                    <span className="text-amber-800">Calculando relevancia...</span>
                  </div>
                </div>
              ) : relevancia && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {renderEstrellas(relevancia.score)}
                      <span className="text-lg font-semibold text-amber-800">
                        {relevancia.score}% relevante para ti
                      </span>
                    </div>
                  </div>
                  
                  {relevancia.razones.length > 0 && (
                    <>
                      <h3 className="font-medium text-amber-900 mb-2">Por qué es relevante:</h3>
                      <ul className="space-y-1">
                        {relevancia.razones.map((razon: string, index: number) => (
                          <li key={index} className="text-sm text-amber-800 flex items-start">
                            <span className="text-amber-600 mr-2">•</span>
                            {razon}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {/* Precio */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-amber-600">RD${calcularPrecioConDescuento(producto.precio, producto.descuento).toFixed(2)}</span>
                  {producto.descuento && producto.descuento > 0 && (
                    <span className="text-lg text-gray-500 line-through">RD${producto.precio.toFixed(2)}</span>
                  )}
                  {producto.descuento && producto.descuento > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                      {producto.descuento}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Información Básica */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Categoría: {producto.categorias?.nombre_categoria || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Material: {producto.materiales?.nombre_materiales || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Estilo: {producto.estilos?.nombre_estilo || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Formato: {producto.formato || 'N/A'}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock disponible:</span>
                  <span className={`text-sm font-medium ${producto.stock_actual > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {producto.stock_actual} {esProductoIndividual ? 'unidades' : 'cajas'}
                  </span>
                </div>
                {producto.stock_actual <= 10 && (
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

            {/* Información Adicional */}
            {!esProductoIndividual && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Metros por caja:</span>
                    <span className="text-sm font-medium text-gray-900">{producto.metros_por_caja || 0} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Piezas por caja:</span>
                    <span className="text-sm font-medium text-gray-900">{producto.piezas_por_caja || 0} unidades</span>
                  </div>
                  {producto.metros_por_caja && producto.metros_por_caja > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cajas necesarias para 10m²:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.ceil(10 / producto.metros_por_caja)} cajas
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
          
          {loadingSimilares ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600 mr-2" />
              <span className="text-gray-600">Cargando productos similares...</span>
            </div>
          ) : productosSimilares.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productosSimilares.map((productoSimilar) => (
                <div key={productoSimilar.id_producto} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                    {productoSimilar.imagen ? (
                      <img
                        src={productoSimilar.imagen}
                        alt={productoSimilar.nombre_producto}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">Sin imagen</span>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">{productoSimilar.nombre_producto}</h3>
                  
                  <p className="text-lg font-semibold text-amber-600 mb-3">RD${productoSimilar.precio.toFixed(2)}</p>
                  
                  <button className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors">
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron productos similares</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto; 