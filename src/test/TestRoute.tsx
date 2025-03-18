import React from 'react';
import { NavLink } from 'react-router-dom';

export default function TestRoute() {
    return (
        <div className="container mx-auto px-4 py-8 mt-20">
            <h1 className="text-2xl font-bold text-green-600 mb-4">Test Route Works!</h1>
            <p>This is a test route component to verify routing is working correctly.</p>
            <p className="mb-4">Current path: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.pathname}</code></p>
            
            <div className="border p-4 rounded mb-4">
                <h2 className="text-xl font-semibold mb-2">Test Links - Public</h2>
                <div className="flex flex-wrap gap-2">
                    <NavLink to="/test" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Test (Public)</NavLink>
                    <NavLink to="/test-private" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Test (Private)</NavLink>
                </div>
            </div>
            
            <div className="border p-4 rounded mb-4">
                <h2 className="text-xl font-semibold mb-2">Test Report Links - Public</h2>
                <div className="flex flex-wrap gap-2">
                    <NavLink to="/reportes-test/compras" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Reporte Compras</NavLink>
                    <NavLink to="/reportes-test/pedidos" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Reporte Pedidos</NavLink>
                    <NavLink to="/reportes-test/productos" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Reporte Productos</NavLink>
                </div>
            </div>
            
            <div className="border p-4 rounded">
                <h2 className="text-xl font-semibold mb-2">Test Report Links - Private</h2>
                <div className="flex flex-wrap gap-2">
                    <NavLink to="/reportes/compras" className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600">Reporte Compras (Private)</NavLink>
                    <NavLink to="/reportes/pedidos" className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600">Reporte Pedidos (Private)</NavLink>
                    <NavLink to="/reportes/productos" className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600">Reporte Productos (Private)</NavLink>
                </div>
            </div>
        </div>
    );
} 