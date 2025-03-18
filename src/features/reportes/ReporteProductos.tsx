import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Package, Download, Search, FileText, Printer, Box, DollarSign, Tag } from 'lucide-react';

interface Producto {
    id_producto: number;
    nombre_producto: string;
    descripcion: string;
    precio: number;
    stock_actual: number;
    formato: string;
    descuento: number;
    estado: boolean;
    imagen?: string;
}

export default function ReporteProductos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormato, setSelectedFormato] = useState<string>('todos');
    const [stockFilter, setStockFilter] = useState<string>('todos');

    useEffect(() => {
        console.log('ReporteProductos component mounted');
        console.log('Current path:', window.location.pathname);
        console.log('Current URL:', window.location.href);
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Iniciando fetchProductos...');

            const { data: testData, error: testError } = await supabase
                .from('productos')
                .select('count');

            if (testError) {
                console.error('Error de conexión:', testError);
                throw new Error(`Error de conexión: ${testError.message}`);
            }

            console.log('Conexión exitosa, total de productos:', testData);

            const { data, error } = await supabase
                .from('productos')
                .select(`
                    id_producto,
                    nombre_producto,
                    stock_actual,
                    precio,
                    imagen,
                    descripcion,
                    formato,
                    descuento,
                    estado
                `)
                .order('nombre_producto', { ascending: true });

            if (error) {
                console.error('Error al cargar datos:', error);
                throw new Error(`Error al cargar los datos: ${error.message}`);
            }

            if (data && data.length > 0) {
                console.log('Productos cargados:', data);
                const productosValidados = data.map(producto => ({
                    id_producto: producto.id_producto || 0,
                    nombre_producto: producto.nombre_producto || 'Sin nombre',
                    descripcion: producto.descripcion || '',
                    precio: typeof producto.precio === 'number' ? producto.precio : 0,
                    stock_actual: typeof producto.stock_actual === 'number' ? producto.stock_actual : 0,
                    formato: producto.formato || 'No especificado',
                    descuento: typeof producto.descuento === 'number' ? producto.descuento : 0,
                    estado: producto.estado || false,
                    imagen: producto.imagen || ''
                }));
                setProductos(productosValidados);
            } else {
                console.log('No se encontraron registros de productos');
                setProductos([]);
            }
        } catch (error) {
            console.error('Error detallado:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido al cargar los productos');
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    const formatosUnicos = [...new Set(
        productos
            .filter(p => p.formato)
            .map(p => p.formato)
    )];

    const filteredProductos = productos.filter(producto => {
        try {
            const matchesSearch = 
                (producto.nombre_producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (producto.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (producto.id_producto || '').toString().includes(searchTerm);

            const matchesFormato = selectedFormato === 'todos' || 
                (producto.formato || '').toLowerCase() === selectedFormato.toLowerCase();

            let matchesStock = true;
            if (stockFilter === 'bajo') {
                matchesStock = (producto.stock_actual || 0) <= 10;
            } else if (stockFilter === 'sin_stock') {
                matchesStock = (producto.stock_actual || 0) === 0;
            }

            return matchesSearch && matchesFormato && matchesStock;
        } catch (e) {
            console.error('Error al filtrar producto:', e, producto);
            return false;
        }
    });

    const totalValorInventario = filteredProductos.reduce((acc, producto) => {
        try {
            const precio = typeof producto.precio === 'number' ? producto.precio : 0;
            const descuento = typeof producto.descuento === 'number' ? producto.descuento : 0;
            const precioFinal = precio * (1 - descuento / 100);
            const stock = typeof producto.stock_actual === 'number' ? producto.stock_actual : 0;
            return acc + (precioFinal * stock);
        } catch (e) {
            console.error('Error al calcular valor de inventario:', e, producto);
            return acc;
        }
    }, 0);

    const exportToCSV = () => {
        try {
            const headers = ['ID', 'Nombre', 'Descripción', 'Precio', 'Descuento', 'Precio Final', 'Stock', 'Formato', 'Valor Total'];
            const csvData = filteredProductos.map(producto => {
                const precioFinal = (producto.precio || 0) * (1 - (producto.descuento || 0) / 100);
                return [
                    producto.id_producto,
                    producto.nombre_producto,
                    producto.descripcion,
                    (producto.precio || 0).toFixed(2),
                    `${(producto.descuento || 0)}%`,
                    precioFinal.toFixed(2),
                    producto.stock_actual || 0,
                    producto.formato || 'No especificado',
                    (precioFinal * (producto.stock_actual || 0)).toFixed(2)
                ];
            });

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `reporte_productos_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (e) {
            console.error('Error al exportar a CSV:', e);
            setError('Error al exportar a CSV. Por favor, intente nuevamente.');
        }
    };

    const handlePrint = () => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                setError('No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.');
                return;
            }

            const productosPorFormato = filteredProductos.reduce((acc, producto) => {
                const formato = producto.formato || 'No especificado';
                if (!acc[formato]) {
                    acc[formato] = [];
                }
                acc[formato].push(producto);
                return acc;
            }, {} as Record<string, Producto[]>);

            const productosConDescuento = filteredProductos.filter(p => (p.descuento || 0) > 0);
            const descuentoPromedio = productosConDescuento.length > 0 
                ? productosConDescuento.reduce((acc, p) => acc + (p.descuento || 0), 0) / productosConDescuento.length 
                : 0;

            const estadisticas = {
                totalProductos: filteredProductos.length,
                totalValorInventario: totalValorInventario,
                promedioPrecio: filteredProductos.length > 0 
                    ? filteredProductos.reduce((acc, p) => acc + (p.precio || 0), 0) / filteredProductos.length 
                    : 0,
                productosBajoStock: filteredProductos.filter(p => (p.stock_actual || 0) <= 10).length,
                productosSinStock: filteredProductos.filter(p => (p.stock_actual || 0) === 0).length,
                formatosUnicos: Object.keys(productosPorFormato).length,
                totalStock: filteredProductos.reduce((acc, p) => acc + (p.stock_actual || 0), 0),
                promedioStock: filteredProductos.length > 0 
                    ? filteredProductos.reduce((acc, p) => acc + (p.stock_actual || 0), 0) / filteredProductos.length 
                    : 0,
                productosConDescuento: productosConDescuento.length,
                descuentoPromedio: descuentoPromedio
            };

            const estadisticasPorFormato = Object.entries(productosPorFormato).map(([formato, productos]) => {
                const valorTotal = productos.reduce((acc, p) => {
                    const precioFinal = (p.precio || 0) * (1 - (p.descuento || 0) / 100);
                    return acc + (precioFinal * (p.stock_actual || 0));
                }, 0);
                return `
                    <div class="stat-item">
                        <div class="stat-label">${formato}</div>
                        <div class="stat-value">${productos.length} productos</div>
                        <div class="stat-value-small">RD$${valorTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                `;
            }).join('');

            const productosHTML = filteredProductos.map(producto => {
                const precioFinal = (producto.precio || 0) * (1 - (producto.descuento || 0) / 100);
                const tieneDescuento = (producto.descuento || 0) > 0;
                
                return `
                <tr>
                    <td class="border px-4 py-2">${producto.id_producto}</td>
                    <td class="border px-4 py-2">
                        <div class="font-medium">${producto.nombre_producto || 'Sin nombre'}</div>
                        <div class="text-gray-600">${producto.descripcion || ''}</div>
                    </td>
                    <td class="border px-4 py-2 text-right">RD$${(producto.precio || 0).toFixed(2)}</td>
                    <td class="border px-4 py-2 text-center">
                        ${tieneDescuento ? 
                            `<span class="text-red-600 font-medium">-${producto.descuento}%</span>` 
                            : 
                            `<span class="text-gray-400">-</span>`
                        }
                    </td>
                    <td class="border px-4 py-2 text-right">
                        ${tieneDescuento ? 
                            `<span class="text-green-600 font-medium">RD$${precioFinal.toFixed(2)}</span>` 
                            : 
                            `<span class="text-gray-400">-</span>`
                        }
                    </td>
                    <td class="border px-4 py-2 text-right">${producto.stock_actual || 0}</td>
                    <td class="border px-4 py-2">${producto.formato || 'No especificado'}</td>
                    <td class="border px-4 py-2 text-right">RD$${(precioFinal * (producto.stock_actual || 0)).toFixed(2)}</td>
                </tr>
            `}).join('');

            const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Reporte de Productos</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            color: #333;
                            background-color: white;
                        }
                        @page {
                            margin: 25mm 15mm 25mm 15mm;
                            size: landscape;
                        }
                        .company-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 30px;
                            padding: 15px 0;
                            border-bottom: 3px solid #fbbf24;
                        }
                        .company-logo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #fbbf24;
                        }
                        .company-info {
                            text-align: right;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 25px;
                            padding: 10px 0;
                        }
                        .title {
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 10px;
                            color: #1f2937;
                        }
                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 15px;
                            margin-bottom: 30px;
                            padding: 20px;
                            background-color: #f9fafb;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        }
                        .formats-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 15px;
                            margin-bottom: 30px;
                            padding: 20px;
                            background-color: #f9fafb;
                            border-radius: 10px;
                            border: 1px solid #e5e7eb;
                        }
                        .stat-item {
                            padding: 12px;
                            background-color: white;
                            border-radius: 8px;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        }
                        .stat-label {
                            font-size: 13px;
                            color: #666;
                            margin-bottom: 6px;
                            font-weight: 500;
                        }
                        .stat-value {
                            font-size: 16px;
                            font-weight: bold;
                            color: #1f2937;
                        }
                        .stat-value-small {
                            font-size: 14px;
                            color: #4b5563;
                            margin-top: 4px;
                        }
                        .section-title {
                            font-size: 18px;
                            font-weight: bold;
                            margin: 20px 0 10px;
                            color: #1f2937;
                        }
                        .line-through {
                            text-decoration: line-through;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 25px;
                            page-break-inside: auto;
                            font-size: 12px;
                            background-color: white;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                        th {
                            background-color: #f3f4f6 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            font-weight: bold;
                            text-align: left;
                            padding: 12px;
                            border: 1px solid #e5e7eb;
                            font-size: 13px;
                            text-transform: uppercase;
                            color: #4b5563;
                        }
                        td {
                            padding: 12px;
                            border: 1px solid #e5e7eb;
                            vertical-align: top;
                        }
                        td div {
                            margin-bottom: 3px;
                        }
                        .text-right {
                            text-align: right;
                        }
                        .total {
                            text-align: right;
                            font-weight: bold;
                            font-size: 18px;
                            margin-top: 20px;
                            margin-bottom: 30px;
                            padding: 15px;
                            background-color: #f9fafb;
                            border-radius: 8px;
                            color: #1f2937;
                            border: 2px solid #e5e7eb;
                        }
                        .footer {
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            margin-top: 20px;
                            padding-top: 10px;
                            border-top: 1px solid #e5e7eb;
                            page-break-inside: avoid;
                        }
                        .footer div {
                            margin: 5px 0;
                        }
                        @media print {
                            body { 
                                margin: 0;
                                padding: 15px;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            .stats-grid, .formats-grid {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                background-color: #f9fafb !important;
                            }
                            .stat-item {
                                background-color: white !important;
                            }
                            table {
                                page-break-inside: auto;
                            }
                            tr {
                                page-break-inside: avoid;
                            }
                            thead {
                                display: table-header-group;
                            }
                            tfoot {
                                display: table-footer-group;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="company-header">
                        <div class="company-logo">
                            Tiles Import & Export S.R.L.
                        </div>
                        <div class="company-info">
                            <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Sistema de Gestión de Inventario</div>
                            <div>Fecha: ${new Date().toLocaleDateString()}</div>
                            <div>Hora: ${new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>

                    <div class="header">
                        <div class="title">Reporte Detallado de Productos</div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">Total de Productos</div>
                            <div class="stat-value">${estadisticas.totalProductos.toLocaleString('es-DO')}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Valor Total del Inventario</div>
                            <div class="stat-value">RD$${estadisticas.totalValorInventario.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Promedio de Precio</div>
                            <div class="stat-value">RD$${estadisticas.promedioPrecio.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Productos Bajo Stock</div>
                            <div class="stat-value">${estadisticas.productosBajoStock.toLocaleString('es-DO')}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Productos Sin Stock</div>
                            <div class="stat-value">${estadisticas.productosSinStock.toLocaleString('es-DO')}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Formatos Únicos</div>
                            <div class="stat-value">${estadisticas.formatosUnicos.toLocaleString('es-DO')}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Productos con Descuento</div>
                            <div class="stat-value">${estadisticas.productosConDescuento.toLocaleString('es-DO')}</div>
                            <div class="stat-value-small">Promedio: ${estadisticas.descuentoPromedio.toLocaleString('es-DO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Total de Stock</div>
                            <div class="stat-value">${estadisticas.totalStock.toLocaleString('es-DO')}</div>
                        </div>
                    </div>

                    <div class="section-title">Distribución por Formato</div>
                    <div class="formats-grid">
                        ${estadisticasPorFormato}
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Descuento</th>
                                <th>Precio Final</th>
                                <th>Stock</th>
                                <th>Formato</th>
                                <th>Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHTML}
                        </tbody>
                    </table>

                    <div class="total">
                        Valor Total del Inventario: RD$${estadisticas.totalValorInventario.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div class="footer">
                        <div style="font-weight: bold;">© ${new Date().getFullYear()} Tiles Import & Export S.R.L.</div>
                        <div>Este es un documento generado automáticamente por el Sistema de Gestión de Inventario</div>
                        <div style="color: #888; margin-top: 5px;">Página 1</div>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        } catch (e) {
            console.error('Error al preparar la impresión:', e);
            setError('Error al preparar la impresión. Por favor, intente nuevamente.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 mt-20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Reporte de Productos</h1>
                        <p className="text-gray-600 mt-1">
                            Valor Total del Inventario: RD${totalValorInventario.toFixed(2)}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrint}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Printer className="w-5 h-5 mr-2" />
                            Imprimir
                        </button>
                        <button
                            onClick={fetchProductos}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            Recargar
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Exportar CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <p className="font-medium">Error al cargar los datos:</p>
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, descripción o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <select
                            value={selectedFormato}
                            onChange={(e) => setSelectedFormato(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white"
                        >
                            <option value="todos">Todos los formatos</option>
                            {formatosUnicos.map(formato => (
                                <option key={formato} value={formato.toLowerCase()}>
                                    {formato}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white"
                        >
                            <option value="todos">Todos los productos</option>
                            <option value="bajo">Stock Bajo</option>
                            <option value="sin_stock">Sin Stock</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando reporte...</p>
                    </div>
                ) : filteredProductos.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 mb-2">No se encontraron productos</p>
                        <p className="text-gray-500">No hay registros que coincidan con los filtros seleccionados</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Final</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProductos.map((producto) => {
                                        const precioFinal = (producto.precio || 0) * (1 - (producto.descuento || 0) / 100);
                                        const tieneDescuento = (producto.descuento || 0) > 0;
                                        
                                        return (
                                            <tr key={producto.id_producto} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">#{producto.id_producto}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {producto.nombre_producto || 'Sin nombre'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{producto.descripcion || ''}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    RD${(producto.precio || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    {tieneDescuento ? (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            -{producto.descuento}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {tieneDescuento ? (
                                                        <span className="font-medium text-green-600">
                                                            RD${precioFinal.toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`
                                                        px-2 py-1 rounded-full text-xs font-medium
                                                        ${(producto.stock_actual || 0) === 0 ? 'bg-red-100 text-red-800' :
                                                        (producto.stock_actual || 0) <= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'}
                                                    `}>
                                                        {producto.stock_actual || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {producto.formato || 'No especificado'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    RD${(precioFinal * (producto.stock_actual || 0)).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 