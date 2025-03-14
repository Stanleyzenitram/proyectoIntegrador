import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { obtenerTodosPedidos, actualizarEstadoPedido, obtenerHistorialEstados } from '../api/pedidos';
import { FaFileInvoice, FaShippingFast, FaCheckCircle, FaTimesCircle, FaExchangeAlt, FaHistory } from 'react-icons/fa';
import NotificacionesPedidos from '../components/NotificacionesPedidos';

interface Cliente {
    nombre: string;
    apellido: string;
    email: string;
}

interface Pedido {
    id_pedido: number;
    id_cliente: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number | null;
    clientes?: Cliente;
}

interface HistorialEstado {
    id: number;
    id_pedido: number;
    estado: string;
    fecha_cambio: string;
    comentario: string;
    usuario_id: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (comentario: string) => void;
    title: string;
    message: string;
}

const ConfirmModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    const [comentario, setComentario] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                
                {/* Mensaje informativo sobre notificaciones */}
                <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md border border-blue-300">
                    <p className="text-sm">
                        <strong>Importante:</strong> Se enviará una notificación al cliente 
                        informándole sobre este cambio de estado.
                    </p>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
                        Comentario (opcional):
                    </label>
                    <textarea
                        id="comentario"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        rows={3}
                        placeholder="Añade un comentario sobre este cambio de estado..."
                    />
                </div>
                
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(comentario);
                            onClose();
                            setComentario(''); // Limpiar el comentario después de enviar
                        }}
                        className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition"
                    >
                        Confirmar y Notificar
                    </button>
                </div>
            </div>
        </div>
    );
};

