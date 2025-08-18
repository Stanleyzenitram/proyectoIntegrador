import { configuracionService } from '../services/configuracionService';

async function testConfiguracionService() {
    console.log('🧪 Probando servicio de configuración...');
    
    try {
        // 1. Verificar si existen configuraciones
        console.log('📋 Verificando configuraciones existentes...');
        const configuraciones = await configuracionService.obtenerConfiguraciones();
        console.log('✅ Configuraciones existentes:', configuraciones);
        
        // 2. Verificar si existen estilos y materiales
        console.log('📋 Verificando estilos decorativos...');
        const estilos = await configuracionService.obtenerEstilosDecorativos();
        console.log('✅ Estilos decorativos:', estilos);
        
        console.log('📋 Verificando tipos de materiales...');
        const materiales = await configuracionService.obtenerTiposMateriales();
        console.log('✅ Tipos de materiales:', materiales);
        
        // 3. Si no existen, crear configuraciones por defecto
        if (!estilos || !materiales) {
            console.log('⚠️ Configuraciones faltantes, creando por defecto...');
            await configuracionService.crearConfiguracionesPorDefecto();
            console.log('✅ Configuraciones por defecto creadas');
            
            // 4. Verificar nuevamente
            console.log('📋 Verificando estilos después de crear...');
            const estilosNuevos = await configuracionService.obtenerEstilosDecorativos();
            console.log('✅ Estilos decorativos (nuevos):', estilosNuevos);
            
            console.log('📋 Verificando materiales después de crear...');
            const materialesNuevos = await configuracionService.obtenerTiposMateriales();
            console.log('✅ Tipos de materiales (nuevos):', materialesNuevos);
        }
        
        // 5. Probar métodos formateados
        console.log('📋 Probando obtenerEstilosDecorativosFormateados...');
        const estilosFormateados = await configuracionService.obtenerEstilosDecorativosFormateados();
        console.log('✅ Estilos formateados:', estilosFormateados);
        
        console.log('📋 Probando obtenerTiposMaterialesFormateados...');
        const materialesFormateados = await configuracionService.obtenerTiposMaterialesFormateados();
        console.log('✅ Materiales formateados:', materialesFormateados);
        
        console.log('🎉 Todas las pruebas pasaron exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar la prueba
testConfiguracionService();
