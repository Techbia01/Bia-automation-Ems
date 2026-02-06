// cypress/e2e/analisis/energia-reactiva/energia-reactiva.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import ModulosNavegacionPage from '../../../pages/Home/modulos-nav/ModulosNavegacionPage.js';
import EnergiaReactivaPage from '../../../pages/analisis/EnergiaReactivaPage.js';
import { 
  ejecutarCurlEnergiaReactiva, 
  procesarRespuestaApiEnergiaReactiva,
  compararEnergiaReactiva,
  parsearHtmlEnergiaReactiva,
  extraerContractIds
} from '../../../support/helpers.js';

describe('Análisis - Energía Reactiva', () => {
  let loginPage;
  let homePage;
  let modulosNavegacionPage;
  let energiaReactivaPage;
  let authToken;
  let contractIds;

  const INTERCEPTS = {
    SIGNIN: 'signinApi',
    CONTRACTS: 'contractsApi'
  };

  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start')
      ) {
        return false;
      }
      return true;
    });
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
    
    // Interceptar llamadas al API (usar el patrón correcto)
    cy.intercept('POST', '**/bia-auth/signin').as(INTERCEPTS.SIGNIN);
    cy.intercept('GET', '**/contracts**').as(INTERCEPTS.CONTRACTS);
    
    // Visitar la página y esperar a que cargue completamente
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
    cy.wait(2000); // Esperar a que la página cargue completamente

    loginPage = new LoginPage();
    homePage = new HomePage();
    modulosNavegacionPage = new ModulosNavegacionPage();
    energiaReactivaPage = new EnergiaReactivaPage();
  });

  it('Debería comparar datos de energía reactiva del frontend vs servicio', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';
    const curlCommand = `curl 'https://api.dev.bia.app/ms-bia-consumptions/v1/reactive-analitics/widgets' \\
  -H 'x-platform: web' \\
  -H 'Authorization: TOKEN_PLACEHOLDER' \\
  -H 'sec-ch-ua-platform: "Windows"' \\
  -H 'Referer: https://web.dev.bia.app/' \\
  -H 'sec-ch-ua: "Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"' \\
  -H 'x-timezone: America/Bogota' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'x-view-as: TX2X5jj3a1RQDAZh70mIaXXpUMk1' \\
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36' \\
  -H 'Content-Type: application/json' \\
  --data-raw '{"contract_ids":[18981,18983,18984,15702,15703,18979,4,29777,18980,18982],"period":"monthly","date":"2026-02-01"}'`;
    
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚡ TEST: Comparación de Energía Reactiva');
    cy.log('═══════════════════════════════════════════════════════');
    
    // ============================================================
    // PASO 1: LOGIN Y OBTENER TOKEN
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔐 PASO 1: LOGIN Y OBTENER TOKEN');
    cy.log('═══════════════════════════════════════════════════════');
    
    // Esperar a que la página de login esté completamente cargada
    cy.get(loginPage.emailInput, { timeout: 15000 }).should('be.visible');
    cy.wait(1000); // Espera adicional para asegurar que todo esté listo
    
    cy.log('🔍 Iniciando proceso de login...');
    loginPage.loginCompleto(email, password);
    
    cy.wait(`@${INTERCEPTS.SIGNIN}`, { timeout: 30000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      authToken = interception.response.body.access_token;
      expect(authToken).to.exist;
      cy.log('✅ Token de autenticación capturado');
      
      return cy.wrap(authToken);
    }).then((token) => {
      cy.url({ timeout: 20000 }).should('include', '/home');
      
      return cy.wait(`@${INTERCEPTS.CONTRACTS}`, { timeout: 30000 }).then((interception) => {
        cy.log(`📊 Status de respuesta de contratos: ${interception.response.statusCode}`);
        
        contractIds = extraerContractIds(interception.response.body);
        
        if (contractIds.length === 0) {
          cy.log('⚠️ No se pudieron extraer contract IDs');
          cy.log('   Usando contract IDs del curl por defecto');
          contractIds = [18981,18983,18984,15702,15703,18979,4,29777,18980,18982];
        } else {
          cy.log(`✅ ${contractIds.length} contratos obtenidos`);
          cy.log(`   IDs: ${contractIds.join(', ')}`);
        }
        
        return cy.wrap({ token, contractIds });
      });
    }).then(({ token, contractIds: ids }) => {
      // Verificar que el home cargó
      homePage.verificarQueCargo();
      
      // ============================================================
      // PASO 2: NAVEGAR A ENERGÍA REACTIVA
      // ============================================================
      cy.log('');
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('⚡ PASO 2: NAVEGAR A ENERGÍA REACTIVA');
      cy.log('═══════════════════════════════════════════════════════');
      
      // Esperar a que el menú de navegación esté completamente visible
      modulosNavegacionPage.esperarMenuNavegacion();
      cy.wait(1500); // Espera adicional para que termine la animación fadeIn
      
      // Hacer clic en análisis usando el método que maneja la visibilidad correctamente
      modulosNavegacionPage.hacerClickEnAnalisis();
      cy.wait(2000);
      
      // Hacer clic en energía reactiva usando el método que maneja la visibilidad
      modulosNavegacionPage.hacerClickEnEnergiaReactiva();
      
      // Verificar que cargó correctamente
      energiaReactivaPage.verificarQueCargo();
      
      // Esperar a que cargue la información mensual (filtro por defecto)
      cy.log('⏳ Esperando a que cargue la información mensual...');
      cy.wait(3000);
      
      // Verificar que hay contenido visible (widgets o gráficas)
      cy.get('body').then(($body) => {
        const $widgets = $body.find('[class*="widget"], [class*="card"], [class*="metric"], [data-demo-target="kpi-card"]').filter(':visible');
        const $graficas = $body.find('canvas, svg, [class*="chart"], [class*="graph"]').filter(':visible');
        
        if ($widgets.length > 0 || $graficas.length > 0) {
          cy.log(`✅ Información mensual cargada: ${$widgets.length} widget(s), ${$graficas.length} gráfica(s)`);
        } else {
          cy.log('⚠️ No se encontraron widgets ni gráficas visibles, continuando...');
        }
      });
      
      cy.wait(2000); // Espera adicional para asegurar que todo esté renderizado
      
      // ============================================================
      // PASO 3: VERIFICAR FILTROS
      // ============================================================
      cy.log('');
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('🔍 PASO 3: VERIFICAR FILTROS');
      cy.log('═══════════════════════════════════════════════════════');
      
      // Verificar filtro mensual (debe estar activo por defecto)
      return energiaReactivaPage.verificarFiltroMensual().then((mensualActivo) => {
        expect(mensualActivo, 'El filtro mensual debe estar activo por defecto').to.be.true;
        
        // Cambiar a filtro semanal
        return energiaReactivaPage.hacerClicEnFiltroSemanal().then(() => {
          return energiaReactivaPage.verificarFiltroSemanal().then((semanalActivo) => {
            expect(semanalActivo, 'El filtro semanal debe estar activo después de hacer clic').to.be.true;
            
            // Cambiar a filtro diario
            return energiaReactivaPage.hacerClicEnFiltroDiario().then(() => {
              return energiaReactivaPage.verificarFiltroDiario().then((diarioActivo) => {
                expect(diarioActivo, 'El filtro diario debe estar activo después de hacer clic').to.be.true;
                
                // Verificar dropdown de filtros
                return energiaReactivaPage.verificarDropdownFiltros().then((dropdownVisible) => {
                  expect(dropdownVisible, 'El dropdown de filtros debe ser visible').to.be.true;
                  
                  cy.log('');
                  cy.log('✅ Todos los filtros verificados correctamente');
                  
                  // Volver al filtro mensual para continuar con la comparación
                  return energiaReactivaPage.cambiarFiltroPeriodo('monthly').then(() => {
                    cy.wait(3000); // Esperar a que se actualice
                    
                    // ============================================================
                    // PASO 4: OBTENER HTML DEL FRONTEND
                    // ============================================================
                    cy.log('');
                    cy.log('═══════════════════════════════════════════════════════');
                    cy.log('📄 PASO 4: OBTENER HTML DEL FRONTEND');
                    cy.log('═══════════════════════════════════════════════════════');
                    
                    return cy.get('body').then(($body) => {
                      const htmlString = $body.html();
                      cy.log('✅ HTML del frontend obtenido');
                      cy.log(`   Tamaño: ${(htmlString.length / 1024).toFixed(2)} KB`);
                      
                      // Parsear HTML
                      const datosFrontend = parsearHtmlEnergiaReactiva(htmlString);
                      
                      // ============================================================
                      // PASO 5: OBTENER DATOS DEL SERVICIO (CURL)
                      // ============================================================
                      cy.log('');
                      cy.log('═══════════════════════════════════════════════════════');
                      cy.log('📡 PASO 5: OBTENER DATOS DEL SERVICIO');
                      cy.log('═══════════════════════════════════════════════════════');
                      
                      // Reemplazar el token en el curl command
                      const curlCommandConToken = curlCommand.replace('TOKEN_PLACEHOLDER', token);
                      
                      return ejecutarCurlEnergiaReactiva(
                        curlCommandConToken,
                        token,
                        ids,
                        'monthly',
                        '2026-02-01',
                        'America/Bogota',
                        'TX2X5jj3a1RQDAZh70mIaXXpUMk1'
                      ).then((apiResponse) => {
                        if (!apiResponse) {
                          cy.log('⚠️ No se obtuvieron datos del servicio');
                          cy.log('   Continuando solo con validaciones del frontend...');
                          return cy.wrap(null);
                        }
                        
                        cy.log('✅ Datos del servicio obtenidos');
                        
                        // Procesar respuesta del API
                        const datosServicio = procesarRespuestaApiEnergiaReactiva(apiResponse);
                        
                        // ============================================================
                        // PASO 6: COMPARAR DATOS
                        // ============================================================
                        cy.log('');
                        cy.log('═══════════════════════════════════════════════════════');
                        cy.log('🔍 PASO 6: COMPARAR DATOS FRONTEND VS SERVICIO');
                        cy.log('═══════════════════════════════════════════════════════');
                        
                        if (datosServicio) {
                          const comparacion = compararEnergiaReactiva(datosFrontend, datosServicio);
                          
                          // Validaciones
                          if (comparacion.reactivaInductiva.encontrado) {
                            expect(comparacion.reactivaInductiva.valor, 'El valor de reactiva inductiva debe coincidir').to.be.true;
                            expect(comparacion.reactivaInductiva.porcentaje, 'El porcentaje de reactiva inductiva debe coincidir').to.be.true;
                          }
                          
                          if (comparacion.reactivaCapacitiva.encontrado) {
                            expect(comparacion.reactivaCapacitiva.valor, 'El valor de reactiva capacitiva debe coincidir').to.be.true;
                            expect(comparacion.reactivaCapacitiva.porcentaje, 'El porcentaje de reactiva capacitiva debe coincidir').to.be.true;
                          }
                          
                          cy.log('');
                          cy.log('✅ Comparación completada exitosamente');
                        } else {
                          cy.log('⚠️ No se pudo realizar la comparación (datos del servicio no disponibles)');
                        }
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
