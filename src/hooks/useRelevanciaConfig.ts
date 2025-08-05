import { useState, useEffect } from 'react';
import { 
  obtenerConfiguracionRelevancia, 
  guardarConfiguracionRelevancia, 
  obtenerConfiguracionPorDefecto,
  validarPesos,
  normalizarPesos,
  type ConfiguracionRelevancia,
  type PesosRelevancia,
  type ConfiguracionAvanzada
} from '../services/relevanciaService';

interface UseRelevanciaConfigReturn {
  // Estado
  configuracion: ConfiguracionRelevancia | null;
  pesos: PesosRelevancia;
  configuracionAvanzada: ConfiguracionAvanzada;
  loading: boolean;
  saving: boolean;
  error: string | null;
  message: { type: 'success' | 'error', text: string } | null;

  // Acciones
  actualizarPesos: (nuevosPesos: PesosRelevancia) => void;
  actualizarConfiguracionAvanzada: (nuevaConfig: ConfiguracionAvanzada) => void;
  guardarConfiguracion: () => Promise<boolean>;
  restaurarConfiguracion: () => void;
  limpiarMensaje: () => void;
  
  // Utilidades
  totalPesos: number;
  pesosValidos: boolean;
}

// Configuración por defecto
const configuracionPorDefecto = obtenerConfiguracionPorDefecto();

export const useRelevanciaConfig = (): UseRelevanciaConfigReturn => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionRelevancia | null>(null);
  const [pesos, setPesos] = useState<PesosRelevancia>(configuracionPorDefecto.configuracion.pesos);
  const [configuracionAvanzada, setConfiguracionAvanzada] = useState<ConfiguracionAvanzada>(configuracionPorDefecto.configuracion.configuracionAvanzada);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Calcular total de pesos
  const totalPesos = Object.values(pesos).reduce((sum, peso) => sum + peso, 0);
  const pesosValidos = validarPesos(pesos);

  // Cargar configuración al montar el componente
  useEffect(() => {
    console.log('🚀 Hook useRelevanciaConfig montado');
    
    const cargarConfiguracion = async () => {
      console.log('🔄 Iniciando carga de configuración...');
      try {
        setLoading(true);
        setError(null);
        
        console.log('📡 Llamando a obtenerConfiguracionRelevancia...');
        const config = await obtenerConfiguracionRelevancia();
        console.log('📦 Configuración obtenida:', config);
        
        if (config && config.configuracion) {
          console.log('✅ Usando configuración de la base de datos');
          setConfiguracion(config);
          setPesos(config.configuracion.pesos);
          setConfiguracionAvanzada(config.configuracion.configuracionAvanzada);
        } else {
          console.log('⚠️ No hay configuración guardada, usando valores por defecto');
          setConfiguracion(configuracionPorDefecto);
          setPesos(configuracionPorDefecto.configuracion.pesos);
          setConfiguracionAvanzada(configuracionPorDefecto.configuracion.configuracionAvanzada);
        }
      } catch (err) {
        console.error('❌ Error al cargar configuración:', err);
        setError('Error al cargar la configuración');
        setConfiguracion(configuracionPorDefecto);
        setPesos(configuracionPorDefecto.configuracion.pesos);
        setConfiguracionAvanzada(configuracionPorDefecto.configuracion.configuracionAvanzada);
      } finally {
        console.log('✅ Carga de configuración completada');
        setLoading(false);
      }
    };

    cargarConfiguracion();
  }, []); // Solo se ejecuta una vez al montar

  // Actualizar pesos
  const actualizarPesos = (nuevosPesos: PesosRelevancia) => {
    setPesos(nuevosPesos);
  };

  // Actualizar configuración avanzada
  const actualizarConfiguracionAvanzada = (nuevaConfig: ConfiguracionAvanzada) => {
    setConfiguracionAvanzada(nuevaConfig);
  };

  // Guardar configuración
  const guardarConfiguracion = async (): Promise<boolean> => {
    console.log('💾 Iniciando guardado de configuración...');
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      // Validar y normalizar pesos si es necesario
      let pesosFinales = pesos;
      if (!validarPesos(pesos)) {
        console.log('⚠️ Pesos no válidos, normalizando...');
        pesosFinales = normalizarPesos(pesos);
        setPesos(pesosFinales);
        setMessage({ 
          type: 'error', 
          text: 'Los pesos han sido normalizados automáticamente para sumar 100%' 
        });
      }

      const configuracionCompleta: ConfiguracionRelevancia = {
        nombre_configuracion: 'configuracion_default',
        descripcion: 'Configuración por defecto del sistema de relevancia',
        configuracion: {
          pesos: pesosFinales,
          configuracionAvanzada
        },
        activo: true
      };

      console.log('📤 Enviando configuración a guardar:', configuracionCompleta);
      const resultado = await guardarConfiguracionRelevancia(configuracionCompleta);
      
      if (resultado) {
        console.log('✅ Configuración guardada exitosamente');
        setConfiguracion(configuracionCompleta);
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
        return true;
      } else {
        console.log('❌ Error al guardar la configuración');
        setError('Error al guardar la configuración');
        return false;
      }
    } catch (err) {
      console.error('❌ Error al guardar configuración:', err);
      setError('Error al guardar la configuración');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Restaurar configuración
  const restaurarConfiguracion = () => {
    console.log('🔄 Restaurando configuración por defecto');
    setConfiguracion(configuracionPorDefecto);
    setPesos(configuracionPorDefecto.configuracion.pesos);
    setConfiguracionAvanzada(configuracionPorDefecto.configuracion.configuracionAvanzada);
    setMessage({ type: 'success', text: 'Configuración restaurada a valores por defecto' });
  };

  // Limpiar mensaje
  const limpiarMensaje = () => {
    setMessage(null);
  };

  // Limpiar mensajes automáticamente después de 3 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return {
    // Estado
    configuracion,
    pesos,
    configuracionAvanzada,
    loading,
    saving,
    error,
    message,

    // Acciones
    actualizarPesos,
    actualizarConfiguracionAvanzada,
    guardarConfiguracion,
    restaurarConfiguracion,
    limpiarMensaje,

    // Utilidades
    totalPesos,
    pesosValidos
  };
}; 