const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando ejecución de pruebas con notificación a Slack...\n');

// Cargar variables de entorno desde .env si existe
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv no está instalado, continuar sin él
}

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Paso 1: Asegurar que el directorio de reportes existe
console.log('📁 Creando directorio de reportes...');
const reportsDir = path.join(__dirname, '../cypress/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Paso 2: Ejecutar pruebas Cypress
// Verificar si se quiere ejecutar en modo headed (visual)
const isHeaded = process.argv.includes('--headed') || process.argv.includes('-h');
const testCommand = isHeaded ? 'npm run test:headed' : 'npm run test';

console.log(`🧪 Ejecutando pruebas Cypress${isHeaded ? ' (modo visual)' : ''}...\n`);
let testsPassed = false;
try {
  execSync(testCommand, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  testsPassed = true;
  console.log('\n✅ Pruebas completadas');
} catch (error) {
  console.log('\n⚠️ Algunas pruebas fallaron, pero continuando con la generación de reportes...');
  testsPassed = false;
}

// Paso 3: Generar reportes
console.log('\n📊 Generando reportes...');
try {
  execSync('npm run merge:reports', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  console.log('⚠️ No se pudieron fusionar reportes (puede ser normal si no hay reportes)');
}

try {
  execSync('npm run generate:report', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Reporte HTML generado en cypress/reports/report.html');
} catch (error) {
  console.log('⚠️ No se pudo generar reporte HTML (puede ser normal si no hay reportes)');
}

// Paso 4: Enviar notificación a Slack (si está configurado)
if (SLACK_WEBHOOK_URL) {
  console.log('\n🔔 Enviando notificación a Slack...');
  try {
    execSync(`node "${path.join(__dirname, 'send-to-slack.js')}"`, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, SLACK_WEBHOOK_URL }
    });
  } catch (error) {
    console.log('⚠️ No se pudo enviar la notificación a Slack');
  }
} else {
  console.log('\n⚠️ SLACK_WEBHOOK_URL no está configurado. Saltando notificación.');
  console.log('   Para configurarlo, crea un archivo .env con:');
  console.log('   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...');
}

console.log('\n✨ Proceso completado!');
if (testsPassed) {
  console.log('✅ Todas las pruebas pasaron exitosamente');
  process.exit(0);
} else {
  console.log('❌ Algunas pruebas fallaron');
  process.exit(1);
}

