# Sistema Estratégico de Relevancia - Venta Cerámicas

Este módulo implementa un sistema completo de recomendaciones y relevancia para la plataforma de venta de cerámicas y productos relacionados.

## 🏗️ Arquitectura del Sistema

### Base de Datos
- **Tablas principales**: `tipos_producto`, `preferencias_usuario`, `interacciones_usuario`, `busquedas_usuario`, `configuracion_relevancia`, `recomendaciones`, `onboarding_usuarios`
- **Funciones SQL**: `calcular_relevancia_producto()`, `generar_recomendaciones()`
- **Triggers**: Actualización automática de popularidad y ratings

### Frontend
- **Hook personalizado**: `useRelevancia()` para gestión de estado
- **Servicio API**: `RelevanciaService` para comunicación con Supabase
- **Tipos TypeScript**: Interfaces completas para type safety

## 🚀 Funcionalidades Implementadas

### 1. **Sistema de Tipos de Productos**
- Soporte para múltiples tipos: cerámica, sanitarios, grifería, accesorios, herramientas, decoración
- Expansión de la tabla de productos con campos adicionales (marca, modelo, dimensiones, garantía, etc.)

### 2. **Sistema de Preferencias**
- Captura de preferencias de usuario por categoría, estilo, material y tipo de producto
- Pesos configurables para cada preferencia
- Actualización dinámica de preferencias

### 3. **Seguimiento de Interacciones**
- Registro de vistas, búsquedas, favoritos, compras, valoraciones y comentarios
- Tiempo de vista y metadata adicional
- Historial completo de interacciones del usuario

### 4. **Algoritmo de Relevancia**
- Cálculo de score basado en múltiples factores:
  - Historial de compras (30%)
  - Historial de vistas (20%)
  - Preferencias del usuario (25%)
  - Popularidad del producto (15%)
  - Valoraciones (10%)
- Configuración dinámica de pesos

### 5. **Sistema de Recomendaciones**
- Recomendaciones personalizadas basadas en el perfil del usuario
- Recomendaciones por popularidad para nuevos usuarios
- Productos similares
- Razones de recomendación

### 6. **Búsqueda Avanzada**
- Filtros múltiples (categoría, estilo, material, tipo, precio, stock)
- Ordenamiento por relevancia, precio, popularidad, rating
- Paginación y resultados optimizados
- Registro automático de búsquedas

### 7. **Onboarding de Usuarios**
- Proceso guiado de configuración de preferencias
- Captura de información inicial del usuario
- Personalización desde el primer uso

### 8. **Métricas y Reportes**
- Precisión de recomendaciones
- Tiempo de respuesta promedio
- Tasa de conversión
- Satisfacción del usuario
- Productos más vistos
- Categorías populares

## 📊 Estructura de Datos

### Productos Expandidos
```typescript
interface ProductoExpandido {
  // Campos básicos
  id_producto: number;
  nombre_producto: string;
  precio: number;
  stock_actual: number;
  
  // Campos expandidos
  id_tipo_producto?: number;
  marca?: string;
  modelo?: string;
  dimensiones?: string;
  peso?: number;
  garantia_meses?: number;
  caracteristicas_especiales?: string[];
  tags?: string[];
  
  // Métricas de relevancia
  rating_promedio: number;
  total_valoraciones: number;
  popularidad: number;
  
  // Relaciones
  categoria?: Categoria;
  estilo?: Estilo;
  material?: Material;
  tipo_producto?: TipoProducto;
}
```

### Configuración de Relevancia
```typescript
interface ConfiguracionRelevancia {
  configuracion: {
    pesos: {
      historial_compras: number;
      historial_vistas: number;
      preferencias_usuario: number;
      popularidad_producto: number;
      valoraciones: number;
    };
    limites: {
      max_recomendaciones: number;
      min_score: number;
      dias_historial: number;
    };
    filtros: {
      incluir_agotados: boolean;
      solo_activos: boolean;
    };
  };
}
```

## 🎯 Uso del Sistema

### Hook useRelevancia
```typescript
import { useRelevancia } from '../hooks/useRelevancia';

const MyComponent = () => {
  const {
    loading,
    error,
    recomendaciones,
    buscarProductos,
    registrarInteraccion,
    guardarPreferencia
  } = useRelevancia();

  // Buscar productos
  const handleBuscar = async () => {
    const resultado = await buscarProductos({
      termino: 'cerámica',
      precio_min: 100,
      precio_max: 500,
      categorias: [1, 2]
    });
  };

  // Registrar interacción
  const handleVerProducto = async (idProducto: number) => {
    await registrarInteraccion({
      id_producto: idProducto,
      tipo_interaccion: 'vista'
    });
  };
};
```

### Servicio API
```typescript
import { relevanciaService } from '../api/relevancia';

// Generar recomendaciones
const recomendaciones = await relevanciaService.generarRecomendaciones(userId, 10);

// Obtener productos similares
const similares = await relevanciaService.getProductosSimilares(productoId, 6);

// Actualizar configuración
await relevanciaService.updateConfiguracionRelevancia({
  id_configuracion: 1,
  configuracion: {
    pesos: {
      historial_compras: 0.4,
      historial_vistas: 0.2,
      preferencias_usuario: 0.2,
      popularidad_producto: 0.1,
      valoraciones: 0.1
    }
  }
});
```

## 🔧 Configuración

### Migración de Base de Datos
```bash
# Aplicar migración de relevancia
supabase db push
```

### Variables de Entorno
```env
# Configuración de Supabase (ya configurado)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📈 Métricas de Rendimiento

El sistema incluye métricas automáticas:
- **Precisión**: Porcentaje de recomendaciones clickeadas
- **Tiempo de respuesta**: Promedio de tiempo para generar recomendaciones
- **Tasa de conversión**: Productos recomendados que se compran
- **Satisfacción**: Valoraciones de productos recomendados

## 🔄 Flujo de Datos

1. **Usuario interactúa** → Se registra interacción
2. **Sistema calcula** → Score de relevancia actualizado
3. **Recomendaciones generadas** → Basadas en nuevo perfil
4. **Usuario recibe** → Recomendaciones personalizadas
5. **Feedback capturado** → Métricas actualizadas

## 🚀 Próximos Pasos

1. **Implementar ML avanzado** con algoritmos de recomendación más sofisticados
2. **A/B Testing** para optimizar pesos de relevancia
3. **Notificaciones push** con recomendaciones personalizadas
4. **Integración con redes sociales** para recomendaciones sociales
5. **Análisis de sentimientos** en comentarios y valoraciones

## 📝 Notas Técnicas

- **Optimización**: Índices en base de datos para consultas rápidas
- **Escalabilidad**: Diseño preparado para grandes volúmenes de datos
- **Mantenibilidad**: Código modular y bien documentado
- **Seguridad**: Validación de datos y control de acceso
- **Performance**: Caché de recomendaciones y consultas optimizadas 