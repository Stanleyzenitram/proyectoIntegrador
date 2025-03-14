import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerFacturaPorId } from "../api/factura";

export default function Factura() {
    const { id } = useParams<{ id: string }>();
    const facturaId = Number(id);
    const [factura, setFactura] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFactura = async () => {
            try {
                const facturaData = await obtenerFacturaPorId(facturaId);
                if (facturaData) {
                    setFactura(facturaData);
                } else {
                    setError("Factura no encontrada");
                }
            } catch (err) {
                setError("Error al obtener los datos de la factura");
                console.error(err);
            }
        };
        fetchFactura();
    }, [facturaId]);

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    if (!factura) {
        return <div className="text-center mt-4">Cargando...</div>;
    }

    const handlePrint = () => {
        const printContent = document.getElementById("factura")?.innerHTML;
        const printWindow = window.open("", "_blank", "width=800,height=600");
      
        if (printWindow) {
          const styles = Array.from(document.styleSheets)
            .map((sheet) =>
              Array.from(sheet.cssRules || [])
                .map((rule) => rule.cssText)
                .join("\n")
            )
            .join("\n");
      
          printWindow.document.write(`
            <html>
              <head>
                <title>Factura</title>
                <style>
                  ${styles}
                  /* Eliminar márgenes y encabezados/pies de impresión */
                  @page {
                    size: auto;
                    margin: 0mm;
                  }
                  body { 
                    margin: 0 !important; 
                    padding: 20px !important;
                  }
                  /* Ocultar URL en impresión */
                  @media print {
                    @page {
                      margin: 0;
                    }
                    body {
                      -webkit-print-color-adjust: exact;
                    }
                  }
                </style>
              </head>
              <body>${printContent}</body>
            </html>
          `);
          printWindow.document.close();
      
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      };

    const formatFecha = (fecha: string) => {
        const date = new Date(fecha);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtener mes con dos dígitos
        const day = String(date.getDate()).padStart(2, '0'); // Obtener día con dos dígitos
        return `${year}-${month}-${day}`;
    };

    console.log(factura);
    return (
        <div className="container mx-auto px-6 md:p-10">
            {/* 🔹 Contenido imprimible */}
            <div id="factura" className="bg-white shadow-lg rounded-md px-6 md:p-5 w-full max-w-3xl mx-auto">
                <p className="font-light text-[0.7rem]">No. {facturaId}</p>
                <p className="font-light text-[0.7rem]">Fecha: {formatFecha(factura.fecha_venta)}</p>
                <div className="flex flex-col justify-center items-center text-center mb-6">
                    <img
                        src="https://pdokbwzmygythqtjroje.supabase.co/storage/v1/object/public/imagenes/assets/icon.png"
                        alt="icon"
                        className="h-14 md:h-20 inline-block"
                    />
                    <h2 className="text-amber-900 text-3xl font-semibold">
                        ¡Gracias por su compra!
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base">
                        Su pedido ha sido procesado exitosamente.
                    </p>
                </div>

                {/* Información del Cliente */}
                <div className="clientInfo mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">
                        Información del cliente
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <p className="font-semibold">Nombre:</p>
                            <p className="text-gray-900">{factura.cliente.nombre}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Email:</p>
                            <p className="text-gray-900">{factura.cliente.email}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Teléfono:</p>
                            <p className="text-gray-900">{factura.cliente.telefono}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Dirección:</p>
                            <p className="text-gray-900">
                                {factura.direccionPedido.provincia}, {factura.direccionPedido.ciudad}, calle:{factura.direccionPedido.calle}
                                </p>
                        </div>
                    </div>
                </div>

                <hr className="text-amber-900 mb-5" />

                {/* Datos Producto */}
                <div className="productosInfo mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                        Factura
                    </h3>
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-orange-200">
                                <th className="px-4 py-2 text-left font-semibold">Producto</th>
                                <th className="px-4 py-2 text-left font-semibold">Cantidad</th>
                                <th className="px-4 py-2 text-left font-semibold">Precio</th>
                                <th className="px-4 py-2 text-left font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {factura.productos.map((producto: any, index: number) => (
                                <tr key={index} className="border-b">
                                    <td className="px-4 py-2">{producto.nombreProducto}</td>
                                    <td className="px-4 py-2">{producto.cantidad}</td>
                                    <td className="px-4 py-2">RD$ {producto.precioUnitario}</td>
                                    <td className="px-4 py-2">RD$ {producto.subtotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totales */}
                <div className="totalInfo flex justify-end">
                    <div className="flex flex-col gap-2 items-start text-left">
                        <div className="flex justify-between w-full">
                            <p className="font-semibold">Subtotal:</p>
                            <p className="text-gray-900">RD$ {factura.subtotal}</p>
                        </div>
                        <div className="flex justify-between w-full">
                            <p className="font-semibold">ITBIS:</p>
                            <p className="text-gray-900">
                                RD$ {(factura.subtotal * 0.18).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex justify-between w-full">
                            <p className="font-semibold">Descuento:</p>
                            <p className="text-gray-900">RD$ {factura.descuento}</p>
                        </div>
                        <div className="flex justify-between w-full border-t pt-2">
                            <p className="font-semibold">Total:</p>
                            <p className="text-gray-900 font-bold">RD$ {factura.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔹 Botón de impresión abajo a la izquierda */}
            <div className="no-print fixed bottom-4 left-4">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300"
                >
                    🖨️ Imprimir
                </button>
            </div>
        </div>
    );
}
