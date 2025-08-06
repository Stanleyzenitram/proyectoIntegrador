# Sistema de Interacciones Simplificado

## 📋 Resumen

El sistema de interacciones ha sido configurado para registrar **solo 3 tipos de interacciones**:

1. **✅ Productos Vistos** - Cuando se abre un modal de producto
2. **✅ Búsquedas** - Cuando el usuario busca productos
3. **✅ Clics en Productos** - Cuando el usuario hace clic en un producto
4. **❌ Compras** - **DESHABILITADO** (no se registran)

## 🗄️ Base de Datos

### Tablas Activas
- `historial_productos_vistos` - Registra vistas de productos
- `historial_busquedas` - Registra términos de búsqueda
- `historial_clics` - Registra clics en productos

### Tabla Deshabilitada
- `historial_compras` - Existe pero no se usa

## 🔧 Configuración

### 1. Ejecutar Script Principal
```sql
-- Copia y pega el contenido de setup_historial_interacciones_final.sql
-- en el Supabase SQL Editor
```

### 2. Verificar Configuración
```sql
-- Copia y pega el contenido de test_interacciones_simplificado.sql
-- en el Supabase SQL Editor
```

### 3. Insertar Datos de Prueba (Opcional)
```sql
-- Copia y pega el contenido de insertar_datos_prueba_3_interacciones.sql
-- en el Supabase SQL Editor
```

## 📱 Integración en la Aplicación

### Componentes Modificados

#### `src/features/HomeConsulta.tsx`
- ✅ Registra búsquedas cuando se envía el formulario
- ✅ Registra clics cuando se hace clic en un producto

#### `src/components/ProductModal.tsx`
- ✅ Registra vista cuando se abre el modal
- ❌ Ya no registra compras al agregar al carrito

#### `src/hooks/useInteracciones.ts`
- ✅ Hook simplificado para las 3 interacciones
- ❌ Función de compra deshabilitada

#### `src/services/interaccionesService.ts`
- ✅ Servicio actualizado para las 3 interacciones
- ❌ Función de compra deshabilitada

#### `src/components/relevancia/HistorialInteracciones.tsx`
- ✅ Panel de administración actualizado
- ❌ Sección de compras deshabilitada

## 📊 Monitoreo

### Consola del Navegador
Abre F12 y verás logs como:
```
✅ Búsqueda registrada en BD: cerámica baño Resultados: 45
✅ Clic en producto registrado en BD: Cerámica Baño ID: 1
✅ Apertura de modal registrada en BD para: Cerámica Baño
🛒 Producto agregado al carrito: Cerámica Baño Cantidad: 2
```

### Panel de Administración
- Ruta: `/historial-interacciones`
- Muestra solo las 3 interacciones activas
- Estadísticas actualizadas sin compras

## 🎯 Tipos de Interacciones Registradas

| **Interacción** | **Cuándo se Registra** | **Datos Capturados** |
|-----------------|------------------------|---------------------|
| **Productos Vistos** | Se abre modal de producto | ID producto, tiempo de vista, relevancia |
| **Búsquedas** | Usuario busca productos | Término, resultados, filtros aplicados |
| **Clics en Productos** | Usuario hace clic en producto | ID producto, tipo de clic, origen |

## 🔍 Verificación

### 1. Verificar Tablas
```sql
SELECT table_name, COUNT(*) as columnas
FROM information_schema.columns 
WHERE table_name IN ('historial_productos_vistos', 'historial_busquedas', 'historial_clics')
GROUP BY table_name;
```

### 2. Verificar Políticas RLS
```sql
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('historial_productos_vistos', 'historial_busquedas', 'historial_clics');
```

### 3. Verificar Datos
```sql
SELECT 'historial_productos_vistos' as tabla, COUNT(*) as total FROM historial_productos_vistos
UNION ALL
SELECT 'historial_busquedas' as tabla, COUNT(*) as total FROM historial_busquedas
UNION ALL
SELECT 'historial_clics' as tabla, COUNT(*) as total FROM historial_clics;
```

## 🚀 Próximos Pasos

1. **Ejecutar scripts** en Supabase SQL Editor
2. **Probar la aplicación** - buscar, hacer clic en productos, abrir modales
3. **Verificar logs** en la consola del navegador
4. **Revisar panel de administración** en `/historial-interacciones`

## 📝 Notas Importantes

- ✅ Las compras ya no se registran automáticamente
- ✅ El sistema es más ligero y enfocado
- ✅ Los datos de compras históricos se mantienen en la BD
- ✅ El panel de administración muestra "Registro de Compras Deshabilitado"

---

**Estado**: ✅ Configurado y listo para usar
**Última actualización**: Sistema simplificado a 3 interacciones principales 