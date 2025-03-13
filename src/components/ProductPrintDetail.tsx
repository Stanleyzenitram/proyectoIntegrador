import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Producto } from '../types';

export default function ProductPrintDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const product = location.state?.product;

    useEffect(() => {
        if (!product) {
            navigate('/'); // Redirigir al home si no hay producto
            return;
        }
        // Imprimir automáticamente cuando se carga el componente
        window.print();
    }, [product, navigate]);

    if (!product) {
        return null; // O puedes mostrar un mensaje de error/loading
    }

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white">
            {/* Header con logo */}
            <div className="flex justify-between items-center mb-8">
                <img 
                    src="/logo-cerarte.png" 
                    alt="Cerarte Logo" 
                    className="h-16"
                />
                <div className="text-right">
                    <button 
                        onClick={() => window.print()}
                        className="print:hidden bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        IMPRIMIR
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="print:hidden ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        CERRAR
                    </button>
                </div>
            </div>

            {/* Detalles del producto */}
            <div className="grid grid-cols-2 gap-8">
                {/* Imagen del producto */}
                <div>
                    {product.imagen && (
                        <img
                            src={product.imagen}
                            alt={product.nombre_producto}
                            className="w-full rounded-lg"
                        />
                    )}
                </div>

                {/* Información del producto */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">{product.nombre_producto}</h1>
                    <p className="text-gray-600">Número de Artículo: {product.id_producto}</p>

                    <div className="text-2xl font-bold text-blue-600">
                        RD${product.precio.toFixed(2)}
                        <span className="text-sm font-normal text-gray-600 block">
                            Precio por Metro cuadrado (No incluye ITBIS)
                        </span>
                    </div>

                    <div className="border-t pt-4">
                        <h2 className="font-bold mb-2">Especificaciones:</h2>
                        <dl className="grid grid-cols-2 gap-2">
                            <dt className="text-gray-600">Formato:</dt>
                            <dd>{product.formato} cm</dd>

                            <dt className="text-gray-600">m² por caja:</dt>
                            <dd>{product.metros_por_caja}</dd>

                            <dt className="text-gray-600">Color:</dt>
                            <dd>{product.color}</dd>

                            <dt className="text-gray-600">Estilo:</dt>
                            <dd>{product.estilo?.nombre_estilo}</dd>

                            <dt className="text-gray-600">Material:</dt>
                            <dd>{product.material?.nombre_materiales}</dd>
                        </dl>
                    </div>

                    {product.descripcion && (
                        <div className="border-t pt-4">
                            <h2 className="font-bold mb-2">Descripción:</h2>
                            <p className="text-gray-600">{product.descripcion}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pie de página */}
            <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
                <p>Para más información, visite nuestra tienda o contáctenos</p>
                <p>Tel: (XXX) XXX-XXXX | Email: info@cerarte.com</p>
            </div>
        </div>
    );
} 