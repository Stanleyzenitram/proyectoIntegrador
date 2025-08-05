import { useState, useEffect, useCallback } from 'react';
import { relevanciaService } from '../api/relevancia';
import { useAuth } from './useAuth';
import {
  TipoProducto,
  PreferenciaUsuario,
  InteraccionUsuario,
  BusquedaUsuario,
  ConfiguracionRelevancia,
  Recomendacion,
  OnboardingUsuario,
  ProductoExpandido,
  FiltrosBusqueda,
  ResultadoBusqueda,
  MetricasRendimiento
} from '../types/relevancia';

export const useRelevancia = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para diferentes datos
  const [tiposProducto, setTiposProducto] = useState<TipoProducto[]>([]);
  const [preferencias, setPreferencias] = useState<PreferenciaUsuario[]>([]);
  const [interacciones, setInteracciones] = useState<InteraccionUsuario[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingUsuario | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionRelevancia | null>(null);
  const [metricas, setMetricas] = useState<MetricasRendimiento | null>(null);

  // Función para manejar errores
  const handleError = useCallback((err: any) => {
    console.error('Error en useRelevancia:', err);
    setError(err.message || 'Error desconocido');
    setLoading(false);
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ===== TIPOS DE PRODUCTO =====
  const cargarTiposProducto = useCallback(async () => {
    try {
      setLoading(true);
      const tipos = await relevanciaService.getTiposProducto();
      setTiposProducto(tipos);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ===== PREFERENCIAS DE USUARIO =====
  const cargarPreferencias = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const prefs = await relevanciaService.getPreferenciasUsuario(user.id);
      setPreferencias(prefs);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  const guardarPreferencia = useCallback(async (preferencia: Omit<PreferenciaUsuario, 'id_preferencia' | 'fecha_creacion' | 'fecha_actualizacion'>) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const nuevaPref = await relevanciaService.savePreferenciaUsuario({
        ...preferencia,
        id_cliente: user.id
      });
      
      // Actualizar estado local
      setPreferencias(prev => {
        const index = prev.findIndex(p => p.id_preferencia === nuevaPref.id_preferencia);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = nuevaPref;
          return updated;
        }
        return [...prev, nuevaPref];
      });
      
      return nuevaPref;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  // ===== INTERACCIONES DE USUARIO =====
  const registrarInteraccion = useCallback(async (interaccion: Omit<InteraccionUsuario, 'id_interaccion' | 'fecha_interaccion' | 'id_cliente'>) => {
    if (!user?.id) return;
    
    try {
      const nuevaInteraccion = await relevanciaService.registrarInteraccion({
        ...interaccion,
        id_cliente: user.id
      });
      
      // Actualizar estado local
      setInteracciones(prev => [nuevaInteraccion, ...prev]);
      
      return nuevaInteraccion;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [user?.id, handleError]);

  const cargarInteracciones = useCallback(async (limite: number = 50) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const interaccionesData = await relevanciaService.getInteraccionesUsuario(user.id, limite);
      setInteracciones(interaccionesData);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  // ===== BÚSQUEDAS =====
  const registrarBusqueda = useCallback(async (busqueda: Omit<BusquedaUsuario, 'id_busqueda' | 'fecha_busqueda' | 'id_cliente'>) => {
    if (!user?.id) return;
    
    try {
      const nuevaBusqueda = await relevanciaService.registrarBusqueda({
        ...busqueda,
        id_cliente: user.id
      });
      
      return nuevaBusqueda;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [user?.id, handleError]);

  // ===== RECOMENDACIONES =====
  const generarRecomendaciones = useCallback(async (limite: number = 10) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const recs = await relevanciaService.generarRecomendaciones(user.id, limite);
      setRecomendaciones(recs);
      return recs;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  const cargarRecomendaciones = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const recs = await relevanciaService.getRecomendacionesUsuario(user.id);
      setRecomendaciones(recs);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  const marcarRecomendacionMostrada = useCallback(async (idRecomendacion: number) => {
    try {
      await relevanciaService.marcarRecomendacionMostrada(idRecomendacion);
      
      // Actualizar estado local
      setRecomendaciones(prev => 
        prev.map(rec => 
          rec.id_recomendacion === idRecomendacion 
            ? { ...rec, mostrada: true }
            : rec
        )
      );
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const marcarRecomendacionClickeada = useCallback(async (idRecomendacion: number) => {
    try {
      await relevanciaService.marcarRecomendacionClickeada(idRecomendacion);
      
      // Actualizar estado local
      setRecomendaciones(prev => 
        prev.map(rec => 
          rec.id_recomendacion === idRecomendacion 
            ? { ...rec, clickeada: true }
            : rec
        )
      );
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // ===== BÚSQUEDA AVANZADA =====
  const buscarProductos = useCallback(async (filtros: FiltrosBusqueda): Promise<ResultadoBusqueda | null> => {
    try {
      setLoading(true);
      const resultado = await relevanciaService.buscarProductos(filtros);
      
      // Registrar la búsqueda
      if (user?.id) {
        await registrarBusqueda({
          termino_busqueda: filtros.termino || '',
          filtros_aplicados: filtros,
          resultados_obtenidos: resultado.total,
          tiempo_busqueda_ms: resultado.tiempo_busqueda_ms,
          exito: resultado.productos.length > 0
        });
      }
      
      return resultado;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, registrarBusqueda, handleError]);

  // ===== CONFIGURACIÓN =====
  const cargarConfiguracion = useCallback(async (nombre: string = 'configuracion_default') => {
    try {
      setLoading(true);
      const config = await relevanciaService.getConfiguracionRelevancia(nombre);
      setConfiguracion(config);
      return config;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const actualizarConfiguracion = useCallback(async (configuracion: Partial<ConfiguracionRelevancia>) => {
    try {
      setLoading(true);
      const configActualizada = await relevanciaService.updateConfiguracionRelevancia(configuracion);
      setConfiguracion(configActualizada);
      return configActualizada;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ===== MÉTRICAS =====
  const cargarMetricas = useCallback(async () => {
    try {
      setLoading(true);
      const metricasData = await relevanciaService.getMetricasRendimiento();
      setMetricas(metricasData);
      return metricasData;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ===== ONBOARDING =====
  const cargarOnboarding = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const onboardingData = await relevanciaService.getOnboardingUsuario(user.id);
      setOnboarding(onboardingData);
      return onboardingData;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  const iniciarOnboarding = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const nuevoOnboarding = await relevanciaService.iniciarOnboarding(user.id);
      setOnboarding(nuevoOnboarding);
      return nuevoOnboarding;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError]);

  const actualizarOnboarding = useCallback(async (paso: number, preferencias?: Record<string, any>) => {
    if (!onboarding) return;
    
    try {
      setLoading(true);
      const onboardingActualizado = await relevanciaService.actualizarOnboarding(
        onboarding.id_onboarding,
        paso,
        preferencias
      );
      setOnboarding(onboardingActualizado);
      return onboardingActualizado;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onboarding, handleError]);

  // ===== PRODUCTOS =====
  const obtenerProductoExpandido = useCallback(async (idProducto: number): Promise<ProductoExpandido | null> => {
    try {
      setLoading(true);
      const producto = await relevanciaService.getProductoExpandido(idProducto);
      
      // Registrar vista del producto
      if (user?.id) {
        await registrarInteraccion({
          id_producto: idProducto,
          tipo_interaccion: 'vista'
        });
      }
      
      return producto;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, registrarInteraccion, handleError]);

  const obtenerProductosSimilares = useCallback(async (idProducto: number, limite: number = 6): Promise<ProductoExpandido[]> => {
    try {
      setLoading(true);
      const productos = await relevanciaService.getProductosSimilares(idProducto, limite);
      return productos;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Cargar datos iniciales cuando el usuario cambie
  useEffect(() => {
    if (user?.id) {
      cargarTiposProducto();
      cargarPreferencias();
      cargarInteracciones();
      cargarRecomendaciones();
      cargarOnboarding();
      cargarConfiguracion();
    }
  }, [
    user?.id,
    cargarTiposProducto,
    cargarPreferencias,
    cargarInteracciones,
    cargarRecomendaciones,
    cargarOnboarding,
    cargarConfiguracion
  ]);

  return {
    // Estados
    loading,
    error,
    tiposProducto,
    preferencias,
    interacciones,
    recomendaciones,
    onboarding,
    configuracion,
    metricas,
    
    // Funciones
    clearError,
    cargarTiposProducto,
    cargarPreferencias,
    guardarPreferencia,
    registrarInteraccion,
    cargarInteracciones,
    registrarBusqueda,
    generarRecomendaciones,
    cargarRecomendaciones,
    marcarRecomendacionMostrada,
    marcarRecomendacionClickeada,
    buscarProductos,
    cargarConfiguracion,
    actualizarConfiguracion,
    cargarMetricas,
    cargarOnboarding,
    iniciarOnboarding,
    actualizarOnboarding,
    obtenerProductoExpandido,
    obtenerProductosSimilares
  };
}; 