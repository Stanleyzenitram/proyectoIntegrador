import React, { useState } from 'react';
import { inicializarUsos, verificarTablasUsos } from '../utils/inicializarUsos';
import { usosService } from '../services/usosService';

export default function TestUsos() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testInicializacion = async () => {
        setLoading(true);
        setStatus('Inicializando...');
        
        try {
            const resultado = await inicializarUsos();
            if (resultado) {
                setStatus('✅ Sistema inicializado correctamente');
            } else {
                setStatus('❌ Error en la inicialización');
            }
        } catch (error) {
            setStatus(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testVerificacion = async () => {
        setLoading(true);
        setStatus('Verificando...');
        
        try {
            const tablasExisten = await verificarTablasUsos();
            if (tablasExisten) {
                setStatus('✅ Tablas verificadas correctamente');
            } else {
                setStatus('❌ Las tablas no existen');
            }
        } catch (error) {
            setStatus(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testObtenerUsos = async () => {
        setLoading(true);
        setStatus('Obteniendo usos...');
        
        try {
            const usos = await usosService.obtenerUsos();
            setStatus(`✅ Se obtuvieron ${usos.length} usos`);
            console.log('Usos obtenidos:', usos);
        } catch (error) {
            setStatus(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🧪 Test del Sistema de Usos</h2>
            
            <div className="space-y-4">
                <button
                    onClick={testInicializacion}
                    disabled={loading}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Procesando...' : '1. Inicializar Sistema'}
                </button>

                <button
                    onClick={testVerificacion}
                    disabled={loading}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                    {loading ? 'Procesando...' : '2. Verificar Tablas'}
                </button>

                <button
                    onClick={testObtenerUsos}
                    disabled={loading}
                    className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                    {loading ? 'Procesando...' : '3. Obtener Usos'}
                </button>
            </div>

            {status && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-mono">{status}</p>
                </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Instrucciones:</h3>
                <ol className="text-sm text-yellow-800 space-y-1">
                    <li>1. Ejecuta "Inicializar Sistema" para crear las tablas</li>
                    <li>2. Ejecuta "Verificar Tablas" para confirmar que existen</li>
                    <li>3. Ejecuta "Obtener Usos" para probar el servicio</li>
                </ol>
            </div>
        </div>
    );
}
