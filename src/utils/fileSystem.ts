import { saveAs } from 'file-saver';

export const saveInvoicePDF = async (pdfBlob: Blob, fileName: string) => {
    try {
        saveAs(pdfBlob, fileName);
        return true;
    } catch (error) {
        console.error('Error al guardar el PDF:', error);
        return false;
    }
};

export const generateFileName = (orderNumber: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `factura-${orderNumber}-${date}.pdf`;
}; 