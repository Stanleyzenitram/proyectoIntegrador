import { useEffect, useRef } from 'react';
import { interaccionesService } from '../services/interaccionesService';

interface UseInteraccionesProps {
  productoId?: number;
  tipo?: 'producto' | 'categoria' | 'busqueda';
  termino?: string;
  resultados?: number;
  filtros?: any;
}

export const useInteracciones = ({
  productoId,
  tipo = 'producto',
  termino,
  resultados = 0,
  filtros = {}
}: UseInteraccionesProps = {}) => {
  const tiempoInicioRef = useRef<number>(Date.now());
  const tiempoVistaRef = useRef<number>(0);

  // Registrar clic en producto
  const registrarClic = async (origenClic: string = '') => {
    if (!productoId) return;
    
    try {
      await interaccionesService.registrarClic(productoId, tipo, origenClic);
      console.log('✅ Clic registrado:', { productoId, tipo, origenClic });
    } catch (error) {
      console.error('❌ Error al registrar clic:', error);
    }
  };

  // Registrar búsqueda
  const registrarBusqueda = async () => {
    if (!termino) return;
    
    try {
      await interaccionesService.registrarBusqueda(termino, resultados, filtros);
      console.log('✅ Búsqueda registrada:', { termino, resultados, filtros });
    } catch (error) {
      console.error('❌ Error al registrar búsqueda:', error);
    }
  };

  // Registrar producto visto
  const registrarProductoVisto = async (relevancia: number = 0) => {
    if (!productoId) return;
    
    try {
      await interaccionesService.registrarProductoVisto(productoId, tiempoVistaRef.current, relevancia);
      console.log('✅ Producto visto registrado:', { productoId, tiempo: tiempoVistaRef.current, relevancia });
    } catch (error) {
      console.error('❌ Error al registrar producto visto:', error);
    }
  };

  // Función placeholder para compras (no se usa)
  const registrarCompra = async (precio: number, cantidad: number, ordenId?: string) => {
    // No registramos compras por ahora
    console.log('ℹ️ Registro de compras deshabilitado');
  };

  // Actualizar tiempo de vista
  const actualizarTiempoVista = () => {
    tiempoVistaRef.current = Math.floor((Date.now() - tiempoInicioRef.current) / 1000);
  };

  // Registrar automáticamente cuando el componente se monta
  useEffect(() => {
    if (tipo === 'busqueda' && termino) {
      registrarBusqueda();
    } else if (tipo === 'producto' && productoId) {
      // Registrar vista inicial
      registrarProductoVisto();
    }

    // Actualizar tiempo de vista cada 30 segundos
    const intervalo = setInterval(() => {
      actualizarTiempoVista();
    }, 30000);

    // Limpiar al desmontar
    return () => {
      clearInterval(intervalo);
      actualizarTiempoVista();
      
      // Registrar tiempo final si es un producto
      if (tipo === 'producto' && productoId && tiempoVistaRef.current > 0) {
        registrarProductoVisto();
      }
    };
  }, [productoId, tipo, termino]);

  return {
    registrarClic,
    registrarBusqueda,
    registrarProductoVisto,
    registrarCompra,
    actualizarTiempoVista,
    tiempoVista: tiempoVistaRef.current
  };
}; 