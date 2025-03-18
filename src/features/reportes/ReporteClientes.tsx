import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { User, Download, Search, FileText, Printer, Mail, Phone } from 'lucide-react';

interface Cliente {
    id_cliente: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    fecha_registro: string;
    uuid?: string;
}

export default function ReporteClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        from: '',
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        console.log('ReporteClientes component mounted');
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Iniciando fetchClientes...');

            const { data, error } = await supabase
                .from('clientes')
                .select(`
                    id_cliente,
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    fecha_registro,
                    uuid
                `)
                .order('apellido', { ascending: true });

            if (error) {
                console.error('Error al cargar datos:', error);
                throw new Error(`Error al cargar los datos: ${error.message}`);
            }

            if (data && data.length > 0) {
                console.log('Clientes cargados:', data);
                setClientes(data);
            } else {
                console.log('No se encontraron registros de clientes');
                setClientes([]);
            }
        } catch (error) {
            console.error('Error detallado:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido al cargar los clientes');
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredClientes = clientes.filter(cliente => {
        const matchesSearch = 
            `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cliente.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cliente.telefono || '').includes(searchTerm) ||
            cliente.id_cliente.toString().includes(searchTerm);
        
        if (!cliente.fecha_registro) return matchesSearch;
        
        const clienteDate = new Date(cliente.fecha_registro).toISOString().split('T')[0];
        const matchesDate = 
            (!dateRange.from || clienteDate >= dateRange.from) &&
            (!dateRange.to || clienteDate <= dateRange.to);

        return matchesSearch && matchesDate;
    });

    const exportToCSV = () => {
        const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Dirección', 'Fecha de Registro'];
        const csvData = filteredClientes.map(cliente => [
            cliente.id_cliente,
            cliente.nombre,
            cliente.apellido,
            cliente.email,
            cliente.telefono,
            cliente.direccion,
            cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString() : 'No registrado'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_clientes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setError('No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.');
            return;
        }

        // Estadísticas básicas
        const estadisticas = {
            totalClientes: filteredClientes.length,
            nuevosClientes: filteredClientes.filter(cliente => {
                if (!cliente.fecha_registro) return false;
                const fechaRegistro = new Date(cliente.fecha_registro);
                const unMesAtras = new Date();
                unMesAtras.setMonth(unMesAtras.getMonth() - 1);
                return fechaRegistro >= unMesAtras;
            }).length
        };

        const clientesHTML = filteredClientes.map(cliente => `
            <tr>
                <td class="border px-4 py-2">${cliente.id_cliente}</td>
                <td class="border px-4 py-2">
                    <div class="font-medium">${cliente.nombre} ${cliente.apellido}</div>
                </td>
                <td class="border px-4 py-2">
                    <div>${cliente.email || 'No disponible'}</div>
                </td>
                <td class="border px-4 py-2">${cliente.telefono || 'No disponible'}</td>
                <td class="border px-4 py-2">${cliente.direccion || 'No disponible'}</td>
                <td class="border px-4 py-2">
                    ${cliente.fecha_registro 
                        ? new Date(cliente.fecha_registro).toLocaleDateString() 
                        : 'No registrado'}
                </td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Clientes</title>
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
                        grid-template-columns: repeat(2, 1fr);
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
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Sistema de Gestión</div>
                        <div>Fecha: ${new Date().toLocaleDateString()}</div>
                        <div>Hora: ${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>

                <div class="header">
                    <div class="title">Reporte de Clientes</div>
                    <div class="subtitle">
                        ${dateRange.from || dateRange.to ? 
                            `Período: ${dateRange.from ? new Date(dateRange.from).toLocaleDateString() : 'Inicio'} - ${dateRange.to ? new Date(dateRange.to).toLocaleDateString() : 'Fin'}` : 
                            'Todos los clientes registrados'}
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Total de Clientes</div>
                        <div class="stat-value">${estadisticas.totalClientes.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Clientes Nuevos (último mes)</div>
                        <div class="stat-value">${estadisticas.nuevosClientes.toLocaleString('es-DO')}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Fecha de Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientesHTML}
                    </tbody>
                </table>

                <div class="footer">
                    <div style="font-weight: bold;">© ${new Date().getFullYear()} Tiles Import & Export S.R.L.</div>
                    <div>Este es un documento generado automáticamente por el Sistema de Gestión</div>
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
                        <h1 className="text-2xl font-bold text-gray-800">Reporte de Clientes</h1>
                        <p className="text-gray-600 mt-1">
                            Total: {filteredClientes.length} clientes
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
                            onClick={fetchClientes}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <User className="w-5 h-5 mr-2" />
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
                            placeholder="Buscar por nombre, email o teléfono..."
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
                                placeholder="Fecha inicio"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Fecha fin"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando reporte...</p>
                    </div>
                ) : filteredClientes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 mb-2">No se encontraron clientes</p>
                        <p className="text-gray-500">No hay registros que coincidan con los filtros seleccionados</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClientes.map((cliente) => (
                                        <tr key={cliente.id_cliente} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">#{cliente.id_cliente}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {cliente.nombre} {cliente.apellido}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-900 mb-1">
                                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                    {cliente.email || 'No disponible'}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                    {cliente.telefono || 'No disponible'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">
                                                    {cliente.direccion || 'No disponible'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {cliente.fecha_registro ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                        {new Date(cliente.fecha_registro).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">No registrado</span>
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
        </div>
    );
} 