const fs = require('fs');
const path = require('path');

// Leer el reporte JSON
const reportPath = path.join(__dirname, '../cypress/reports/report.json');
let reportData = { stats: {}, results: [] };
let hasReportData = false;

try {
  if (fs.existsSync(reportPath)) {
    const fileContent = fs.readFileSync(reportPath, 'utf8');
    if (fileContent.trim()) {
      reportData = JSON.parse(fileContent);
      hasReportData = true;
      // Usar stderr para logs, no stdout (que se usa para JSON)
      process.stderr.write('✅ Reporte JSON leído exitosamente\n');
    } else {
      process.stderr.write('⚠️ El archivo de reporte está vacío\n');
    }
  } else {
    process.stderr.write(`⚠️ No se encontró el archivo de reporte en: ${reportPath}\n`);
  }
} catch (error) {
  process.stderr.write(`❌ Error al leer el reporte: ${error.message}\n`);
  // Continuar con datos vacíos
}

const stats = reportData.stats || {};
const totalTests = stats.tests || 0;
const passedTests = stats.passes || 0;
const failedTests = stats.failures || 0;
const pendingTests = stats.pending || 0;
const successRate = totalTests > 0 ? ((passedTests * 100) / totalTests).toFixed(2) : 0;

// Extraer pruebas fallidas y exitosas por archivo
const failedSpecs = [];
const passedSpecs = [];
const fileResults = {}; // Para agrupar por archivo

if (reportData.results && Array.isArray(reportData.results)) {
  reportData.results.forEach(suite => {
    // Obtener nombre del archivo completo (ej: cypress/e2e/Login/login.cy.js)
    const fullFilePath = suite.file || '';
    // Extraer solo el nombre del archivo (ej: login.cy.js)
    const fileName = fullFilePath ? fullFilePath.split('/').pop() : 'Desconocido';
    // Extraer ruta relativa (ej: Login/login.cy.js)
    const relativePath = fullFilePath ? fullFilePath.replace(/^.*\/e2e\//, '') : fileName;
    
    if (suite.suites && Array.isArray(suite.suites)) {
      suite.suites.forEach(s => {
        if (s.tests && Array.isArray(s.tests)) {
          s.tests.forEach(test => {
            const testTitle = test.title ? test.title.join(' > ') : 'Test sin título';
            const testInfo = {
              title: testTitle,
              file: fileName,
              relativePath: relativePath,
              duration: test.duration || 0
            };
            
            if (test.state === 'failed') {
              failedSpecs.push(testInfo);
              if (!fileResults[relativePath]) {
                fileResults[relativePath] = { passed: 0, failed: 0 };
              }
              fileResults[relativePath].failed++;
            } else if (test.state === 'passed') {
              passedSpecs.push(testInfo);
              if (!fileResults[relativePath]) {
                fileResults[relativePath] = { passed: 0, failed: 0 };
              }
              fileResults[relativePath].passed++;
            }
          });
        }
      });
    }
  });
}

// Determinar color y emoji según resultado
let color = 'good';
let emoji = '🎉';
let statusText = '¡Todas las pruebas pasaron!';
let celebrationMessage = '';

if (!hasReportData) {
  color = '#FFA500'; // Naranja para advertencia
  emoji = '⚠️';
  statusText = 'No se pudo leer el reporte de pruebas';
} else if (failedTests > 0) {
  color = 'warning';
  emoji = '⚠️';
  statusText = 'Algunas pruebas fallaron';
} else if (totalTests === 0) {
  color = 'danger';
  emoji = '❌';
  statusText = 'No se ejecutaron pruebas';
} else if (passedTests === totalTests && totalTests > 0) {
  // Mensaje celebratorio cuando todas pasan
  celebrationMessage = '🚀 ¡Excelente trabajo! Todas las pruebas están funcionando correctamente.';
}

// Construir bloques de Slack
const blocks = [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `${emoji} Reporte de Pruebas Cypress - EMS`
    }
  }
];

