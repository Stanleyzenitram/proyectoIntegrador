import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import OnboardingPreferencias from './relevancia/OnboardingPreferencias';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  const { loading, onboardingCompletado, marcarOnboardingCompletado } = useOnboarding(user?.id || null);

  const handleOnboardingCompletado = async (preferencias: any) => {
    console.log('🎉 Onboarding completado con preferencias:', preferencias);
    
    try {
      const resultado = await marcarOnboardingCompletado(preferencias);
      if (resultado) {
        console.log('✅ Onboarding marcado como completado exitosamente');
      } else {
        console.log('⚠️ Onboarding completado pero hubo un problema al guardar');
      }
    } catch (error) {
      console.error('❌ Error al marcar onboarding como completado:', error);
    }
  };

  // Si no hay usuario, mostrar contenido normal
  if (!user) {
    console.log('👤 No hay usuario autenticado, mostrando contenido normal');
    return <>{children}</>;
  }

  // Verificar si el usuario es un cliente (no empleado)
  const esCliente = user.user_metadata?.role === 'cliente' || !user.user_metadata?.role;
  
  // Si es empleado/usuario, mostrar contenido normal sin onboarding
  if (!esCliente) {
    console.log('👔 Usuario es empleado, saltando onboarding');
    return <>{children}</>;
  }

  // Si está cargando, mostrar loading
  if (loading) {
    console.log('⏳ Verificando estado del onboarding...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  // Si el onboarding no está completado, mostrar el onboarding
  if (!onboardingCompletado) {
    console.log('👤 Cliente necesita completar onboarding');
    return (
      <OnboardingPreferencias
        usuario={user.email || user.id}
        onCompletar={handleOnboardingCompletado}
      />
    );
  }

  // Si el onboarding está completado, mostrar el contenido normal
  console.log('✅ Cliente ya completó onboarding');
  return <>{children}</>;
};

export default OnboardingWrapper; 