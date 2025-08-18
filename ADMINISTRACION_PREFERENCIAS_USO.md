# 🎯 Sistema de Preferencias por Uso - Guía de Administración

## 📋 Descripción General

El sistema de preferencias por uso permite a los clientes configurar sus preferencias de productos de cerámica de manera simplificada, y a los administradores gestionar y personalizar estas preferencias según las necesidades del negocio.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Configuración del Sistema** (`/configuracion-sistema`)
   - Rangos de precio
   - Categorías de colores
   - Estilos decorativos
   - Tipos de materiales

2. **Administración de Preferencias** (`/admin-preferencias-uso`)
   - Vista general de todas las preferencias de clientes
   - Edición y eliminación de preferencias
   - Filtros y búsqueda

3. **Página de Preferencias del Cliente** (`/preferencias`)
   - Interfaz para que los clientes configuren sus preferencias
   - Sincronización automática con la configuración del sistema

## ⚙️ Configuración del Sistema

### Acceso
- Ruta: `/configuracion-sistema`
- Requiere rol: `admin` o `mantenimiento`

### Funcionalidades

#### 1. Rangos de Precio
- **Económico**: $0 - $50
- **Intermedio**: $51 - $150  
- **Premium**: $151 - $500+

**Configuración:**
- Editar rangos mínimos y máximos
- Personalizar nombres de categorías
- Los cambios se reflejan automáticamente en las preferencias

#### 2. Categorías de Colores
- **Neutros**: Blanco, Gris, Beige, Crema
- **Vibrantes**: Rojo, Azul, Verde, Amarillo, Naranja
- **Terrosos**: Marrón, Ocre, Siena, Tierra
- **Pasteles**: Rosa, Azul Claro, Verde Menta, Lavanda
- **Metálicos**: Dorado, Plateado, Cobre, Bronce

**Configuración:**
- Agregar/eliminar colores por categoría
- Personalizar nombres de categorías
- Los cambios se sincronizan automáticamente

#### 3. Estilos Decorativos
- **Rústico**: Texturas naturales y acabados envejecidos
- **Moderno**: Líneas limpias, minimalista y contemporáneo
- **Ejecutivo**: Elegante, sofisticado y profesional
- **Clásico**: Tradicional, atemporal y refinado

**Configuración:**
- Editar descripciones de estilos
- Asociar IDs de estilos de la base de datos
- Personalizar nombres y características

#### 4. Tipos de Materiales
- **Cerámica Natural**: Materiales naturales y orgánicos
- **Porcelanato**: Alta densidad y durabilidad
- **Gres**: Resistente y versátil

**Configuración:**
- Editar descripciones de materiales
- Asociar IDs de materiales de la base de datos
- Personalizar características técnicas

## 👥 Administración de Preferencias

### Acceso
- Ruta: `/admin-preferencias-uso`
- Requiere rol: `admin` o `mantenimiento`

### Funcionalidades

#### Vista General
- Lista de todas las preferencias de clientes
- Información del cliente (nombre, apellido, email)
- Estado de cada categoría de preferencia
- Fecha de última actualización

#### Filtros y Búsqueda
- **Búsqueda por cliente**: Nombre, apellido o email
- **Filtro por categoría**: Color, estilo, material, precio
- **Actualización en tiempo real**

#### Gestión de Preferencias
- **Edición inline**: Cambiar preferencias directamente en la tabla
- **Eliminación**: Borrar preferencias completas de un cliente
- **Validación**: Solo se guardan cambios válidos

#### Estadísticas
- Total de preferencias configuradas
- Número de clientes activos
- Preferencias con filtros aplicados
- Última edición realizada

## 🔄 Sincronización Automática

### Eventos del Sistema
El sistema utiliza eventos personalizados para sincronizar cambios:

