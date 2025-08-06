# Sistema de Relevancia Completo para Clientes

## 📋 Resumen del Sistema

El sistema de relevancia ahora está completamente integrado para que los **clientes** puedan:

1. **✅ Ver su historial de interacciones** - Productos vistos, búsquedas realizadas
2. **✅ Configurar sus preferencias de relevancia** - Ajustar pesos del algoritmo
3. **✅ Recibir recomendaciones personalizadas** - Productos basados en su comportamiento
4. **✅ Registrar interacciones automáticamente** - Vistas, búsquedas y clics

## 🎯 Funcionalidades para Clientes

### **1. Mi Historial (`/mi-historial`)**
- **Productos Vistos**: Lista de productos que has abierto en modal
- **Búsquedas Realizadas**: Términos que has buscado y resultados encontrados
- **Filtros por período**: 7 días, 30 días, 90 días, 1 año
- **Estadísticas**: Resumen de tu actividad

### **2. Mis Preferencias (`/mis-preferencias`)**
- **Configuración de Pesos**: Ajusta la importancia de cada factor
  - Tiempo de Vista (0-50%)
  - Búsquedas (0-50%)
  - Clics en Productos (0-50%)
  - Preferencias Personales (0-50%)
  - Categoría (0-30%)
  - Precio (0-20%)
  - Popularidad (0-20%)
- **Configuración Avanzada**: Tiempo de respuesta, máximo de resultados, factor de decaimiento
- **Validación**: Los pesos deben sumar 100%

### **3. Recomendaciones Personalizadas (`/recomendaciones`)**
- **Algoritmo Inteligente**: Calcula relevancia basado en:
  - Tu historial de interacciones
  - Tus preferencias configuradas
  - Tu onboarding inicial
- **Scores de Relevancia**: 0-100 puntos con estrellas
- **Razones**: Explica por qué se recomienda cada producto
- **Filtros**: Por categoría
- **Actualización en tiempo real**

## 🗄️ Base de Datos

### **Tablas Principales**
- `historial_productos_vistos` - Registra vistas de productos
- `historial_busquedas` - Registra términos de búsqueda
- `historial_clics` - Registra clics en productos
- `configuracion_relevancia` - Configuración personalizada por usuario
- `preferencias_usuarios` - Preferencias del onboarding

### **Funciones SQL**
- `obtener_configuracion_relevancia_usuario()` - Obtiene configuración del usuario
- `calcular_relevancia_producto()` - Calcula score de relevancia
- `obtener_estadisticas_usuario()` - Estadísticas del usuario

## 🔧 Configuración Inicial

### **1. Ejecutar Scripts SQL en Orden**

```sql
-- 1. Crear tablas de interacciones
-- Copia y pega el contenido de setup_historial_interacciones_final.sql

-- 2. Actualizar configuración de relevancia para usuarios
-- Copia y pega el contenido de actualizar_configuracion_relevancia_usuarios.sql

-- 3. Verificar configuración
-- Copia y pega el contenido de test_interacciones_simplificado.sql
```

### **2. Verificar Integración**

```sql
-- Verificar que las funciones existen
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN (
    'obtener_configuracion_relevancia_usuario',
    'calcular_relevancia_producto'
);

-- Verificar políticas RLS
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN (
    'configuracion_relevancia',
    'historial_productos_vistos',
    'historial_busquedas',
    'historial_clics'
);
```

## 📱 Integración en la Aplicación

### **Componentes Creados**

#### **Para Clientes:**
- `src/components/relevancia/MiHistorial.tsx` - Historial personal
- `src/components/relevancia/MisPreferenciasRelevancia.tsx` - Configuración de relevancia
- `src/components/relevancia/RecomendacionesPersonalizadas.tsx` - Recomendaciones

#### **Para Administradores:**
- `src/components/relevancia/ConfiguracionRelevancia.tsx` - Configuración global
- `src/components/relevancia/HistorialInteracciones.tsx` - Historial de todos los usuarios

### **Rutas Agregadas**
```typescript
// Rutas para clientes (requieren autenticación)
<Route path="/mi-historial" element={<MiHistorial />} />
<Route path="/mis-preferencias" element={<MisPreferenciasRelevancia />} />
<Route path="/recomendaciones" element={<RecomendacionesPersonalizadas />} />

// Rutas para administradores
<Route path="/configuracion-relevancia" element={<ConfiguracionRelevancia />} />
<Route path="/historial-interacciones" element={<HistorialInteracciones />} />
```

### **Menú Actualizado**
- **Mi Historial** - Ver actividad personal
- **Recomendaciones** - Productos recomendados
- **Mis Preferencias** - Configurar relevancia