// Agregar mensaje celebratorio si todas las pruebas pasaron
if (celebrationMessage) {
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${celebrationMessage}*`
    }
  });
  blocks.push({
    type: 'divider'
  });
}

// Construir texto de resumen
let summaryText = `*📊 Resumen General*\n`;
if (!hasReportData) {
  // Intentar leer información básica de los logs o archivos disponibles
  const reportsDir = path.join(__dirname, '../cypress/reports');
  let jsonFilesFound = [];
  try {
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      jsonFilesFound = files.filter(f => f.endsWith('.json'));
    }
  } catch (e) {
    // Ignorar errores
  }
  
  if (jsonFilesFound.length > 0) {
    summaryText += `• ⚠️ Reporte no disponible (se encontraron ${jsonFilesFound.length} archivo(s) JSON pero no se pudo leer)\n• Archivos encontrados: ${jsonFilesFound.slice(0, 3).join(', ')}\n• Revisa los logs de GitHub Actions`;
  } else {
    summaryText += `• ⚠️ Reporte no disponible\n• No se encontraron archivos JSON de reporte\n• Las pruebas pueden haber fallado antes de generar reportes\n• Revisa los logs de GitHub Actions`;
  }
} else {
  summaryText += `• Total: *${totalTests}*\n• ✅ Exitosas: *${passedTests}*\n• ❌ Fallidas: *${failedTests}*\n• ⏸️ Pendientes: *${pendingTests}*`;
}

let coverageText = `*📈 Información*\n`;
if (!hasReportData) {
  coverageText += `• Estado: ${statusText}\n• Rama: \`${process.env.GITHUB_REF_NAME || 'N/A'}\`\n• Autor: ${process.env.GITHUB_ACTOR || 'N/A'}\n• Commit: \`${(process.env.GITHUB_SHA || '').substring(0, 7) || 'N/A'}\``;
} else {
  coverageText += `• Tasa de éxito: *${successRate}%*\n• Estado: ${statusText}\n• Rama: \`${process.env.GITHUB_REF_NAME || 'N/A'}\`\n• Autor: ${process.env.GITHUB_ACTOR || 'N/A'}`;
}

blocks.push({
  type: 'section',
  fields: [
    {
      type: 'mrkdwn',
      text: summaryText
    },
    {
      type: 'mrkdwn',
      text: coverageText
    }
  ]
});

blocks.push({
  type: 'divider'
});

// Agregar sección de pruebas fallidas por archivo
if (failedSpecs.length > 0) {
  // Agrupar por archivo
  const failedByFile = {};
  failedSpecs.forEach(test => {
    if (!failedByFile[test.relativePath]) {
      failedByFile[test.relativePath] = [];
    }
    failedByFile[test.relativePath].push(test);
  });
  
  const failedList = Object.keys(failedByFile)
    .slice(0, 10) // Máximo 10 archivos
    .map(filePath => {
      const tests = failedByFile[filePath];
      const testNames = tests.map(t => t.title).join(', ');
      return `✖ ${filePath}\n  ${testNames}`;
    })
    .join('\n\n');
  
  const moreFiles = Object.keys(failedByFile).length > 10 
    ? `\n\n... y ${Object.keys(failedByFile).length - 10} archivo(s) más con fallos` 
    : '';
  
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*❌ Archivos con Pruebas Fallidas (${Object.keys(failedByFile).length}):*\n\`\`\`${failedList}${moreFiles}\`\`\``
    }
  });
  
  blocks.push({
    type: 'divider'
  });
}

