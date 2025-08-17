# Sistema de Recompra de Pedidos y Recomendaciones Inteligentes

## Índice
1. [Introducción](#introducción)
2. [Sistema de Recompra de Pedidos](#sistema-de-recompra-de-pedidos)
3. [Sistema de Recomendaciones Inteligentes](#sistema-de-recomendaciones-inteligentes)
4. [Servicios y APIs](#servicios-y-apis)
5. [Hooks y Utilidades](#hooks-y-utilidades)
6. [Componentes de Interfaz](#componentes-de-interfaz)
7. [Algoritmos de Análisis](#algoritmos-de-análisis)
8. [Arquitectura y Flujo de Datos](#arquitectura-y-flujo-de-datos)

---

## Introducción

El sistema implementado para VentaCeramicas incluye dos módulos principales que mejoran significativamente la experiencia del usuario:

1. **Sistema de Recompra de Pedidos**: Permite a los clientes repetir fácilmente pedidos anteriores
2. **Sistema de Recomendaciones Inteligentes**: Sugiere productos personalizados basados en preferencias y comportamiento de compra

---

## Sistema de Recompra de Pedidos

### Página Principal: `PedidosInt.tsx`

**Ubicación**: `src/pages/PedidosInt.tsx`

**Funcionalidades principales**:

#### 1. Gestión de Pedidos
- **`cargarPedidos()`**: Obtiene el historial completo de pedidos del cliente
- **`recargarPedidos()`**: Refresca manualmente la lista de pedidos
- **Control de carga optimizado**: Usa `useRef` para evitar cargas innecesarias

#### 2. Modal de Repetición de Pedido
- **`abrirModalRepetir(pedido)`**: Función principal para repetir un pedido
  - Obtiene detalles de la factura desde `detalles_factura`
  - Carga información completa de productos
  - Combina datos de cantidad/precio original con información actual del producto
  - Valida disponibilidad y stock actual

#### 3. Gestión de Cantidades y Cálculos
- **`actualizarCantidad(index, nuevaCantidad)`**: Modifica cantidades en tiempo real
- **`calcularTotalRepetir()`**: Calcula subtotal, ITBIS y total
- **Validación de stock**: Previene cantidades superiores al stock disponible

#### 4. Confirmación y Agregado al Carrito
- **`confirmarPedidoRepetido()`**: 
  - Valida todos los productos
  - Agrega cada producto al carrito con la cantidad especificada
  - Maneja el estado de carga y errores
  - Navega automáticamente al carrito tras confirmar

#### 5. Modos de Visualización
- **Modo Cajas**: Muestra cantidades en cajas
- **Modo Metros**: Calcula y muestra metros cuadrados basado en `metros_por_caja`
- **`toggleDisplayMode()`**: Alterna entre ambos modos

### Características Técnicas

**Estados manejados**:
```typescript
const [pedidos, setPedidos] = useState<Pedido[]>([]);
const [modalRepetirAbierto, setModalRepetirAbierto] = useState(false);
const [productosRepetir, setProductosRepetir] = useState<ProductoEnRepetirModal[]>([]);
const [displayMode, setDisplayMode] = useState<'cajas' | 'metros'>('cajas');
```

**Interfaz ProductoEnRepetirModal**:
```typescript
interface ProductoEnRepetirModal extends Producto {
    precio_unitario: number; // Precio original del pedido
    subtotal: number;        // Calculado automáticamente
}
```

---

## Sistema de Recomendaciones Inteligentes

### Componente Principal: `RecomendacionesInteligentes.tsx`

**Ubicación**: `src/components/RecomendacionesInteligentes.tsx`

#### Funcionalidades Principales

1. **Generación de Recomendaciones Contextuales**
   - **Modo Productos Relacionados**: Cuando se pasa `contextProducts`
   - **Modo Historial**: Basado en compras previas del usuario
   - **Modo Preferencias**: Para usuarios sin historial de compras

2. **Gestión de Productos Recomendados**
   - **`generarRecomendaciones()`**: Función principal que coordina todo el proceso
   - **Análisis de preferencias**: Integra con `preferenciasProd` table
   - **Score de recomendación**: Algoritmo de puntuación personalizado

3. **Modal de Producto Detallado**
   - **Selector de cantidad**: Por metros o cajas
   - **Validación de tipo**: Determina si es revestimiento automáticamente
   - **Cálculos dinámicos**: Conversión metros ↔ cajas en tiempo real

### Hook de Recomendaciones: `useRecomendaciones.ts`

**Ubicación**: `src/hooks/useRecomendaciones.ts`

#### Funciones Principales

1. **`generarRecomendacionesPersonalizadas()`**
   - **Análisis de usuario**: Determina si tiene compras previas
   - **Aplicación de filtros**: Basado en preferencias guardadas
   - **Cálculo de puntuación**: Sistema de scoring avanzado
   - **Límites adaptativos**: Más productos para usuarios nuevos

2. **`obtenerPreferenciasPorUso()`**
   - Obtiene preferencias específicas por uso (ej: "baño", "cocina")
   - Enriquece recomendaciones con contexto específico

3. **`verificarCoincidenciaUsoProducto()`**
   - Verifica si un producto coincide con preferencias por uso
   - Genera mensajes personalizados como "Perfecto para tu baño"

4. **`obtenerProductosRelacionados()`**
   - Consulta tabla `productosRelacionados`
   - Implementa fallback a generación automática

#### Sistema de Puntuación

**Para usuarios SIN compras previas**:
- Categoría preferida: +40 puntos
- Estilo preferido: +35 puntos  
- Material preferido: +35 puntos
- Color preferido: +25 puntos
- Superficie preferida: +25 puntos
- Rango de precio: +30 puntos

**Para usuarios CON compras previas**:
- Preferencias: +50 puntos
- Productos relacionados: +30 puntos
- Factores comunes: descuento (+20), stock, uso específico (+40)

---

## Servicios y APIs

### Servicio de Productos Relacionados: `productosRelacionadosService.ts`

**Ubicación**: `src/services/productosRelacionadosService.ts`

#### Funciones de Análisis

1. **`analizarCaracteristicasProductos(productos)`**
   - Analiza patrones en conjuntos de productos
   - Extrae categorías, estilos, materiales, colores, superficies
   - Calcula rangos de precio

2. **`calcularSimilitudProducto(producto, características)`**
   - Compara un producto contra un conjunto de características
   - Genera score de similitud y razones
   - Peso por: categoría (25), estilo (20), material (20), color (15), superficie (15), durabilidad (15), precio (20)

#### Gestión de Productos Relacionados

3. **`obtenerProductosRelacionados(productosComprados)`**
   - Consulta tabla `productosRelacionados` primero
   - Fallback a generación automática si hay menos de 5 productos
   - Combina resultados existentes con nuevos

4. **`generarYGuardarProductosRelacionados(productosComprados)`**
   - Genera productos relacionados usando algoritmo de similitud
   - Guarda resultados en BD para futuras consultas
   - Normaliza scores a 0-1

#### Análisis de Compras Conjuntas

5. **`analizarComprasConjuntas()`**
   - Analiza todas las facturas para encontrar productos comprados juntos
   - Calcula frecuencia y recencia de compras conjuntas
   - Genera scores basados en frecuencia relativa y recencia

6. **`guardarProductosRelacionadosCompra()`**
   - Ejecuta análisis completo de compras conjuntas
   - Guarda resultados en tabla `productos_relacionados_compra`
   - Maneja creación de tabla si no existe

### Servicio de Recomendaciones: `recomendacionesService.ts`

**Ubicación**: `src/services/recomendacionesService.ts`

#### Gestión de Preferencias

1. **`obtenerPreferencias(usuarioId)`**
   - Obtiene preferencias desde tabla `preferenciasProd`
   - Convierte formato BD a formato del sistema
   - Maneja casos de usuario sin preferencias

2. **`guardarPreferencias(preferencias)`**
   - Guarda/actualiza preferencias del usuario
   - Upsert por `idClientes` para evitar duplicados

#### Historial y Comportamiento

3. **`registrarVistaProducto(usuarioId, productoId, accion)`**
   - Registra interacciones del usuario con productos
   - Tipos: 'vista', 'click', 'carrito', 'compra'

4. **`obtenerComportamientoCompra(usuarioId)`**
   - Obtiene historial de comportamiento
   - Usado para personalizar recomendaciones

#### Algoritmo de Recomendaciones

5. **`generarRecomendaciones(usuarioId, limit)`**
   - **Motor principal de recomendaciones**
   - Combina preferencias + historial + comportamiento
   - Diferentes estrategias según perfil del usuario:
     - **Sin compras**: Prioriza preferencias exactas
     - **Con compras**: Balancea preferencias + patrones de compra
     - **Sin preferencias**: Productos populares/oferta

---

## Hooks y Utilidades

### Hook useRecomendaciones

**Funciones Exportadas**:
- `productosRecomendados`: Estado de productos recomendados
- `loading`, `error`: Estados de carga y error
- `generarRecomendaciones()`: Regenera recomendaciones
- `actualizarPreferencias()`: Actualiza preferencias y regenera
- `obtenerRecomendacionesPorCategoria()`: Recomendaciones por categoría específica
- `obtenerRecomendacionesSimilares()`: Productos similares a uno dado

### Interfaces Principales

```typescript
interface ProductoRecomendado {
    id_producto: number;
    nombre_producto: string;
    imagen: string;
    precio: number;
    score_recomendacion?: number;
    razon_recomendacion?: string;
    uso_recomendado?: string;
    // ... más campos del producto
}

interface Preferencia {
    id?: string;
    idClientes: number;
    idEstilo?: number;
    color?: string;
    idMaterial?: number;
    idCategoria?: number;
    durabilidad?: number;
    superficie?: string;
    enTendencia?: boolean;
    precMin?: number;
    precMax?: number;
    usoEspecifico?: string;
}
```

---

## Componentes de Interfaz

### Modal de Repetir Pedido

**Características**:
- **Lista de productos**: Con imagen, nombre, cantidad original, precio
- **Controles de cantidad**: Incremento/decremento con validación de stock
- **Alternancia de vista**: Cajas ↔ Metros cuadrados
- **Cálculos en tiempo real**: Subtotal, ITBIS, total
- **Validación visual**: Productos sin stock marcados claramente

### Modal de Producto Recomendado

**Características**:
- **Información detallada**: Descripción, especificaciones técnicas
- **Selector inteligente**: Automáticamente detecta si es revestimiento
- **Cálculos dinámicos**: Conversión metros/cajas bidireccional
- **Razón de recomendación**: Explica por qué se recomienda el producto

### Componente de Recomendaciones

**Modos de operación**:
- **Compacto**: Para uso en modales y espacios reducidos
- **Completo**: Vista principal con todos los productos
- **Contextual**: Adapta recomendaciones según contexto (ej: modal de repetir)

---

## Algoritmos de Análisis

### Algoritmo de Similitud de Productos

```
Puntuación Total = 
  + 25 puntos (Misma categoría)
  + 20 puntos (Mismo estilo)  
  + 20 puntos (Mismo material)
  + 15 puntos (Mismo color)
  + 15 puntos (Misma superficie)
  + 15 puntos (Misma durabilidad)
  + 20 puntos (Precio similar ±30%)

Score normalizado = Puntuación / 130
```

### Algoritmo de Compras Conjuntas

```
Score Base = (Frecuencia compra conjunta / Total facturas) * 100

Bonus Recencia:
  + 20 puntos (≤ 30 días)
  + 10 puntos (≤ 90 días)

Bonus Frecuencia:
  + 30 puntos (≥ 5 compras conjuntas)
  + 15 puntos (≥ 3 compras conjuntas)

Score Final = min(100, Score Base + Bonus)
```

### Algoritmo de Recomendaciones Personalizadas

**Usuario Nuevo (Sin Compras)**:
```
Score = Coincidencia exacta con preferencias
Categoría (40) + Estilo (35) + Material (35) + Color (25) + 
Superficie (25) + Durabilidad (20) + Rango Precio (30)
```

**Usuario Existente**:
```
Score = Preferencias (50) + Productos Relacionados (30) + 
Descuento (20) + Stock (10) + Uso Específico (40)
```

---

## Arquitectura y Flujo de Datos

### Flujo de Recompra de Pedidos

```
1. Usuario selecciona "Repetir Pedido"
2. PedidosInt.abrirModalRepetir()
3. Consulta detalles_factura + productos
4. Valida stock y disponibilidad
5. Usuario modifica cantidades
6. confirmarPedidoRepetido()
7. Agrega productos al carrito
8. Navega a carrito
```

### Flujo de Recomendaciones

```
1. Componente monta RecomendacionesInteligentes
2. generarRecomendaciones()
3. Obtiene preferencias usuario
4. Analiza historial de compras
5. generarRecomendacionesPersonalizadas()
6. Aplica algoritmo de scoring
7. Ordena por puntuación
8. Renderiza productos recomendados
```

### Flujo de Productos Relacionados

```
1. obtenerProductosRelacionados(productosComprados)
2. Consulta tabla productosRelacionados
3. Si < 5 productos: generarYGuardarProductosRelacionados()
4. Analiza características de productos base
5. Busca productos similares
6. Calcula scores de similitud
7. Guarda en BD para futuras consultas
8. Retorna IDs de productos relacionados
```

---

## Tablas de Base de Datos Utilizadas

### Principales
- **`pedidos`**: Información de pedidos
- **`facturas`**: Facturas generadas
- **`detalles_factura`**: Productos y cantidades por factura
- **`productos`**: Catálogo de productos
- **`preferenciasProd`**: Preferencias de usuario
- **`productosRelacionados`**: Productos relacionados por similitud
- **`productos_relacionados_compra`**: Productos relacionados por compras conjuntas

### Auxiliares
- **`categorias`**, **`estilos`**, **`materiales`**: Metadatos de productos
- **`usoXpref`**: Relación uso específico ↔ preferencias
- **`uso`**: Tipos de uso (baño, cocina, etc.)
- **`clientes`**: Información de clientes

---

## Consideraciones Técnicas

### Optimizaciones Implementadas
1. **Carga perezosa**: Los productos relacionados se generan solo cuando es necesario
2. **Cache en BD**: Resultados de análisis se guardan para reutilización
3. **Validación de stock**: Previene errores de disponibilidad
4. **Scores normalizados**: Algoritmos consistentes entre diferentes módulos

### Manejo de Errores
1. **Fallbacks**: Múltiples estrategias si falla la principal
2. **Validación de datos**: Verificación de integridad en cada paso
3. **Estados de loading**: UI responsive durante operaciones pesadas
4. **Mensajes descriptivos**: Errores específicos para debugging

### Escalabilidad
1. **Análisis por lotes**: Procesamiento eficiente de grandes volúmenes
2. **Límites configurables**: Parámetros ajustables según necesidades
3. **Índices de BD**: Optimización de consultas frecuentes
4. **Limpieza automática**: Eliminación de datos obsoletos

---

Este sistema proporciona una experiencia de usuario mejorada mediante:
- **Facilidad de recompra**: Repetir pedidos en pocos clics
- **Recomendaciones precisas**: Algoritmos que aprenden del comportamiento
- **Personalización**: Adaptación a preferencias individuales
- **Rendimiento**: Operaciones optimizadas y responsive

