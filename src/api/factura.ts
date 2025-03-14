import { supabase } from "../services/supabase";
import { crearPedido } from "../api/pedidos";

// Función para obtener el id_cliente basado en el uuid
export const obtenerIdClientePorUuid = async (uuid: string) => {
    try {
        // Verificar que el uuid no sea null ni undefined
        if (!uuid) {
            throw new Error('UUID no proporcionado');
        }

        // Realizamos una consulta en la tabla 'clientes' donde el 'uuid' sea igual al valor proporcionado
        const { data, error, count } = await supabase
            .from('clientes')
            .select('id_cliente')  
            .eq('uuid', uuid)  
            .single();  // Usamos .single() para obtener un solo resultado

        if (error) {
            throw new Error(`Error al obtener el cliente: ${error.message}`);
        }

        // Verificar si se devuelve más de una fila
        if (count && count > 1) {
            throw new Error(`Se han encontrado múltiples clientes con el mismo UUID: ${uuid}`);
        }

        // Verificar si no se encuentra un cliente
        if (!data) {
            throw new Error(`No se encontró cliente con el UUID: ${uuid}`);
        }

        // Retornar el id_cliente encontrado
        return data.id_cliente || null;
    } catch (err) {
        console.error("Error al obtener el id_cliente por uuid:", err);
        throw err;
    }
};

// Función para crear la factura
export const crearFactura = async (datosFactura: any, direccionPedido: any) => {
    const { id, fechaActual, descuento, productos } = datosFactura;
    
    // Obtener el id_cliente por uuid
    const id_cliente = await obtenerIdClientePorUuid(id);

    // Calcular el total de la factura
    const total = datosFactura.total;

    // Insertar la factura en la tabla 'facturas'
    const { data: facturaData, error: facturaError } = await supabase
        .from('facturas')
        .insert([
            {
                id_cliente: id_cliente,
                fecha_venta: fechaActual,
                descuento_total: descuento,
                total: total,
                sub_total: datosFactura.subtotal,
                estado: datosFactura.estado,  
            },
        ])
        .select('id_factura'); // Obtener el id de la factura

    if (facturaError) {
        throw new Error(`Error al crear la factura: ${facturaError.message}`);
    }

    const idFactura = facturaData[0]?.id_factura;

    // Insertar los detalles de la factura en la tabla 'detalles_factura'
    const detalles = productos.map((producto: any) => ({
        id_factura: idFactura, // Relacionar con la factura
        id_producto: producto.idProducto,
        cantidad: producto.cantidad,
        precio_unitario: producto.precioUnit,
    }));

    const { error: detallesError } = await supabase
        .from('detalles_factura')
        .insert(detalles);

    if (detallesError) {
        throw new Error(`Error al crear los detalles de la factura: ${detallesError.message}`);
    }

    const datosPedido = {
        idCliente: id_cliente,
        fechaActual: fechaActual,
        total: total,
        estado: datosFactura.estado,
        metodoPago: datosFactura.metodoPago,
        id_factura: idFactura,
    };

    // Crear el pedido en la tabla 'pedidos'
    await crearPedido(datosPedido, direccionPedido);

    return { success: true, idFactura };
};

// Función para obtener los datos de una factura por su ID
export const obtenerFacturaPorId = async (idFactura: number) => {
    try {
        // Obtener la información de la factura
        const { data: facturaData, error: facturaError } = await supabase
            .from('facturas')
            .select('id_factura, id_cliente, fecha_venta, descuento_total, total, sub_total, estado')
            .eq('id_factura', idFactura)
            .single();  // Usamos .single() porque esperamos un solo resultado

        if (facturaError) {
            throw new Error(`Error al obtener la factura: ${facturaError.message}`);
        }

        // Obtener el id_pedido asociado a la factura
        const { data: pedidoData, error: pedidoError } = await supabase
            .from('pedidos')
            .select('id_pedido')
            .eq('id_factura', idFactura)
            .single();

        if (pedidoError) {
            throw new Error(`Error al obtener el pedido: ${pedidoError.message}`);
        }

        // Obtener la dirección de pedido asociada al id_pedido
        const { data: direccionData, error: direccionError } = await supabase
            .from('direcciones_pedidos')
            .select('calle, ciudad, provincia, codigo_postal, referencia, pais')
            .eq('id_pedido', pedidoData.id_pedido)
            .single();

        if (direccionError) {
            throw new Error(`Error al obtener la dirección de pedido: ${direccionError.message}`);
        }

        // Obtener los detalles de la factura
        const { data: detallesData, error: detallesError } = await supabase
            .from('detalles_factura')
            .select('id_producto, cantidad, precio_unitario, subtotal')
            .eq('id_factura', idFactura);

        if (detallesError) {
            throw new Error(`Error al obtener los detalles de la factura: ${detallesError.message}`);
        }

        // Obtener los datos del cliente
        const { data: clienteData, error: clienteError } = await supabase
            .from('clientes')
            .select('nombre, email, telefono, direccion')
            .eq('id_cliente', facturaData.id_cliente)
            .single();

        if (clienteError) {
            throw new Error(`Error al obtener los datos del cliente: ${clienteError.message}`);
        }

        // Obtener los nombres de los productos relacionados con la factura
        const productosIds = detallesData.map((detalle: any) => detalle.id_producto);
        const { data: productosData, error: productosError } = await supabase
            .from('productos')
            .select('nombre_producto')
            .in('id_producto', productosIds);

        if (productosError) {
            throw new Error(`Error al obtener los productos: ${productosError.message}`);
        }

        // Asociar los productos con sus detalles
        const productosConDetalles = detallesData.map((detalle: any, index: number) => ({
            nombreProducto: productosData[index]?.nombre_producto,  // Asocia el nombre del producto
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precio_unitario,
            subtotal: detalle.subtotal,
        }));

        // Construir la factura con los detalles, la información del cliente y la dirección de pedido
        const factura = {
            idFactura: facturaData.id_factura,
            cliente: {
                nombre: clienteData.nombre,
                email: clienteData.email,
                telefono: clienteData.telefono,
                direccion: clienteData.direccion,
            },
            fecha_venta: facturaData.fecha_venta,
            descuento: facturaData.descuento_total,
            subtotal: facturaData.sub_total,
            total: facturaData.total,
            estado: facturaData.estado,
            productos: productosConDetalles,
            direccionPedido: direccionData,  // Agregar la dirección de pedido
        };

        return factura;
    } catch (error) {
        console.error("Error al obtener la factura:", error);
        throw error;
    }
};