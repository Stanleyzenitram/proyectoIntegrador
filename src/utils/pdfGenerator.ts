import { jsPDF } from 'jspdf';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: {
            head: string[][];
            body: string[][];
            startY: number;
            theme: string;
            styles: {
                fontSize: number;
                cellPadding: number;
            };
            headStyles: {
                fillColor: number[];
                textColor: number[];
            };
        }) => void;
    }
}

interface Producto {
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Factura {
    id: string;
    numero_factura: string;
    fecha: string;
    productos: Producto[];
    subtotal: number;
    descuento: number;
    itbis: number;
    total: number;
    direccion: {
        calle: string;
        ciudad: string;
        provincia: string;
        codigo_postal: string;
    };
    cliente?: {
        nombre?: string;
        email?: string;
        telefono?: string;
    };
}

// Función para cargar la imagen del logo
const loadImage = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading image:', error);
        return '';
    }
};

export const generateInvoicePDF = async (factura: Factura): Promise<string> => {
    const doc = new jsPDF();
    
    // Configuración de la página
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Número de factura y fecha (arriba a la izquierda)
    doc.setFontSize(10);
    doc.text(`No. ${factura.numero_factura}`, margin, y);
    y += 4;
    doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString()}`, margin, y);
    y += 25;

    // Cargar y agregar el logo
    try {
        const logoUrl = 'https://pdokbwzmygythqtjroje.supabase.co/storage/v1/object/public/imagenes/assets/icon.png';
        const logoData = await loadImage(logoUrl);
        if (logoData) {
            const logoWidth = 40;
            const logoHeight = 40;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(logoData, 'PNG', logoX, y, logoWidth, logoHeight);
        }
    } catch (error) {
        console.error('Error adding logo:', error);
    }
    y += 50;

    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(139, 69, 19); // Color marrón
    doc.text('¡Gracias por su compra!', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Subtítulo
    doc.setFontSize(11);
    doc.setTextColor(128, 128, 128); // Color gris
    doc.text('Su pedido ha sido procesado exitosamente.', pageWidth / 2, y, { align: 'center' });
    y += 25;

    // Información del cliente
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Información del cliente', margin, y);
    y += 15;

    // Grid de información del cliente
    doc.setFontSize(10);
    const leftCol = margin;
    const rightCol = pageWidth / 2;
    
    // Columna izquierda
    doc.text('Nombre:', leftCol, y);
    const nombreCliente = factura.cliente?.nombre || '-';
    doc.text(nombreCliente, leftCol + 35, y);
    y += 12;
    doc.text('Teléfono:', leftCol, y);
    const telefonoCliente = factura.cliente?.telefono || '-';
    doc.text(telefonoCliente, leftCol + 35, y);

    // Columna derecha
    y -= 12;
    doc.text('Email:', rightCol, y);
    const emailCliente = factura.cliente?.email || '-';
    doc.text(emailCliente, rightCol + 35, y);
    y += 12;
    doc.text('Dirección:', rightCol, y);
    const direccionCompleta = factura.direccion ? 
        `${factura.direccion.ciudad}, ${factura.direccion.provincia}, ${factura.direccion.calle}`.trim() : '-';
    doc.text(direccionCompleta, rightCol + 35, y, { maxWidth: 80 });

    y += 25;

    // Título de Factura
    doc.setFontSize(14);
    doc.text('Factura', margin, y);
    y += 10;

    // Tabla de productos
    const tableWidth = contentWidth;
    const columnWidths = [
        tableWidth * 0.4, // Producto (40%)
        tableWidth * 0.2, // Cantidad (20%)
        tableWidth * 0.2, // Precio (20%)
        tableWidth * 0.2  // Total (20%)
    ];
    
    // Dibujar fondo del encabezado
    doc.setFillColor(255, 228, 196); // Color naranja muy claro
    doc.rect(margin, y, tableWidth, 10, 'F');
    
    // Encabezados de la tabla
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Producto', margin + 5, y + 7);
    doc.text('Cantidad', margin + columnWidths[0] + 5, y + 7);
    doc.text('Precio', margin + columnWidths[0] + columnWidths[1] + 5, y + 7);
    doc.text('Total', margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y + 7);
    y += 15;

    // Datos de productos
    doc.setFontSize(10);
    factura.productos.forEach(producto => {
        const nombreProducto = producto.nombre_producto || '-';
        doc.text(nombreProducto, margin + 5, y);
        doc.text(producto.cantidad.toString(), margin + columnWidths[0] + 5, y);
        doc.text(`RD$ ${producto.precio_unitario.toFixed(2)}`, margin + columnWidths[0] + columnWidths[1] + 5, y);
        doc.text(`RD$ ${producto.subtotal.toFixed(2)}`, margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y);
        y += 8;
    });

    y += 10;
    
    // Totales alineados a la derecha
    const totalesX = pageWidth - margin - 80;
    const valoresX = pageWidth - margin - 20;
    doc.setFontSize(10);
    
    doc.text('Subtotal:', totalesX, y);
    doc.text(`RD$ ${factura.subtotal.toFixed(2)}`, valoresX, y);
    y += 7;

    doc.text('ITBIS:', totalesX, y);
    doc.text(`RD$ ${factura.itbis.toFixed(2)}`, valoresX, y);
    y += 7;

    doc.text('Descuento:', totalesX, y);
    doc.text(`RD$ ${factura.descuento.toFixed(2)}`, valoresX, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', totalesX, y);
    doc.text(`RD$ ${factura.total.toFixed(2)}`, valoresX, y);

    // Convertir a base64
    return doc.output('datauristring').split(',')[1];
}; 