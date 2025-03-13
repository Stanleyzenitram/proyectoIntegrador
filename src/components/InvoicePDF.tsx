import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CartItem } from '../types';

interface InvoicePDFProps {
    items: CartItem[];
    total: number;
    orderNumber: string;
    customerInfo: {
        nombre: string;
        apellido: string;
        email: string;
        detalles_direccion: string;
    };
}

const styles = StyleSheet.create({
    page: {
        padding: 30,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 5,
    },
    table: {
        display: 'flex' as const,
        width: '100%',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        padding: 5,
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
    },
    tableCell: {
        flex: 1,
        padding: 5,
    },
    total: {
        marginTop: 20,
        textAlign: 'right',
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
    },
});

const InvoicePDF = ({ items, total, orderNumber, customerInfo }: InvoicePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Tiles Import & Export S.R.L.</Text>
                <Text style={styles.subtitle}>Factura #{orderNumber}</Text>
                <Text>Fecha: {new Date().toLocaleDateString()}</Text>
            </View>

            <View style={styles.header}>
                <Text style={styles.subtitle}>Información del Cliente:</Text>
                <Text>Nombre: {`${customerInfo.nombre} ${customerInfo.apellido}`}</Text>
                <Text>Email: {customerInfo.email}</Text>
                <Text>Dirección: {customerInfo.detalles_direccion}</Text>
            </View>

            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCell}>Producto</Text>
                    <Text style={styles.tableCell}>Cantidad</Text>
                    <Text style={styles.tableCell}>Precio</Text>
                    <Text style={styles.tableCell}>Total</Text>
                </View>

                {items.map((item) => (
                    <View key={item.id_producto} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{item.nombre_producto}</Text>
                        <Text style={styles.tableCell}>{item.quantity}</Text>
                        <Text style={styles.tableCell}>RD${item.precio.toFixed(2)}</Text>
                        <Text style={styles.tableCell}>
                            RD${(item.precio * item.quantity).toFixed(2)}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.total}>
                <Text>Subtotal: RD${total.toFixed(2)}</Text>
                <Text>ITBIS (18%): RD${(total * 0.18).toFixed(2)}</Text>
                <Text style={{ fontWeight: 'bold' }}>
                    Total: RD${(total * 1.18).toFixed(2)}
                </Text>
            </View>

            <View style={styles.footer}>
                <Text>Gracias por su compra</Text>
                <Text>Tiles Import & Export S.R.L.</Text>
                <Text>RNC: XXX-XXXXXX-X</Text>
            </View>
        </Page>
    </Document>
);

export default InvoicePDF; 