```javascript
// Ejemplo de evento disparado al cambiar configuración
window.dispatchEvent(new CustomEvent('configuracionActualizada', {
    detail: { 
        tipo: 'rangos_precio', 
        datos: nuevosRangos 
    }
}));
```

### Componentes Sincronizados
- Página de preferencias del cliente
- Sistema de recomendaciones
- Filtros de productos
- Categorización automática

## 📊 Base de Datos

### Tabla Principal: `preferencias_categorias`
```sql
CREATE TABLE preferencias_categorias (
    id SERIAL PRIMARY KEY,
    idclientes INTEGER REFERENCES clientes(id_cliente),
    categoria_color VARCHAR(50),
    categoria_estilo VARCHAR(50),
    categoria_material VARCHAR(50),
    categoria_precio VARCHAR(50),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);
```

### Tabla de Configuración: `configuracion_sistema`
```sql
CREATE TABLE configuracion_sistema (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE,
    valor JSONB,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Flujo de Trabajo Recomendado

### 1. Configuración Inicial
1. Acceder a `/configuracion-sistema`
2. Hacer clic en "Crear Configuraciones por Defecto"
3. Revisar y personalizar cada categoría según necesidades

### 2. Personalización de Categorías
1. Seleccionar la pestaña deseada (Rangos, Colores, Estilos, Materiales)
2. Hacer clic en "Editar [Categoría]"
3. Modificar valores, nombres y descripciones
4. Guardar cambios

### 3. Monitoreo de Preferencias
1. Acceder a `/admin-preferencias-uso`
2. Revisar preferencias de clientes
3. Ajustar preferencias individuales si es necesario
4. Monitorear estadísticas de uso

### 4. Mantenimiento Regular
1. Revisar configuración mensualmente
2. Actualizar categorías según tendencias del mercado
3. Limpiar preferencias obsoletas
4. Optimizar rangos de precio según inventario

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Las preferencias no se actualizan
- Verificar que el evento `configuracionActualizada` se dispare
- Revisar consola del navegador para errores
- Confirmar que la base de datos se actualice correctamente

#### 2. Categorías no aparecen
- Verificar que existan en `configuracion_sistema`
- Confirmar que el campo `activo` sea `true`
- Revisar formato JSON de la configuración

#### 3. Errores de permisos
- Verificar rol del usuario (admin o mantenimiento)
- Confirmar permisos en Supabase
- Revisar políticas de seguridad

### Logs y Debugging
```javascript
// Habilitar logs detallados
console.log('🔄 Configuración actualizada, refrescando preferencias...');

// Verificar estado de la configuración
console.log('Categorías cargadas:', categoriasColores);
console.log('Estilos cargados:', estilosDecorativos);
```

## 📈 Mejores Prácticas

### 1. Nomenclatura
- Usar nombres descriptivos y consistentes
- Mantener formato estándar para categorías
- Documentar cambios en descripciones

### 2. Validación
- Verificar que los IDs de estilos/materiales existan
- Validar rangos de precio lógicos
- Confirmar que los colores estén disponibles en inventario

### 3. Performance
- Limitar número de categorías por tipo
- Usar índices en campos de búsqueda frecuente
- Implementar paginación para grandes volúmenes

### 4. Seguridad
- Validar permisos de usuario antes de operaciones
- Sanitizar inputs de configuración
- Mantener logs de cambios administrativos

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas
- **Importación masiva** de preferencias desde CSV
- **Análisis predictivo** de preferencias de clientes
- **Sincronización** con sistemas externos
- **API REST** para integraciones
- **Dashboard** de métricas avanzadas

### Optimizaciones Técnicas
- **Caché** de configuración en memoria
- **WebSockets** para actualizaciones en tiempo real
- **Compresión** de datos de preferencias
- **Backup automático** de configuración

---

## 📞 Soporte

Para dudas o problemas técnicos:
- Revisar logs del sistema
- Consultar documentación de Supabase
- Contactar al equipo de desarrollo

---

*Última actualización: Diciembre 2024*
