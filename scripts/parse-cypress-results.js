#!/usr/bin/env node

/**
 * Script para parsear resultados de Cypress y generar estadísticas
 * para notificaciones de Slack
 */

const fs = require('fs');
const path = require('path');

// Buscar archivos de resultados en diferentes ubicaciones
const possiblePaths = [
  'cypress/results/results.json',
  'mochawesome-report/results.json',
  'cypress/reports/results.json',
  'cypress/results.json',
  'cypress/.results/results.json'
];

let resultsData = null;
let resultsPath = null;

for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Intentar parsear como JSON
      if (fileContent.trim().startsWith('{') || fileContent.trim().startsWith('[')) {
        resultsData = JSON.parse(fileContent);
        resultsPath = filePath;
        console.log(`Archivo encontrado: ${filePath}`);
        break;
      }
    } catch (error) {
      console.error(`Error leyendo ${filePath}:`, error.message);
    }
  }
}

// Si no encontramos archivo JSON, intentar usar los resultados del hook after:run
if (!resultsData) {
  console.log('No se encontró archivo JSON de resultados');
  console.log('Intentando leer desde el hook after:run de Cypress...');
  
  // El hook after:run debería haber guardado los resultados
  // Si no están disponibles, salir con código 0 para no fallar el workflow
  if (!fs.existsSync('cypress/results/results.json')) {
    console.log('No se encontraron resultados JSON. El workflow continuará sin detalles.');
    // Crear un archivo vacío para que el workflow continúe
    const emptyStats = {
      stats: { tests: 0, passes: 0, failures: 0, pending: 0, skipped: 0 },
      failedTests: [],
      passedTests: []
    };
    fs.writeFileSync('cypress/results/stats.json', JSON.stringify(emptyStats, null, 2));
    process.exit(0);
  }
}