// Agregar sección de pruebas exitosas por archivo
if (passedSpecs.length > 0) {
  // Agrupar por archivo
  const passedByFile = {};
  passedSpecs.forEach(test => {
    if (!passedByFile[test.relativePath]) {
      passedByFile[test.relativePath] = [];
    }
    passedByFile[test.relativePath].push(test);
  });
  
  const maxToShow = failedTests === 0 ? 15 : 8; // Mostrar más si todas pasaron
  const passedList = Object.keys(passedByFile)
    .slice(0, maxToShow)
    .map(filePath => {
      const tests = passedByFile[filePath];
      return `✓ ${filePath} (${tests.length} prueba${tests.length > 1 ? 's' : ''})`;
    })
    .join('\n');
  
  const moreFiles = Object.keys(passedByFile).length > maxToShow 
    ? `\n\n... y ${Object.keys(passedByFile).length - maxToShow} archivo(s) más exitoso(s)` 
    : '';
  
  // Título diferente según el resultado
  const titleEmoji = failedTests === 0 ? '🎯' : '✅';
  const titleText = failedTests === 0 
    ? `*${titleEmoji} Archivos con Pruebas Exitosas (${Object.keys(passedByFile).length}):*`
    : `*${titleEmoji} Archivos con Pruebas Exitosas (${Object.keys(passedByFile).length}):*`;
  
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${titleText}\n\`\`\`${passedList}${moreFiles}\`\`\``
    }
  });
  
  blocks.push({
    type: 'divider'
  });
}

// Agregar enlaces
const runId = process.env.GITHUB_RUN_ID || '';
const repository = process.env.GITHUB_REPOSITORY || '';
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';

// Agregar enlaces con mejor formato
let linksText = '';
if (!hasReportData) {
  linksText = `*🔗 Enlaces Útiles:*\n• <${serverUrl}/${repository}/actions/runs/${runId}|📋 Ver ejecución completa y logs>\n• <${serverUrl}/${repository}/actions/runs/${runId}|📊 Descargar artefactos (videos/screenshots)>\n\n*💡 Nota:* Revisa los logs del paso "Ejecutar pruebas Cypress" para ver qué pruebas se ejecutaron y cuáles fallaron.`;
} else if (failedTests === 0) {
  linksText = `*🔗 Enlaces Útiles:*\n• <${serverUrl}/${repository}/actions/runs/${runId}|📋 Ver ejecución completa>\n• <${serverUrl}/${repository}/actions/runs/${runId}|📊 Descargar reporte HTML>\n\n*💡 Tip:* ¡Mantén este nivel de calidad!`;
} else {
  linksText = `*🔗 Enlaces Útiles:*\n• <${serverUrl}/${repository}/actions/runs/${runId}|📋 Ver ejecución completa>\n• <${serverUrl}/${repository}/actions/runs/${runId}|📊 Descargar reporte HTML y videos de fallos>`;
}

blocks.push({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: linksText
  }
});

// Crear payload final
const payload = {
  blocks: blocks,
  attachments: [
    {
      color: color,
      footer: `EMS Automation | ${new Date().toLocaleString('es-ES')}`,
      footer_icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
    }
  ]
};

// Imprimir JSON para que GitHub Actions lo use
// Usar try-catch para asegurar que siempre se imprima algo
try {
  const jsonOutput = JSON.stringify(payload);
  if (!jsonOutput || jsonOutput === '{}' || jsonOutput === 'null') {
    throw new Error('Payload vacío o inválido');
  }
  console.log(jsonOutput);
} catch (error) {
  // Si hay error, generar un payload mínimo válido
  process.stderr.write(`Error al generar JSON: ${error.message}\n`);
  const fallbackPayload = {
    text: '🧪 Reporte de Pruebas Cypress - EMS',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🧪 Reporte de Pruebas Cypress*\n\n*Error:* No se pudo generar el reporte completo\n*Repositorio:* ${process.env.GITHUB_REPOSITORY || 'N/A'}\n*Rama:* ${process.env.GITHUB_REF_NAME || 'N/A'}\n*Commit:* ${(process.env.GITHUB_SHA || '').substring(0, 7) || 'N/A'}\n*Ejecutado por:* ${process.env.GITHUB_ACTOR || 'N/A'}`
        }
      }
    ]
  };
  console.log(JSON.stringify(fallbackPayload));
}