const GestionPedidos = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<string>('todos');
    const [actualizando, setActualizando] = useState(false);
    
    // Estado para el modal de confirmación
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: (comentario: string) => {},
    });
    
    // Estado para el pedido seleccionado y el nuevo estado
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<number | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<string>('');
    
    // Estado para el historial expandible
    const [historialEstados, setHistorialEstados] = useState<HistorialEstado[]>([]);
    const [pedidoHistorialExpandido, setPedidoHistorialExpandido] = useState<number | null>(null);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            const data = await obtenerTodosPedidos();
            setPedidos(data);
        } catch (error: any) {
            console.error('Error al obtener los pedidos:', error);
            setError(error.message || 'No se pudieron cargar los pedidos. Por favor, intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar y mostrar el historial de estados de un pedido
    const toggleHistorialEstados = async (idPedido: number) => {
        // Si ya está expandido, lo cerramos
        if (pedidoHistorialExpandido === idPedido) {
            setPedidoHistorialExpandido(null);
            return;
        }
        
        try {
            setCargandoHistorial(true);
            const historial = await obtenerHistorialEstados(idPedido);
            setHistorialEstados(historial);
            setPedidoHistorialExpandido(idPedido);
        } catch (error: any) {
            console.error('Error al obtener el historial de estados:', error);
            alert('No se pudo cargar el historial de estados. Por favor, intenta de nuevo más tarde.');
        } finally {
            setCargandoHistorial(false);
        }
    };

    // Función para formatear la fecha
    const formatearFecha = (fechaStr: string) => {
        try {
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) {
                return 'Fecha no válida';
            }
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha no válida';
        }
    };

    // Filtrar pedidos según el estado seleccionado
    const pedidosFiltrados = filtro === 'todos' 
        ? pedidos 
        : pedidos.filter(pedido => pedido.estado.toLowerCase() === filtro);

    // Función para obtener el color según el estado
    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente':
                return 'text-yellow-500';
            case 'en proceso':
                return 'text-blue-500';
            case 'enviado':
                return 'text-green-500';
            case 'entregado':
                return 'text-green-700';
            case 'cancelado':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    // Función para obtener el icono según el estado
    const getEstadoIcon = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente':
                return <FaFileInvoice className="mr-2" />;
            case 'en proceso':
            case 'enviado':
                return <FaShippingFast className="mr-2" />;
            case 'entregado':
                return <FaCheckCircle className="mr-2" />;
            case 'cancelado':
                return <FaTimesCircle className="mr-2" />;
            default:
                return <FaFileInvoice className="mr-2" />;
        }
    };

    // Función para mostrar el modal de confirmación
    const confirmarCambioEstado = (idPedido: number, estado: string) => {
        setPedidoSeleccionado(idPedido);
        setNuevoEstado(estado);
        
        const pedido = pedidos.find(p => p.id_pedido === idPedido);
        if (!pedido) return;
        
        setModalConfig({
            title: 'Confirmar cambio de estado',
            message: `¿Estás seguro de que deseas cambiar el estado del pedido #${idPedido} de "${pedido.estado}" a "${estado}"?`,
            onConfirm: (comentario) => cambiarEstadoPedido(idPedido, estado, comentario),
        });
        
        setModalOpen(true);
    };

    // Función para actualizar el estado de un pedido
    const cambiarEstadoPedido = async (idPedido: number, nuevoEstado: string, comentario: string = '') => {
        try {
            setActualizando(true);
            await actualizarEstadoPedido(idPedido, nuevoEstado, comentario);
            // Actualizar la lista de pedidos
            await cargarPedidos();
            
            // Mostrar notificación de éxito más detallada
            const mensaje = `
                Pedido #${idPedido} actualizado a estado: ${nuevoEstado}
                ${comentario ? `\nComentario: ${comentario}` : ''}
                \nSe ha enviado una notificación al cliente.
            `;
            alert(mensaje);
            
            // Cargar el historial actualizado para mostrar el cambio reciente
            await toggleHistorialEstados(idPedido);
        } catch (error: any) {
            console.error('Error al actualizar el estado del pedido:', error);
            alert(`Error al actualizar el pedido: ${error.message}`);
        } finally {
            setActualizando(false);
        }
    };

    // Función para mover un pedido hacia arriba en la lista
    const moverPedidoArriba = (index: number) => {
        if (index <= 0) return; // No se puede mover más arriba si ya está en la primera posición
        
        const nuevosPedidos = [...pedidosFiltrados];
        const temp = nuevosPedidos[index];
        nuevosPedidos[index] = nuevosPedidos[index - 1];
        nuevosPedidos[index - 1] = temp;
        
        // Actualizar la lista completa de pedidos manteniendo los filtros
        const pedidosActualizados = [...pedidos];
        const indexEnListaCompleta1 = pedidosActualizados.findIndex(p => p.id_pedido === nuevosPedidos[index].id_pedido);
        const indexEnListaCompleta2 = pedidosActualizados.findIndex(p => p.id_pedido === nuevosPedidos[index - 1].id_pedido);
        
        if (indexEnListaCompleta1 !== -1 && indexEnListaCompleta2 !== -1) {
            const temp = pedidosActualizados[indexEnListaCompleta1];
            pedidosActualizados[indexEnListaCompleta1] = pedidosActualizados[indexEnListaCompleta2];
            pedidosActualizados[indexEnListaCompleta2] = temp;
            setPedidos(pedidosActualizados);
        }
    };
    
    // Función para mover un pedido hacia abajo en la lista
    const moverPedidoAbajo = (index: number) => {
        if (index >= pedidosFiltrados.length - 1) return; // No se puede mover más abajo si ya está en la última posición
        
        const nuevosPedidos = [...pedidosFiltrados];
        const temp = nuevosPedidos[index];
        nuevosPedidos[index] = nuevosPedidos[index + 1];
        nuevosPedidos[index + 1] = temp;
        
        // Actualizar la lista completa de pedidos manteniendo los filtros
        const pedidosActualizados = [...pedidos];
        const indexEnListaCompleta1 = pedidosActualizados.findIndex(p => p.id_pedido === nuevosPedidos[index].id_pedido);
        const indexEnListaCompleta2 = pedidosActualizados.findIndex(p => p.id_pedido === nuevosPedidos[index + 1].id_pedido);
        
        if (indexEnListaCompleta1 !== -1 && indexEnListaCompleta2 !== -1) {
            const temp = pedidosActualizados[indexEnListaCompleta1];
            pedidosActualizados[indexEnListaCompleta1] = pedidosActualizados[indexEnListaCompleta2];
            pedidosActualizados[indexEnListaCompleta2] = temp;
            setPedidos(pedidosActualizados);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col space-y-2 mb-6">
                <div>
                    <NavLink
                        className="text-gray-400 uppercase hover:text-amber-900 transition"
                        to="/"
                    >
                        Inicio&nbsp;&gt;
                    </NavLink>
                    <span className="uppercase text-amber-900">
                        Gestión de Pedidos
                    </span>
                </div>

                <h1 className="text-amber-900 text-3xl md:text-5xl uppercase mt-4 font-bold">
                    Gestión de Pedidos
                </h1>
            </div>

            {/* Componente de Notificaciones de Pedidos */}
            <NotificacionesPedidos />

            {/* Filtros */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFiltro('todos')}
                        className={`px-4 py-2 rounded-lg ${
                            filtro === 'todos' 
                                ? 'bg-amber-900 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFiltro('pendiente')}
                        className={`px-4 py-2 rounded-lg ${
                            filtro === 'pendiente' 
                                ? 'bg-amber-900 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFiltro('en proceso')}
                        className={`px-4 py-2 rounded-lg ${
                            filtro === 'en proceso' 
                                ? 'bg-amber-900 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        En Proceso
                    </button>
                    <button
                        onClick={() => setFiltro('enviado')}
                        className={`px-4 py-2 rounded-lg ${
                            filtro === 'enviado' 
                                ? 'bg-amber-900 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Enviados
                    </button>
                    <button
                        onClick={() => setFiltro('entregado')}
                        className={`px-4 py-2 rounded-lg ${
                            filtro === 'entregado' 
                                ? 'bg-amber-900 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Entregados
                    </button>
                    <button
                        onClick={() => setFiltro('cancelado')}
                        className={`px-4 py-2 rounded-lg ${
                            filtro === 'cancelado' 
                                ? 'bg-amber-900 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Cancelados
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="bg-white rounded-lg shadow-md">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        <p>{error}</p>
                    </div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">No hay pedidos {filtro !== 'todos' ? `con estado "${filtro}"` : ''} en este momento.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pedido #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Método de Pago
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pedidosFiltrados.map((pedido, index) => (
                                    <React.Fragment key={pedido.id_pedido}>
                                        <tr className={`hover:bg-gray-50 ${pedidoHistorialExpandido === pedido.id_pedido ? 'bg-amber-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-sm font-medium text-gray-900 mb-2">#{pedido.id_pedido}</div>
                                                    <div className="flex space-x-1">
                                                        <button 
                                                            onClick={() => moverPedidoArriba(index)}
                                                            disabled={index === 0}
                                                            className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-amber-900 hover:bg-amber-100'}`}
                                                            title="Mover arriba"
                                                        >
                                                            ▲
                                                        </button>
                                                        <button 
                                                            onClick={() => moverPedidoAbajo(index)}
                                                            disabled={index === pedidosFiltrados.length - 1}
                                                            className={`p-1 rounded ${index === pedidosFiltrados.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-amber-900 hover:bg-amber-100'}`}
                                                            title="Mover abajo"
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {pedido.clientes ? `${pedido.clientes.nombre} ${pedido.clientes.apellido}` : 'Cliente no disponible'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {pedido.clientes?.email || ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{formatearFecha(pedido.fecha_pedido)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">RD${pedido.total.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {/* Indicador visual del estado del pedido (timeline) */}
                                                <div className="w-full mb-3">
                                                    <div className="relative">
                                                        {/* Línea de progreso */}
                                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                                                        
                                                        {/* Pasos del proceso */}
                                                        <div className="relative flex justify-between">
                                                            {/* Pendiente */}
                                                            <div className={`flex flex-col items-center ${
                                                                pedido.estado.toLowerCase() === 'cancelado' 
                                                                    ? 'opacity-30' 
                                                                    : ''
                                                            }`}>
                                                                <div className={`
                                                                    w-6 h-6 rounded-full flex items-center justify-center z-10
                                                                    ${pedido.estado.toLowerCase() === 'pendiente' 
                                                                        ? 'bg-yellow-500 text-white' 
                                                                        : ['en proceso', 'enviado', 'entregado'].includes(pedido.estado.toLowerCase())
                                                                            ? 'bg-gray-500 text-white' 
                                                                            : 'bg-gray-200 text-gray-500'
                                                                }
                                                            `}>
                                                                    <FaFileInvoice size={12} />
                                                                </div>
                                                                <span className="text-xs mt-1 font-medium">Pendiente</span>
                                                            </div>
                                                            
                                                            {/* En Proceso */}
                                                            <div className={`flex flex-col items-center ${
                                                                pedido.estado.toLowerCase() === 'cancelado' 
                                                                    ? 'opacity-30' 
                                                                    : ''
                                                            }`}>
                                                                <div className={`
                                                                    w-6 h-6 rounded-full flex items-center justify-center z-10
                                                                    ${pedido.estado.toLowerCase() === 'en proceso' 
                                                                        ? 'bg-blue-500 text-white' 
                                                                        : ['enviado', 'entregado'].includes(pedido.estado.toLowerCase())
                                                                            ? 'bg-gray-500 text-white' 
                                                                            : 'bg-gray-200 text-gray-500'
                                                                }
                                                            `}>
                                                                    <FaShippingFast size={12} />
                                                                </div>
                                                                <span className="text-xs mt-1 font-medium">En Proceso</span>
                                                            </div>
                                                            
                                                            {/* Enviado */}
                                                            <div className={`flex flex-col items-center ${
                                                                pedido.estado.toLowerCase() === 'cancelado' 
                                                                    ? 'opacity-30' 
                                                                    : ''
                                                            }`}>
                                                                <div className={`
                                                                    w-6 h-6 rounded-full flex items-center justify-center z-10
                                                                    ${pedido.estado.toLowerCase() === 'enviado' 
                                                                        ? 'bg-green-500 text-white' 
                                                                        : pedido.estado.toLowerCase() === 'entregado'
                                                                            ? 'bg-gray-500 text-white' 
                                                                            : 'bg-gray-200 text-gray-500'
                                                                }
                                                            `}>
                                                                    <FaShippingFast size={12} />
                                                                </div>
                                                                <span className="text-xs mt-1 font-medium">Enviado</span>
                                                            </div>
                                                            
                                                            {/* Entregado */}
                                                            <div className={`flex flex-col items-center ${
                                                                pedido.estado.toLowerCase() === 'cancelado' 
                                                                    ? 'opacity-30' 
                                                                    : ''
                                                            }`}>
                                                                <div className={`
                                                                    w-6 h-6 rounded-full flex items-center justify-center z-10
                                                                    ${pedido.estado.toLowerCase() === 'entregado' 
                                                                        ? 'bg-green-700 text-white' 
                                                                        : 'bg-gray-200 text-gray-500'
                                                                    }
                                                                `}>
                                                                    <FaCheckCircle size={12} />
                                                                </div>
                                                                <span className="text-xs mt-1 font-medium">Entregado</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Estado actual (badge) */}
                                                <div className="flex justify-center">
                                                    <div className={`
                                                        px-4 py-2 rounded-lg font-bold text-base shadow-md inline-flex items-center
                                                        ${pedido.estado.toLowerCase() === 'pendiente' ? 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400' : ''}
                                                        ${pedido.estado.toLowerCase() === 'en proceso' ? 'bg-blue-200 text-blue-800 border-2 border-blue-400' : ''}
                                                        ${pedido.estado.toLowerCase() === 'enviado' ? 'bg-green-200 text-green-800 border-2 border-green-400' : ''}
                                                        ${pedido.estado.toLowerCase() === 'entregado' ? 'bg-green-200 text-green-900 border-2 border-green-500' : ''}
                                                        ${pedido.estado.toLowerCase() === 'cancelado' ? 'bg-red-200 text-red-800 border-2 border-red-400' : ''}
                                                    `}>
                                                        {getEstadoIcon(pedido.estado)}
                                                        {pedido.estado.toUpperCase()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{pedido.metodo_pago}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex space-x-2">
                                                        <NavLink 
                                                            to={`/pedido/${pedido.id_pedido}`} 
                                                            className="text-amber-900 hover:text-amber-700"
                                                        >
                                                            Ver detalles
                                                        </NavLink>
                                                        
                                                        <button
                                                            onClick={() => toggleHistorialEstados(pedido.id_pedido)}
                                                            className={`flex items-center ${pedidoHistorialExpandido === pedido.id_pedido ? 'text-amber-700 font-bold' : 'text-amber-900 hover:text-amber-700'}`}
                                                        >
                                                            <FaHistory className="mr-1" size={14} />
                                                            {pedidoHistorialExpandido === pedido.id_pedido ? 'Ocultar historial' : 'Ver historial'}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Selector de estado mejorado */}
                                                    {['pendiente', 'en proceso', 'enviado', 'entregado', 'cancelado'].includes(pedido.estado.toLowerCase()) && (
                                                        <div className="mt-3 p-4 border-2 border-amber-500 rounded-lg bg-amber-50 shadow-lg">
                                                            <div className="flex items-center mb-4 bg-amber-900 text-white p-3 rounded-md">
                                                                <FaExchangeAlt className="mr-2" size={24} />
                                                                <span className="text-lg font-bold">CAMBIAR ESTADO DEL PEDIDO</span>
                                                            </div>
                                                            
                                                            {/* Mensaje informativo sobre notificaciones */}
                                                            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md border border-blue-300">
                                                                <p className="text-sm">
                                                                    <strong>Nota:</strong> Al cambiar el estado del pedido, se enviará automáticamente 
                                                                    una notificación al cliente informándole sobre el cambio.
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {pedido.estado.toLowerCase() !== 'pendiente' && (
                                                                    <button
                                                                        onClick={() => confirmarCambioEstado(pedido.id_pedido, 'Pendiente')}
                                                                        disabled={actualizando}
                                                                        className="p-4 text-base text-center text-yellow-800 bg-yellow-200 border-2 border-yellow-400 rounded-lg hover:bg-yellow-300 flex items-center justify-center transition-colors font-bold shadow-md"
                                                                    >
                                                                        <FaFileInvoice className="mr-3" size={20} /> PENDIENTE
                                                                    </button>
                                                                )}
                                                                
                                                                {pedido.estado.toLowerCase() !== 'en proceso' && (
                                                                    <button
                                                                        onClick={() => confirmarCambioEstado(pedido.id_pedido, 'En Proceso')}
                                                                        disabled={actualizando}
                                                                        className="p-4 text-base text-center text-blue-800 bg-blue-200 border-2 border-blue-400 rounded-lg hover:bg-blue-300 flex items-center justify-center transition-colors font-bold shadow-md"
                                                                    >
                                                                        <FaShippingFast className="mr-3" size={20} /> EN PROCESO
                                                                    </button>
                                                                )}
                                                                
                                                                {pedido.estado.toLowerCase() !== 'enviado' && (
                                                                    <button
                                                                        onClick={() => confirmarCambioEstado(pedido.id_pedido, 'Enviado')}
                                                                        disabled={actualizando}
                                                                        className="p-4 text-base text-center text-green-800 bg-green-200 border-2 border-green-400 rounded-lg hover:bg-green-300 flex items-center justify-center transition-colors font-bold shadow-md"
                                                                    >
                                                                        <FaShippingFast className="mr-3" size={20} /> ENVIADO
                                                                    </button>
                                                                )}
                                                                
                                                                {pedido.estado.toLowerCase() !== 'entregado' && (
                                                                    <button
                                                                        onClick={() => confirmarCambioEstado(pedido.id_pedido, 'Entregado')}
                                                                        disabled={actualizando}
                                                                        className="p-4 text-base text-center text-green-900 bg-green-200 border-2 border-green-400 rounded-lg hover:bg-green-300 flex items-center justify-center transition-colors font-bold shadow-md"
                                                                    >
                                                                        <FaCheckCircle className="mr-3" size={20} /> ENTREGADO
                                                                    </button>
                                                                )}
                                                                
                                                                {pedido.estado.toLowerCase() !== 'cancelado' && (
                                                                    <button
                                                                        onClick={() => confirmarCambioEstado(pedido.id_pedido, 'Cancelado')}
                                                                        disabled={actualizando}
                                                                        className="p-4 text-base text-center text-red-800 bg-red-200 border-2 border-red-400 rounded-lg hover:bg-red-300 flex items-center justify-center transition-colors font-bold shadow-md"
                                                                    >
                                                                        <FaTimesCircle className="mr-3" size={20} /> CANCELADO
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Panel expandible para el historial */}
                                        {pedidoHistorialExpandido === pedido.id_pedido && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 bg-amber-50">
                                                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                                                        <h3 className="text-lg font-bold text-amber-900 mb-3">Historial de Estados - Pedido #{pedido.id_pedido}</h3>
                                                        
                                                        {cargandoHistorial ? (
                                                            <div className="py-4 text-center">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                                                                <p className="mt-2 text-gray-600">Cargando historial...</p>
                                                            </div>
                                                        ) : historialEstados.length === 0 ? (
                                                            <p className="text-gray-600 text-center py-4">No hay registros de cambios de estado para este pedido.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {historialEstados.map((item) => (
                                                                    <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border border-amber-200">
                                                                        <div className="flex items-center mb-2">
                                                                            <div className={`w-3 h-3 rounded-full mr-2 ${
                                                                                item.estado.toLowerCase() === 'pendiente' ? 'bg-yellow-500' :
                                                                                item.estado.toLowerCase() === 'en proceso' ? 'bg-blue-500' :
                                                                                item.estado.toLowerCase() === 'enviado' ? 'bg-green-500' :
                                                                                item.estado.toLowerCase() === 'entregado' ? 'bg-green-700' :
                                                                                item.estado.toLowerCase() === 'cancelado' ? 'bg-red-500' : 'bg-gray-500'
                                                                            }`}></div>
                                                                            <p className={`font-medium ${getEstadoColor(item.estado)}`}>
                                                                                {item.estado}
                                                                            </p>
                                                                        </div>
                                                                        <p className="text-sm text-gray-500 mb-2">
                                                                            {formatearFecha(item.fecha_cambio)}
                                                                        </p>
                                                                        {item.comentario && (
                                                                            <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                                                                                <p className="font-medium text-gray-700">Comentario:</p>
                                                                                <p className="text-gray-600">{item.comentario}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="mt-4 flex justify-end">
                                                            <button
                                                                onClick={() => setPedidoHistorialExpandido(null)}
                                                                className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition"
                                                            >
                                                                Cerrar historial
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Modal de confirmación */}
            <ConfirmModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div>
    );
};

export default GestionPedidos; 