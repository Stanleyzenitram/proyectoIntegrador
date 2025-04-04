import { supabase } from "../services/supabase";
import { crearPedido } from "../api/pedidos";
import { generateInvoicePDF } from "../utils/pdfGenerator";

// Definir la interfaz para el producto en los datos de la factura
interface ProductoFactura {
    nombre_producto: string;
    cantidad: string;
    precioUnit: number;
    idProducto: string;
}

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
    try {
        // Crear la factura en la base de datos
        const { data: facturaData, error: facturaError } = await supabase
            .from("facturas")
            .insert([{
                id_cliente: datosFactura.id,
                fecha_venta: datosFactura.fechaActual,
                descuento_total: datosFactura.descuento_total || 0.00,
                total: datosFactura.total,
                estado: datosFactura.estado,
                sub_total: datosFactura.sub_total
            }])
            .select()
            .single();

        if (facturaError) throw facturaError;

        // Crear el pedido con la dirección
        const pedidoResult = await crearPedido({
            idCliente: datosFactura.id,
            fechaActual: datosFactura.fechaActual,
            total: datosFactura.total,
            metodoPago: datosFactura.metodoPago,
            id_factura: facturaData.id_factura,
            estado: "pendiente"
        }, direccionPedido);

        if (!pedidoResult || !pedidoResult.success) {
            throw new Error("Error al crear el pedido");
        }

        // Insertar los productos en detalles_factura
        const detallesFactura = datosFactura.productos.map((producto: any) => ({
            id_factura: facturaData.id_factura,
            id_producto: parseInt(producto.idProducto),
            cantidad: parseInt(producto.cantidad),
            precio_unitario: Number(producto.precioUnit),
            descuento: 0.00
        }));

        const { error: detallesError } = await supabase
            .from("detalles_factura")
            .insert(detallesFactura);

        if (detallesError) {
            console.error("Error al insertar detalles:", detallesError);
            throw detallesError;
        }

        // Generar el PDF con el ITBIS calculado
        const pdfContent = await generateInvoicePDF({
            id: facturaData.id_factura.toString(),
            numero_factura: facturaData.numero_factura || facturaData.id_factura.toString(),
            fecha: datosFactura.fechaActual,
            productos: datosFactura.productos.map((producto: ProductoFactura) => ({
                nombre_producto: producto.nombre_producto,
                cantidad: parseInt(producto.cantidad),
                precio_unitario: Number(producto.precioUnit),
                subtotal: Number(producto.cantidad) * Number(producto.precioUnit)
            })),
            subtotal: Number(datosFactura.sub_total),
            descuento: Number(datosFactura.descuento_total),
            itbis: Number(datosFactura.sub_total) * 0.18,
            total: Number(datosFactura.total),
            direccion: {
                calle: direccionPedido.calle,
                ciudad: direccionPedido.ciudad,
                provincia: direccionPedido.provincia,
                codigo_postal: direccionPedido.codigo_postal
            },
            cliente: {
                nombre: datosFactura.nombre_cliente,
                email: datosFactura.email_cliente,
                telefono: datosFactura.telefono_cliente
            }
        });

        return {
            success: true,
            idFactura: facturaData.id_factura,
            numeroFactura: facturaData.numero_factura,
            pdfContent: pdfContent
        };
    } catch (error) {
        console.error("Error al crear la factura:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al crear la factura"
        };
    }
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