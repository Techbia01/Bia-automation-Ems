#!/usr/bin/env node

/**
 * Script para generar el payload de Slack con detalles de las pruebas
 */

const fs = require('fs');

// Leer estadísticas parseadas
let stats = {
  tests: 0,
  passes: 0,
  failures: 0,
  pending: 0,
  skipped: 0
};

let failedTests = [];
let passedTests = [];

try {
  if (fs.existsSync('cypress/results/stats.json')) {
    console.log('Leyendo archivo cypress/results/stats.json...');
    const fileContent = fs.readFileSync('cypress/results/stats.json', 'utf8');
    const data = JSON.parse(fileContent);
    stats = data.stats || stats;
    failedTests = data.failedTests || [];
    passedTests = data.passedTests || [];
    console.log(`Estadísticas leídas: ${stats.tests} tests, ${stats.passes} pasaron, ${stats.failures} fallaron`);
    console.log(`Pruebas fallidas encontradas: ${failedTests.length}`);
  } else {
    console.log('⚠️ Archivo cypress/results/stats.json no encontrado');
    // Intentar leer desde variables de entorno como fallback
    if (process.env.TESTS) {
      stats.tests = parseInt(process.env.TESTS) || 0;
      stats.passes = parseInt(process.env.PASSES) || 0;
      stats.failures = parseInt(process.env.FAILURES) || 0;
      console.log(`Usando estadísticas de variables de entorno: ${stats.tests} tests`);
    }
  }
} catch (error) {
  console.error('Error leyendo estadísticas:', error.message);
  console.error('Stack:', error.stack);
}

// Leer variables de entorno de GitHub Actions
const githubRepo = process.env.GITHUB_REPOSITORY || 'unknown/repo';
const githubRef = process.env.GITHUB_REF_NAME || 'unknown';
const githubSha = process.env.GITHUB_SHA || 'unknown';
const githubActor = process.env.GITHUB_ACTOR || 'unknown';
const githubRunId = process.env.GITHUB_RUN_ID || 'unknown';
const githubServerUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';

// Determinar estado y color
let statusMessage = '';
let color = 'good';

if (stats.failures === 0 && stats.tests > 0) {
  statusMessage = `✅ Todas las ${stats.tests} pruebas pasaron exitosamente`;
  color = 'good';
} else if (stats.failures > 0) {
  statusMessage = `❌ ${stats.failures} de ${stats.tests} pruebas fallaron (${stats.passes} pasaron)`;
  color = 'danger';
} else {
  statusMessage = '⚠️ No se pudieron obtener resultados';
  color = 'warning';
}

// Construir bloques de Slack
const blocks = [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: '🧪 Reporte de Pruebas Cypress'
    }
  },
  {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `*Estado:*\n${statusMessage}`
      },
      {
        type: 'mrkdwn',
        text: `*Repositorio:*\n${githubRepo}`
      },
      {
        type: 'mrkdwn',
        text: `*Rama:*\n${githubRef}`
      },
      {
        type: 'mrkdwn',
        text: `*Commit:*\n<${githubServerUrl}/${githubRepo}/commit/${githubSha}|${githubSha.substring(0, 7)}>`
      },
      {
        type: 'mrkdwn',
        text: `*Ejecutado por:*\n${githubActor}`
      },
      {
        type: 'mrkdwn',
        text: `*Workflow:*\n<${githubServerUrl}/${githubRepo}/actions/runs/${githubRunId}|Ver detalles>`
      }
    ]
  }
];

