import { supabase } from "../services/supabase";

// Función para crear el pedido
export const crearPedido = async (datosPedido: any) => {
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
                estado: estado || "Iniciado",  // Usa el estado proporcionado o "Iniciado"
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

    return { success: true, idPedido };  // Devolver el id del pedido
};
