import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import type { Producto } from '../types/index';

interface Filters {
  searchTerm: string;
  selectedCategory: string;
  selectedMaterial: string;
  selectedEstilo: string;
  minPrice: string;
  maxPrice: string;
  orderAsc: boolean;
  showOnlyOffers: boolean;
  minRelevancia: string;
}

interface RecomendacionHome {
  producto: Producto;
  score: number;
  razones: string[];
}

export const useRecomendacionesHome = (limit: number = 6, filters?: Filters) => {
  const { user } = useAuth();
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecomendaciones();
    } else {
      setRecomendaciones([]);
      setLoading(false);
    }
  }, [user, filters]);

  const fetchRecomendaciones = async () => {
    try {
      setLoading(true);
      setError(null);

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

      // Determinar el límite de recomendaciones basado en la configuración
      let limiteRecomendaciones = limit; // Valor por defecto
      
      if (config) {
        // Si hay configuración específica del usuario, usarla
        if (config.max_recomendaciones_home) {
          limiteRecomendaciones = config.max_recomendaciones_home;
        } else if (config.configuracion?.configuracionAvanzada?.maxRecomendacionesHome) {
          // Si no hay configuración específica, usar la configuración general
          limiteRecomendaciones = config.configuracion.configuracionAvanzada.maxRecomendacionesHome;
        }
      }

             // Obtener historial del usuario
       const [historialVistos, historialBusquedas, historialClics, preferencias] = await Promise.all([
         supabase.from('historial_productos_vistos').select('producto_id, tiempo_vista').eq('usuario_id', user.id),
         supabase.from('historial_busquedas').select('termino_busqueda').eq('usuario_id', user.id),
         supabase.from('historial_clics').select('producto_id, cantidad_clics').eq('usuario_id', user.id),
         supabase.from('preferencias_usuarios').select('*').eq('usuario_id', user.id).single()
       ]);

             // Obtener productos disponibles
       const { data: productos, error: productosError } = await supabase
         .from('productos')
         .select(`
           *,
           categorias(id_categoria, nombre_categoria),
           estilos(id_estilo, nombre_estilo),
           materiales(id_materiales, nombre_materiales)
         `)
         .eq('disponibilidad', true)
         .order('precio', { ascending: true });

       // Obtener IDs de productos ya vistos para excluirlos
       const productosVistosIds = historialVistos.data?.map(h => h.producto_id) || [];

      if (productosError || !productos) {
        console.error('Error al obtener productos:', productosError);
        setRecomendaciones([]);
        return;
      }

                           // Calcular scores de relevancia para cada producto (excluyendo los ya vistos)
        const productosNoVistos = productos.filter(producto => !productosVistosIds.includes(producto.id_producto));
        
        const recomendacionesConScore = productosNoVistos.map(producto => {
         let score = 0;
         const razones: string[] = [];

         // Configuración por defecto si no existe
         const pesos = config || {
           peso_tiempo_vista: 0.25,
           peso_busquedas: 0.30,
           peso_clics: 0.25,
           peso_preferencias: 0.20
         };

                   // 1. Score por tiempo de vista (IMPACTO MUY ALTO)
          const vistos = historialVistos.data?.filter(h => h.producto_id === producto.id_producto) || [];
          if (vistos.length > 0) {
            const tiempoTotal = vistos.reduce((sum, v) => sum + (v.tiempo_vista || 0), 0);
            // Impacto muy alto: tiempo de vista tiene mayor peso
            const scoreVista = Math.min(tiempoTotal / 30, 1) * 50; // Hasta 50 puntos por tiempo de vista
            score += scoreVista;
            if (scoreVista > 0) {
              const minutos = Math.floor(tiempoTotal / 60);
              const segundos = tiempoTotal % 60;
              razones.push(`Visto por ${minutos}m ${segundos}s`);
            }
          }

                   // 2. Score por búsquedas relacionadas (IMPACTO MUY ALTO) - MEJORADO
          const busquedas = historialBusquedas.data || [];
          const terminosProducto = producto.nombre_producto.toLowerCase().split(' ');
          const terminosCategoria = producto.categorias?.nombre_categoria?.toLowerCase().split(' ') || [];
          const terminosMaterial = producto.materiales?.nombre_materiales?.toLowerCase().split(' ') || [];
          const terminosEstilo = producto.estilos?.nombre_estilo?.toLowerCase().split(' ') || [];
          const terminosDescripcion = producto.descripcion?.toLowerCase().split(' ') || [];
          
          // Agregar términos de peso/dimensiones si están disponibles
          const terminosPeso = [];
          if (producto.peso) terminosPeso.push(producto.peso.toString());
          if (producto.dimensiones) terminosPeso.push(producto.dimensiones.toLowerCase());
          if (producto.formato) terminosPeso.push(producto.formato.toLowerCase());
          if (producto.metros_por_caja) terminosPeso.push(producto.metros_por_caja.toString());
          
          busquedas.forEach(busqueda => {
            const terminoBusqueda = busqueda.termino_busqueda.toLowerCase();
            const todosTerminos = [
              ...terminosProducto, 
              ...terminosCategoria, 
              ...terminosMaterial, 
              ...terminosEstilo,
              ...terminosDescripcion,
              ...terminosPeso
            ];
            
            // Mejorar la lógica de coincidencias con pesos diferentes
            let coincidenciasExactas = 0;
            let coincidenciasParciales = 0;
            let coincidenciasPeso = 0;
            
            todosTerminos.forEach(termino => {
              if (terminoBusqueda === termino) {
                coincidenciasExactas += 3; // Coincidencia exacta vale más
              } else if (terminoBusqueda.includes(termino) || termino.includes(terminoBusqueda)) {
                coincidenciasParciales += 1;
              }
            });
            
            // Verificar coincidencias específicas de peso/dimensiones
            if (terminoBusqueda.includes('kg') || terminoBusqueda.includes('kilo') || terminoBusqueda.includes('peso')) {
              if (producto.peso) {
                coincidenciasPeso += 2;
              }
            }
            
            if (terminoBusqueda.includes('cm') || terminoBusqueda.includes('metro') || terminoBusqueda.includes('dimension')) {
              if (producto.dimensiones || producto.metros_por_caja) {
                coincidenciasPeso += 2;
              }
            }
            
            const totalCoincidencias = coincidenciasExactas + coincidenciasParciales + coincidenciasPeso;
            
            if (totalCoincidencias > 0) {
              // Impacto muy alto: búsquedas tienen mayor peso
              const scoreBusqueda = Math.min((totalCoincidencias / Math.max(todosTerminos.length, 1)) * 50, 50); // Hasta 50 puntos por búsqueda
              score += scoreBusqueda;
              
              // Razón más específica
              if (coincidenciasPeso > 0) {
                razones.push(`Coincide con búsqueda de peso/dimensiones: "${busqueda.termino_busqueda}"`);
              } else if (coincidenciasExactas > 0) {
                razones.push(`Coincidencia exacta con: "${busqueda.termino_busqueda}"`);
              } else {
                razones.push(`Coincide con búsqueda: "${busqueda.termino_busqueda}"`);
              }
            }
          });

                   // 3. Score por clics (IMPACTO MUY ALTO)
          const clic = historialClics.data?.find(c => c.producto_id === producto.id_producto);
          if (clic && clic.cantidad_clics) {
            // Impacto muy alto: cada clic vale más puntos
            const scoreClics = Math.min(clic.cantidad_clics * 20, 40); // Hasta 40 puntos por clics
            score += scoreClics;
            razones.push(`Clickeado ${clic.cantidad_clics} veces`);
          }

                   // 4. Score por categorías similares (IMPACTO ALTO)
          const categoriasVistos = historialVistos.data?.map(h => h.producto_id) || [];
          const productosVistos = productos.filter(p => categoriasVistos.includes(p.id_producto));
          const categoriasFrecuentes = productosVistos.reduce((acc, p) => {
            const cat = p.categorias?.nombre_categoria;
            if (cat) acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Si el usuario ve mucho una categoría, dar más peso a productos similares
          const categoriaProducto = producto.categorias?.nombre_categoria;
          if (categoriaProducto && categoriasFrecuentes[categoriaProducto]) {
            const frecuencia = categoriasFrecuentes[categoriaProducto];
            const scoreCategoria = Math.min(frecuencia * 10, 30); // Hasta 30 puntos por categoría frecuente
            score += scoreCategoria;
            razones.push(`Categoría frecuente: ${categoriaProducto}`);
          }

                   // 5. Score por materiales similares (IMPACTO MEDIO)
          const materialesVistos = productosVistos.reduce((acc, p) => {
            const mat = p.materiales?.nombre_materiales;
            if (mat) acc[mat] = (acc[mat] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const materialProducto = producto.materiales?.nombre_materiales;
          if (materialProducto && materialesVistos[materialProducto]) {
            const frecuencia = materialesVistos[materialProducto];
            const scoreMaterial = Math.min(frecuencia * 8, 20); // Hasta 20 puntos por material frecuente
            score += scoreMaterial;
            razones.push(`Material frecuente: ${materialProducto}`);
          }

                   // 6. Score por preferencias de usuario (IMPACTO ALTO)
          if (preferencias?.data) {
            const pref = preferencias.data;
            
            // Categoría preferida
            if (pref.categoria_preferida && producto.categorias?.nombre_categoria?.toLowerCase().includes(pref.categoria_preferida.toLowerCase())) {
              score += 25;
              razones.push('De tu categoría preferida');
            }

            // Rango de precio
            if (pref.rango_precio_min && pref.rango_precio_max) {
              if (producto.precio >= pref.rango_precio_min && producto.precio <= pref.rango_precio_max) {
                score += 20;
                razones.push('En tu rango de precio');
              }
            }

            // Material preferido
            if (pref.material_preferido && producto.materiales?.nombre_materiales?.toLowerCase().includes(pref.material_preferido.toLowerCase())) {
              score += 15;
              razones.push('De tu material preferido');
            }

            // Estilo preferido
            if (pref.estilo_preferido && producto.estilos?.nombre_estilo?.toLowerCase().includes(pref.estilo_preferido.toLowerCase())) {
              score += 15;
              razones.push('De tu estilo preferido');
            }
          }

                   // 7. Score por descuento (IMPACTO MEDIO)
          if (producto.descuento && producto.descuento > 0) {
            const scoreDescuento = Math.min(producto.descuento * 0.5, 15); // Hasta 15 puntos por descuento
            score += scoreDescuento;
            razones.push(`${producto.descuento}% de descuento`);
          }

                    // 8. Score por popularidad (IMPACTO BAJO)
          const popularidad = Math.random() * 3 + 1; // Simular popularidad entre 1-4
          score += popularidad;

          // 9. Score por similitud de precio con productos vistos (MEJORADO)
          const preciosVistos = productosVistos.map(p => p.precio);
          if (preciosVistos.length > 0) {
            const precioPromedio = preciosVistos.reduce((sum, precio) => sum + precio, 0) / preciosVistos.length;
            const diferenciaPrecio = Math.abs(producto.precio - precioPromedio);
            const porcentajeDiferencia = (diferenciaPrecio / precioPromedio) * 100;
            
            // Score más granular basado en la similitud de precio
            if (porcentajeDiferencia <= 10) { // Muy similar (10% o menos)
              score += 15;
              razones.push('Precio muy similar a productos vistos');
            } else if (porcentajeDiferencia <= 25) { // Similar (25% o menos)
              score += 10;
              razones.push('Precio similar a productos vistos');
            } else if (porcentajeDiferencia <= 50) { // Moderadamente similar (50% o menos)
              score += 5;
              razones.push('Precio moderadamente similar');
            }
          }

          // 9.5. Score por similitud de peso/dimensiones con productos vistos (NUEVO)
          if (producto.peso) {
            const pesosVistos = productosVistos
              .filter(p => p.peso)
              .map(p => p.peso as number);
            
            if (pesosVistos.length > 0) {
              const pesoPromedio = pesosVistos.reduce((sum, peso) => sum + peso, 0) / pesosVistos.length;
              const diferenciaPeso = Math.abs(producto.peso - pesoPromedio);
              const porcentajeDiferenciaPeso = (diferenciaPeso / pesoPromedio) * 100;
              
              if (porcentajeDiferenciaPeso <= 30) { // Si el peso está dentro del 30% del promedio
                score += 8;
                razones.push('Peso similar a productos vistos');
              }
            }
          }

          // 10. Score por tendencias recientes (MEJORADO)
          const productosRecientes = historialVistos.data?.slice(-5) || []; // Últimos 5 productos vistos
          const categoriasRecientes = productosRecientes.map(h => {
            const prod = productos.find(p => p.id_producto === h.producto_id);
            return prod?.categorias?.nombre_categoria;
          }).filter(Boolean);

          if (categoriasRecientes.includes(producto.categorias?.nombre_categoria)) {
            score += 15;
            razones.push('Tendencia reciente');
          }

          // 10.5. Score por búsquedas recientes (NUEVO)
          const busquedasRecientes = historialBusquedas.data?.slice(-3) || []; // Últimas 3 búsquedas
          busquedasRecientes.forEach(busqueda => {
            const terminoBusqueda = busqueda.termino_busqueda.toLowerCase();
            const terminosProducto = producto.nombre_producto.toLowerCase();
            const terminosDescripcion = producto.descripcion?.toLowerCase() || '';
            
            if (terminosProducto.includes(terminoBusqueda) || terminosDescripcion.includes(terminoBusqueda)) {
              score += 12; // Búsquedas recientes tienen más peso
              razones.push(`Búsqueda reciente: "${busqueda.termino_busqueda}"`);
            }
          });

          // 11. Score por características específicas de peso/dimensiones (NUEVO)
          if (producto.peso && producto.peso > 0) {
            // Si el usuario busca productos pesados o ligeros
            const busquedasPeso = busquedas.filter(b => 
              b.termino_busqueda.toLowerCase().includes('pesado') || 
              b.termino_busqueda.toLowerCase().includes('ligero') ||
              b.termino_busqueda.toLowerCase().includes('kg') ||
              b.termino_busqueda.toLowerCase().includes('kilo')
            );
            
            if (busquedasPeso.length > 0) {
              score += 8;
              razones.push('Características de peso relevantes');
            }
          }

          if (producto.dimensiones || producto.metros_por_caja) {
            // Si el usuario busca productos por dimensiones
            const busquedasDimensiones = busquedas.filter(b => 
              b.termino_busqueda.toLowerCase().includes('cm') || 
              b.termino_busqueda.toLowerCase().includes('metro') ||
              b.termino_busqueda.toLowerCase().includes('dimension')
            );
            
            if (busquedasDimensiones.length > 0) {
              score += 8;
              razones.push('Dimensiones relevantes');
            }
          }

         return {
           producto,
           score: Math.round(score * 100) / 100,
           razones: razones.slice(0, 3) // Máximo 3 razones para el home
         };
      });

             // Aplicar filtros si existen
       let recomendacionesFiltradas = recomendacionesConScore.filter(r => r.score > 0);

       if (filters) {
         recomendacionesFiltradas = recomendacionesFiltradas.filter(recomendacion => {
           const producto = recomendacion.producto;

           // Filtro por búsqueda
           if (filters.searchTerm && !producto.nombre_producto.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
             return false;
           }

           // Filtro por categoría
           if (filters.selectedCategory && producto.categorias?.id_categoria !== filters.selectedCategory) {
             return false;
           }

           // Filtro por material
           if (filters.selectedMaterial && producto.materiales?.id_materiales !== filters.selectedMaterial) {
             return false;
           }

           // Filtro por estilo
           if (filters.selectedEstilo && producto.estilos?.id_estilo !== filters.selectedEstilo) {
             return false;
           }

           // Filtro por precio mínimo
           if (filters.minPrice && producto.precio < parseFloat(filters.minPrice)) {
             return false;
           }

           // Filtro por precio máximo
           if (filters.maxPrice && producto.precio > parseFloat(filters.maxPrice)) {
             return false;
           }

                       // Filtro por ofertas
            if (filters.showOnlyOffers && (!producto.descuento || producto.descuento <= 0)) {
              return false;
            }

            // Filtro por relevancia mínima
            if (filters.minRelevancia && recomendacion.score < parseFloat(filters.minRelevancia)) {
              return false;
            }

            return true;
         });
       }

                               // Ordenar por score y precio según configuración
         const ordenarPor = filters?.orderAsc ? 'precio' : 'score';
         let mejoresRecomendaciones = recomendacionesFiltradas
           .sort((a, b) => {
             if (ordenarPor === 'precio') {
               return filters?.orderAsc ? a.producto.precio - b.producto.precio : b.producto.precio - a.producto.precio;
             } else {
               return b.score - a.score;
             }
           });
         
         // Función para normalizar nombres de productos
         const normalizarNombre = (nombre: string): string => {
           return nombre
             .toLowerCase()
             .trim()
             .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
             .replace(/[^\w\s]/g, ''); // Remover caracteres especiales
         };

         // Eliminar duplicados por ID de producto y por nombre similar
         const productosUnicos = new Map();
         const nombresNormalizados = new Set();
         
         mejoresRecomendaciones.forEach(recomendacion => {
           const producto = recomendacion.producto;
           const nombreNormalizado = normalizarNombre(producto.nombre_producto);
           
           // Verificar si ya existe un producto con el mismo ID o nombre similar
           const existePorId = productosUnicos.has(producto.id_producto);
           const existePorNombre = nombresNormalizados.has(nombreNormalizado);
           
           if (!existePorId && !existePorNombre) {
             productosUnicos.set(producto.id_producto, recomendacion);
             nombresNormalizados.add(nombreNormalizado);
           } else if (existePorId && !existePorNombre) {
             // Si existe por ID pero no por nombre, actualizar con el mejor score
             const existente = productosUnicos.get(producto.id_producto);
             if (existente && recomendacion.score > existente.score) {
               productosUnicos.set(producto.id_producto, recomendacion);
             }
           } else if (!existePorId && existePorNombre) {
             // Si existe por nombre pero no por ID, verificar si es realmente el mismo producto
             // Buscar el producto existente con nombre similar
             let productoExistente = null;
             for (const [id, rec] of productosUnicos) {
               if (normalizarNombre(rec.producto.nombre_producto) === nombreNormalizado) {
                 productoExistente = rec;
                 break;
               }
             }
             
             // Si es el mismo producto (mismo precio, categoría, etc.), mantener el de mejor score
             if (productoExistente && 
                 producto.precio === productoExistente.producto.precio &&
                 producto.categorias?.id_categoria === productoExistente.producto.categorias?.id_categoria) {
               if (recomendacion.score > productoExistente.score) {
                 // Reemplazar el existente
                 productosUnicos.delete(productoExistente.producto.id_producto);
                 productosUnicos.set(producto.id_producto, recomendacion);
               }
             }
           }
         });
         
         mejoresRecomendaciones = Array.from(productosUnicos.values());
         
         // Aplicar límite solo si no es "Todas las disponibles" (50)
         if (limit < 50) {
           mejoresRecomendaciones = mejoresRecomendaciones.slice(0, limiteRecomendaciones);
         }

      setRecomendaciones(mejoresRecomendaciones);

    } catch (err) {
      console.error('Error al obtener recomendaciones:', err);
      setError('Error al cargar recomendaciones');
      setRecomendaciones([]);
    } finally {
      setLoading(false);
    }
  };

  return { recomendaciones, loading, error, refetch: fetchRecomendaciones };
}; 