// cypress/e2e/Home/graficas/hover_tooltips_graficas.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import GraficasPage from '../../../pages/Home/GraficasPage.js';
import ModulosNavegacionPage from '../../../pages/Home/modulos-nav/ModulosNavegacionPage.js';

describe('Automatización de Tooltips en Gráficas', () => {
  const loginPage = new LoginPage();
  const graficasPage = new GraficasPage();
  const modulosNavegacionPage = new ModulosNavegacionPage();

  beforeEach(() => {
    // Interceptar llamadas de autenticación si es necesario
    cy.intercept('POST', '**/auth/signin').as('signin');
    cy.intercept('GET', '**/ems-api/**').as('apiCalls');
    
    // Visitar la página de login
    cy.visit('/login');
    
    // Login (ajustar según tus credenciales)
    cy.fixture('credenciales.json').then((credenciales) => {
      loginPage.ingresarEmail(credenciales.correo);
      loginPage.hacerClickEnContinuar();
      cy.wait(1000);
      loginPage.ingresarPassword(credenciales.contrasena);
      loginPage.hacerLogin();
      
      // Esperar a que el login se complete
      cy.wait('@signin', { timeout: 15000 });
      cy.wait(3000); // Esperar a que cargue el dashboard
    });
  });

  it('Debería hacer hover sobre las barras de las gráficas y mostrar tooltips - Energía Reactiva', () => {
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('📊 TEST: Hover sobre barras de gráficas - Energía Reactiva');
    cy.log('═══════════════════════════════════════════════════════');
    
    // Navegar a la sección de análisis de energía reactiva
    cy.log('\n📍 Navegando a energía reactiva...');
    modulosNavegacionPage.hacerClickEnEnergiaReactiva();
    cy.wait(3000);
    
    // Verificar que la página cargó correctamente
    modulosNavegacionPage.verificarEnergiaReactivaCargada();
    
    // Esperar a que las gráficas carguen
    cy.log('\n⏳ Esperando a que las gráficas carguen...');
    graficasPage.esperarGraficasCarguen();
    
    // ============================================================
    // TEST 1: Hover sobre barras de "Excesos de energía reactiva inductiva"
    // ============================================================
    cy.log('\n═══════════════════════════════════════════════════════');
    cy.log('📈 TEST 1: Gráfica "Excesos de energía reactiva inductiva"');
    cy.log('═══════════════════════════════════════════════════════');
    
    graficasPage.hacerHoverSobreBarrasDeGrafica('Excesos de energía reactiva inductiva')
      .then((resultados) => {
        cy.log(`\n📊 Resultados: ${resultados.length} barra(s) procesada(s)`);
        
        resultados.forEach((resultado, index) => {
          if (resultado.tooltipVisible) {
            cy.log(`✅ Barra ${resultado.indice}: Tooltip visible`);
            cy.log(`   📋 Contenido: "${resultado.contenido.substring(0, 100)}..."`);
          } else {
            cy.log(`⚠️ Barra ${resultado.indice}: Tooltip NO visible`);
          }
        });
        
        // Verificar que al menos una barra mostró tooltip
        const tooltipsVisibles = resultados.filter(r => r.tooltipVisible).length;
        expect(tooltipsVisibles).to.be.greaterThan(0, 
          `Se esperaba que al menos una barra mostrara tooltip, pero solo ${tooltipsVisibles} de ${resultados.length} lo mostraron`);
      });
    
    cy.wait(2000);
    
    // ============================================================
    // TEST 2: Hover sobre barras de "Total reactiva inductiva"
    // ============================================================
    cy.log('\n═══════════════════════════════════════════════════════');
    cy.log('📈 TEST 2: Gráfica "Total reactiva inductiva"');
    cy.log('═══════════════════════════════════════════════════════');
    
    graficasPage.hacerHoverSobreBarrasDeGrafica('Total reactiva inductiva')
      .then((resultados) => {
        cy.log(`\n📊 Resultados: ${resultados.length} barra(s) procesada(s)`);
        
        resultados.forEach((resultado) => {
          if (resultado.tooltipVisible) {
            cy.log(`✅ Barra ${resultado.indice}: Tooltip visible`);
            cy.log(`   📋 Contenido: "${resultado.contenido.substring(0, 100)}..."`);
          } else {
            cy.log(`⚠️ Barra ${resultado.indice}: Tooltip NO visible`);
          }
        });
        
        const tooltipsVisibles = resultados.filter(r => r.tooltipVisible).length;
        if (resultados.length > 0) {
          expect(tooltipsVisibles).to.be.greaterThan(0, 
            `Se esperaba que al menos una barra mostrara tooltip`);
        }
      });
    
    cy.wait(2000);
    
    // ============================================================
    // TEST 3: Hover sobre todas las barras de todas las gráficas
    // ============================================================
    cy.log('\n═══════════════════════════════════════════════════════');
    cy.log('📈 TEST 3: Hover sobre TODAS las barras de TODAS las gráficas');
    cy.log('═══════════════════════════════════════════════════════');
    
    graficasPage.hacerHoverSobreTodasLasBarras()
      .then((resultados) => {
        cy.log(`\n📊 Resultados totales: ${resultados.length} barra(s) procesada(s)`);
        
        const tooltipsVisibles = resultados.filter(r => r.tooltipVisible).length;
        const tooltipsNoVisibles = resultados.filter(r => !r.tooltipVisible).length;
        
        cy.log(`✅ Tooltips visibles: ${tooltipsVisibles}`);
        cy.log(`⚠️ Tooltips NO visibles: ${tooltipsNoVisibles}`);
        
        // Mostrar resumen de tooltips visibles
        resultados.filter(r => r.tooltipVisible).forEach((resultado) => {
          cy.log(`\n📋 Barra ${resultado.indice}:`);
          cy.log(`   Contenido: "${resultado.contenido.substring(0, 150)}..."`);
        });
        
        // Verificar que al menos algunas barras mostraron tooltips
        if (resultados.length > 0) {
          expect(tooltipsVisibles).to.be.greaterThan(0, 
            `Se esperaba que al menos una barra mostrara tooltip de ${resultados.length} barras procesadas`);
        }
      });
  });

  it('Debería hacer hover sobre las barras de las gráficas - URL directa /analysis/reactive', () => {
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('📊 TEST: Hover sobre barras - Navegación directa');
    cy.log('═══════════════════════════════════════════════════════');
    
    // Navegar directamente a la URL de análisis reactivo
    cy.visit('/analysis/reactive');
    cy.wait(5000); // Esperar a que cargue completamente
    
    // Esperar a que las gráficas carguen
    graficasPage.esperarGraficasCarguen();
    
    // Hacer hover sobre todas las barras
    graficasPage.hacerHoverSobreTodasLasBarras()
      .then((resultados) => {
        cy.log(`\n📊 Total de barras procesadas: ${resultados.length}`);
        
        const tooltipsVisibles = resultados.filter(r => r.tooltipVisible).length;
        
        cy.log(`✅ Tooltips visibles: ${tooltipsVisibles} de ${resultados.length}`);
        
        // Verificar que se encontraron barras
        expect(resultados.length).to.be.greaterThan(0, 
          'Se esperaba encontrar al menos una barra en las gráficas');
        
        // Si hay barras, verificar que al menos una mostró tooltip
        if (resultados.length > 0) {
          expect(tooltipsVisibles).to.be.greaterThan(0, 
            `Se esperaba que al menos una barra mostrara tooltip`);
        }
      });
  });
});