// Extraer estadísticas según el formato
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
  // Formato Cypress after:run (formato nativo) - resultado completo del run
  if (resultsData.stats) {
    stats = {
      tests: resultsData.stats.tests || 0,
      passes: resultsData.stats.passes || 0,
      failures: resultsData.stats.failures || 0,
      pending: resultsData.stats.pending || 0,
      skipped: resultsData.stats.skipped || 0
    };
    
    // Extraer pruebas fallidas y exitosas del formato Cypress
    // Puede venir en diferentes estructuras
    if (resultsData.tests && Array.isArray(resultsData.tests)) {
      resultsData.tests.forEach(test => {
        let testName = 'Test sin nombre';
        
        // Diferentes formatos de nombre de test
        if (test.title) {
          if (Array.isArray(test.title)) {
            testName = test.title.join(' > ');
          } else if (typeof test.title === 'string') {
            testName = test.title;
          } else if (test.title.fullTitle) {
            testName = test.title.fullTitle;
          }
        } else if (test.fullTitle) {
          testName = test.fullTitle;
        }
        
        const state = test.state || test.status;
        if (state === 'failed' || state === 'fail') {
          let error = 'Error desconocido';
          if (test.displayError) error = test.displayError;
          else if (test.err?.message) error = test.err.message;
          else if (test.err?.stack) error = test.err.stack;
          else if (test.error) error = typeof test.error === 'string' ? test.error : (test.error.message || JSON.stringify(test.error));
          
          failedTests.push({
            name: testName,
            error: error.substring(0, 500) // Limitar tamaño del error
          });
        } else if (state === 'passed' || state === 'pass') {
          passedTests.push(testName);
        }
      });
    }
    
    // También buscar en results.runs si existe
    if (resultsData.runs && Array.isArray(resultsData.runs)) {
      resultsData.runs.forEach(run => {
        if (run.tests && Array.isArray(run.tests)) {
          run.tests.forEach(test => {
            let testName = test.title?.join(' > ') || test.title?.fullTitle || test.fullTitle || 'Test sin nombre';
            const state = test.state || test.status;
            
            if (state === 'failed' || state === 'fail') {
              let error = test.displayError || test.err?.message || test.err?.stack || 'Error desconocido';
              failedTests.push({
                name: testName,
                error: error.substring(0, 500)
              });
            } else if (state === 'passed' || state === 'pass') {
              passedTests.push(testName);
            }
          });
        }
      });
    }
  }
  // Formato Mochawesome
  else if (resultsData.stats) {
    stats = {
      tests: resultsData.stats.tests || 0,
      passes: resultsData.stats.passes || 0,
      failures: resultsData.stats.failures || 0,
      pending: resultsData.stats.pending || 0,
      skipped: resultsData.stats.skipped || 0
    };

    // Extraer pruebas fallidas y exitosas
    if (resultsData.results && Array.isArray(resultsData.results)) {
      resultsData.results.forEach(suite => {
        if (suite.tests && Array.isArray(suite.tests)) {
          suite.tests.forEach(test => {
            const testName = test.fullTitle || `${suite.title || ''} - ${test.title || 'Test sin nombre'}`.trim();
            
            if (test.state === 'failed') {
              failedTests.push({
                name: testName,
                error: test.err?.message || test.err?.stack || 'Error desconocido'
              });
            } else if (test.state === 'passed') {
              passedTests.push(testName);
            }
          });
        }
      });
    }
  }
  // Formato Cypress JSON directo (array)
  else if (Array.isArray(resultsData)) {
    resultsData.forEach(result => {
      // Formato de Cypress con suites
      if (result.suites && Array.isArray(result.suites)) {
        result.suites.forEach(suite => {
          if (suite.tests && Array.isArray(suite.tests)) {
            suite.tests.forEach(test => {
              const testName = `${suite.title || ''} - ${test.title || 'Test sin nombre'}`.trim();
              
              if (test.state === 'failed') {
                stats.failures++;
                failedTests.push({
                  name: testName,
                  error: test.err?.message || test.err?.stack || 'Error desconocido'
                });
              } else if (test.state === 'passed') {
                stats.passes++;
                passedTests.push(testName);
              }
              stats.tests++;
            });
          }
        });
      }
      // Formato directo con tests
      else if (result.tests && Array.isArray(result.tests)) {
        result.tests.forEach(test => {
          const testName = `${result.title || ''} - ${test.title || 'Test sin nombre'}`.trim();
          
          if (test.state === 'failed') {
            stats.failures++;
            failedTests.push({
              name: testName,
              error: test.err?.message || test.err?.stack || 'Error desconocido'
            });
          } else if (test.state === 'passed') {
            stats.passes++;
            passedTests.push(testName);
          }
          stats.tests++;
        });
      }
      // Formato con stats en el objeto
      else if (result.stats) {
        stats.tests += result.stats.tests || 0;
        stats.passes += result.stats.passes || 0;
        stats.failures += result.stats.failures || 0;
        stats.pending += result.stats.pending || 0;
        stats.skipped += result.stats.skipped || 0;
      }
    });
  }
  // Formato con estructura diferente
  else if (resultsData.suites || resultsData.specs) {
    const suites = resultsData.suites || resultsData.specs || [];
    suites.forEach(suite => {
      if (suite.tests) {
        suite.tests.forEach(test => {
          const testName = test.title || 'Test sin nombre';
          
          if (test.state === 'failed' || test.fail) {
            stats.failures++;
            failedTests.push({
              name: testName,
              error: test.error || test.err?.message || 'Error desconocido'
            });
          } else if (test.state === 'passed' || test.pass) {
            stats.passes++;
            passedTests.push(testName);
          }
          stats.tests++;
        });
      }
    });
  }
} catch (error) {
  console.error('Error parseando resultados:', error.message);
  process.exit(1);
}

// Escribir resultados a archivo para GitHub Actions
const output = {
  stats,
  failedTests: failedTests.slice(0, 50), // Limitar a 50 pruebas fallidas
  passedTests: passedTests.slice(0, 50)   // Limitar a 50 pruebas exitosas
};

const outputPath = process.env.GITHUB_OUTPUT || 'cypress/results/output.txt';
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Escribir en formato para GitHub Actions
const githubOutput = [
  `tests=${stats.tests}`,
  `passes=${stats.passes}`,
  `failures=${stats.failures}`,
  `pending=${stats.pending}`,
  `skipped=${stats.skipped}`,
  `failed_tests<<EOF`,
  JSON.stringify(failedTests, null, 2),
  `EOF`,
  `passed_tests<<EOF`,
  JSON.stringify(passedTests.slice(0, 20), null, 2),
  `EOF`
].join('\n');

fs.writeFileSync(outputPath, githubOutput);
fs.writeFileSync('cypress/results/stats.json', JSON.stringify(output, null, 2));

console.log('Resultados parseados exitosamente:');
console.log(`  Tests: ${stats.tests}`);
console.log(`  Pasados: ${stats.passes}`);
console.log(`  Fallidos: ${stats.failures}`);
console.log(`  Pendientes: ${stats.pending}`);
console.log(`  Omitidos: ${stats.skipped}`);

process.exit(0);

