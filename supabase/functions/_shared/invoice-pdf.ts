import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@^1.17.1";

export async function generateInvoicePDF(invoice: any) {
  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  // Cargar la fuente
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Configurar el tamaño de fuente y márgenes
  const fontSize = 12;
  const margin = 50;
  let y = page.getHeight() - margin;

  // Función auxiliar para dibujar texto
  const drawText = (text: string, x: number, y: number, options: any = {}) => {
    page.drawText(text, {
      x,
      y,
      size: options.size || fontSize,
      font: options.bold ? boldFont : font,
      color: options.color || rgb(0, 0, 0),
    });
  };

  // Encabezado
  drawText("FACTURA", margin, y, { size: 24, bold: true });
  y -= 30;

  // Información de la empresa
  drawText("Venta Cerámicas", margin, y, { bold: true });
  y -= 20;
  drawText("RNC: 123456789", margin, y);
  y -= 20;
  drawText("Dirección: Calle Principal #123", margin, y);
  y -= 20;
  drawText("Teléfono: (809) 123-4567", margin, y);
  y -= 40;

  // Información del cliente
  drawText("Cliente:", margin, y, { bold: true });
  y -= 20;
  drawText(`Nombre: ${invoice.cliente.nombre} ${invoice.cliente.apellido}`, margin, y);
  y -= 20;
  drawText(`RNC/Cédula: ${invoice.cliente.numero_documento}`, margin, y);
  y -= 20;
  drawText(`Dirección: ${invoice.cliente.detalles_direccion}`, margin, y);
  y -= 40;

  // Detalles de la factura
  drawText(`Número de Factura: ${invoice.numero_factura}`, margin, y);
  y -= 20;
  drawText(`Fecha: ${new Date(invoice.fecha).toLocaleDateString()}`, margin, y);
  y -= 40;

  // Tabla de productos
  drawText("Productos", margin, y, { bold: true });
  y -= 20;

  // Encabezados de la tabla
  const colWidths = [200, 100, 100, 100];
  const headers = ["Producto", "Cantidad", "Precio", "Subtotal"];
  let x = margin;
  headers.forEach((header, i) => {
    drawText(header, x, y, { bold: true });
    x += colWidths[i];
  });
  y -= 20;

  // Filas de productos
  invoice.productos.forEach((item: any) => {
    x = margin;
    drawText(item.producto.nombre, x, y);
    x += colWidths[0];
    drawText(item.cantidad.toString(), x, y);
    x += colWidths[1];
    drawText(`RD$ ${item.precioUnit.toFixed(2)}`, x, y);
    x += colWidths[2];
    drawText(`RD$ ${item.subtotal}`, x, y);
    y -= 20;
  });

  // Totales
  y -= 20;
  drawText(`Subtotal: RD$ ${invoice.subtotal.toFixed(2)}`, margin + 300, y);
  y -= 20;
  drawText(`ITBIS (18%): RD$ ${invoice.itbis.toFixed(2)}`, margin + 300, y);
  y -= 20;
  drawText(`Total: RD$ ${invoice.total.toFixed(2)}`, margin + 300, y, { bold: true });

  // Convertir a bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
} 