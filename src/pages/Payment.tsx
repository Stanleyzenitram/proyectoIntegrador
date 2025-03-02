import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useState } from "react";


export default function Payment() {

  const {
    items,
    removeItem,
    total,
    tax,
    totalAmount,
    totalWithDiscount,
  } = useCart();



function getAccessToken() {
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const item = localStorage.getItem(key);

      try {
          const parsedItem = JSON.parse(item);
          if (parsedItem && parsedItem.access_token) {
              return parsedItem.access_token;
          }
      } catch (error) {
          // Si no es un JSON válido, ignoramos y continuamos
      }
  }
  console.log('No se encontró ningún token en localStorage.');
  return null;
}

// Uso
const accessToken = getAccessToken();

const PAYPAL_FUNCTION_URL = "https://pdokbwzmygythqtjroje.supabase.co/functions/v1/create-paypal-order";

const handlePayment = async () => {
  try {
    const response = await fetch(PAYPAL_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${accessToken}`,  // Agregar el token JWT
      },
      body: JSON.stringify({ amount: "10.00" }),
    });

    if (!response.ok) {
      throw new Error("Error al crear la orden de PayPal");
    }

    const data = await response.json();
    console.log("Orden creada:", data);
    
  } catch (error) {
    console.error("Error en el pago:", error);
  }
};


  return (
    <div className="container h-full mx-auto grid place-items-center grid-cols-2 ">
      <div className="col-1">
        <div className="items-start justify-start">
          <NavLink className="text-gray-400 border-0 uppercase" to="/">
            Inicio&nbsp;&gt;
          </NavLink>
          <NavLink className="text-gray-400 border-0 uppercase" to="/">
            Carrito&nbsp;&gt;
          </NavLink>
          <span className=" border-0 uppercase">Pago</span>
          <h1 className="text-amber-900 text-5xl uppercase m-2">
            Finalizar compra
          </h1>
          <NavLink className="text-amber-900 border-0 uppercase" to="/">
            Volver al carrito
          </NavLink>
        </div>
        <div className="metodosPago flex flex-col items-center justify-center">
          <h2 className="uppercase m-8 text-amber-900">
            {" "}
            seleccionar método de pago
          </h2>
          <label
            htmlFor="PayPal"
            className="cursor-pointer  bg-white w-full border mb-4 border-gray-300 rounded-lg h-24 flex flex-row justify-between items-center px-4 peer-checked:border-blue-500 peer-checked:bg-blue-100"
          >
            <img
              src="https://rappicard.mx/wp-content/uploads/2024/10/logo-paypal.png"
              width="108"
              height="32"
              alt="PayPal"
            />
            <h3>PayPal</h3>
            <input
              type="radio"
              name="metodoPago"
              id="PayPal"
              value="PayPal"
              className="w-5 h-5 accent-blue-500"
            />
          </label>

          <label
            htmlFor="Card"
            className="cursor-pointer  bg-white w-full border border-gray-300 rounded-lg h-24 flex flex-row justify-between items-center px-4 peer-checked:border-blue-500 peer-checked:bg-blue-100"
          >
            <img
              src="https://www.mastercard.com.co/content/dam/mccom/global/logos/logo-mastercard-mobile.svg"
              width="108"
              height="32"
              alt="MasterCard"
            />
            <h3>Card</h3>
            <input
              type="radio"
              name="metodoPago"
              id="Card"
              value="Card"
              className="w-5 h-5 accent-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="col-2 bg-white p-10 w-[80%] h-fit border border-gray-300 min-h-48 flex justify-center flex-col items-center">
        {items.map((item) => (
          <div key={item.id_producto} className="flex justify-between w-full">
            <div className="flex items-center mb-5">
              <img
                src={item.imagen}
                alt={item.nombre_producto}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex flex-col ml-4">
                <h3 className="text-amber-900">{item.nombre_producto}</h3>
                <p className="text-gray-400">Cantidad: {item.quantity}</p>
                <p className="text-gray-400">Precio: ${item.precio}</p>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.id_producto)}
              className="text-amber-900 cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        ))}

        <hr className="w-full border-t border-gray-400" />

        <div className="direcEnvi flex justify-between p-1 w-full">
          <h3 className="text-amber-900">Dirección de envío</h3>

          <button className="text-amber-900 cursor-pointer">Editar</button>
        </div>
        <p className="text-gray-400">
          Calle 123, Ciudad, Estado, Código Postal
        </p>
        <hr className="w-full border-t border-gray-400 mt-5" />

        <div className="flex justify-between p-1 w-full">
          <h3 className="">Subtotal</h3>
          <p className="">RD${total.toFixed(2)}</p>
        </div>

        <div className="flex justify-between p-1 w-full">
          <h3 className="">Descuento</h3>
          <p className="">RD${(total - totalWithDiscount).toFixed(2)}</p>
        </div>

        <div className="flex justify-between p-1 w-full">
          <h3 className="">ITBIS(18%)</h3>
          <p className="">RD${tax.toFixed(2)}</p>
        </div>


        <div className="flex justify-between p-1 w-full">
          <h3 className="">Total</h3>
          <p className="">RD${totalAmount.toFixed(2)}</p>
        </div>

        <input
          type="submit"
          value="Continuar"
          className="bg-amber-900 text-white w-1/2 h-12 rounded-lg hover:bg-amber-600 transition cursor-pointer mt-5"
          onClick={handlePayment}
        />
      </div>
    </div>
  );
}