// Agregar estadísticas detalladas
if (stats.tests > 0) {
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*📊 Resumen de Ejecución:*\n• Total de pruebas: ${stats.tests}\n• ✅ Pasaron: ${stats.passes}\n• ❌ Fallaron: ${stats.failures}${stats.pending > 0 ? `\n• ⏸️ Pendientes: ${stats.pending}` : ''}${stats.skipped > 0 ? `\n• ⏭️ Omitidas: ${stats.skipped}` : ''}`
    }
  });
  
  // Si hay fallos, destacar inmediatamente después de las estadísticas
  if (stats.failures > 0) {
    blocks.push({
      type: 'divider'
    });
  }
}

// Agregar pruebas fallidas si las hay - SIEMPRE mostrar la lista completa
if (failedTests.length > 0) {
  // Crear un bloque destacado con el título
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*❌ CASOS QUE FALLARON (${failedTests.length}):*`
    }
  });
  
  // Dividir en múltiples bloques si hay muchas pruebas para evitar límites de Slack
  // Slack tiene un límite de ~3000 caracteres por bloque
  const testsPerBlock = 15; // Aproximadamente 15 pruebas por bloque
  const totalBlocks = Math.ceil(failedTests.length / testsPerBlock);
  
  for (let blockIndex = 0; blockIndex < totalBlocks; blockIndex++) {
    const startIndex = blockIndex * testsPerBlock;
    const endIndex = Math.min(startIndex + testsPerBlock, failedTests.length);
    
    let failedTestsText = '';
    
    for (let i = startIndex; i < endIndex; i++) {
      const test = failedTests[i];
      const testName = typeof test === 'string' ? test : (test.name || 'Test sin nombre');
      
      // Limpiar el nombre del test para que sea más legible
      const cleanTestName = testName
        .replace(/cypress\/e2e\//g, '')
        .replace(/\.cy\.js/g, '')
        .replace(/\//g, ' > ')
        .trim();
      
      failedTestsText += `\n*${i + 1}.* \`${cleanTestName}\``;
      
      // Agregar error si existe (limitado a 200 caracteres)
      if (typeof test === 'object' && test.error) {
        const error = test.error;
        const shortError = error.length > 200 ? error.substring(0, 200) + '...' : error;
        // Limpiar el error para que sea más legible
        const cleanError = shortError
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        failedTestsText += `\n   _${cleanError}_`;
      }
    }
    
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: failedTestsText
      }
    });
  }
  
  // Agregar un separador visual
  blocks.push({
    type: 'divider'
  });
}

// Agregar resumen de pruebas exitosas si hay muchas
if (passedTests.length > 0 && failedTests.length === 0) {
  const maxPassed = Math.min(passedTests.length, 5);
  let passedTestsText = '*✅ Pruebas Exitosas:*\n';
  
  for (let i = 0; i < maxPassed; i++) {
    passedTestsText += `\n• ${passedTests[i]}`;
  }
  
  if (passedTests.length > maxPassed) {
    passedTestsText += `\n\n_... y ${passedTests.length - maxPassed} prueba(s) más_`;
  }
  
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: passedTestsText
    }
  });
}

// Agregar enlace a resultados completos
blocks.push({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `<${githubServerUrl}/${githubRepo}/actions/runs/${githubRunId}|📊 Ver resultados completos en GitHub>`
  }
});

// Construir payload completo
const payload = {
  text: statusMessage,
  blocks: blocks,
  attachments: [
    {
      color: color,
      footer: 'GitHub Actions'
    }
  ]
};

// Escribir payload a archivo
const outputFile = process.env.SLACK_PAYLOAD_FILE || 'slack-payload.json';
try {
  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
  console.log(`✅ Payload de Slack generado exitosamente en: ${outputFile}`);
  console.log(`Tamaño del payload: ${JSON.stringify(payload).length} caracteres`);
  console.log(`Número de bloques: ${payload.blocks.length}`);
  
  // Validar que el payload sea válido
  if (!payload.text) {
    console.error('⚠️ ADVERTENCIA: payload.text está vacío');
  }
  if (!payload.blocks || payload.blocks.length === 0) {
    console.error('⚠️ ADVERTENCIA: payload.blocks está vacío');
  }
  
  // Mostrar resumen del payload
  console.log('\n=== Resumen del Payload ===');
  console.log(`Texto: ${payload.text}`);
  console.log(`Bloques: ${payload.blocks.length}`);
  console.log(`Color: ${payload.attachments[0]?.color || 'no definido'}`);
  if (failedTests.length > 0) {
    console.log(`Pruebas fallidas incluidas: ${failedTests.length}`);
  }
} catch (error) {
  console.error('❌ Error escribiendo payload:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

