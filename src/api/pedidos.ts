import { supabase } from "../services/supabase";

// Función para crear el pedido
export const crearPedido = async (datosPedido: any) => {
    const { datos } = datosPedido;

    console.log("Datos para crear el pedido en la funcion: ", datosPedido);

    // Validar que el id_cliente esté presente
    if (!datos.idCliente) {
        throw new Error("El id_cliente es obligatorio");
    }

    console.log("Datos para crear el pedido: ", datos.idCliente);

    // Insertar el pedido en la tabla 'pedidos'
    const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([
            {
                id_cliente: datos.idCliente,
                fecha_pedido: datos.fechaActual,  // Verifica que el nombre de la columna sea correcto
                total: datos.total,
                estado: "Iniciado",
                metodo_pago: datos.metodoPago,
                id_factura: datos.id_factura,  // Asegúrate de que id_factura esté correctamente proporcionado
            },
        ])
        .select('id_pedido');  // Seleccionar el id del pedido recién insertado (no id_factura)

    if (pedidoError) {
        throw new Error(`Error al crear el pedido: ${pedidoError.message}`);
    }

    // Devuelvo el id del pedido recién creado
    const idPedido = pedidoData[0]?.id_pedido;

    return { success: true, idPedido };  // Devolver el id del pedido
};
