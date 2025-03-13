import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Package, Download, Search, Calendar, FileText, Printer } from 'lucide-react';

interface Compra {
    id_compra: number;
    id_producto: number;
    id_proveedor: number;
    cantidad: number;
    precio_unitario: number;
    fecha_compra: string;
    numero_factura: string;
    comprobante_url?: string;
    producto: {
        nombre_producto: string;
        descripcion?: string;
    };
    proveedor: {
        nombre_proveedor: string;
        contacto: string;
    };
}

export default function ReporteCompras() {
    const [compras, setCompras] = useState<Compra[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComprobante, setSelectedComprobante] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        from: '',
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        console.log('ReporteCompras component mounted');
        fetchCompras();
    }, []);

    const fetchCompras = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Iniciando fetchCompras...');

            const { data, error } = await supabase
                .from('compras')
                .select(`
                    *,
                    producto:productos(nombre_producto, descripcion),
                    proveedor:proveedores(nombre_proveedor, contacto)
                `)
                .order('fecha_compra', { ascending: false });

            if (error) {
                console.error('Error al cargar datos:', error);
                throw new Error(`Error al cargar los datos: ${error.message}`);
            }

            if (data && data.length > 0) {
                // No modificamos las URLs, las usamos tal como vienen de la base de datos
                console.log('Compras cargadas:', data);
                setCompras(data);
            } else {
                console.log('No se encontraron registros de compras');
                setCompras([]);
            }
        } catch (error) {
            console.error('Error detallado:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido al cargar las compras');
            setCompras([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompras = compras.filter(compra => {
        const matchesSearch = 
            compra.producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            compra.proveedor.nombre_proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            compra.numero_factura.toLowerCase().includes(searchTerm.toLowerCase());
        
        const compraDate = new Date(compra.fecha_compra).toISOString().split('T')[0];
        const matchesDate = 
            (!dateRange.from || compraDate >= dateRange.from) &&
            (!dateRange.to || compraDate <= dateRange.to);

        return matchesSearch && matchesDate;
    });

    const totalCompras = filteredCompras.reduce((acc, compra) => {
        return acc + (compra.cantidad * compra.precio_unitario);
    }, 0);

    const exportToCSV = () => {
        const headers = ['Fecha', 'Factura', 'Producto', 'Proveedor', 'Cantidad', 'Precio Unit.', 'Total'];
        const csvData = filteredCompras.map(compra => [
            new Date(compra.fecha_compra).toLocaleDateString(),
            compra.numero_factura,
            compra.producto.nombre_producto,
            compra.proveedor.nombre_proveedor,
            compra.cantidad,
            compra.precio_unitario.toFixed(2),
            (compra.cantidad * compra.precio_unitario).toFixed(2)
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_compras_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleComprobanteClick = async (url: string, e: React.MouseEvent) => {
        e.preventDefault();
        console.log('URL original:', url);

        // Intentamos diferentes formatos de URL
        const urlVariations = [
            url,
            url.replace('/comprobantes/comprobantes/', '/comprobantes/'),
            `https://pdokbwzmygythqtjroje.supabase.co/storage/v1/object/public/comprobantes/${url}`,
            url.startsWith('http') ? url : `https://pdokbwzmygythqtjroje.supabase.co/storage/v1/object/public/comprobantes/${url}`
        ];

        setSelectedComprobante(url);
        console.log('Intentando las siguientes URLs:', urlVariations);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Calcular estadísticas
        const estadisticas = {
            totalCompras: totalCompras,
            cantidadTransacciones: filteredCompras.length,
            promedioCompra: totalCompras / filteredCompras.length,
            mayorCompra: Math.max(...filteredCompras.map(c => c.cantidad * c.precio_unitario)),
            menorCompra: Math.min(...filteredCompras.map(c => c.cantidad * c.precio_unitario)),
            totalUnidades: filteredCompras.reduce((acc, c) => acc + c.cantidad, 0),
            proveedoresUnicos: new Set(filteredCompras.map(c => c.proveedor.nombre_proveedor)).size,
            productosUnicos: new Set(filteredCompras.map(c => c.producto.nombre_producto)).size
        };

        const comprasHTML = filteredCompras.map(compra => `
            <tr>
                <td class="border px-4 py-2">${new Date(compra.fecha_compra).toLocaleDateString()}</td>
                <td class="border px-4 py-2">${compra.numero_factura}</td>
                <td class="border px-4 py-2">
                    <div class="font-medium">${compra.producto.nombre_producto}</div>
                    ${compra.producto.descripcion ? `<div class="text-gray-600">${compra.producto.descripcion}</div>` : ''}
                </td>
                <td class="border px-4 py-2">
                    <div>${compra.proveedor.nombre_proveedor}</div>
                    <div class="text-gray-600">${compra.proveedor.contacto}</div>
                </td>
                <td class="border px-4 py-2 text-right">${compra.cantidad}</td>
                <td class="border px-4 py-2 text-right">RD$${compra.precio_unitario.toFixed(2)}</td>
                <td class="border px-4 py-2 text-right">RD$${(compra.cantidad * compra.precio_unitario).toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Compras</title>
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
                    .subtitle {
                        font-size: 16px;
                        color: #666;
                        margin-bottom: 20px;
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
                        .stats-grid {
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
                    <div class="title">Reporte Detallado de Compras</div>
                    <div class="subtitle">
                        ${dateRange.from || dateRange.to ? 
                            `Período: ${dateRange.from ? new Date(dateRange.from).toLocaleDateString() : 'Inicio'} - ${dateRange.to ? new Date(dateRange.to).toLocaleDateString() : 'Fin'}` : 
                            'Período: Todas las compras'}
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Total de Compras</div>
                        <div class="stat-value">RD$${estadisticas.totalCompras.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Cantidad de Transacciones</div>
                        <div class="stat-value">${estadisticas.cantidadTransacciones.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Promedio por Compra</div>
                        <div class="stat-value">RD$${estadisticas.promedioCompra.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Mayor Compra</div>
                        <div class="stat-value">RD$${estadisticas.mayorCompra.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Menor Compra</div>
                        <div class="stat-value">RD$${estadisticas.menorCompra.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Total de Unidades</div>
                        <div class="stat-value">${estadisticas.totalUnidades.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Proveedores Únicos</div>
                        <div class="stat-value">${estadisticas.proveedoresUnicos.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Productos Únicos</div>
                        <div class="stat-value">${estadisticas.productosUnicos.toLocaleString('es-DO')}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Factura</th>
                            <th>Producto</th>
                            <th>Proveedor</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comprasHTML}
                    </tbody>
                </table>

                <div class="total">
                    Total General: RD$${estadisticas.totalCompras.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 mt-20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Reporte de Compras</h1>
                        <p className="text-gray-600 mt-1">
                            Total: RD${totalCompras.toFixed(2)}
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
                            onClick={fetchCompras}
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
                            placeholder="Buscar por producto, proveedor o factura..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando reporte...</p>
                    </div>
                ) : filteredCompras.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 mb-2">No se encontraron compras</p>
                        <p className="text-gray-500">No hay registros que coincidan con los filtros seleccionados</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factura</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCompras.map((compra) => (
                                        <tr key={compra.id_compra} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(compra.fecha_compra).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{compra.numero_factura}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{compra.producto.nombre_producto}</div>
                                                {compra.producto.descripcion && (
                                                    <div className="text-sm text-gray-500">{compra.producto.descripcion}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{compra.proveedor.nombre_proveedor}</div>
                                                <div className="text-sm text-gray-500">{compra.proveedor.contacto}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {compra.cantidad} unidades
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                RD${compra.precio_unitario.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-amber-600">
                                                    RD${(compra.cantidad * compra.precio_unitario).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {compra.comprobante_url ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={(e) => handleComprobanteClick(compra.comprobante_url!, e)}
                                                            className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4 mr-1" />
                                                            Ver comprobante
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">No disponible</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para mostrar detalles del comprobante */}
            {selectedComprobante && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Detalles del Comprobante</h3>
                            <button
                                onClick={() => setSelectedComprobante(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium mb-2">URL del comprobante:</p>
                                <div className="bg-gray-100 p-3 rounded-lg break-all">
                                    <code className="text-sm">{selectedComprobante}</code>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={selectedComprobante}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Abrir en nueva pestaña
                                </a>
                                <a
                                    href={`https://pdokbwzmygythqtjroje.supabase.co/storage/v1/object/public/comprobantes/${selectedComprobante}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Intentar URL alternativa
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 