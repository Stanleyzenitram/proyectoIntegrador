import { supabase } from "../services/supabase";

// Función para crear el pedido
export const crearPedido = async (datosPedido: any, direccionPedido: any) => {
    const { idCliente, fechaActual, total, metodoPago, id_factura, estado } = datosPedido;

    console.log("Datos para crear el pedido en la función: ", datosPedido);

    // Validar que el id_cliente esté presente
    if (!idCliente) {
        throw new Error("El id_cliente es obligatorio");
    }

    console.log("ID Cliente recibido: ", idCliente);

    // Insertar el pedido en la tabla 'pedidos'
    const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([
            {
                id_cliente: idCliente,
                fecha_pedido: fechaActual,  
                total: total,
                estado: "pendiente",  // Usa el estado proporcionado o "pendiente"
                metodo_pago: metodoPago,
                id_factura: id_factura,  
            },
        ])
        .select('id_pedido');  // Seleccionar el id del pedido recién insertado

    if (pedidoError) {
        throw new Error(`Error al crear el pedido: ${pedidoError.message}`);
    }

    // Extraer el id del pedido recién creado
    const idPedido = pedidoData?.[0]?.id_pedido;


            // ingresar direccion del pedido
    try {
        const { data: direccionData, error: direccionError } = await supabase
        .from('direcciones_pedidos')
        .insert([
            {
                id_pedido: idPedido,
                calle: direccionPedido.calle,   
                ciudad: direccionPedido.ciudad,
                provincia: direccionPedido.provincia,
                codigo_postal: direccionPedido.codigo_postal,
                referencia: direccionPedido.referencia || '',
                pais: direccionPedido.pais || 'República Dominicana',
            },
        ])
        .select('id_direccion_pedido');

        if (direccionError) {
            console.error("Error al insertar dirección del pedido:", direccionError);
            // No lanzar error aquí, solo logear. El pedido ya se creó exitosamente
            console.warn("El pedido se creó pero no se pudo guardar la dirección");
        } else {
            console.log("Dirección del pedido guardada exitosamente");
        }
    } catch (error) {
        console.error("Error inesperado al guardar dirección del pedido:", error);
        // No lanzar error aquí, solo logear. El pedido ya se creó exitosamente
        console.warn("El pedido se creó pero no se pudo guardar la dirección");
    }


    return { success: true, idPedido };  // Devolver el id del pedido
};

// Interfaz para el historial de estados
interface HistorialEstado {
    id: number;
    id_pedido: number;
    estado: string;
    fecha_cambio: string;
    comentario: string;
    usuario_id: string;
}

// Función para obtener todos los pedidos con información del cliente
export const obtenerTodosPedidos = async () => {
    try {
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
            console.error('Error al obtener los pedidos:', error);
            throw new Error('No se pudieron obtener los pedidos');
        }

        return data || [];
    } catch (error) {
        console.error('Error en obtenerTodosPedidos:', error);
        throw error;
    }
};

// Función para actualizar el estado de un pedido
export const actualizarEstadoPedido = async (idPedido: number, nuevoEstado: string, comentario: string = '') => {
    try {
        // Primero actualizar el estado del pedido
        const { error: pedidoError } = await supabase
            .from('pedidos')
            .update({ estado: nuevoEstado })
            .eq('id_pedido', idPedido);

        if (pedidoError) {
            throw new Error(`Error al actualizar el estado del pedido: ${pedidoError.message}`);
        }

        // Luego registrar el cambio en el historial
        const { error: historialError } = await supabase
            .from('historial_estados_pedido')
            .insert([
                {
                    id_pedido: idPedido,
                    estado: nuevoEstado,
                    fecha_cambio: new Date().toISOString(),
                    comentario: comentario,
                    usuario_id: (await supabase.auth.getUser()).data.user?.id || 'sistema'
                }
            ]);

        if (historialError) {
            throw new Error(`Error al registrar el historial: ${historialError.message}`);
        }

        // Obtener el id_cliente del pedido para enviar la notificación
        const { data: pedidoData, error: pedidoDataError } = await supabase
            .from('pedidos')
            .select('id_cliente')
            .eq('id_pedido', idPedido)
            .single();

        if (pedidoDataError) {
            throw new Error(`Error al obtener el cliente del pedido: ${pedidoDataError.message}`);
        }

        // Crear la notificación para el cliente
        const { error: notificacionError } = await supabase
            .from('notificaciones')
            .insert([
                {
                    id_usuario: pedidoData.id_cliente,
                    tipo: 'cambio_estado_pedido',
                    titulo: `Actualización de estado - Pedido #${idPedido}`,
                    mensaje: `El estado de tu pedido #${idPedido} ha sido actualizado a "${nuevoEstado}". ${comentario ? `\nComentario: ${comentario}` : ''}`,
                    fecha: new Date().toISOString(),
                    leido: false
                }
            ]);

        if (notificacionError) {
            console.error('Error al crear la notificación:', notificacionError);
            // No lanzamos el error aquí para no interrumpir el flujo principal
        }

        return { success: true };
    } catch (error) {
        console.error('Error en actualizarEstadoPedido:', error);
        throw error;
    }
};

// Función para obtener el historial de estados de un pedido
export const obtenerHistorialEstados = async (idPedido: number): Promise<HistorialEstado[]> => {
    try {
        const { data, error } = await supabase
            .from('historial_estados_pedido')
            .select('*')
            .eq('id_pedido', idPedido)
            .order('fecha_cambio', { ascending: false });

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error al obtener el historial de estados:', error);
        throw new Error('No se pudo obtener el historial de estados');
    }
};
