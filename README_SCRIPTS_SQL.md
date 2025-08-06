# 📋 Scripts SQL Necesarios

Este documento describe los scripts SQL esenciales para el funcionamiento del sistema de relevancia y la corrección del error de facturación.

## 🚨 **Script Crítico - Error de Facturación**

### `crear_tabla_direcciones_pedidos.sql`
**OBLIGATORIO** - Ejecutar PRIMERO para solucionar el error de facturación.
- Crea la tabla `direcciones_pedidos` que falta en la base de datos
- Esta tabla es necesaria para el proceso de facturación
- **Error que soluciona**: "Error al crear la factura"

```sql
-- Ejecutar en Supabase SQL Editor
-- Este script debe ejecutarse ANTES de cualquier proceso de pago
```

## 🔧 **Scripts del Sistema de Relevancia**

### Scripts de Configuración (Ejecutar en orden):

1. **`setup_historial_interacciones_final.sql`**
   - Script principal para crear el sistema de relevancia
   - Crea todas las tablas necesarias: historial_productos_vistos, historial_busquedas, historial_clics
   - Configura RLS policies y funciones

2. **`agregar_columnas_pesos_relevancia.sql`**
   - Agrega columnas de pesos para la configuración de relevancia
   - Debe ejecutarse después del script principal

3. **`actualizar_configuracion_relevancia_usuarios.sql`**
   - Actualiza la configuración de relevancia con pesos personalizados
   - Configura funciones para calcular relevancia

4. **`agregar_limite_recomendaciones_home.sql`**
   - Agrega límite de recomendaciones para el home
   - Configuración adicional del sistema

5. **`actualizar_configuracion_relevancia_home.sql`**
   - Actualiza configuración específica para el home
   - Configuración final del sistema

### Scripts de Limpieza (Opcionales - Solo si hay duplicados):

6. **`identificar_productos_duplicados.sql`**
   - Identifica productos duplicados en la base de datos
   - **Ejecutar primero para verificar**

7. **`limpiar_productos_duplicados.sql`**
   - Elimina productos duplicados
   - **Solo ejecutar si se encontraron duplicados**

8. **`limpiar_busquedas_duplicadas.sql`**
   - Limpia búsquedas duplicadas del historial
   - **Opcional - solo si hay problemas**

9. **`limpiar_productos_vistos_funcional.sql`**
   - Limpia productos vistos duplicados
   - **Opcional - solo si hay problemas**

10. **`actualizar_historial_clics_funcional.sql`**
    - Actualiza historial de clics consolidando duplicados
    - **Opcional - solo si hay problemas**

## 📊 **Scripts de Verificación**

### `verificar_estructura_tablas.sql`
- Verifica la estructura de las tablas principales
- Útil para debugging y verificación

## 🗂️ **Scripts de Datos**

### `insert_productos_con_imagenes.sql`
- Inserta productos de ejemplo con imágenes
- **Opcional - solo para desarrollo/pruebas**

## 🔒 **Scripts de Seguridad**

### `setup_storage_policies.sql`
- Configura políticas de seguridad para storage
- **Opcional - solo si se usa Supabase Storage**

### `quick_fix_storage.sql`
- Corrección rápida para storage
- **Opcional - solo si hay problemas con storage**

## 📖 **Documentación**

### `README_SISTEMA_RELEVANCIA_COMPLETO.md`
- Documentación completa del sistema de relevancia
- Guía de uso y configuración

## ⚡ **Orden de Ejecución Recomendado**

### Para Solucionar Error de Facturación:
1. `crear_tabla_direcciones_pedidos.sql` ⚠️ **CRÍTICO**

### Para Configurar Sistema de Relevancia:
1. `setup_historial_interacciones_final.sql`
2. `agregar_columnas_pesos_relevancia.sql`
3. `actualizar_configuracion_relevancia_usuarios.sql`
4. `agregar_limite_recomendaciones_home.sql`
5. `actualizar_configuracion_relevancia_home.sql`

### Para Limpiar Duplicados (si es necesario):
1. `identificar_productos_duplicados.sql` (verificar)
2. `limpiar_productos_duplicados.sql` (si hay duplicados)
3. `limpiar_busquedas_duplicadas.sql` (opcional)
4. `limpiar_productos_vistos_funcional.sql` (opcional)
5. `actualizar_historial_clics_funcional.sql` (opcional)

## 🎯 **Resumen**

- **Scripts críticos**: 1 (direcciones_pedidos)
- **Scripts de configuración**: 5
- **Scripts de limpieza**: 5 (opcionales)
- **Scripts de verificación**: 1
- **Scripts de datos**: 1 (opcional)
- **Scripts de seguridad**: 2 (opcionales)

**Total de scripts necesarios**: 15 (5 críticos + 10 opcionales) 