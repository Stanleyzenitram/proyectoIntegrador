import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import type { Producto } from "../types/index";
import { supabase } from "../services/supabase";

interface ProductModalProps {
    product: Producto;
    onClose: () => void;
    isUpdating?: boolean;
    currentMetros?: number;
}

export default function ProductModal({ product, onClose, isUpdating = false, currentMetros }: ProductModalProps) {
    console.log("Modal renderizando con producto:", product);
    const [selectionMode, setSelectionMode] = useState<'metros' | 'cajas'>('metros');
    const [metrosDeseados, setMetrosDeseados] = useState(currentMetros || product.metros_por_caja);
    const [cajasDeseadas, setCajasDeseadas] = useState(1);
    const [esRevestimiento, setEsRevestimiento] = useState(false);
    const [loading, setLoading] = useState(true);
    const [calculando, setCalculando] = useState(false);
    const { addItem, updateQuantity } = useCart();
    const navigate = useNavigate();

    // Función para determinar si un producto es de revestimientos
    const determinarTipoProducto = async (producto: Producto): Promise<boolean> => {
        try {
            // Si no tiene categoría, asumimos que no es revestimiento
            if (!producto.id_categoria) return false;
            
            // Solo estas categorías específicas se consideran revestimientos (cálculo por metros)
            const categoriasRevestimientos = [
                'cerámica', 
                'porcelanato',
                'mosaico'
            ];
            
            // Buscar la categoría en la base de datos
            const { data: categoria } = await supabase
                .from('categorias')
                .select('nombre_categoria')
                .eq('id_categoria', producto.id_categoria)
                .single();
            
            if (categoria) {
                const nombreCategoria = categoria.nombre_categoria.toLowerCase();
                // Verificar si la categoría coincide exactamente con las categorías de revestimientos
                const esRevestimientoPorCategoria = categoriasRevestimientos.some(term => 
                    nombreCategoria === term
                );
                
                if (esRevestimientoPorCategoria) return true;
            }
            
            // Si no es de las categorías específicas, no es revestimiento
            return false;
            
        } catch (error) {
            console.error('Error al verificar categoría:', error);
            // En caso de error, asumimos que no es revestimiento
            return false;
        }
    };

    // Determinar el tipo de producto al cargar el componente
    useEffect(() => {
        const verificarTipo = async () => {
            const tipo = await determinarTipoProducto(product);
            setEsRevestimiento(tipo);
            setLoading(false);
        };
        
        verificarTipo();
    }, [product]);

    // Efecto para sincronizar metros y cajas cuando cambien
    useEffect(() => {
        if (esRevestimiento && product.metros_por_caja) {
            console.log('Estado actualizado:', {
                cajasDeseadas,
                metrosDeseados,
                metrosPorCaja: product.metros_por_caja,
                precioTotal: calcularPrecioTotal()
            });
        }
    }, [cajasDeseadas, metrosDeseados, esRevestimiento, product.metros_por_caja]);

    // Función para calcular metros cuadrados por pieza con validación
    const calcularMetrosPorPieza = (formato: string | undefined): number => {
        if (!formato) return 0;
        const [ancho, largo] = formato.split('x').map(Number);
        if (!ancho || !largo) return 0;
        return (ancho * largo) / 10000;
    };

    // Cálculos básicos
    const metrosPorPieza = calcularMetrosPorPieza(product.formato);
    const piezasPorCaja = product.metros_por_caja ? Math.round(product.metros_por_caja / metrosPorPieza) : 0;
    const metrosMaximos = product.stock_actual * (product.metros_por_caja || 0);

    // Función para calcular el precio total
    const calcularPrecioTotal = () => {
        const precioBase = product.precio * cajasDeseadas;

        // Aplicar descuento si existe
        if (product.descuento && product.descuento > 0) {
            const descuento = (precioBase * product.descuento) / 100;
            return precioBase - descuento;
        }

        return precioBase;
    };

    // Función para calcular el subtotal (sin descuento)
    const calcularSubtotal = () => {
        return product.precio * cajasDeseadas;
    };

    // Función para calcular el descuento en pesos
    const calcularDescuentoPesos = () => {
        if (!product.descuento || product.descuento <= 0) return 0;
        return (calcularSubtotal() * product.descuento) / 100;
    };

    // Actualizar cálculos basados en el modo de selección (solo para productos revestimiento)
    useEffect(() => {
        // Solo ejecutar este efecto para productos revestimiento que tienen metros_por_caja
        if (!esRevestimiento || !product.metros_por_caja) return;
        
        if (selectionMode === 'cajas') {
            setMetrosDeseados(cajasDeseadas * product.metros_por_caja);
        } else {
            const cajasNecesarias = Math.ceil(metrosDeseados / product.metros_por_caja);
            setCajasDeseadas(cajasNecesarias);
            // Actualizar metros deseados para reflejar el número real de metros basado en cajas completas
            setMetrosDeseados(cajasNecesarias * product.metros_por_caja);
        }
    }, [selectionMode, cajasDeseadas, metrosDeseados, product.metros_por_caja, esRevestimiento]);

    const handleMetrosChange = (metros: number) => {
        if (metros < (product.metros_por_caja || 0)) return;
        // Permitir metros incluso si no hay stock (para pedidos futuros)
        const cajasRequeridas = Math.ceil(metros / (product.metros_por_caja || 1));
        const metrosReales = cajasRequeridas * (product.metros_por_caja || 0);
        
        // Activar animación de cálculo
        setCalculando(true);
        
        setMetrosDeseados(metrosReales);
        setCajasDeseadas(cajasRequeridas);
        
        // Desactivar animación después de un breve delay
        setTimeout(() => setCalculando(false), 500);
        
        // Log para debugging
        console.log('Metros cambiados:', {
            metrosSolicitados: metros,
            metrosReales: metrosReales,
            cajasRequeridas: cajasRequeridas,
            metrosPorCaja: product.metros_por_caja
        });
    };

    const handleCajasChange = (cajas: number) => {
        // Permitir cantidades desde 1, sin límite superior estricto del stock
        if (cajas >= 1) {
            // Activar animación de cálculo
            setCalculando(true);
            
            setCajasDeseadas(cajas);
            
            // Solo calcular metros si es un producto revestimiento
            if (esRevestimiento && product.metros_por_caja) {
                setMetrosDeseados(cajas * product.metros_por_caja);
            }
            
            // Desactivar animación después de un breve delay
            setTimeout(() => setCalculando(false), 500);
            
            // Log para debugging
            console.log('Cajas cambiadas:', {
                cajasSolicitadas: cajas,
                esRevestimiento,
                metrosCalculados: esRevestimiento ? cajas * (product.metros_por_caja || 0) : 'N/A',
                metrosPorCaja: product.metros_por_caja
            });
        }
    };

    const handleAddToCart = () => {
        // Verificar si el producto tiene stock disponible
        if (product.stock_actual === 0) {
            // Mostrar confirmación para productos sin stock
            const confirmar = window.confirm(
                `Este producto no tiene stock disponible actualmente.\n\n` +
                `¿Deseas agregarlo al carrito como pedido para futuro?\n\n` +
                `Cantidad: ${cajasDeseadas} ${esRevestimiento ? 'cajas' : 'cajas'}\n` +
                `Total: RD$${calcularPrecioTotal().toFixed(2)}`
            );
            
            if (!confirmar) return;
        }

        if (isUpdating) {
            updateQuantity(product.id_producto!.toString(), cajasDeseadas);
        } else {
            addItem(product, cajasDeseadas, {
                metrosCuadrados: esRevestimiento ? metrosDeseados : 0,
                cajasNecesarias: cajasDeseadas,
                metrosReales: esRevestimiento ? metrosDeseados : 0
            });
        }
        onClose();
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Sin stock', color: 'text-red-600' };
        if (stock <= 3) return { text: 'Stock bajo', color: 'text-yellow-600' };
        return { text: 'Disponible', color: 'text-green-600' };
    };

    const handlePrintDetail = () => {
        navigate(`/producto/${product.id_producto}`);
    };

    // Mostrar loading mientras se determina el tipo de producto
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verificando tipo de producto...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Verificar que el producto tenga los datos necesarios SOLO si es revestimiento
    if (esRevestimiento && (!product.metros_por_caja || !product.formato)) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white p-6 rounded-lg max-w-2xl w-full mx-4 shadow-xl">
                    <div className="text-center">
                        <p className="text-red-600">
                            Error: Producto de revestimiento no configurado correctamente. 
                            Necesita formato y metros por caja.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Si no es revestimiento, mostrar modal simplificado
    if (!esRevestimiento) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{product.nombre_producto}</h2>
                                <div className="flex items-center mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        product.stock_actual === 0 
                                            ? 'bg-orange-100 text-orange-800' 
                                            : product.stock_actual <= 3 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-green-100 text-green-800'
                                    }`}>
                                        {product.stock_actual === 0 
                                            ? '⚠️ Sin Stock' 
                                            : product.stock_actual <= 3 
                                                ? '⚠️ Stock Bajo' 
                                                : '✓ Disponible'
                                        }
                                    </span>
                                    {product.stock_actual > 0 && (
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({product.stock_actual} unidades)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Cerrar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                {product.imagen && (
                                    <img
                                        src={product.imagen}
                                        alt={product.nombre_producto}
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                )}
                                
                                {/* Cálculo en tiempo real para productos no-revestimiento */}
                                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                                        <span className="mr-2">📊</span>
                                        Cálculo en tiempo real
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Precio por caja:</span>
                                            <span className="font-medium text-blue-900">RD${product.precio}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Cantidad de cajas:</span>
                                            <span className="font-medium text-blue-900">{cajasDeseadas}</span>
                                        </div>
                                        <div className="border-t border-blue-200 pt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-700 font-medium">Total:</span>
                                                <span className={`text-lg font-bold text-blue-900 transition-all duration-300 ${
                                                    calculando ? 'scale-110' : ''
                                                }`}>
                                                    RD${(product.precio * cajasDeseadas).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Detalles del producto</h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.descripcion}</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">Precio:</span>
                                            <span className="font-medium">RD${product.precio}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">Stock disponible:</span>
                                            <span className={`font-medium ${product.stock_actual === 0 ? 'text-orange-600' : ''}`}>
                                                {product.stock_actual === 0 ? 'Sin stock' : `${product.stock_actual} cajas`}
                                            </span>
                                        </div>
                                        {product.stock_actual === 0 && (
                                            <div className="mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <p className="text-sm text-orange-800">
                                                    <span className="font-medium">⚠️ Producto sin stock:</span> Este producto no tiene inventario disponible actualmente, pero puedes hacer un pedido para futuro.
                                                </p>
                                            </div>
                                        )}
                                        {product.formato && (
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Especificaciones:</span>
                                                <span className="font-medium">{product.formato}</span>
                                            </div>
                                        )}
                                        {product.piezas_por_caja > 1 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Piezas por caja:</span>
                                                <span className="font-medium">{product.piezas_por_caja}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cantidad (Cajas)
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleCajasChange(Math.max(1, cajasDeseadas - 1))}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                    disabled={cajasDeseadas <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="text-lg font-medium min-w-[3rem] text-center">
                                                    {cajasDeseadas}
                                                </span>
                                                <button
                                                    onClick={() => handleCajasChange(cajasDeseadas + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {product.stock_actual === 0 && (
                                                <p className="text-sm text-orange-600 mt-1">
                                                    ⚠️ Sin stock disponible - Pedido para futuro
                                                </p>
                                            )}
                                            {product.stock_actual > 0 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Stock disponible: {product.stock_actual} cajas
                                                </p>
                                            )}
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-lg font-medium text-gray-900">Total:</span>
                                                <span className="text-2xl font-bold text-amber-600">
                                                    RD${calcularPrecioTotal().toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleAddToCart}
                                                    className={`flex-1 py-3 px-6 rounded-lg transition-colors font-medium ${
                                                        product.stock_actual === 0
                                                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                                                    }`}
                                                >
                                                    {product.stock_actual === 0 
                                                        ? 'Pedido para Futuro' 
                                                        : (isUpdating ? "Actualizar Carrito" : "Agregar al Carrito")
                                                    }
                                                </button>
                                                <button
                                                    onClick={handlePrintDetail}
                                                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Ver Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo semi-transparente con efecto de desenfoque */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Contenido del modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{product.nombre_producto}</h2>
                            <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    product.stock_actual === 0 
                                        ? 'bg-orange-100 text-orange-800' 
                                        : product.stock_actual <= 3 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-green-100 text-green-800'
                                }`}>
                                    {product.stock_actual === 0 
                                        ? '⚠️ Sin Stock' 
                                        : product.stock_actual <= 3 
                                            ? '⚠️ Stock Bajo' 
                                            : '✓ Disponible'
                                    }
                                </span>
                                {product.stock_actual > 0 && (
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({product.stock_actual} cajas)
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            {product.imagen && (
                                <img
                                    src={product.imagen}
                                    alt={product.nombre_producto}
                                    className="w-full h-64 object-cover rounded-lg shadow-md"
                                />
                            )}
                            
                            {/* Sección de cálculo en tiempo real - Movida aquí debajo de la foto */}
                            {esRevestimiento && (
                                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-amber-800 flex items-center">
                                            📊 Cálculo en tiempo real
                                        </h4>
                                        <div className={`text-xs px-2 py-1 rounded-full transition-all duration-200 ${
                                            calculando 
                                                ? 'text-amber-800 bg-amber-200 scale-110' 
                                                : 'text-amber-600 bg-amber-100'
                                        }`}>
                                            {calculando ? '🔄 Calculando...' : '✓ Actualizado'}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                                            <span className="text-amber-700 text-xs uppercase tracking-wide">Metros seleccionados</span>
                                            <div className={`font-bold text-lg transition-colors duration-200 ${
                                                calculando ? 'text-orange-600' : 'text-amber-900'
                                            }`}>{metrosDeseados.toFixed(2)} m²</div>
                                        </div>
                                        <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                                            <span className="text-amber-700 text-xs uppercase tracking-wide">Cajas necesarias</span>
                                            <div className={`font-bold text-lg transition-colors duration-200 ${
                                                calculando ? 'text-orange-600' : 'text-amber-900'
                                            }`}>{cajasDeseadas} cajas</div>
                                        </div>
                                        <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                                            <span className="text-amber-700 text-xs uppercase tracking-wide">Precio por metro</span>
                                            <div className="font-bold text-lg text-amber-900">RD${(product.precio / product.metros_por_caja).toFixed(2)}</div>
                                        </div>
                                        <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                                            <span className="text-amber-700 text-xs uppercase tracking-wide">Precio por caja</span>
                                            <div className="font-bold text-lg text-amber-900">RD${product.precio}</div>
                                        </div>
                                    </div>
                                    
                                    {product.descuento && product.descuento > 0 && (
                                        <div className="mt-4 pt-3 border-t border-amber-200">
                                            <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-amber-700 text-sm">Subtotal:</span>
                                                    <span className="font-semibold text-amber-900">RD${calcularSubtotal().toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-amber-700 text-sm">Descuento ({product.descuento}%):</span>
                                                    <span className="font-semibold text-green-600">-RD${calcularDescuentoPesos().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 pt-3 border-t border-amber-200">
                                        <div className={`bg-amber-100 rounded-lg p-3 transition-all duration-200 ${
                                            calculando ? 'animate-pulse scale-105' : ''
                                        }`}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-800 font-semibold">Total calculado:</span>
                                                <span className="text-xl font-bold text-amber-900 transition-all duration-200">
                                                    RD${calcularPrecioTotal().toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Detalles del producto</h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.descripcion}</p>
                                </div>

                                {esRevestimiento ? (
                                    // Para productos revestimiento (cerámica, porcelanato, mosaico)
                                    <>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Precio por metro:</span>
                                                <span className="font-medium">RD${(product.precio / product.metros_por_caja).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Metros por caja:</span>
                                                <span className="font-medium">{product.metros_por_caja} m²</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Piezas por caja:</span>
                                                <span className="font-medium">{piezasPorCaja} piezas</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Stock disponible:</span>
                                                <span className={`font-medium ${product.stock_actual === 0 ? 'text-orange-600' : ''}`}>
                                                    {product.stock_actual === 0 ? 'Sin stock' : `${product.stock_actual} cajas`}
                                                </span>
                                            </div>
                                            {product.stock_actual === 0 && (
                                                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                    <p className="text-sm text-orange-800">
                                                        <span className="font-medium">⚠️ Producto sin stock:</span> Este producto no tiene inventario disponible actualmente, pero puedes hacer un pedido para futuro.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex gap-4 mb-4">
                                                <button
                                                    onClick={() => setSelectionMode('metros')}
                                                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                                        selectionMode === 'metros'
                                                            ? 'bg-amber-500 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    Por metros
                                                </button>
                                                <button
                                                    onClick={() => setSelectionMode('cajas')}
                                                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                                        selectionMode === 'cajas'
                                                            ? 'bg-amber-500 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    Por cajas
                                                </button>
                                            </div>

                                            {selectionMode === 'metros' ? (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Metros cuadrados deseados
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={product.metros_por_caja}
                                                        max={metrosMaximos}
                                                        step={product.metros_por_caja}
                                                        value={metrosDeseados}
                                                        onChange={(e) => handleMetrosChange(Number(e.target.value))}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                    />
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Mínimo: {product.metros_por_caja} m², Máximo: {metrosMaximos} m²
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Cajas deseadas
                                                    </label>
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => handleCajasChange(Math.max(1, cajasDeseadas - 1))}
                                                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                            disabled={cajasDeseadas <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-lg font-medium min-w-[3rem] text-center">
                                                            {cajasDeseadas}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCajasChange(cajasDeseadas + 1)}
                                                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {product.stock_actual === 0 && (
                                                        <p className="text-sm text-orange-600 mt-1">
                                                            ⚠️ Sin stock disponible - Pedido para futuro
                                                        </p>
                                                    )}
                                                    {product.stock_actual > 0 && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Stock disponible: {product.stock_actual} cajas
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    // Para productos normales (no revestimiento)
                                    <>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Precio:</span>
                                                <span className="font-medium">RD${product.precio}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Stock disponible:</span>
                                                <span className={`font-medium ${product.stock_actual === 0 ? 'text-orange-600' : ''}`}>
                                                    {product.stock_actual === 0 ? 'Sin stock' : `${product.stock_actual} unidades`}
                                                </span>
                                            </div>
                                            {product.stock_actual === 0 && (
                                                <div className="mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                    <p className="text-sm text-orange-800">
                                                        <span className="font-medium">⚠️ Producto sin stock:</span> Este producto no tiene inventario disponible actualmente, pero puedes hacer un pedido para futuro.
                                                    </p>
                                                </div>
                                            )}
                                            {product.formato && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-600">Especificaciones:</span>
                                                    <span className="font-medium">{product.formato}</span>
                                                </div>
                                            )}
                                            {product.piezas_por_caja > 1 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Piezas por unidad:</span>
                                                    <span className="font-medium">{product.piezas_por_caja}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cantidad (Cajas)
                                                </label>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleCajasChange(Math.max(1, cajasDeseadas - 1))}
                                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                        disabled={cajasDeseadas <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-lg font-medium min-w-[3rem] text-center">
                                                        {cajasDeseadas}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCajasChange(cajasDeseadas + 1)}
                                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                {product.stock_actual === 0 && (
                                                    <p className="text-sm text-orange-600 mt-1">
                                                        ⚠️ Sin stock disponible - Pedido para futuro
                                                    </p>
                                                )}
                                                {product.stock_actual > 0 && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Stock disponible: {product.stock_actual} cajas
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-medium text-gray-900">Total:</span>
                                        <span className="text-2xl font-bold text-amber-600">
                                            RD${calcularPrecioTotal().toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAddToCart}
                                            className={`flex-1 py-3 px-6 rounded-lg transition-colors font-medium ${
                                                product.stock_actual === 0
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                                            }`}
                                        >
                                            {product.stock_actual === 0 
                                                ? 'Pedido para Futuro' 
                                                : (isUpdating ? "Actualizar Carrito" : "Agregar al Carrito")
                                            }
                                        </button>
                                        <button
                                            onClick={handlePrintDetail}
                                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 