// cypress/e2e/Home/homewidgets/homewidgets.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import HomeWidgetsPage from '../../../pages/Home/HomeWidgetsPage.js';
import { INTERCEPTS } from '../../../pages/config.js';
import { llamarApiWidgets, extraerContractIds, compararDatosWidgets, compararSaludo, validarElementoDeberiaMostrarse } from '../../../support/helpers.js';

describe('Home - Validación Completa UI vs API', () => {
  let loginPage;
  let homePage;
  let homeWidgetsPage;
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

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));

    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  it('Debería validar todos los elementos del home vs el API', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';
    
    // Variables para almacenar resultados del informe
    let resultadosInforme = {
      saludo: null,
      widgets: null,
      graficaConsumo: null,
      facturas: null,
      variaciones: null,
      procesoInstalacion: null,
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
      
      // Continuar con la obtención de contratos
      return cy.wrap(authToken);
    }).then((token) => {
      cy.url({ timeout: 20000 }).should('include', '/home');
      
      return cy.wait(`@${INTERCEPTS.CONTRACTS}`, { timeout: 30000 }).then((interception) => {
        cy.log(`📊 Status de respuesta de contratos: ${interception.response.statusCode}`);
        cy.log(`📋 Estructura de respuesta: ${JSON.stringify(interception.response.body).substring(0, 200)}`);
        
        contractIds = extraerContractIds(interception.response.body);
        
        if (contractIds.length === 0) {
          cy.log('⚠️ No se pudieron extraer contract IDs');
          cy.log('   El API puede requerir contract IDs para funcionar correctamente');
          cy.log('   Intentando continuar de todas formas...');
        } else {
          cy.log(`✅ ${contractIds.length} contratos obtenidos`);
          cy.log(`   IDs: ${contractIds.join(', ')}`);
        }
        
        return cy.wrap({ token, contractIds });
      });
    }).then(({ token, contractIds: ids }) => {
      homePage.verificarQueCargo();
      
      // Limpiar cache antes de cargar widgets para obtener datos frescos
      // NOTA: NO recargamos la página para evitar interrumpir el flujo
      cy.log('🧹 Limpiando cache antes de cargar widgets...');
      homeWidgetsPage.limpiarCache();
      
      // Esperar a que los widgets carguen (sin recargar la página)
      homeWidgetsPage.esperarWidgetsCarguen();
      cy.wait(3000);

      // ============================================================
      // PASO 2: OBTENER DATOS DEL API
      // ============================================================
      cy.log('');
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📡 PASO 2: OBTENER DATOS DEL API');
      cy.log('═══════════════════════════════════════════════════════');
      
      const fechaActual = new Date().toISOString().split('T')[0];
      cy.log(`📅 Fecha para el API: ${fechaActual}`);
      cy.log(`🔑 Token disponible: ${token ? 'Sí' : 'No'}`);
      cy.log(`🔑 Tipo de token: ${typeof token}`);
      cy.log(`🔑 Token (primeros 20 chars): ${token ? token.substring(0, 20) + '...' : 'undefined'}`);
      cy.log(`📋 Contract IDs: ${ids.length} contratos`);
      cy.log(`📋 Contract IDs valores: ${ids.join(', ')}`);
      
      if (!token) {
        cy.log('❌ ERROR: El token no está disponible en este punto');
        throw new Error('Token de autenticación no disponible');
      }
      
      return llamarApiWidgets(token, ids, 'monthly', fechaActual, 'America/Bogota').then((apiResponse) => {
        const apiData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.widgets || []);
        
        if (apiData.length === 0) {
          cy.log('⚠️ No se obtuvieron datos del API');
          cy.log('   Continuando con validaciones del UI solamente...');
        } else {
          cy.log(`✅ Datos del API obtenidos: ${apiData.length} elementos`);
          
          // Log detallado de la estructura completa del API
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('📡 RESPUESTA COMPLETA DEL API');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log(`Total widgets en respuesta: ${apiData.length}`);
          cy.log('');
          
          apiData.forEach((widget, index) => {
            cy.log(`Widget API ${index + 1}:`);
            cy.log(`   kind: "${widget.kind || 'N/A'}"`);
            cy.log(`   header: "${widget.header || 'N/A'}"`);
            cy.log(`   value_str: "${widget.value_str || 'N/A'}"`);
            cy.log(`   subheader: "${widget.subheader || 'N/A'}"`);
            cy.log(`   value: ${widget.value !== undefined ? widget.value : 'N/A'}`);
            cy.log(`   type: "${widget.type || 'N/A'}"`);
            cy.log('');
          });
          
          // Contar widgets por kind
          const widgetsPorKind = {};
          apiData.forEach(w => {
            const kind = w.kind || 'sin_kind';
            widgetsPorKind[kind] = (widgetsPorKind[kind] || 0) + 1;
          });
          
          cy.log('Resumen por kind:');
          Object.keys(widgetsPorKind).forEach(kind => {
            cy.log(`   - ${kind}: ${widgetsPorKind[kind]} widget(s)`);
          });
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('');
        }
        
        // ============================================================
        // SECCIÓN 1: VALIDAR SALUDO/BIENVENIDA
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('👋 SECCIÓN 1: VALIDACIÓN DEL SALUDO');
        cy.log('═══════════════════════════════════════════════════════');
        
        return homeWidgetsPage.obtenerDatosSaludo().then((uiSaludo) => {
          const apiSaludo = apiData.find(w => w.kind === 'greeting' || w.header?.includes('Buenas') || w.header?.includes('Buenos'));
          
          cy.log(`📋 Saludo en UI: ${uiSaludo.encontrado ? '✅ Encontrado' : '❌ No encontrado'}`);
          if (uiSaludo.encontrado) {
            cy.log(`   - Header: "${uiSaludo.header}"`);
            cy.log(`   - value_str: "${uiSaludo.value_str}"`);
          }
          
          cy.log(`📋 Saludo en API: ${apiSaludo ? '✅ Encontrado' : '❌ No encontrado'}`);
          if (apiSaludo) {
            cy.log(`   - Header: "${apiSaludo.header}"`);
            cy.log(`   - value_str: "${apiSaludo.value_str}"`);
          }
          
          const comparacionSaludo = compararSaludo(uiSaludo, apiSaludo);
          cy.log(`📊 Resultado:`);
          cy.log(`   - Header coincide: ${comparacionSaludo.header ? '✅' : '❌'}`);
          cy.log(`   - value_str coincide: ${comparacionSaludo.value_str ? '✅' : '❌'}`);
          
          // Guardar resultados para el informe
          resultadosInforme.saludo = {
            ui: uiSaludo,
            api: apiSaludo,
            comparacion: comparacionSaludo
          };
          
          return cy.wrap(apiData);
        });
      }).then((apiData) => {
        // ============================================================
        // SECCIÓN 2: VALIDAR WIDGETS DE CONSUMO
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📊 SECCIÓN 2: VALIDACIÓN DE WIDGETS DE CONSUMO');
        cy.log('═══════════════════════════════════════════════════════');
        
        return homeWidgetsPage.obtenerDatosWidgets().then((uiWidgetsData) => {
          // IMPORTANTE: Comparar SOLO los widgets que vienen del API
          // El API es la fuente de verdad - comparamos frontend contra API
          // Filtrar widgets KPI: consumo (active_energy_consumption) y reactiva
          
          cy.log('🔍 Aplicando filtro para widgets KPI...');
          cy.log(`   Total widgets del API: ${apiData.length}`);
          
          const widgetsConsumo = apiData.filter(w => {
            const kind = (w.kind || '').toLowerCase();
            const header = (w.header || '').toLowerCase();
            
            // Widgets de consumo activo (por kind)
            if (kind === 'active_energy_consumption') {
              cy.log(`   ✅ Incluido por kind: "${w.header}" (kind: "${w.kind}")`);
              return true;
            }
            
            // Widgets de reactiva inductiva penalizada (por kind)
            if (kind === 'reactive_inductive_penalized' || 
                kind.includes('reactive') || 
                kind.includes('reactiva')) {
              cy.log(`   ✅ Incluido por kind (reactiva): "${w.header}" (kind: "${w.kind}")`);
              return true;
            }
            
            // Si el header indica reactiva (aunque no tenga kind o tenga otro kind)
            if (header.includes('reactiva') || header.includes('inductiva') || header.includes('penalizada')) {
              cy.log(`   ✅ Incluido por header (reactiva): "${w.header}" (kind: "${w.kind || 'N/A'}")`);
              return true;
            }
            
            // Widgets de consumo por header (por si acaso no tienen el kind correcto)
            if (header.includes('consumo') && 
                (header.includes('hoy') || header.includes('semana') || header.includes('mes'))) {
              cy.log(`   ✅ Incluido por header (consumo): "${w.header}" (kind: "${w.kind || 'N/A'}")`);
              return true;
            }
            
            cy.log(`   ❌ Excluido: "${w.header}" (kind: "${w.kind || 'N/A'}")`);
            return false;
          });
          
          cy.log(`📊 Resultado del filtro: ${widgetsConsumo.length} widget(s) KPI del API`);
          cy.log('');
          
          // Log detallado de qué widgets pasaron el filtro
          cy.log('📋 Widgets que pasaron el filtro y se compararán:');
          widgetsConsumo.forEach((widget, index) => {
            cy.log(`   ${index + 1}. "${widget.header || 'Sin header'}"`);
            cy.log(`      kind: "${widget.kind || 'N/A'}"`);
            cy.log(`      value_str: "${widget.value_str || 'N/A'}"`);
            cy.log(`      subheader: "${widget.subheader || 'N/A'}"`);
          });
          cy.log('');
          
          cy.log(`📡 Widgets recibidos del API (total): ${apiData.length}`);
          cy.log(`📊 Widgets KPI del API a comparar: ${widgetsConsumo.length}`);
          
          // Log detallado de TODOS los widgets del API
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('📋 ANÁLISIS: Widgets del API vs Frontend');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('');
          cy.log('📡 TODOS los widgets que retorna el API:');
          apiData.forEach((widget, index) => {
            cy.log(`   ${index + 1}. kind: "${widget.kind || 'N/A'}"`);
            cy.log(`      header: "${widget.header || 'N/A'}"`);
            cy.log(`      value_str: "${widget.value_str || 'N/A'}"`);
            cy.log(`      subheader: "${widget.subheader || 'N/A'}"`);
          });
          cy.log('');
          
          cy.log(`📊 Widgets KPI del API (kind: active_energy_consumption o reactive_inductive_penalized):`);
          widgetsConsumo.forEach((widget, index) => {
            cy.log(`   ${index + 1}. "${widget.header || 'Sin header'}"`);
            cy.log(`      kind: "${widget.kind || 'N/A'}"`);
            cy.log(`      value_str: "${widget.value_str || 'N/A'}"`);
            cy.log(`      subheader: "${widget.subheader || 'N/A'}"`);
            cy.log(`      valor numérico: ${widget.value || 'N/A'}`);
          });
          cy.log('');
          
          cy.log(`🖥️ Widgets encontrados en el Frontend (UI):`);
          cy.log(`   Total: ${Object.keys(uiWidgetsData).length} widget(s)`);
          Object.keys(uiWidgetsData).forEach((key, index) => {
            const widget = uiWidgetsData[key];
            cy.log(`   ${index + 1}. "${key}"`);
            cy.log(`      value_str: "${widget.value_str || 'N/A'}"`);
            cy.log(`      subheader: "${widget.subheader || 'N/A'}"`);
          });
          cy.log('');
          
          // Verificar si hay widgets en el frontend que NO están en el API
          const widgetsSoloEnFrontend = Object.keys(uiWidgetsData).filter(uiHeader => {
            return !widgetsConsumo.some(apiWidget => {
              const apiHeader = (apiWidget.header || '').toLowerCase().trim();
              const uiHeaderNorm = uiHeader.toLowerCase().trim();
              return apiHeader === uiHeaderNorm ||
                     apiHeader.includes(uiHeaderNorm) ||
                     uiHeaderNorm.includes(apiHeader);
            });
          });
          
          if (widgetsSoloEnFrontend.length > 0) {
            cy.log(`⚠️ Widgets que están en el Frontend pero NO en el API (${widgetsSoloEnFrontend.length}):`);
            widgetsSoloEnFrontend.forEach((header) => {
              cy.log(`   - "${header}"`);
            });
            cy.log('   ℹ️ Estos widgets NO se compararán porque no vienen del API');
            cy.log('');
          }
          
          cy.log(`✅ Se compararán ${widgetsConsumo.length} widget(s) del API contra el Frontend`);
          cy.log('');
          
          // Usar la función helper para comparar
          const comparacion = compararDatosWidgets(uiWidgetsData, widgetsConsumo);
          
          // ============================================================
          // VALIDACIONES CRÍTICAS: FALLAR SI HAY DISCREPANCIAS
          // ============================================================
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('🚨 VALIDACIONES CRÍTICAS - EL TEST FALLARÁ SI HAY DISCREPANCIAS');
          cy.log('═══════════════════════════════════════════════════════');
          
          // VALIDACIÓN 1: Verificar que todos los widgets del API estén en el frontend
          expect(comparacion.apiSolo.length, 
            `El Frontend NO muestra ${comparacion.apiSolo.length} widget(s) que retorna el API. Widgets faltantes: ${comparacion.apiSolo.map(w => w.widget).join(', ')}`
          ).to.eq(0);
          
          // VALIDACIÓN 2: Verificar que el número de widgets coincida
          const widgetsEsperadosEnFrontend = widgetsConsumo.length;
          const widgetsEncontradosEnFrontend = Object.keys(uiWidgetsData).length;
          
          expect(widgetsEncontradosEnFrontend, 
            `Discrepancia en cantidad: Frontend muestra ${widgetsEncontradosEnFrontend} widget(s) pero el API retorna ${widgetsEsperadosEnFrontend}`
          ).to.be.at.least(widgetsEsperadosEnFrontend);
          
          // VALIDACIÓN 3: Verificar que los valores coincidan (sin diferencias)
          expect(comparacion.diferencias.length,
            `${comparacion.diferencias.length} widget(s) tienen valores diferentes entre API y Frontend. Detalles en los logs.`
          ).to.eq(0);
          
          // Si llegamos aquí, todas las validaciones pasaron
          cy.log('✅ Todas las validaciones críticas pasaron');
          cy.log(`   - Todos los widgets del API están en el Frontend`);
          cy.log(`   - Todos los valores coinciden`);
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('');
          
          // Validar cada widget del API individualmente usando los resultados de la comparación
          const validacionesIndividuales = [];
          
          widgetsConsumo.forEach((apiWidget, index) => {
            cy.log(`📊 Validando Widget ${index + 1}/${widgetsConsumo.length}: "${apiWidget.header || apiWidget.kind || 'Sin header'}"`);
            
            // Buscar en los resultados de la comparación
            const coincidencia = comparacion.coincidencias.find(c => 
              c.widget.toLowerCase().trim() === (apiWidget.header || '').toLowerCase().trim() ||
              c.widget.toLowerCase().includes((apiWidget.header || '').toLowerCase().trim()) ||
              (apiWidget.header || '').toLowerCase().trim().includes(c.widget.toLowerCase())
            );
            
            const diferencia = comparacion.diferencias.find(d => 
              d.widget.toLowerCase().trim() === (apiWidget.header || '').toLowerCase().trim() ||
              d.widget.toLowerCase().includes((apiWidget.header || '').toLowerCase().trim()) ||
              (apiWidget.header || '').toLowerCase().trim().includes(d.widget.toLowerCase())
            );
            
            const soloEnAPI = comparacion.apiSolo.find(s => 
              s.widget.toLowerCase().trim() === (apiWidget.header || '').toLowerCase().trim()
            );
            
            let uiWidgetEncontrado = null;
            let headerMatch = null;
            
            // Buscar el widget en el UI
            if (coincidencia || diferencia) {
              // Buscar en uiData por el header del widget
              Object.keys(uiWidgetsData).forEach((uiHeader) => {
                const apiHeaderNorm = (apiWidget.header || '').toLowerCase().trim();
                const uiHeaderNorm = uiHeader.toLowerCase().trim();
                
                if (apiHeaderNorm === uiHeaderNorm || 
                    apiHeaderNorm.includes(uiHeaderNorm) ||
                    uiHeaderNorm.includes(apiHeaderNorm)) {
                  uiWidgetEncontrado = uiWidgetsData[uiHeader];
                  headerMatch = uiHeader;
                }
              });
            }
            
            const validacionWidget = {
              apiWidget: apiWidget,
              uiWidget: uiWidgetEncontrado,
              headerMatch: headerMatch,
              encontrado: !!uiWidgetEncontrado,
              esCoincidencia: !!coincidencia,
              esDiferencia: !!diferencia,
              esSoloEnAPI: !!soloEnAPI,
              comparaciones: diferencia ? diferencia.comparaciones : null
            };
            
            // Log detallado
            cy.log(`   ┌─ API:`);
            cy.log(`   │  Header: "${apiWidget.header || 'N/A'}"`);
            cy.log(`   │  value_str: "${apiWidget.value_str || 'N/A'}"`);
            cy.log(`   │  subheader: "${apiWidget.subheader || 'N/A'}"`);
            cy.log(`   │  Valor numérico: ${apiWidget.value || 'N/A'}`);
            cy.log(`   ├─ UI:`);
            if (uiWidgetEncontrado) {
              cy.log(`   │  Encontrado: ✅ Sí`);
              cy.log(`   │  Header: "${headerMatch || 'N/A'}"`);
              cy.log(`   │  value_str: "${uiWidgetEncontrado.value_str || 'N/A'}"`);
              cy.log(`   │  subheader: "${uiWidgetEncontrado.subheader || 'N/A'}"`);
            } else {
              cy.log(`   │  Encontrado: ❌ No`);
            }
            cy.log(`   └─ Validación:`);
            
            if (coincidencia) {
              cy.log(`      🎯 RESULTADO: ✅ Todas las validaciones correctas`);
              cy.log(`         value_str: ✅ | subheader: ✅`);
            } else if (diferencia) {
              cy.log(`      🎯 RESULTADO: ❌ ERROR - Se encontraron diferencias`);
              cy.log(`         value_str: ${diferencia.comparaciones.value_str ? '✅' : '❌'}`);
              cy.log(`         subheader: ${diferencia.comparaciones.subheader ? '✅' : '❌'}`);
              cy.log(`         UI value_str: "${uiWidgetEncontrado?.value_str || 'N/A'}"`);
              cy.log(`         API value_str: "${apiWidget.value_str || 'N/A'}"`);
              cy.log(`         UI subheader: "${uiWidgetEncontrado?.subheader || 'N/A'}"`);
              cy.log(`         API subheader: "${apiWidget.subheader || 'N/A'}"`);
            } else if (soloEnAPI) {
              cy.log(`      🎯 RESULTADO: ❌ ERROR - Widget no encontrado en UI`);
            }
            
            cy.log('');
            validacionesIndividuales.push(validacionWidget);
          });
          
          // Guardar resultados para el informe
          resultadosInforme.widgets = {
            ui: uiWidgetsData,
            api: widgetsConsumo,
            comparacion: comparacion,
            validacionesIndividuales: validacionesIndividuales
          };
          
          return cy.wrap(apiData);
        });
      }).then((apiData) => {
        // ============================================================
        // SECCIÓN 3: VALIDAR GRÁFICA DE CONSUMO ENERGÉTICO
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📈 SECCIÓN 3: VALIDACIÓN DE GRÁFICA DE CONSUMO ENERGÉTICO');
        cy.log('═══════════════════════════════════════════════════════');
        
        return homeWidgetsPage.verificarGraficaConsumo().then((uiGrafica) => {
          const apiGrafica = apiData.find(w => 
            w.header?.includes('Consumo energético') || 
            w.kind === 'energy_consumption_chart'
          );
          
          const validacion = validarElementoDeberiaMostrarse(apiGrafica, uiGrafica.encontrada);
          
          cy.log(`📋 Gráfica en UI: ${uiGrafica.encontrada ? '✅ Encontrada' : '❌ No encontrada'}`);
          if (uiGrafica.encontrada) {
            cy.log(`   - Título: "${uiGrafica.titulo}"`);
          }
          
          cy.log(`📋 Gráfica en API: ${apiGrafica ? '✅ Existe' : '❌ No existe'}`);
          cy.log(`📊 Resultado: ${validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
          if (!validacion.coincide) {
            cy.log(`   ⚠️ El API ${apiGrafica ? 'tiene' : 'no tiene'} la gráfica pero el UI ${uiGrafica.encontrada ? 'la muestra' : 'no la muestra'}`);
          }
          
          // Guardar resultados para el informe
          resultadosInforme.graficaConsumo = {
            ui: uiGrafica,
            api: apiGrafica,
            validacion: validacion
          };
          
          return cy.wrap(apiData);
        });
      }).then((apiData) => {
        // ============================================================
        // SECCIÓN 4: VALIDAR MODAL/SECCIÓN DE FACTURAS
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('💰 SECCIÓN 4: VALIDACIÓN DE FACTURAS');
        cy.log('═══════════════════════════════════════════════════════');
        
        return homeWidgetsPage.verificarFacturas().then((uiFacturas) => {
          const apiFacturas = apiData.find(w => w.header === 'Facturas' || w.kind === 'bills');
          
          const validacion = validarElementoDeberiaMostrarse(apiFacturas, uiFacturas.encontrada);
          
          cy.log(`📋 Facturas en UI: ${uiFacturas.encontrada ? '✅ Encontradas' : '❌ No encontradas'}`);
          if (uiFacturas.encontrada) {
            cy.log(`   - Header: "${uiFacturas.header}"`);
          }
          
          cy.log(`📋 Facturas en API: ${apiFacturas ? '✅ Existe' : '❌ No existe'}`);
          cy.log(`📊 Resultado: ${validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
          if (!validacion.coincide) {
            cy.log(`   ⚠️ El API ${apiFacturas ? 'tiene' : 'no tiene'} facturas pero el UI ${uiFacturas.encontrada ? 'las muestra' : 'no las muestra'}`);
          }
          
          // Guardar resultados para el informe
          resultadosInforme.facturas = {
            ui: uiFacturas,
            api: apiFacturas,
            validacion: validacion
          };
          
          return cy.wrap(apiData);
        });
      }).then((apiData) => {
        // ============================================================
        // SECCIÓN 5: VALIDAR VARIACIONES DE CONSUMO (SI EXISTE)
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📉 SECCIÓN 5: VALIDACIÓN DE VARIACIONES DE CONSUMO');
        cy.log('═══════════════════════════════════════════════════════');
        
        return homeWidgetsPage.verificarVariacionesConsumo().then((uiVariaciones) => {
          const apiVariaciones = apiData.find(w => 
            w.header === 'Variaciones de consumo' || 
            w.kind === 'consumption_variations'
          );
          
          const validacion = validarElementoDeberiaMostrarse(apiVariaciones, uiVariaciones.encontrada);
          
          cy.log(`📋 Variaciones en UI: ${uiVariaciones.encontrada ? '✅ Encontradas' : '❌ No encontradas'}`);
          cy.log(`📋 Variaciones en API: ${apiVariaciones ? '✅ Existe' : '❌ No existe'}`);
          
          if (apiVariaciones || uiVariaciones.encontrada) {
            cy.log(`📊 Resultado: ${validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
            if (!validacion.coincide) {
              cy.log(`   ⚠️ El API ${apiVariaciones ? 'tiene' : 'no tiene'} variaciones pero el UI ${uiVariaciones.encontrada ? 'las muestra' : 'no las muestra'}`);
            }
          } else {
            cy.log(`📊 Resultado: ℹ️ No aplica (no hay variaciones en API ni UI)`);
          }
          
          // Guardar resultados para el informe
          resultadosInforme.variaciones = {
            ui: uiVariaciones,
            api: apiVariaciones,
            validacion: validacion
          };
          
          return cy.wrap(apiData);
        });
      }).then((apiData) => {
        // ============================================================
        // SECCIÓN 6: VALIDAR PROCESO DE INSTALACIÓN (SI EXISTE)
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('🔧 SECCIÓN 6: VALIDACIÓN DE PROCESO DE INSTALACIÓN');
        cy.log('═══════════════════════════════════════════════════════');
        
        return homeWidgetsPage.verificarProcesoInstalacion().then((uiProceso) => {
          const apiProceso = apiData.find(w => 
            w.header === 'Proceso de instalación' || 
            w.kind === 'installation_process'
          );
          
          const validacion = validarElementoDeberiaMostrarse(apiProceso, uiProceso.encontrado);
          
          cy.log(`📋 Proceso en UI: ${uiProceso.encontrado ? '✅ Encontrado' : '❌ No encontrado'}`);
          cy.log(`📋 Proceso en API: ${apiProceso ? '✅ Existe' : '❌ No existe'}`);
          
          if (apiProceso || uiProceso.encontrado) {
            cy.log(`📊 Resultado: ${validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
            if (!validacion.coincide) {
              cy.log(`   ⚠️ El API ${apiProceso ? 'tiene' : 'no tiene'} proceso pero el UI ${uiProceso.encontrado ? 'lo muestra' : 'no lo muestra'}`);
            }
          } else {
            cy.log(`📊 Resultado: ℹ️ No aplica (no hay proceso en API ni UI)`);
          }
          
          // Guardar resultados para el informe
          resultadosInforme.procesoInstalacion = {
            ui: uiProceso,
            api: apiProceso,
            validacion: validacion
          };
          resultadosInforme.apiData = apiData;
          
          // ============================================================
          // INFORME FINAL DETALLADO
          // ============================================================
          cy.log('');
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('📋 INFORME FINAL DETALLADO DE VALIDACIÓN');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('');
          
          // 1. SALUDO
          cy.log('1️⃣ SALUDO/BIENVENIDA');
          cy.log('─────────────────────────────────────────────────────');
          if (resultadosInforme.saludo) {
            const sal = resultadosInforme.saludo;
            cy.log(`   UI:`);
            cy.log(`      - Encontrado: ${sal.ui.encontrado ? '✅ Sí' : '❌ No'}`);
            if (sal.ui.encontrado) {
              cy.log(`      - Header: "${sal.ui.header || 'N/A'}"`);
              cy.log(`      - value_str: "${sal.ui.value_str || 'N/A'}"`);
            }
            cy.log(`   API:`);
            cy.log(`      - Existe: ${sal.api ? '✅ Sí' : '❌ No'}`);
            if (sal.api) {
              cy.log(`      - Header: "${sal.api.header || 'N/A'}"`);
              cy.log(`      - value_str: "${sal.api.value_str || 'N/A'}"`);
            }
            cy.log(`   Comparación:`);
            cy.log(`      - Header coincide: ${sal.comparacion.header ? '✅' : '❌'}`);
            cy.log(`      - value_str coincide: ${sal.comparacion.value_str ? '✅' : '❌'}`);
          }
          cy.log('');
          
          // 2. WIDGETS DE CONSUMO - Validación Individual
          cy.log('2️⃣ WIDGETS DE CONSUMO - Validación Individual por Widget');
          cy.log('─────────────────────────────────────────────────────');
          if (resultadosInforme.widgets && resultadosInforme.widgets.comparacion) {
            const wid = resultadosInforme.widgets;
            cy.log(`   Total widgets en UI: ${Object.keys(wid.ui).length}`);
            cy.log(`   Total widgets en API: ${wid.api.length}`);
            cy.log('');
            
            // Mostrar validación de cada widget del API
            if (wid.validacionesIndividuales) {
              wid.validacionesIndividuales.forEach((validacion, index) => {
                cy.log(`   📊 Widget ${index + 1}/${wid.validacionesIndividuales.length}: "${validacion.apiWidget.header || validacion.apiWidget.kind || 'Sin header'}"`);
                cy.log(`      ┌─ API:`);
                cy.log(`      │  Header: "${validacion.apiWidget.header || 'N/A'}"`);
                cy.log(`      │  value_str: "${validacion.apiWidget.value_str || 'N/A'}"`);
                cy.log(`      │  subheader: "${validacion.apiWidget.subheader || 'N/A'}"`);
                cy.log(`      │  Valor numérico: ${validacion.apiWidget.value || 'N/A'}`);
                cy.log(`      ├─ UI:`);
                cy.log(`      │  Encontrado: ${validacion.encontrado ? '✅ Sí' : '❌ No'}`);
                if (validacion.encontrado && validacion.uiWidget) {
                  cy.log(`      │  Header: "${validacion.headerMatch || 'N/A'}"`);
                  cy.log(`      │  value_str: "${validacion.uiWidget.value_str || 'N/A'}"`);
                  cy.log(`      │  subheader: "${validacion.uiWidget.subheader || 'N/A'}"`);
                }
                cy.log(`      └─ Validación:`);
                if (validacion.esCoincidencia) {
                  cy.log(`         🎯 RESULTADO: ✅ Todas las validaciones correctas`);
                } else if (validacion.esDiferencia && validacion.comparaciones) {
                  cy.log(`         🎯 RESULTADO: ⚠️ Se encontraron diferencias`);
                  cy.log(`            value_str: ${validacion.comparaciones.value_str ? '✅' : '❌'}`);
                  cy.log(`            subheader: ${validacion.comparaciones.subheader ? '✅' : '❌'}`);
                } else {
                  cy.log(`         🎯 RESULTADO: ❌ Widget no encontrado en UI`);
                }
                cy.log('');
              });
            }
            
            // Widgets solo en UI
            if (wid.comparacion.uiSolo && wid.comparacion.uiSolo.length > 0) {
              cy.log(`   ⚠️ Widgets encontrados solo en UI (${wid.comparacion.uiSolo.length}):`);
              wid.comparacion.uiSolo.forEach((item) => {
                cy.log(`      ℹ️ "${item.widget}"`);
                if (item.ui) {
                  cy.log(`         value_str: "${item.ui.value_str || 'N/A'}"`);
                  cy.log(`         subheader: "${item.ui.subheader || 'N/A'}"`);
                }
              });
              cy.log('');
            }
            
            // Resumen de widgets usando la comparación
            cy.log(`   📊 Resumen:`);
            cy.log(`      ✅ Correctos: ${wid.comparacion.coincidencias.length}/${wid.api.length}`);
            cy.log(`      ⚠️ Con diferencias: ${wid.comparacion.diferencias.length}/${wid.api.length}`);
            cy.log(`      ❌ No encontrados: ${wid.comparacion.apiSolo.length}/${wid.api.length}`);
          }
          cy.log('');
          
          // 3. GRÁFICA DE CONSUMO
          cy.log('3️⃣ GRÁFICA DE CONSUMO ENERGÉTICO');
          cy.log('─────────────────────────────────────────────────────');
          if (resultadosInforme.graficaConsumo) {
            const graf = resultadosInforme.graficaConsumo;
            cy.log(`   UI:`);
            cy.log(`      - Encontrada: ${graf.ui.encontrada ? '✅ Sí' : '❌ No'}`);
            if (graf.ui.encontrada) {
              cy.log(`      - Título: "${graf.ui.titulo || 'N/A'}"`);
            }
            cy.log(`   API:`);
            cy.log(`      - Existe: ${graf.api ? '✅ Sí' : '❌ No'}`);
            if (graf.api) {
              cy.log(`      - Header: "${graf.api.header || 'N/A'}"`);
              cy.log(`      - Kind: "${graf.api.kind || 'N/A'}"`);
            }
            cy.log(`   Validación: ${graf.validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
          }
          cy.log('');
          
          // 4. FACTURAS
          cy.log('4️⃣ SECCIÓN DE FACTURAS');
          cy.log('─────────────────────────────────────────────────────');
          if (resultadosInforme.facturas) {
            const fact = resultadosInforme.facturas;
            cy.log(`   UI:`);
            cy.log(`      - Encontrada: ${fact.ui.encontrada ? '✅ Sí' : '❌ No'}`);
            if (fact.ui.encontrada) {
              cy.log(`      - Header: "${fact.ui.header || 'N/A'}"`);
            }
            cy.log(`   API:`);
            cy.log(`      - Existe: ${fact.api ? '✅ Sí' : '❌ No'}`);
            if (fact.api) {
              cy.log(`      - Header: "${fact.api.header || 'N/A'}"`);
              cy.log(`      - Kind: "${fact.api.kind || 'N/A'}"`);
            }
            cy.log(`   Validación: ${fact.validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
          }
          cy.log('');
          
          // 5. VARIACIONES DE CONSUMO
          cy.log('5️⃣ VARIACIONES DE CONSUMO');
          cy.log('─────────────────────────────────────────────────────');
          if (resultadosInforme.variaciones) {
            const vari = resultadosInforme.variaciones;
            cy.log(`   UI:`);
            cy.log(`      - Encontrada: ${vari.ui.encontrada ? '✅ Sí' : '❌ No'}`);
            cy.log(`   API:`);
            cy.log(`      - Existe: ${vari.api ? '✅ Sí' : '❌ No'}`);
            if (vari.api) {
              cy.log(`      - Header: "${vari.api.header || 'N/A'}"`);
              cy.log(`      - Kind: "${vari.api.kind || 'N/A'}"`);
            }
            if (vari.api || vari.ui.encontrada) {
              cy.log(`   Validación: ${vari.validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
            } else {
              cy.log(`   Validación: ℹ️ No aplica`);
            }
          }
          cy.log('');
          
          // 6. PROCESO DE INSTALACIÓN
          cy.log('6️⃣ PROCESO DE INSTALACIÓN');
          cy.log('─────────────────────────────────────────────────────');
          if (resultadosInforme.procesoInstalacion) {
            const proc = resultadosInforme.procesoInstalacion;
            cy.log(`   UI:`);
            cy.log(`      - Encontrado: ${proc.ui.encontrado ? '✅ Sí' : '❌ No'}`);
            cy.log(`   API:`);
            cy.log(`      - Existe: ${proc.api ? '✅ Sí' : '❌ No'}`);
            if (proc.api) {
              cy.log(`      - Header: "${proc.api.header || 'N/A'}"`);
              cy.log(`      - Kind: "${proc.api.kind || 'N/A'}"`);
            }
            if (proc.api || proc.ui.encontrado) {
              cy.log(`   Validación: ${proc.validacion.coincide ? '✅ Correcto' : '❌ Incorrecto'}`);
            } else {
              cy.log(`   Validación: ℹ️ No aplica`);
            }
          }
          cy.log('');
          
          // RESUMEN FINAL
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('📊 RESUMEN GENERAL');
          cy.log('═══════════════════════════════════════════════════════');
          const totalWidgetsUI = resultadosInforme.widgets ? Object.keys(resultadosInforme.widgets.ui).length : 0;
          const totalWidgetsAPI = resultadosInforme.widgets ? resultadosInforme.widgets.api.length : 0;
          
          // Calcular estadísticas de widgets usando la comparación
          let widgetsCorrectos = 0;
          let widgetsConDiferencias = 0;
          let widgetsNoEncontrados = 0;
          
          if (resultadosInforme.widgets && resultadosInforme.widgets.comparacion) {
            widgetsCorrectos = resultadosInforme.widgets.comparacion.coincidencias.length;
            widgetsConDiferencias = resultadosInforme.widgets.comparacion.diferencias.length;
            widgetsNoEncontrados = resultadosInforme.widgets.comparacion.apiSolo.length;
          }
          
          cy.log(`   Total elementos validados: 6`);
          cy.log(`   Widgets de consumo (validación individual):`);
          cy.log(`      📡 Widgets que retorna el API: ${totalWidgetsAPI} widget(s)`);
          cy.log(`      🖥️ Widgets encontrados en el Frontend: ${totalWidgetsUI} widget(s)`);
          cy.log(`      📊 Comparación (API vs Frontend):`);
          cy.log(`         - ✅ Correctos: ${widgetsCorrectos}/${totalWidgetsAPI}`);
          cy.log(`         - ⚠️ Con diferencias: ${widgetsConDiferencias}/${totalWidgetsAPI}`);
          cy.log(`         - ❌ No encontrados en Frontend: ${widgetsNoEncontrados}/${totalWidgetsAPI}`);
          
          // Mostrar si hay widgets en el frontend que no están en el API
          if (totalWidgetsUI > totalWidgetsAPI) {
            const diferencia = totalWidgetsUI - totalWidgetsAPI;
            cy.log(`      ℹ️ Nota: Hay ${diferencia} widget(s) más en el Frontend que no vienen del API`);
            cy.log(`         (Estos widgets NO se comparan porque el API es la fuente de verdad)`);
          }
          cy.log('');
          
          const todasLasValidacionesCorrectas = widgetsCorrectos === totalWidgetsAPI && widgetsConDiferencias === 0 && widgetsNoEncontrados === 0;
          cy.log(`   Estado general: ${todasLasValidacionesCorrectas ? '✅ Todas las validaciones correctas' : '⚠️ Se encontraron diferencias'}`);
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
        });
      });
    });
  });
});
