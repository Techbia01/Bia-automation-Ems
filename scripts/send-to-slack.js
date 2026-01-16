const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env si existe
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // dotenv no está instalado, continuar sin él
}

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (!SLACK_WEBHOOK_URL) {
  console.error('❌ Error: SLACK_WEBHOOK_URL no está configurado.');
  console.error('   Configúralo en una variable de entorno o en un archivo .env');
  console.error('   Ejemplo: SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...');
  process.exit(1);
}

// Generar el mensaje usando el script existente
console.log('📝 Generando mensaje de Slack...');
let payload;
try {
  const generateScript = path.join(__dirname, 'generate-slack-message.js');
  const payloadOutput = execSync(`node "${generateScript}"`, { encoding: 'utf8' });
  payload = payloadOutput.trim();
  
  if (!payload || payload === '') {
    throw new Error('El script no generó un payload válido');
  }
} catch (error) {
  console.error('⚠️ Error al generar el payload:', error.message);
  console.error('   Enviando notificación básica...');
  
  // Payload básico de respaldo
  payload = JSON.stringify({
    text: '🧪 Reporte de Pruebas Cypress - EMS',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🧪 Reporte de Pruebas Cypress*\n\nLas pruebas se ejecutaron localmente.\nRevisa los reportes en `cypress/reports/`'
        }
      }
    ]
  });
}

// Enviar a Slack
console.log('📤 Enviando notificación a Slack...');
try {
  const https = require('https');
  const url = new URL(SLACK_WEBHOOK_URL);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Notificación enviada exitosamente a Slack');
      } else {
        console.error(`⚠️ Error al enviar notificación. Código HTTP: ${res.statusCode}`);
        console.error('Respuesta:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  });

  req.write(payload);
  req.end();
} catch (error) {
  console.error('❌ Error al enviar notificación:', error.message);
  process.exit(1);
}

