import ProveedorForm from "../features/auth/ProveedoresForm";
import CategoriaForm from "../features/auth/CategoriasForm";
import ProductoForm from "../features/auth/ProductosForm";

export default function Proveedor() {
    return (
        <div className="bg-gray-100 h-screen flex justify-center items-center">
            <ProductoForm />
        </div>
    );
}