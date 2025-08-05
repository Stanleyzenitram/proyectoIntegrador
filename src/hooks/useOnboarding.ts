import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface PreferenciasUsuario {
  id_preferencia: number;
  usuario_id: string;
  categorias: string[];
  tipos_piso: string[];
  tipos_pared: string[];
  tipos_bano: string[];
  tipos_cocina: string[];
  materiales: string[];
  materiales_exterior: string[];
  acabados: string[];
  colores: string[];
  rango_precio: string;
  experiencia: string;
  proyecto_actual: string;
  tiempo_proyecto: string;
  completado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export const useOnboarding = (usuarioId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [onboardingCompletado, setOnboardingCompletado] = useState(false);
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verificarOnboarding = async () => {
      if (!usuarioId) {
        setLoading(false);
        setOnboardingCompletado(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Primero verificar si el usuario es cliente
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.log('❌ Error al obtener datos del usuario');
          setLoading(false);
          setOnboardingCompletado(false);
          return;
        }

        const esCliente = userData.user.user_metadata?.role === 'cliente' || !userData.user.user_metadata?.role;
        
        // Si no es cliente, no necesita onboarding
        if (!esCliente) {
          console.log('👔 Usuario es empleado, no necesita onboarding');
          setLoading(false);
          setOnboardingCompletado(true); // Marcar como completado para empleados
          return;
        }

        console.log('🔍 Verificando onboarding para cliente:', userData.user.id);

        const { data, error } = await supabase
          .from('preferencias_usuarios')
          .select('*')
          .eq('usuario_id', userData.user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No se encontraron preferencias - cliente nuevo
            console.log('👤 Cliente nuevo, necesita completar onboarding');
            setOnboardingCompletado(false);
            setPreferencias(null);
          } else {
            console.error('❌ Error al verificar onboarding:', error);
            setError('Error al verificar el estado del onboarding');
            setOnboardingCompletado(false);
          }
        } else if (data) {
          console.log('✅ Preferencias encontradas:', data);
          setPreferencias(data);
          setOnboardingCompletado(data.completado);
        }
      } catch (err) {
        console.error('❌ Error inesperado al verificar onboarding:', err);
        setError('Error inesperado al verificar el onboarding');
        setOnboardingCompletado(false);
      } finally {
        setLoading(false);
      }
    };

    verificarOnboarding();
  }, [usuarioId]);

  const marcarOnboardingCompletado = async (nuevasPreferencias: any) => {
    try {
      console.log('💾 Marcando onboarding como completado:', nuevasPreferencias);

      // Obtener el usuario actual para obtener el ID correcto
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Error al obtener usuario:', userError);
        throw new Error('No se pudo obtener el usuario actual');
      }

      console.log('✅ Usuario obtenido para guardar:', user.id);

      // Primero verificar si ya existe un registro para este usuario
      const { data: existingData, error: checkError } = await supabase
        .from('preferencias_usuarios')
        .select('id_preferencia')
        .eq('usuario_id', user.id)
        .single();

      let result;
      
      if (checkError && checkError.code === 'PGRST116') {
        // No existe registro, crear uno nuevo
        console.log('🆕 Creando nuevo registro de preferencias');
        result = await supabase
          .from('preferencias_usuarios')
          .insert({
            usuario_id: user.id,
            categorias: nuevasPreferencias.categorias,
            tipos_piso: nuevasPreferencias.tiposPiso,
            tipos_pared: nuevasPreferencias.tiposPared,
            tipos_bano: nuevasPreferencias.tiposBano,
            tipos_cocina: nuevasPreferencias.tiposCocina,
            materiales: nuevasPreferencias.materiales,
            materiales_exterior: nuevasPreferencias.materialesExterior,
            acabados: nuevasPreferencias.acabados,
            colores: nuevasPreferencias.colores,
            rango_precio: nuevasPreferencias.rangoPrecio,
            experiencia: nuevasPreferencias.experiencia,
            proyecto_actual: nuevasPreferencias.proyectoActual,
            tiempo_proyecto: nuevasPreferencias.tiempoProyecto,
            completado: true,
            fecha_actualizacion: new Date().toISOString()
          });
      } else if (existingData) {
        // Existe registro, actualizar
        console.log('🔄 Actualizando registro existente:', existingData.id_preferencia);
        result = await supabase
          .from('preferencias_usuarios')
          .update({
            categorias: nuevasPreferencias.categorias,
            tipos_piso: nuevasPreferencias.tiposPiso,
            tipos_pared: nuevasPreferencias.tiposPared,
            tipos_bano: nuevasPreferencias.tiposBano,
            tipos_cocina: nuevasPreferencias.tiposCocina,
            materiales: nuevasPreferencias.materiales,
            materiales_exterior: nuevasPreferencias.materialesExterior,
            acabados: nuevasPreferencias.acabados,
            colores: nuevasPreferencias.colores,
            rango_precio: nuevasPreferencias.rangoPrecio,
            experiencia: nuevasPreferencias.experiencia,
            proyecto_actual: nuevasPreferencias.proyectoActual,
            tiempo_proyecto: nuevasPreferencias.tiempoProyecto,
            completado: true,
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('id_preferencia', existingData.id_preferencia);
      } else {
        throw new Error('Error al verificar registro existente');
      }

      if (result.error) {
        console.error('❌ Error al guardar preferencias:', result.error);
        throw result.error;
      }

      console.log('✅ Onboarding marcado como completado exitosamente');
      setOnboardingCompletado(true);
      
      // Actualizar preferencias locales
      setPreferencias({
        id_preferencia: existingData?.id_preferencia || 0,
        usuario_id: user.id,
        categorias: nuevasPreferencias.categorias,
        tipos_piso: nuevasPreferencias.tiposPiso,
        tipos_pared: nuevasPreferencias.tiposPared,
        tipos_bano: nuevasPreferencias.tiposBano,
        tipos_cocina: nuevasPreferencias.tiposCocina,
        materiales: nuevasPreferencias.materiales,
        materiales_exterior: nuevasPreferencias.materialesExterior,
        acabados: nuevasPreferencias.acabados,
        colores: nuevasPreferencias.colores,
        rango_precio: nuevasPreferencias.rangoPrecio,
        experiencia: nuevasPreferencias.experiencia,
        proyecto_actual: nuevasPreferencias.proyectoActual,
        tiempo_proyecto: nuevasPreferencias.tiempoProyecto,
        completado: true,
        fecha_creacion: preferencias?.fecha_creacion || new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      });

      return true;
    } catch (err) {
      console.error('❌ Error al marcar onboarding como completado:', err);
      setError('Error al completar el onboarding');
      return false;
    }
  };

  return {
    loading,
    onboardingCompletado,
    preferencias,
    error,
    marcarOnboardingCompletado
  };
}; 