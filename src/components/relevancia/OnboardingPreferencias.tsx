import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Home, Bath, ChefHat, Palette, DollarSign, Clock, Star, Sun, Cloud, Trees, Building } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface OnboardingPreferenciasProps {
  usuario: string;
  onCompletar: (preferencias: any) => void;
}

interface Preferencias {
  categorias: string[];
  tiposPiso: string[];
  tiposPared: string[];
  tiposBano: string[];
  tiposCocina: string[];
  materiales: string[];
  materialesExterior: string[];
  acabados: string[];
  colores: string[];
  rangoPrecio: string;
  experiencia: string;
  proyectoActual: string;
  tiempoProyecto: string;
}

const OnboardingPreferencias: React.FC<OnboardingPreferenciasProps> = ({ usuario, onCompletar }) => {
  const [pasoActual, setPasoActual] = useState(1);
  const [preferencias, setPreferencias] = useState<Preferencias>({
    categorias: [],
    tiposPiso: [],
    tiposPared: [],
    tiposBano: [],
    tiposCocina: [],
    materiales: [],
    materialesExterior: [],
    acabados: [],
    colores: [],
    rangoPrecio: '',
    experiencia: '',
    proyectoActual: '',
    tiempoProyecto: ''
  });
  const [completando, setCompletando] = useState(false);

  const totalPasos = 6;

  // Datos de opciones más detallados
  const categorias = [
    { id: 'piso', nombre: 'Pisos', icono: '🏠', descripcion: 'Cerámicas para pisos interiores y exteriores' },
    { id: 'pared', nombre: 'Paredes', icono: '🧱', descripcion: 'Cerámicas para paredes y muros' },
    { id: 'bano', nombre: 'Baños', icono: '🚿', descripcion: 'Cerámicas para baños y duchas' },
    { id: 'cocina', nombre: 'Cocinas', icono: '🍳', descripcion: 'Cerámicas para cocinas y áreas húmedas' }
  ];

  const tiposPiso = [
    { id: 'interior', nombre: 'Interior', icono: '🏠', descripcion: 'Pisos para espacios interiores' },
    { id: 'exterior', nombre: 'Exterior', icono: '🌳', descripcion: 'Pisos para terrazas y jardines' },
    { id: 'comercial', nombre: 'Comercial', icono: '🏢', descripcion: 'Pisos para locales comerciales' },
    { id: 'industrial', nombre: 'Industrial', icono: '🏭', descripcion: 'Pisos para espacios industriales' }
  ];

  const tiposPared = [
    { id: 'interior', nombre: 'Interior', icono: '🏠', descripcion: 'Paredes interiores' },
    { id: 'exterior', nombre: 'Exterior', icono: '🌳', descripcion: 'Fachadas y muros exteriores' },
    { id: 'bano', nombre: 'Baño', icono: '🚿', descripcion: 'Paredes de baño y ducha' },
    { id: 'cocina', nombre: 'Cocina', icono: '🍳', descripcion: 'Paredes de cocina' }
  ];

  const tiposBano = [
    { id: 'ducha', nombre: 'Ducha', icono: '🚿', descripcion: 'Área de ducha' },
    { id: 'bañera', nombre: 'Bañera', icono: '🛁', descripcion: 'Área de bañera' },
    { id: 'lavabo', nombre: 'Lavabo', icono: '🚰', descripcion: 'Área del lavabo' },
    { id: 'completo', nombre: 'Baño completo', icono: '🚽', descripcion: 'Todo el baño' }
  ];

  const tiposCocina = [
    { id: 'cocina', nombre: 'Cocina', icono: '🍳', descripcion: 'Área de cocina' },
    { id: 'comedor', nombre: 'Comedor', icono: '🍽️', descripcion: 'Área de comedor' },
    { id: 'isla', nombre: 'Isla', icono: '🏝️', descripcion: 'Isla de cocina' },
    { id: 'despensa', nombre: 'Despensa', icono: '🥫', descripcion: 'Área de despensa' }
  ];

  const materiales = [
    { id: 'porcelana', nombre: 'Porcelana', descripcion: 'Alta resistencia y durabilidad', caracteristicas: ['Resistente', 'Fácil limpieza', 'Bajo mantenimiento'] },
    { id: 'gres', nombre: 'Gres', descripcion: 'Excelente durabilidad y resistencia', caracteristicas: ['Muy resistente', 'Bajo mantenimiento', 'Ideal exterior'] },
    { id: 'marmol', nombre: 'Mármol', descripcion: 'Elegancia natural y exclusividad', caracteristicas: ['Elegante', 'Único', 'Requiere mantenimiento'] },
    { id: 'vitrificado', nombre: 'Vitrificado', descripcion: 'Buen balance calidad-precio', caracteristicas: ['Económico', 'Variedad', 'Fácil instalación'] },
    { id: 'gres_porcelanico', nombre: 'Gres Porcelánico', descripcion: 'Máxima resistencia y versatilidad', caracteristicas: ['Ultra resistente', 'Ideal exterior', 'Muy duradero'] }
  ];

  const materialesExterior = [
    { id: 'gres_porcelanico', nombre: 'Gres Porcelánico', descripcion: 'Máxima resistencia al clima', caracteristicas: ['Resistente al hielo', 'Antideslizante', 'UV resistente'] },
    { id: 'gres_rustico', nombre: 'Gres Rústico', descripcion: 'Aspecto natural y antideslizante', caracteristicas: ['Natural', 'Antideslizante', 'Resistente'] },
    { id: 'piedra_natural', nombre: 'Piedra Natural', descripcion: 'Elegancia natural para exteriores', caracteristicas: ['Natural', 'Elegante', 'Requiere sellado'] },
    { id: 'concreto_estampado', nombre: 'Concreto Estampado', descripcion: 'Versatilidad y personalización', caracteristicas: ['Personalizable', 'Resistente', 'Económico'] }
  ];

  const acabados = [
    { id: 'pulido', nombre: 'Pulido', descripcion: 'Superficie brillante y elegante', icono: '✨' },
    { id: 'mate', nombre: 'Mate', descripcion: 'Superficie sin brillo y moderna', icono: '🔲' },
    { id: 'texturizado', nombre: 'Texturizado', descripcion: 'Superficie con textura y antideslizante', icono: '🌊' },
    { id: 'rustico', nombre: 'Rústico', descripcion: 'Aspecto natural y rústico', icono: '🪨' },
    { id: 'esmaltado', nombre: 'Esmaltado', descripcion: 'Superficie vidriada y colorida', icono: '🎨' }
  ];

  const colores = [
    { id: 'blanco', nombre: 'Blanco', color: 'bg-white', descripcion: 'Limpio y moderno' },
    { id: 'gris', nombre: 'Gris', color: 'bg-gray-500', descripcion: 'Elegante y neutro' },
    { id: 'beige', nombre: 'Beige', color: 'bg-amber-200', descripcion: 'Cálido y acogedor' },
    { id: 'marron', nombre: 'Marrón', color: 'bg-amber-800', descripcion: 'Natural y terroso' },
    { id: 'negro', nombre: 'Negro', color: 'bg-black', descripcion: 'Sofisticado y moderno' },
    { id: 'colorido', nombre: 'Colorido', color: 'bg-gradient-to-r from-red-500 to-blue-500', descripcion: 'Vibrante y expresivo' }
  ];

  const rangosPrecio = [
    { id: 'economico', nombre: 'Económico', rango: '$30 - $80', icono: DollarSign, color: 'bg-green-100 text-green-700' },
    { id: 'medio', nombre: 'Medio', rango: '$80 - $150', icono: DollarSign, color: 'bg-amber-100 text-amber-700' },
    { id: 'premium', nombre: 'Premium', rango: '$150 - $300', icono: DollarSign, color: 'bg-purple-100 text-purple-700' },
    { id: 'luxury', nombre: 'Luxury', rango: '$300+', icono: Star, color: 'bg-red-100 text-red-700' }
  ];

  const nivelesExperiencia = [
    { id: 'principiante', nombre: 'Principiante', descripcion: 'Primera vez comprando cerámicas', icono: '🌱' },
    { id: 'intermedio', nombre: 'Intermedio', descripcion: 'Alguna experiencia previa', icono: '🌿' },
    { id: 'experto', nombre: 'Experto', descripcion: 'Conocedor del mercado', icono: '🌳' }
  ];

  const proyectosActuales = [
    { id: 'casa_nueva', nombre: 'Casa Nueva', descripcion: 'Construyendo desde cero', icono: '🏗️' },
    { id: 'remodelacion', nombre: 'Remodelación', descripcion: 'Renovando espacios existentes', icono: '🔨' },
    { id: 'ampliacion', nombre: 'Ampliación', descripcion: 'Agregando nuevos espacios', icono: '➕' },
    { id: 'decoracion', nombre: 'Decoración', descripcion: 'Cambiando el aspecto', icono: '🎨' }
  ];

  const tiemposProyecto = [
    { id: 'inmediato', nombre: 'Inmediato', descripcion: 'Necesito materiales ya', icono: '⚡' },
    { id: '1_mes', nombre: '1 Mes', descripcion: 'Proyecto en curso', icono: '📅' },
    { id: '3_meses', nombre: '3 Meses', descripcion: 'Planificando proyecto', icono: '📆' },
    { id: '6_meses', nombre: '6+ Meses', descripcion: 'Proyecto a largo plazo', icono: '🗓️' }
  ];

  const toggleSeleccion = (tipo: keyof Preferencias, valor: string) => {
    setPreferencias(prev => ({
      ...prev,
      [tipo]: prev[tipo].includes(valor)
        ? (prev[tipo] as string[]).filter(item => item !== valor)
        : [...(prev[tipo] as string[]), valor]
    }));
  };

  const seleccionarUnico = (tipo: keyof Preferencias, valor: string) => {
    setPreferencias(prev => ({
      ...prev,
      [tipo]: valor
    }));
  };

  const siguientePaso = () => {
    if (pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const completarOnboarding = async () => {
    try {
      setCompletando(true);
      console.log('🚀 Iniciando completado de onboarding...');
      console.log('📋 Preferencias a guardar:', preferencias);
      console.log('👤 Usuario:', usuario);

      // Obtener el usuario actual para obtener el ID correcto
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Error al obtener usuario:', userError);
        throw new Error('No se pudo obtener el usuario actual');
      }

      console.log('✅ Usuario obtenido:', user.id);

      // Verificar si ya existe un registro para este usuario
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
            categorias: preferencias.categorias,
            tipos_piso: preferencias.tiposPiso,
            tipos_pared: preferencias.tiposPared,
            tipos_bano: preferencias.tiposBano,
            tipos_cocina: preferencias.tiposCocina,
            materiales: preferencias.materiales,
            materiales_exterior: preferencias.materialesExterior,
            acabados: preferencias.acabados,
            colores: preferencias.colores,
            rango_precio: preferencias.rangoPrecio,
            experiencia: preferencias.experiencia,
            proyecto_actual: preferencias.proyectoActual,
            tiempo_proyecto: preferencias.tiempoProyecto,
            completado: true,
            fecha_actualizacion: new Date().toISOString()
          });
      } else if (existingData) {
        // Existe registro, actualizar
        console.log('🔄 Actualizando registro existente:', existingData.id_preferencia);
        result = await supabase
          .from('preferencias_usuarios')
          .update({
            categorias: preferencias.categorias,
            tipos_piso: preferencias.tiposPiso,
            tipos_pared: preferencias.tiposPared,
            tipos_bano: preferencias.tiposBano,
            tipos_cocina: preferencias.tiposCocina,
            materiales: preferencias.materiales,
            materiales_exterior: preferencias.materialesExterior,
            acabados: preferencias.acabados,
            colores: preferencias.colores,
            rango_precio: preferencias.rangoPrecio,
            experiencia: preferencias.experiencia,
            proyecto_actual: preferencias.proyectoActual,
            tiempo_proyecto: preferencias.tiempoProyecto,
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

      console.log('✅ Preferencias guardadas exitosamente');
      
      // Llamar al callback de completado
      onCompletar(preferencias);
      
    } catch (err) {
      console.error('❌ Error al completar onboarding:', err);
      // Aún así llamar al callback para que no se quede bloqueado
      onCompletar(preferencias);
    } finally {
      setCompletando(false);
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <div className="text-center">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Bienvenido a Cerámicas Premium!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Para mostrarte los productos más relevantes para ti, necesitamos conocer tus preferencias específicas. 
              Esto nos ayudará a personalizar tu experiencia de compra.
            </p>
            <div className="bg-amber-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">¿Qué vamos a configurar?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Categorías y tipos específicos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Materiales y acabados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Colores y estilos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span>Presupuesto y experiencia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <span>Tu proyecto actual</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</div>
                  <span>Timeline del proyecto</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué categorías te interesan?</h2>
            <p className="text-gray-600 mb-8">Selecciona las categorías principales que más te interesan.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  onClick={() => toggleSeleccion('categorias', categoria.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    preferencias.categorias.includes(categoria.id)
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{categoria.icono}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{categoria.nombre}</h3>
                      <p className="text-sm text-gray-600">{categoria.descripcion}</p>
                    </div>
                    {preferencias.categorias.includes(categoria.id) && (
                      <Check className="h-5 w-5 text-amber-600 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tipos específicos según categorías seleccionadas */}
            {preferencias.categorias.includes('piso') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Qué tipos de pisos te interesan?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposPiso.map((tipo) => (
                    <div
                      key={tipo.id}
                      onClick={() => toggleSeleccion('tiposPiso', tipo.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        preferencias.tiposPiso.includes(tipo.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{tipo.icono}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{tipo.nombre}</h4>
                          <p className="text-xs text-gray-600">{tipo.descripcion}</p>
                        </div>
                        {preferencias.tiposPiso.includes(tipo.id) && (
                          <Check className="h-4 w-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preferencias.categorias.includes('pared') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Qué tipos de paredes te interesan?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposPared.map((tipo) => (
                    <div
                      key={tipo.id}
                      onClick={() => toggleSeleccion('tiposPared', tipo.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        preferencias.tiposPared.includes(tipo.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{tipo.icono}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{tipo.nombre}</h4>
                          <p className="text-xs text-gray-600">{tipo.descripcion}</p>
                        </div>
                        {preferencias.tiposPared.includes(tipo.id) && (
                          <Check className="h-4 w-4 text-green-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preferencias.categorias.includes('bano') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Qué áreas del baño te interesan?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposBano.map((tipo) => (
                    <div
                      key={tipo.id}
                      onClick={() => toggleSeleccion('tiposBano', tipo.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        preferencias.tiposBano.includes(tipo.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{tipo.icono}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{tipo.nombre}</h4>
                          <p className="text-xs text-gray-600">{tipo.descripcion}</p>
                        </div>
                        {preferencias.tiposBano.includes(tipo.id) && (
                          <Check className="h-4 w-4 text-purple-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preferencias.categorias.includes('cocina') && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Qué áreas de la cocina te interesan?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposCocina.map((tipo) => (
                    <div
                      key={tipo.id}
                      onClick={() => toggleSeleccion('tiposCocina', tipo.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        preferencias.tiposCocina.includes(tipo.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{tipo.icono}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{tipo.nombre}</h4>
                          <p className="text-xs text-gray-600">{tipo.descripcion}</p>
                        </div>
                        {preferencias.tiposCocina.includes(tipo.id) && (
                          <Check className="h-4 w-4 text-orange-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué materiales prefieres?</h2>
            <p className="text-gray-600 mb-8">Elige los materiales que más te gustan para tus proyectos.</p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Materiales para Interior</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materiales.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => toggleSeleccion('materiales', material.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      preferencias.materiales.includes(material.id)
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{material.nombre}</h3>
                        <p className="text-sm text-gray-600 mb-2">{material.descripcion}</p>
                        <div className="flex flex-wrap gap-1">
                          {material.caracteristicas.map((caracteristica, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {caracteristica}
                            </span>
                          ))}
                        </div>
                      </div>
                      {preferencias.materiales.includes(material.id) && (
                        <Check className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(preferencias.categorias.includes('piso') || preferencias.categorias.includes('pared')) && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Materiales para Exterior</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materialesExterior.map((material) => (
                    <div
                      key={material.id}
                      onClick={() => toggleSeleccion('materialesExterior', material.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        preferencias.materialesExterior.includes(material.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{material.nombre}</h3>
                          <p className="text-sm text-gray-600 mb-2">{material.descripcion}</p>
                          <div className="flex flex-wrap gap-1">
                            {material.caracteristicas.map((caracteristica, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {caracteristica}
                              </span>
                            ))}
                          </div>
                        </div>
                        {preferencias.materialesExterior.includes(material.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Qué acabados y colores prefieres?</h2>
            <p className="text-gray-600 mb-8">Elige los acabados y colores que más te gustan.</p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Acabados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acabados.map((acabado) => (
                  <div
                    key={acabado.id}
                    onClick={() => toggleSeleccion('acabados', acabado.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      preferencias.acabados.includes(acabado.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{acabado.icono}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{acabado.nombre}</h3>
                        <p className="text-sm text-gray-600">{acabado.descripcion}</p>
                      </div>
                      {preferencias.acabados.includes(acabado.id) && (
                        <Check className="h-5 w-5 text-purple-600 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Colores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colores.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => toggleSeleccion('colores', color.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      preferencias.colores.includes(color.id)
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${color.color}`}></div>
                      <h3 className="font-semibold text-gray-900 text-sm">{color.nombre}</h3>
                      <p className="text-xs text-gray-600">{color.descripcion}</p>
                      {preferencias.colores.includes(color.id) && (
                        <Check className="h-4 w-4 text-amber-600 mx-auto mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cuál es tu presupuesto y experiencia?</h2>
            <p className="text-gray-600 mb-8">Esto nos ayudará a mostrarte opciones más relevantes.</p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rango de Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rangosPrecio.map((rango) => {
                  const IconComponent = rango.icono;
                  return (
                    <div
                      key={rango.id}
                      onClick={() => seleccionarUnico('rangoPrecio', rango.id)}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        preferencias.rangoPrecio === rango.id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${rango.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{rango.nombre}</h3>
                          <p className="text-lg font-bold text-gray-700">{rango.rango}</p>
                        </div>
                        {preferencias.rangoPrecio === rango.id && (
                          <Check className="h-5 w-5 text-amber-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Nivel de Experiencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {nivelesExperiencia.map((nivel) => (
                  <div
                    key={nivel.id}
                    onClick={() => seleccionarUnico('experiencia', nivel.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      preferencias.experiencia === nivel.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{nivel.icono}</div>
                    <h4 className="font-semibold text-gray-900 mb-1">{nivel.nombre}</h4>
                    <p className="text-sm text-gray-600">{nivel.descripcion}</p>
                    {preferencias.experiencia === nivel.id && (
                      <Check className="h-5 w-5 text-amber-600 mx-auto mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cuéntanos sobre tu proyecto</h2>
            <p className="text-gray-600 mb-8">Esto nos ayudará a personalizar mejor las recomendaciones.</p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Qué tipo de proyecto tienes?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proyectosActuales.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    onClick={() => seleccionarUnico('proyectoActual', proyecto.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      preferencias.proyectoActual === proyecto.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{proyecto.icono}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{proyecto.nombre}</h3>
                        <p className="text-sm text-gray-600">{proyecto.descripcion}</p>
                      </div>
                      {preferencias.proyectoActual === proyecto.id && (
                        <Check className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Cuándo planeas ejecutar el proyecto?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tiemposProyecto.map((tiempo) => (
                  <div
                    key={tiempo.id}
                    onClick={() => seleccionarUnico('tiempoProyecto', tiempo.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      preferencias.tiempoProyecto === tiempo.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{tiempo.icono}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tiempo.nombre}</h3>
                        <p className="text-sm text-gray-600">{tiempo.descripcion}</p>
                      </div>
                      {preferencias.tiempoProyecto === tiempo.id && (
                        <Check className="h-5 w-5 text-blue-600 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configuración de Preferencias</h1>
                <p className="text-sm text-gray-600">Paso {pasoActual} de {totalPasos}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">👤 {usuario}</span>
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-xs text-blue-700 font-medium">Cliente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(pasoActual / totalPasos) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {renderPaso()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={pasoAnterior}
            disabled={pasoActual === 1 || completando}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              pasoActual === 1 || completando
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>

          <div className="text-sm text-gray-500">
            Paso {pasoActual} de {totalPasos}
          </div>

          {pasoActual < totalPasos ? (
            <button
              onClick={siguientePaso}
              disabled={completando}
              className="flex items-center space-x-2 bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              <span>Siguiente</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={completarOnboarding}
              disabled={completando}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {completando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completando...</span>
                </>
              ) : (
                <>
                  <span>Completar Configuración</span>
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPreferencias; 