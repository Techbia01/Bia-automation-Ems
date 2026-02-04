// cypress/e2e/Home/homegraficas/validacion_graficas_home.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import HomeWidgetsPage from '../../../pages/Home/HomeWidgetsPage.js';
import GraficasPage from '../../../pages/Home/GraficasPage.js';
import { INTERCEPTS } from '../../../pages/config.js';
import { llamarApiWidgets, extraerContractIds } from '../../../support/helpers.js';

describe('Home - Validación de Gráficas vs API', () => {
  let loginPage;
  let homePage;
  let homeWidgetsPage;
  let graficasPage;
  let authToken;
  let contractIds = [];

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
    cy.intercept('POST', '**/bia-auth/signin').as(INTERCEPTS.SIGNIN);
    cy.intercept('GET', '**/ms-users/contracts/**').as(INTERCEPTS.CONTRACTS);
    
    homeWidgetsPage = new HomeWidgetsPage();
    homeWidgetsPage.interceptarApiWidgets();
    graficasPage = new GraficasPage();

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));

    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  it('Debería validar que las gráficas del home coincidan con el API', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';
    
    // Variables para almacenar resultados
    let resultadosInforme = {
      graficas: null,
      apiData: null
    };

    // ============================================================
    // PASO 1: LOGIN Y CONFIGURACIÓN INICIAL
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔐 PASO 1: LOGIN Y CONFIGURACIÓN INICIAL');
    cy.log('═══════════════════════════════════════════════════════');
    
    loginPage.loginCompleto(email, password);

    cy.wait(`@${INTERCEPTS.SIGNIN}`, { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      authToken = interception.response.body.access_token;
      expect(authToken).to.exist;
      cy.log('✅ Token de autenticación capturado');
      
      return cy.wrap(authToken);
    }).then((token) => {
      cy.url({ timeout: 20000 }).should('include', '/home');
      
      return cy.wait(`@${INTERCEPTS.CONTRACTS}`, { timeout: 30000 }).then((interception) => {
        contractIds = extraerContractIds(interception.response.body);
        
        if (contractIds.length === 0) {
          cy.log('⚠️ No se pudieron extraer contract IDs');
        } else {
          cy.log(`✅ ${contractIds.length} contratos obtenidos`);
        }
        
        return cy.wrap({ token, contractIds });
      });
    }).then(({ token, contractIds: ids }) => {
      homePage.verificarQueCargo();
      
      // Limpiar cache antes de cargar widgets
      cy.log('🧹 Limpiando cache antes de cargar widgets...');
      homeWidgetsPage.limpiarCache();
      
      homeWidgetsPage.esperarWidgetsCarguen();
      cy.wait(1000); // Reducido de 3000ms

      // ============================================================
      // PASO 2: OBTENER DATOS DEL API
      // ============================================================
      cy.log('');
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📡 PASO 2: OBTENER DATOS DEL API');
      cy.log('═══════════════════════════════════════════════════════');
      
      const fechaActual = new Date().toISOString().split('T')[0];
      
      return llamarApiWidgets(token, ids, 'monthly', fechaActual, 'America/Bogota').then((apiResponse) => {
        const apiData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.widgets || []);
        
        cy.log(`✅ Datos del API obtenidos: ${apiData.length} elementos`);
        
        // Log resumido del API (optimizado)
        cy.log(`📡 Total widgets en API: ${apiData.length}`);
        
        // Filtrar gráficas del API (pueden tener diferentes kinds o types)
        const graficasAPI = apiData.filter(w => {
          const kind = (w.kind || '').toLowerCase();
          const type = (w.type || '').toLowerCase();
          const header = (w.header || '').toLowerCase();
          
          // Gráficas de consumo energético
          if (kind === 'energy_consumption_chart' || 
              kind.includes('chart') ||
              kind.includes('graph')) {
            return true;
          }
          
          // Por type
          if (type === 'chart' || type === 'graph') {
            return true;
          }
          
          // Por header (si menciona gráfica o consumo energético)
          if (header.includes('consumo energético') || 
              header.includes('consumo energetico') ||
              header.includes('gráfica') ||
              header.includes('grafica')) {
            return true;
          }
          
          return false;
        });
        
        cy.log(`📊 Gráficas encontradas en el API: ${graficasAPI.length}`);
        
        resultadosInforme.apiData = apiData;
        
        return cy.wrap({ apiData, graficasAPI });
      }).then(({ apiData, graficasAPI }) => {
        // ============================================================
        // PASO 3: VALIDAR GRÁFICAS EN EL FRONTEND
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📈 PASO 3: VALIDAR GRÁFICAS EN EL FRONTEND');
        cy.log('═══════════════════════════════════════════════════════');
        
        // Esperar a que las gráficas carguen
        graficasPage.esperarGraficasCarguen();
        
        // Obtener todas las gráficas del frontend
        return cy.get('body').then(($body) => {
          const graficasFrontend = [];
          
          // Buscar gráficas usando data-graph-widget
          const $graficas = $body.find('[data-graph-widget="true"]').filter(':visible');
          
          cy.log(`🔍 Gráficas encontradas en el Frontend: ${$graficas.length}`);
          
          $graficas.each((i, grafica) => {
            const $grafica = Cypress.$(grafica);
            const titulo = $grafica.attr('data-graph-title') || '';
            const $tituloElement = $grafica.find('.GraphWidget_titleGroup__Q6FtL');
            const tituloTexto = $tituloElement.length > 0 ? $tituloElement.text().trim() : titulo;
            const tieneCanvas = $grafica.find('.echarts-for-react canvas').length > 0;
            
            graficasFrontend.push({
              titulo: tituloTexto || titulo,
              tieneCanvas: tieneCanvas,
              encontrada: true
            });
            
            cy.log(`   ${i + 1}. "${tituloTexto || titulo}" ${tieneCanvas ? '✅' : '❌'}`);
          });
          
          // También verificar la gráfica de consumo energético específicamente
          return homeWidgetsPage.verificarGraficaConsumo().then((uiGraficaConsumo) => {
            cy.log(`📊 Gráfica de Consumo Energético en Frontend:`);
            cy.log(`   - Encontrada: ${uiGraficaConsumo.encontrada ? '✅ Sí' : '❌ No'}`);
            cy.log(`   - Título: "${uiGraficaConsumo.titulo || 'N/A'}"`);
            cy.log(`   - Canvas renderizado: ${uiGraficaConsumo.tieneCanvas ? '✅ Sí' : '❌ No'}`);
            cy.log('');
            
            // Buscar la gráfica correspondiente en el API
            const graficaAPI = graficasAPI.find(g => {
              const header = (g.header || '').toLowerCase();
              const kind = (g.kind || '').toLowerCase();
              
              return kind === 'energy_consumption_chart' ||
                     header.includes('consumo energético') ||
                     header.includes('consumo energetico');
            });
            
            cy.log(`📊 Gráfica en API: ${graficaAPI ? '✅ Existe' : '❌ No existe'}`);
            
            // ============================================================
            // VALIDACIONES CRÍTICAS: FALLAR SI HAY DISCREPANCIAS
            // ============================================================
            cy.log('═══════════════════════════════════════════════════════');
            cy.log('🚨 VALIDACIONES CRÍTICAS - EL TEST FALLARÁ SI HAY DISCREPANCIAS');
            cy.log('═══════════════════════════════════════════════════════');
            
            // VALIDACIÓN 1: Si el API tiene gráfica, debe estar en el frontend
            if (graficaAPI) {
              expect(uiGraficaConsumo.encontrada, 
                `El API retorna una gráfica "${graficaAPI.header}" pero NO está en el Frontend`
              ).to.be.true;
              
              // VALIDACIÓN 2: El canvas debe estar renderizado
              expect(uiGraficaConsumo.tieneCanvas,
                `La gráfica "${uiGraficaConsumo.titulo}" está en el Frontend pero el canvas NO está renderizado`
              ).to.be.true;
              
              // VALIDACIÓN 3: El título debe coincidir (al menos parcialmente)
              if (graficaAPI.header && uiGraficaConsumo.titulo) {
                const tituloAPI = graficaAPI.header.toLowerCase();
                const tituloUI = uiGraficaConsumo.titulo.toLowerCase();
                
                expect(
                  tituloUI.includes(tituloAPI) || tituloAPI.includes(tituloUI),
                  `El título de la gráfica no coincide: API="${graficaAPI.header}" vs Frontend="${uiGraficaConsumo.titulo}"`
                ).to.be.true;
              }
              
              cy.log('✅ Todas las validaciones de gráfica pasaron');
            } else {
              cy.log('ℹ️ El API no retorna gráficas en este momento');
            }
            
            cy.log('');
            
            resultadosInforme.graficas = {
              ui: uiGraficaConsumo,
              api: graficaAPI,
              todasLasGraficasFrontend: graficasFrontend
            };
            
            return cy.wrap({ apiData, graficasAPI, graficasFrontend });
        });
      }).then(({ apiData, graficasAPI, graficasFrontend }) => {
        // ============================================================
        // PASO 4: VALIDAR QUE LAS GRÁFICAS TENGAN DATOS
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📊 PASO 4: VALIDAR QUE LAS GRÁFICAS TENGAN DATOS');
        cy.log('═══════════════════════════════════════════════════════');
        
        // Verificar que la gráfica tenga barras/elementos renderizados
        return graficasPage.obtenerBarrasDeGraficas().then((barras) => {
          cy.log(`📊 Barras encontradas en las gráficas: ${barras.length}`);
          
          if (barras.length > 0) {
            cy.log(`✅ Las gráficas tienen datos renderizados (${barras.length} barras)`);
          } else {
            cy.log('⚠️ No se encontraron barras en las gráficas');
          }
          
          // VALIDACIÓN: Si hay gráfica, debe tener al menos algunas barras
          const tieneGrafica = resultadosInforme.graficas?.ui?.encontrada;
          if (tieneGrafica) {
            expect(barras.length, 
              `La gráfica está en el Frontend pero NO tiene barras/datos renderizados`
            ).to.be.greaterThan(0);
          }
          
          cy.log('');
          
          // ============================================================
          // PASO 5: VALIDACIÓN DE INTERACCIÓN CON GRÁFICA DE CONSUMO ENERGÉTICO
          // ============================================================
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('🎯 PASO 5: VALIDACIÓN DE INTERACCIÓN CON GRÁFICA DE CONSUMO ENERGÉTICO');
          cy.log('═══════════════════════════════════════════════════════');
          
          const tieneGraficaConsumo = resultadosInforme.graficas?.ui?.encontrada;
          
          if (tieneGraficaConsumo && barras.length > 0) {
            cy.log('✅ La gráfica de consumo energético existe y tiene barras');
            cy.log('🔄 Iniciando interacción con la gráfica...');
            
            // 5.1: Hacer hover sobre las barras hasta encontrar un tooltip, luego continuar con chat de Eva
            cy.log('');
            cy.log('📊 5.1: Haciendo hover sobre las barras hasta encontrar un tooltip...');
            
            return graficasPage.hacerHoverSobreBarrasClave('Consumo energético', 3)
              .then((resultado) => {
                // Si se encontró un tooltip, continuar inmediatamente con el chat de Eva
                if (resultado.tooltipEncontrado) {
                  cy.log('✅ Tooltip encontrado - Continuando con chat de Eva...');
                  
                  // 5.2: Hacer clic en el botón de asistencia de IA (usando POM)
                  cy.log('');
                  cy.log('🤖 5.2: Haciendo clic en el botón de asistencia de IA...');
                  return homeWidgetsPage.hacerClicEnAsistenciaIA('Consumo energético');
                } else {
                  // Si no se encontró tooltip, hacer clic en la barra y luego continuar
                  cy.log('⚠️ No se encontró tooltip - Haciendo clic en la gráfica...');
                  return graficasPage.hacerClicEnBarraYCerrarModal(0)
                    .then(() => {
                      cy.log('🤖 5.2: Haciendo clic en el botón de asistencia de IA...');
                      return homeWidgetsPage.hacerClicEnAsistenciaIA('Consumo energético');
                    });
                }
              })
              .then(() => {
                // 5.3 y 5.4: Verificar chat de Eva (usando POM)
                cy.log('💬 5.3-5.4: Verificando chat de Eva...');
                return homeWidgetsPage.verificarChatEvaAbierto(3000);
              })
              .then(() => {
                // 5.5: Cerrar chat de Eva (usando POM)
                cy.log('');
                cy.log('❌ 5.5: Cerrando el chat de Eva...');
                return homeWidgetsPage.cerrarChatEva();
              })
              .then(() => {
                cy.log('');
                cy.log('✅ Validación de interacción con gráfica completada exitosamente');
                
                // ============================================================
                // PASO 6: VALIDACIÓN DE NAVEGACIÓN AL MÓDULO DE FACTURAS
                // ============================================================
                cy.log('');
                cy.log('═══════════════════════════════════════════════════════');
                cy.log('📄 PASO 6: VALIDACIÓN DE NAVEGACIÓN AL MÓDULO DE FACTURAS');
                cy.log('═══════════════════════════════════════════════════════');
                
                // 6.0-6.5: Navegación al módulo de Facturas (usando POM)
                cy.log('');
                cy.log('🖱️ 6.0: Haciendo clic en el widget de Facturas...');
                
                return homeWidgetsPage.hacerClicEnWidgetFacturas()
                  .then(() => {
                    cy.log('🔘 6.1: Navegando al módulo de Facturas...');
                    return homeWidgetsPage.navegarAModuloFacturas();
                  })
                  .then(() => {
                    cy.log('🏠 6.4: Volviendo al home...');
                    return homeWidgetsPage.volverAlHome();
                  })
                  .then(() => {
                    cy.log('✅ Validación de navegación al módulo de facturas completada');
                    
                    // ============================================================
                    // PASO 7: VALIDACIÓN DE NAVEGACIÓN A VARIACIONES DE CONSUMO
                    // ============================================================
                    cy.log('');
                    cy.log('═══════════════════════════════════════════════════════');
                    cy.log('📊 PASO 7: VALIDACIÓN DE NAVEGACIÓN A VARIACIONES DE CONSUMO');
                    cy.log('═══════════════════════════════════════════════════════');
                    
                    // 7.1-7.8: Navegación a Variaciones de consumo e interacción con filtros (usando POM)
                    cy.log('');
                    cy.log('🔍 7.1: Verificando si existe la gráfica de Variaciones de consumo...');
                    
                    return cy.get('body', { timeout: 10000 }).then(($body) => {
                      const $variacionesWidget = $body.find('[data-table-widget="true"][data-table-title="Variaciones de consumo"]');
                      const existeVariaciones = $variacionesWidget.length > 0;
                      
                      if (existeVariaciones) {
                        cy.log('✅ Gráfica/Tabla de Variaciones de consumo encontrada');
                        
                        return homeWidgetsPage.hacerClicEnWidgetVariaciones()
                          .then(() => {
                            cy.log('🔘 7.2: Navegando al módulo de Variaciones de consumo...');
                            return homeWidgetsPage.navegarAModuloVariaciones();
                          })
                          .then(() => {
                            cy.log('🔧 7.5: Cambiando filtro a "Semana"...');
                            return homeWidgetsPage.cambiarFiltroVariaciones('semana');
                          })
                          .then(() => {
                            cy.log('🔧 7.6: Cambiando filtro a "Día"...');
                            return homeWidgetsPage.cambiarFiltroVariaciones('dia');
                          })
                          .then(() => {
                            cy.log('🏠 7.7: Volviendo al home...');
                            return homeWidgetsPage.volverAlHome();
                          })
                          .then(() => {
                            cy.log('✅ Validación de navegación a Variaciones de consumo completada');
                          });
                      } else {
                        cy.log('ℹ️ No se encontró la gráfica/tabla de Variaciones de consumo');
                        cy.log('   Saltando validación de navegación a Variaciones de consumo...');
                        return cy.wrap(null);
                      }
                    });
                  });
              });
          } else {
            cy.log('ℹ️ La gráfica de consumo energético no existe o no tiene barras');
            cy.log('   Saltando validación de interacción...');
          }
          
          cy.log('');
          
          // ============================================================
          // RESUMEN FINAL
          // ============================================================
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('📊 RESUMEN FINAL DE VALIDACIÓN DE GRÁFICAS');
          cy.log('═══════════════════════════════════════════════════════');
          
          cy.log(`   📡 Gráficas en el API: ${graficasAPI.length}`);
          cy.log(`   🖥️ Gráficas en el Frontend: ${graficasFrontend.length}`);
          
          if (resultadosInforme.graficas) {
            const graf = resultadosInforme.graficas;
            const esValida = graf.api && graf.ui.encontrada && graf.ui.tieneCanvas && barras.length > 0;
            
            cy.log(`   Gráfica de Consumo Energético: ${esValida ? '✅ Válida' : '❌ Inválida'}`);
            cy.log(`      Frontend: ${graf.ui.encontrada ? '✅' : '❌'} | Canvas: ${graf.ui.tieneCanvas ? '✅' : '❌'} | Barras: ${barras.length}`);
            cy.log(`      API: ${graf.api ? '✅' : '❌'}`);
            
            if (esValida && tieneGraficaConsumo) {
              cy.log(`      ✅ Todas las validaciones e interacciones completadas exitosamente`);
            }
          }
          
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
        });
      });
    });
    });
  });
});
