import React from 'react';

export default function PreferenciasUso() {
    console.log('PreferenciasUso component rendered - SIMPLE VERSION');
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
                <h2 className="text-2xl font-bold mb-2">🎯 PREFERENCIAS DE USO</h2>
                <p className="mb-2">¡Este componente está funcionando!</p>
                <p className="text-sm">Si puedes ver este mensaje amarillo, el tab está funcionando correctamente.</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Estilos de Uso Disponibles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-800">🏠 Gaje Rustico</h4>
                        <p className="text-sm text-gray-600">Para ambientes tradicionales y rústicos</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-800">🏢 Gaje Moderno</h4>
                        <p className="text-sm text-gray-600">Para ambientes contemporáneos</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-800">👑 Gaje Clásico</h4>
                        <p className="text-sm text-gray-600">Para ambientes elegantes</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-800">🏭 Gaje Industrial</h4>
                        <p className="text-sm text-gray-600">Para ambientes urbanos</p>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Estado del Sistema</h4>
                    <p className="text-green-700 text-sm">
                        El componente de preferencias de uso está funcionando correctamente. 
                        Este es el tab que buscabas.
                    </p>
                </div>
            </div>
        </div>
    );
}
