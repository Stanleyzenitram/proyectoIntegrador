import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
    return (
        <div className="h-30 bg-amber-400 grid grid-cols-2 place-content-between">
            <div className="flex items-center">
                <a href="#">
                    <img
                        src="/src/assets/images/icon.png"
                        alt="icon"
                        className="h-20 mt-4 ml-4 px-5"
                    />
                </a>

                <a
                    href="#"
                    className="text-2xl ml-4 mt-4 text-amber-900 font-light"
                >
                    Tiles Import & Export S.R.L.
                </a>
            </div>

            <div className="grid grid-cols-2  items-center font-medium text-amber-900 uppercase place-content-end mb-4">
                <div className="flex items-center justify-end">
                    <a
                        href="#"
                        className="mr-6 hover:text-amber-600 transition"
                    >
                        Inicio
                    </a>
                    <a
                        href="#"
                        className="mr-6 hover:text-amber-600 transition"
                    >
                        Sobre nosotros
                    </a>
                </div>
                <div className="flex items-center justify-end mr-4">
                    <button className="w-12 h-12 flex items-center justify-center text-2xl text-amber-900 rounded-lg hover:text-amber-600 transition">
                        <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center text-2xl text-amber-900 rounded-lg hover:text-amber-600 transition">
                        <FontAwesomeIcon icon={faUser} size="lg" />
                    </button>
                </div>
            </div>
        </div>
    );
}
