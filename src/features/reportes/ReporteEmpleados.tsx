import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Users, Download, Search, FileText, Printer, Mail, Phone, Shield, CreditCard } from 'lucide-react';

interface Empleado {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    rol: string;
    estado: boolean;
    uuid?: string;
    cedula?: string;
}

export default function ReporteEmpleados() {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rolFilter, setRolFilter] = useState('todos');

    useEffect(() => {
        console.log('ReporteEmpleados component mounted');
        fetchEmpleados();
    }, []);

    const fetchEmpleados = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Iniciando fetchEmpleados...');

            const { data, error } = await supabase
                .from('usuarios')
                .select(`
                    id_usuario,
                    nombre,
                    apellido,
                    correo,
                    telefono,
                    rol,
                    estado,
                    uuid,
                    cedula
                `)
                .order('apellido', { ascending: true });

            if (error) {
                console.error('Error al cargar datos:', error);
                throw new Error(`Error al cargar los datos: ${error.message}`);
            }

            if (data && data.length > 0) {
                console.log('Empleados cargados:', data);
                setEmpleados(data);
            } else {
                console.log('No se encontraron registros de empleados');
                setEmpleados([]);
            }
        } catch (error) {
            console.error('Error detallado:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido al cargar los empleados');
            setEmpleados([]);
        } finally {
            setLoading(false);
        }
    };

    const roles = [...new Set(empleados.map(emp => emp.rol))].filter(Boolean);

    const filteredEmpleados = empleados.filter(empleado => {
        const matchesSearch = 
            `${empleado.nombre} ${empleado.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (empleado.correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (empleado.telefono || '').includes(searchTerm) ||
            (empleado.rol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (empleado.cedula || '').includes(searchTerm) ||
            empleado.id_usuario.toString().includes(searchTerm);
        
        const matchesRol = rolFilter === 'todos' || empleado.rol === rolFilter;
        
        return matchesSearch && matchesRol;
    });

    const exportToCSV = () => {
        const headers = ['ID', 'Nombre', 'Apellido', 'Correo', 'Teléfono', 'Rol', 'Estado', 'Cédula'];
        const csvData = filteredEmpleados.map(empleado => [
            empleado.id_usuario,
            empleado.nombre,
            empleado.apellido,
            empleado.correo,
            empleado.telefono,
            empleado.rol || 'No asignado',
            empleado.estado ? 'Activo' : 'Inactivo',
            empleado.cedula || 'No registrado'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_empleados_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setError('No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.');
            return;
        }

        // Estadísticas por rol
        const estadisticasPorRol = roles.reduce((acc, rol) => {
            if (!rol) return acc;
            const count = filteredEmpleados.filter(emp => emp.rol === rol).length;
            return { ...acc, [rol]: count };
        }, {} as Record<string, number>);

        // Estadísticas básicas
        const estadisticas = {
            totalEmpleados: filteredEmpleados.length,
            empleadosActivos: filteredEmpleados.filter(emp => emp.estado).length,
            empleadosInactivos: filteredEmpleados.filter(emp => !emp.estado).length,
            rolStats: estadisticasPorRol
        };

        const roleStatsHTML = Object.entries(estadisticas.rolStats).map(([rol, count]) => `
            <div class="stat-item">
                <div class="stat-label">${rol}</div>
                <div class="stat-value">${count}</div>
            </div>
        `).join('');

        const empleadosHTML = filteredEmpleados.map(empleado => `
            <tr>
                <td class="border px-4 py-2">${empleado.id_usuario}</td>
                <td class="border px-4 py-2">
                    <div class="font-medium">${empleado.nombre} ${empleado.apellido}</div>
                </td>
                <td class="border px-4 py-2">
                    <div>${empleado.correo || 'No disponible'}</div>
                    <div>${empleado.telefono || 'No disponible'}</div>
                </td>
                <td class="border px-4 py-2">
                    <div class="font-medium">${empleado.rol || 'No asignado'}</div>
                </td>
                <td class="border px-4 py-2">
                    ${empleado.estado ? 
                        '<span class="px-2 py-1 rounded bg-green-100 text-green-800">Activo</span>' : 
                        '<span class="px-2 py-1 rounded bg-red-100 text-red-800">Inactivo</span>'}
                </td>
                <td class="border px-4 py-2">
                    ${empleado.cedula || 'No registrado'}
                </td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Empleados</title>
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
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                        padding: 20px;
                        background-color: #f9fafb;
                        border-radius: 10px;
                        border: 1px solid #e5e7eb;
                    }
                    .roles-grid {
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
                    .section-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin: 20px 0 10px;
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
                        .stats-grid, .roles-grid {
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
                    <div class="title">Reporte de Empleados</div>
                    <div class="subtitle">
                        Todos los empleados registrados
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Total de Empleados</div>
                        <div class="stat-value">${estadisticas.totalEmpleados.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Empleados Activos</div>
                        <div class="stat-value">${estadisticas.empleadosActivos.toLocaleString('es-DO')}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Empleados Inactivos</div>
                        <div class="stat-value">${estadisticas.empleadosInactivos.toLocaleString('es-DO')}</div>
                    </div>
                </div>

                ${roles.length > 0 ? `
                    <div class="section-title">Distribución por Rol</div>
                    <div class="roles-grid">
                        ${roleStatsHTML}
                    </div>
                ` : ''}

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Contacto</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Cédula</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${empleadosHTML}
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
                        <h1 className="text-2xl font-bold text-gray-800">Reporte de Empleados</h1>
                        <p className="text-gray-600 mt-1">
                            Total: {filteredEmpleados.length} empleados
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
                            onClick={fetchEmpleados}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <Users className="w-5 h-5 mr-2" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo, teléfono, rol o cédula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <select
                            value={rolFilter}
                            onChange={(e) => setRolFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="todos">Todos los roles</option>
                            {roles.map((rol) => (
                                <option key={rol} value={rol}>
                                    {rol}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando reporte...</p>
                    </div>
                ) : filteredEmpleados.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 mb-2">No se encontraron empleados</p>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEmpleados.map((empleado) => (
                                        <tr key={empleado.id_usuario} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">#{empleado.id_usuario}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {empleado.nombre} {empleado.apellido}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-900 mb-1">
                                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                    {empleado.correo || 'No disponible'}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                    {empleado.telefono || 'No disponible'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                        {empleado.rol || 'No asignado'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {empleado.estado ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {empleado.cedula ? (
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                                                        {empleado.cedula}
                                                    </div>
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