# Sistema de Historial de Interacciones

## 📋 Descripción

El sistema de historial de interacciones permite rastrear automáticamente todas las acciones que realizan los clientes en la aplicación, incluyendo:

- **Productos vistos**: Cuándo y por cuánto tiempo un cliente ve un producto
- **Búsquedas realizadas**: Términos de búsqueda y filtros aplicados
- **Clics en productos**: Interacciones con productos específicos
- **Compras realizadas**: Productos comprados y cantidades

## 🗄️ Base de Datos

### Tablas Creadas

1. **`historial_productos_vistos`** - Registra productos vistos por usuarios
2. **`historial_busquedas`** - Registra búsquedas realizadas
3. **`historial_clics`** - Registra clics en productos
4. **`historial_compras`** - Registra compras realizadas

### Configuración

1. Ejecuta el script `setup_historial_interacciones.sql` en Supabase SQL Editor
2. Las tablas incluyen políticas RLS (Row Level Security) para proteger los datos
3. Se crean índices para optimizar las consultas

## 🚀 Implementación

### 1. Servicios

- **`interaccionesService.ts`**: Servicio principal para manejar todas las interacciones
- **`useInteracciones.ts`**: Hook personalizado para tracking automático

### 2. Componentes Modificados

- **`HomeConsulta.tsx`**: Registra búsquedas y clics en productos
- **`ProductModal.tsx`**: Registra vistas de productos y compras
- **`HistorialInteracciones.tsx`**: Muestra el historial completo

### 3. Funcionalidades

#### Tracking Automático
```typescript
// En cualquier componente
const { registrarClic, registrarBusqueda, registrarProductoVisto } = useInteracciones({
  productoId: 123,
  tipo: 'producto'
});

// Registrar clic
await registrarClic('lista_productos');

// Registrar búsqueda
await registrarBusqueda('cerámica baño', 45, { categoria: 'baño' });
```

#### Historial de Interacciones
- **Productos vistos**: Con tiempo de vista y relevancia calculada
- **Búsquedas**: Con filtros aplicados y resultados encontrados
- **Compras**: Con precios y cantidades
- **Estadísticas**: Tasa de conversión y métricas

## 📊 Características

### Filtros de Tiempo
- Últimos 7 días
- Últimos 30 días
- Últimos 90 días
- Último año

### Estadísticas
- Total de productos vistos
- Total de búsquedas realizadas
- Total de compras
- Tasa de conversión
- Categorías más visitadas
- Rango de precios preferido

### Funciones Adicionales
- **Exportar historial**: Descarga en formato JSON
- **Limpiar historial**: Elimina datos antiguos (excepto compras)
- **Búsqueda en tiempo real**: Filtros dinámicos

## 🔧 Configuración

### 1. Ejecutar Scripts SQL

```sql
-- 1. Crear tablas
-- Ejecutar: setup_historial_interacciones.sql

-- 2. Insertar datos de ejemplo (opcional)
-- Ejecutar: insertar_datos_ejemplo_historial.sql
-- IMPORTANTE: Reemplazar 'tu-user-id-aqui' con un UUID real
```

### 2. Verificar Implementación

1. Navega a `/historial-interacciones` (solo administradores)
2. Realiza algunas búsquedas y clics en productos
3. Verifica que los datos aparezcan en el historial

## 📱 Uso

### Para Administradores
1. Accede al menú "Sistema" → "Historial Interacciones"
2. Visualiza estadísticas de usuarios
3. Exporta datos para análisis
4. Limpia historial antiguo

### Para Desarrolladores
```typescript
// Registrar interacción manual
import { interaccionesService } from '../services/interaccionesService';

// Registrar producto visto
await interaccionesService.registrarProductoVisto(productoId, tiempoVista, relevancia);

// Registrar búsqueda
await interaccionesService.registrarBusqueda(termino, resultados, filtros);

// Registrar clic
await interaccionesService.registrarClic(productoId, tipo, origen);

// Registrar compra
await interaccionesService.registrarCompra(productoId, precio, cantidad, ordenId);
```

## 🔒 Seguridad

- **RLS (Row Level Security)**: Cada usuario solo ve sus propios datos
- **Autenticación requerida**: Todas las operaciones requieren usuario autenticado
- **Validación de datos**: Verificación de tipos y rangos
- **Logs de errores**: Registro de errores para debugging

## 📈 Análisis de Datos

### Métricas Disponibles
- **Engagement**: Tiempo promedio en productos
- **Conversión**: Tasa de compra vs vista
- **Preferencias**: Categorías y rangos de precio más populares
- **Comportamiento**: Patrones de búsqueda y navegación

### Casos de Uso
- **Personalización**: Mejorar recomendaciones
- **Optimización**: Identificar productos más populares
- **Marketing**: Segmentación de usuarios
- **UX**: Mejorar experiencia de usuario

## 🐛 Troubleshooting

### Problemas Comunes

1. **No aparecen datos**
   - Verificar que el usuario esté autenticado
   - Revisar políticas RLS
   - Verificar conexión a Supabase

2. **Errores de permisos**
   - Verificar rol de usuario (admin para ver historial)
   - Revisar políticas de seguridad

3. **Datos duplicados**
   - Verificar lógica de inserción
   - Revisar triggers de base de datos

### Logs de Debug
```typescript
// Habilitar logs detallados
console.log('✅ Interacción registrada:', data);
console.error('❌ Error al registrar:', error);
```

## 🔄 Mantenimiento

### Limpieza Automática
```sql
-- Limpiar datos antiguos (ejecutar periódicamente)
SELECT limpiar_historial_antiguo(365); -- Mantener 1 año
```

### Backup
- Exportar datos importantes antes de limpiar
- Mantener historial de compras indefinidamente
- Backup regular de estadísticas

## 📝 Notas

- El sistema es compatible con el módulo de relevancia existente
- Los datos se almacenan de forma segura y privada
- El rendimiento está optimizado con índices apropiados
- Se puede extender fácilmente para más tipos de interacciones

## 🎯 Próximos Pasos

1. **Integración con IA**: Usar datos para mejorar recomendaciones
2. **Dashboard avanzado**: Más métricas y visualizaciones
3. **Notificaciones**: Alertas basadas en comportamiento
4. **A/B Testing**: Comparar diferentes experiencias de usuario 