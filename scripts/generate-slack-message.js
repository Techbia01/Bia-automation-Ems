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
      console.error('✅ Reporte JSON leído exitosamente');
    } else {
      console.error('⚠️ El archivo de reporte está vacío');
    }
  } else {
    console.error('⚠️ No se encontró el archivo de reporte en:', reportPath);
  }
} catch (error) {
  console.error('❌ Error al leer el reporte:', error.message);
  // Continuar con datos vacíos
}

const stats = reportData.stats || {};
const totalTests = stats.tests || 0;
const passedTests = stats.passes || 0;
const failedTests = stats.failures || 0;
const pendingTests = stats.pending || 0;
const successRate = totalTests > 0 ? ((passedTests * 100) / totalTests).toFixed(2) : 0;

// Extraer pruebas fallidas
const failedSpecs = [];
const passedSpecs = [];

if (reportData.results && Array.isArray(reportData.results)) {
  reportData.results.forEach(suite => {
    const fileName = suite.file ? suite.file.split('/').pop() : 'Desconocido';
    
    if (suite.suites && Array.isArray(suite.suites)) {
      suite.suites.forEach(s => {
        if (s.tests && Array.isArray(s.tests)) {
          s.tests.forEach(test => {
            const testTitle = test.title ? test.title.join(' > ') : 'Test sin título';
            const testInfo = {
              title: testTitle,
              file: fileName,
              duration: test.duration || 0
            };
            
            if (test.state === 'failed') {
              failedSpecs.push(testInfo);
            } else if (test.state === 'passed') {
              passedSpecs.push(testInfo);
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
  summaryText += `• ⚠️ Reporte no disponible\n• Revisa los logs de GitHub Actions\n• Verifica la ejecución de las pruebas`;
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

// Agregar sección de pruebas fallidas
if (failedSpecs.length > 0) {
  const failedList = failedSpecs
    .slice(0, 15) // Máximo 15 pruebas fallidas
    .map(test => `• ${test.title}\n  _${test.file}_`)
    .join('\n');
  
  const moreFailed = failedSpecs.length > 15 ? `\n• ... y ${failedSpecs.length - 15} más` : '';
  
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*❌ Pruebas Fallidas (${failedTests}):*\n\`\`\`${failedList}${moreFailed}\`\`\``
    }
  });
  
  blocks.push({
    type: 'divider'
  });
}

// Agregar sección de pruebas exitosas (mejor formato cuando todas pasan)
if (passedSpecs.length > 0) {
  // Si todas pasaron, mostrar más pruebas y con mejor formato
  const maxToShow = failedTests === 0 ? 20 : 10; // Mostrar más si todas pasaron
  const passedList = passedSpecs
    .slice(0, maxToShow)
    .map((test, index) => {
      const duration = test.duration ? ` (${(test.duration / 1000).toFixed(1)}s)` : '';
      return `✅ ${test.title}${duration}`;
    })
    .join('\n');
  
  const morePassed = passedSpecs.length > maxToShow ? `\n\n... y ${passedSpecs.length - maxToShow} prueba(s) más exitosa(s)` : '';
  
  // Título diferente según el resultado
  const titleEmoji = failedTests === 0 ? '🎯' : '✅';
  const titleText = failedTests === 0 
    ? `*${titleEmoji} ¡Todas las Pruebas Exitosas! (${passedTests}/${totalTests}):*`
    : `*${titleEmoji} Pruebas Exitosas (${passedTests}):*`;
  
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${titleText}\n\`\`\`${passedList}${morePassed}\`\`\``
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
const linksText = failedTests === 0
  ? `*🔗 Enlaces Útiles:*\n• <${serverUrl}/${repository}/actions/runs/${runId}|📋 Ver ejecución completa>\n• <${serverUrl}/${repository}/actions/runs/${runId}|📊 Descargar reporte HTML>\n\n*💡 Tip:* ¡Mantén este nivel de calidad!`
  : `*🔗 Enlaces Útiles:*\n• <${serverUrl}/${repository}/actions/runs/${runId}|📋 Ver ejecución completa>\n• <${serverUrl}/${repository}/actions/runs/${runId}|📊 Descargar reporte HTML>`;

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
console.log(JSON.stringify(payload));

