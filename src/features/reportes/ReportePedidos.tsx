import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Package, Download, Search, Calendar, FileText, Printer } from 'lucide-react';

interface Pedido {
    id_pedido: number;
    id_cliente: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number | null;
    clientes: {
        nombre: string;
        apellido: string;
        email: string;
    };
}

export default function ReportePedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        from: '',
        to: new Date().toISOString().split('T')[0]
    });
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');

    useEffect(() => {
        console.log('ReportePedidos component mounted');
        console.log('Current path:', window.location.pathname);
        console.log('Current URL:', window.location.href);
        fetchPedidos();
    }, []);

    const fetchPedidos = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Iniciando fetchPedidos...');

            const { data, error } = await supabase
                .from('pedidos')
                .select(`
                    *,
                    clientes (
                        nombre,
                        apellido,
                        email
                    )
                `)
                .order('fecha_pedido', { ascending: false });

            if (error) {
                console.error('Error al cargar datos:', error);
                throw new Error(`Error al cargar los datos: ${error.message}`);
            }

            if (data && data.length > 0) {
                console.log('Pedidos cargados:', data);
                setPedidos(data);
            } else {
                console.log('No se encontraron registros de pedidos');
                setPedidos([]);
            }
        } catch (error) {
            console.error('Error detallado:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido al cargar los pedidos');
            setPedidos([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPedidos = pedidos.filter(pedido => {
        const matchesSearch = 
            `${pedido.clientes.nombre} ${pedido.clientes.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pedido.clientes.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pedido.id_pedido.toString().includes(searchTerm);
        
        const pedidoDate = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
        const matchesDate = 
            (!dateRange.from || pedidoDate >= dateRange.from) &&
            (!dateRange.to || pedidoDate <= dateRange.to);

        const matchesEstado = selectedEstado === 'todos' || pedido.estado.toLowerCase() === selectedEstado.toLowerCase();

        return matchesSearch && matchesDate && matchesEstado;
    });

    const totalPedidos = filteredPedidos.reduce((acc, pedido) => {
        return acc + pedido.total;
    }, 0);

    const exportToCSV = () => {
        const headers = ['Fecha', 'Pedido #', 'Cliente', 'Email', 'Total', 'Estado', 'Método de Pago'];
        const csvData = filteredPedidos.map(pedido => [
            new Date(pedido.fecha_pedido).toLocaleDateString(),
            pedido.id_pedido,
            `${pedido.clientes.nombre} ${pedido.clientes.apellido}`,
            pedido.clientes.email,
            pedido.total.toFixed(2),
            pedido.estado,
            pedido.metodo_pago
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_pedidos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Calcular estadísticas
        const estadisticas = {
            totalPedidos: totalPedidos,
            cantidadTransacciones: filteredPedidos.length,
            promedioPedido: totalPedidos / filteredPedidos.length,
            mayorPedido: Math.max(...filteredPedidos.map(p => p.total)),
            menorPedido: Math.min(...filteredPedidos.map(p => p.total)),
            pedidosPendientes: filteredPedidos.filter(p => p.estado.toLowerCase() === 'pendiente').length,
            pedidosEnProceso: filteredPedidos.filter(p => p.estado.toLowerCase() === 'en proceso').length,
            pedidosEntregados: filteredPedidos.filter(p => p.estado.toLowerCase() === 'entregado').length,
            pedidosCancelados: filteredPedidos.filter(p => p.estado.toLowerCase() === 'cancelado').length
        };

        const pedidosHTML = filteredPedidos.map(pedido => `
            <tr>
                <td class="border px-4 py-2">${new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                <td class="border px-4 py-2">#${pedido.id_pedido}</td>
                <td class="border px-4 py-2">
                    <div class="font-medium">${pedido.clientes.nombre} ${pedido.clientes.apellido}</div>
                    <div class="text-gray-600">${pedido.clientes.email}</div>
                </td>
                <td class="border px-4 py-2 text-right">RD$${pedido.total.toFixed(2)}</td>
                <td class="border px-4 py-2">${pedido.estado}</td>
                <td class="border px-4 py-2">${pedido.metodo_pago}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Pedidos</title>
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
                    <div class="title">Reporte Detallado de Pedidos</div>
                    <div class="subtitle">
                        ${dateRange.from || dateRange.to ? 
                            `Período: ${dateRange.from ? new Date(dateRange.from).toLocaleDateString() : 'Inicio'} - ${dateRange.to ? new Date(dateRange.to).toLocaleDateString() : 'Fin'}` : 
                            'Período: Todos los pedidos'}
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Total de Pedidos</div>
                        <div class="stat-value">RD$${estadisticas.totalPedidos.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Cantidad de Transacciones</div>
                        <div class="stat-value">${estadisticas.cantidadTransacciones.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Promedio por Pedido</div>
                        <div class="stat-value">RD$${estadisticas.promedioPedido.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Mayor Pedido</div>
                        <div class="stat-value">RD$${estadisticas.mayorPedido.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Menor Pedido</div>
                        <div class="stat-value">RD$${estadisticas.menorPedido.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Pedidos Pendientes</div>
                        <div class="stat-value">${estadisticas.pedidosPendientes.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Pedidos en Proceso</div>
                        <div class="stat-value">${estadisticas.pedidosEnProceso.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Pedidos Entregados</div>
                        <div class="stat-value">${estadisticas.pedidosEntregados.toLocaleString('es-DO')}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Pedido #</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Método de Pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidosHTML}
                    </tbody>
                </table>

                <div class="total">
                    Total General: RD$${estadisticas.totalPedidos.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        <h1 className="text-2xl font-bold text-gray-800">Reporte de Pedidos</h1>
                        <p className="text-gray-600 mt-1">
                            Total: RD${totalPedidos.toFixed(2)}
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
                            onClick={fetchPedidos}
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, email o número de pedido..."
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
                    <div>
                        <select
                            value={selectedEstado}
                            onChange={(e) => setSelectedEstado(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en proceso">En Proceso</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando reporte...</p>
                    </div>
                ) : filteredPedidos.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 mb-2">No se encontraron pedidos</p>
                        <p className="text-gray-500">No hay registros que coincidan con los filtros seleccionados</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPedidos.map((pedido) => (
                                        <tr key={pedido.id_pedido} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(pedido.fecha_pedido).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">#{pedido.id_pedido}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {pedido.clientes.nombre} {pedido.clientes.apellido}
                                                </div>
                                                <div className="text-sm text-gray-500">{pedido.clientes.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                RD${pedido.total.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-medium
                                                    ${pedido.estado.toLowerCase() === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    pedido.estado.toLowerCase() === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                                                    pedido.estado.toLowerCase() === 'enviado' ? 'bg-purple-100 text-purple-800' :
                                                    pedido.estado.toLowerCase() === 'entregado' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'}
                                                `}>
                                                    {pedido.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {pedido.metodo_pago}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 