## 🎯 Algoritmo de Relevancia

### **Factores Considerados**

| **Factor** | **Descripción** | **Peso Configurable** |
|------------|-----------------|----------------------|
| **Tiempo de Vista** | Tiempo que has visto un producto | 0-50% |
| **Búsquedas** | Términos que has buscado | 0-50% |
| **Clics** | Veces que has hecho clic en un producto | 0-50% |
| **Preferencias Personales** | Basado en tu onboarding | 0-50% |
| **Categoría** | Productos de categorías que prefieres | 0-30% |
| **Precio** | Productos en tu rango de precio | 0-20% |
| **Popularidad** | Productos populares entre usuarios | 0-20% |

### **Cálculo de Score**
```javascript
score = (tiempo_vista / 100) * peso_tiempo_vista +
        (coincidencias_busqueda) * peso_busquedas +
        (numero_clics * 10) * peso_clics +
        (tiene_preferencias ? 1 : 0) * peso_preferencias +
        (coincide_categoria ? 1 : 0) * peso_categoria +
        (en_rango_precio ? 1 : 0) * peso_precio +
        (popularidad / 100) * peso_popularidad
```

## 📊 Monitoreo y Logs

### **Consola del Navegador**
```
✅ Búsqueda registrada en BD: cerámica baño Resultados: 45
✅ Clic en producto registrado en BD: Cerámica Baño ID: 1
✅ Apertura de modal registrada en BD para: Cerámica Baño
🛒 Producto agregado al carrito: Cerámica Baño Cantidad: 2
```

### **Panel de Administración**
- **Ruta**: `/historial-interacciones`
- **Funcionalidades**:
  - Ver historial de todos los usuarios
  - Estadísticas generales
  - Exportar datos
  - Limpiar historial

## 🚀 Flujo de Usuario

### **1. Primer Acceso**
1. Usuario se registra/inicia sesión
2. Completa onboarding obligatorio
3. Sistema comienza a registrar interacciones automáticamente

### **2. Uso Regular**
1. **Navega** por productos → Se registran vistas
2. **Busca** productos → Se registran búsquedas
3. **Hace clic** en productos → Se registran clics
4. **Configura** preferencias → Se guardan pesos personalizados

### **3. Recomendaciones**
1. **Visita** `/recomendaciones`
2. **Ve** productos ordenados por relevancia
3. **Lee** razones de cada recomendación
4. **Ajusta** preferencias si es necesario

## 🔍 Verificación del Sistema

### **1. Verificar Registro de Interacciones**
```sql
-- Verificar que se están registrando interacciones
SELECT 'historial_productos_vistos' as tabla, COUNT(*) as total FROM historial_productos_vistos
UNION ALL
SELECT 'historial_busquedas' as tabla, COUNT(*) as total FROM historial_busquedas
UNION ALL
SELECT 'historial_clics' as tabla, COUNT(*) as total FROM historial_clics;
```

### **2. Verificar Configuración de Usuario**
```sql
-- Verificar configuración de relevancia por usuario
SELECT usuario_id, peso_tiempo_vista, peso_busquedas, peso_clics
FROM configuracion_relevancia
WHERE usuario_id IS NOT NULL;
```

### **3. Probar Algoritmo**
```sql
-- Calcular relevancia de un producto para un usuario específico
SELECT calcular_relevancia_producto(1, 'tu-user-id-aqui');
```

## 📝 Notas Importantes

### **Seguridad**
- ✅ Políticas RLS implementadas
- ✅ Usuarios solo ven sus propios datos
- ✅ Administradores pueden ver todo

### **Rendimiento**
- ✅ Índices creados para consultas rápidas
- ✅ Funciones optimizadas
- ✅ Límites en número de resultados

### **Escalabilidad**
- ✅ Sistema modular
- ✅ Configuración por usuario
- ✅ Fácil extensión de factores

## 🎉 Beneficios para el Cliente

1. **Experiencia Personalizada**: Productos relevantes para sus gustos
2. **Descubrimiento**: Encuentra productos que no sabía que existían
3. **Eficiencia**: Menos tiempo buscando, más tiempo comprando
4. **Transparencia**: Ve por qué se recomienda cada producto
5. **Control**: Ajusta cómo se calculan las recomendaciones

## 🔮 Próximos Pasos

1. **Ejecutar scripts SQL** en Supabase
2. **Probar registro de interacciones** en la aplicación
3. **Configurar preferencias** como cliente
4. **Verificar recomendaciones** personalizadas
5. **Monitorear logs** en consola del navegador

---

**Estado**: ✅ Sistema completo implementado y listo para usar
**Última actualización**: Sistema de relevancia completo para clientes 