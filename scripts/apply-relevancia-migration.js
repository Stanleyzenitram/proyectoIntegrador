#!/usr/bin/env node

/**
 * Script para aplicar la migración del sistema de relevancia
 * Uso: node scripts/apply-relevancia-migration.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Aplicando migración del Sistema de Relevancia...\n');

try {
  // Verificar que estamos en el directorio correcto
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.');
  }

  // Verificar que existe la migración
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240320000000_create_relevancia_system.sql');
  if (!fs.existsSync(migrationPath)) {
    throw new Error('No se encontró el archivo de migración. Verifica que existe: supabase/migrations/20240320000000_create_relevancia_system.sql');
  }

  console.log('📋 Verificando configuración de Supabase...');
  
  // Verificar que Supabase CLI está instalado
  try {
    execSync('supabase --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Supabase CLI no está instalado. Instálalo con: npm install -g supabase');
  }

  console.log('✅ Supabase CLI encontrado');

  // Verificar que el proyecto está inicializado
  const supabaseConfigPath = path.join(process.cwd(), 'supabase', 'config.toml');
  if (!fs.existsSync(supabaseConfigPath)) {
    throw new Error('Proyecto Supabase no inicializado. Ejecuta: supabase init');
  }

  console.log('✅ Proyecto Supabase inicializado');

  // Aplicar la migración
  console.log('\n🔄 Aplicando migración...');
  execSync('supabase db push', { stdio: 'inherit' });

  console.log('\n✅ Migración aplicada exitosamente!');
  console.log('\n📊 Sistema de Relevancia configurado con:');
  console.log('   • Tablas de tipos de productos');
  console.log('   • Sistema de preferencias de usuario');
  console.log('   • Seguimiento de interacciones');
  console.log('   • Algoritmo de relevancia');
  console.log('   • Sistema de recomendaciones');
  console.log('   • Métricas y reportes');
  console.log('   • Onboarding de usuarios');

  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Inicia el servidor de desarrollo: npm run dev');
  console.log('   2. Accede a las nuevas funcionalidades desde el menú "Relevancia"');
  console.log('   3. Configura las preferencias iniciales');
  console.log('   4. Prueba el sistema de recomendaciones');

  console.log('\n🔗 URLs disponibles:');
  console.log('   • /relevancia/busqueda - Búsqueda avanzada');
  console.log('   • /relevancia/recomendaciones - Recomendaciones personalizadas');
  console.log('   • /relevancia/historial - Historial de interacciones');
  console.log('   • /relevancia/metricas - Dashboard de métricas');
  console.log('   • /relevancia/configuracion - Configuración del sistema');

} catch (error) {
  console.error('\n❌ Error al aplicar la migración:');
  console.error(error.message);
  process.exit(1);
} 