// Archivo temporal para debug - entender qué está pasando con los widgets
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import HomeWidgetsPage from '../../../pages/Home/HomeWidgetsPage.js';
import { INTERCEPTS } from '../../../pages/config.js';
import { llamarApiWidgets, extraerContractIds } from '../../../support/helpers.js';

describe('DEBUG - Análisis de Widgets', () => {
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

  it('DEBUG: Analizar qué widgets hay en UI y API', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';

    // Login
    loginPage.loginCompleto(email, password);

    cy.wait(`@${INTERCEPTS.SIGNIN}`, { timeout: 20000 }).then((interception) => {
      authToken = interception.response.body.access_token;
      cy.log('✅ Token obtenido');
      return cy.wrap(authToken);
    }).then((token) => {
      cy.url({ timeout: 20000 }).should('include', '/home');
      
      return cy.wait(`@${INTERCEPTS.CONTRACTS}`, { timeout: 30000 }).then((interception) => {
        contractIds = extraerContractIds(interception.response.body);
        cy.log(`✅ ${contractIds.length} contratos obtenidos`);
        return cy.wrap({ token, contractIds });
      });
    }).then(({ token, contractIds: ids }) => {
      homePage.verificarQueCargo();
      homeWidgetsPage.esperarWidgetsCarguen();
      cy.wait(5000); // Esperar más tiempo para que carguen los widgets

      // ============================================================
      // PASO 1: OBTENER DATOS DEL API
      // ============================================================
      cy.log('');
      cy.log('═══════════════════════════════════════════════════════');
      cy.log('📡 PASO 1: OBTENER DATOS DEL API');
      cy.log('═══════════════════════════════════════════════════════');
      
      const fechaActual = new Date().toISOString().split('T')[0];
      
      return llamarApiWidgets(token, ids, 'monthly', fechaActual, 'America/Bogota').then((apiResponse) => {
        const apiData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.widgets || []);
        
        cy.log(`📊 Total widgets del API: ${apiData.length}`);
        cy.log('');
        
        // Mostrar TODOS los widgets del API
        apiData.forEach((widget, index) => {
          cy.log(`Widget API ${index + 1}:`);
          cy.log(`  header: "${widget.header || 'N/A'}"`);
          cy.log(`  kind: "${widget.kind || 'N/A'}"`);
          cy.log(`  value_str: "${widget.value_str || 'N/A'}"`);
          cy.log(`  subheader: "${widget.subheader || 'N/A'}"`);
          cy.log(`  value: ${widget.value || 'N/A'}`);
          cy.log(`  type: "${widget.type || 'N/A'}"`);
          cy.log('');
        });
        
        // Filtrar widgets de consumo
        const widgetsConsumo = apiData.filter(w => 
          w.kind === 'active_energy_consumption' || 
          w.header?.includes('Consumo')
        );
        
        cy.log(`📊 Widgets de consumo del API: ${widgetsConsumo.length}`);
        widgetsConsumo.forEach((widget, index) => {
          cy.log(`  ${index + 1}. "${widget.header}"`);
          cy.log(`     Header exacto: "${widget.header}"`);
          cy.log(`     Header normalizado (trim): "${widget.header.trim()}"`);
          cy.log(`     Header normalizado (lowercase): "${widget.header.toLowerCase().trim()}"`);
        });
        
        return cy.wrap(apiData);
      }).then((apiData) => {
        // ============================================================
        // PASO 2: OBTENER DATOS DEL UI
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('🖥️ PASO 2: OBTENER DATOS DEL UI');
        cy.log('═══════════════════════════════════════════════════════');
        
        return homeWidgetsPage.obtenerDatosWidgets().then((uiWidgetsData) => {
          cy.log(`📊 Total widgets del UI: ${Object.keys(uiWidgetsData).length}`);
          cy.log('');
          
          // Mostrar TODOS los widgets del UI
          Object.keys(uiWidgetsData).forEach((key, index) => {
            const widget = uiWidgetsData[key];
            cy.log(`Widget UI ${index + 1}:`);
            cy.log(`  header (key): "${key}"`);
            cy.log(`  header (widget.header): "${widget.header || 'N/A'}"`);
            cy.log(`  Header normalizado (trim): "${key.trim()}"`);
            cy.log(`  Header normalizado (lowercase): "${key.toLowerCase().trim()}"`);
            cy.log(`  value_str: "${widget.value_str || 'N/A'}"`);
            cy.log(`  subheader: "${widget.subheader || 'N/A'}"`);
            cy.log('');
          });
          
          // ============================================================
          // PASO 3: INTENTAR MATCHING MANUAL
          // ============================================================
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('🔍 PASO 3: INTENTAR MATCHING MANUAL');
          cy.log('═══════════════════════════════════════════════════════');
          
          const widgetsConsumo = apiData.filter(w => 
            w.kind === 'active_energy_consumption' || 
            w.header?.includes('Consumo')
          );
          
          widgetsConsumo.forEach((apiWidget) => {
            const apiHeader = apiWidget.header.trim();
            cy.log(`Buscando match para API: "${apiHeader}"`);
            
            // Intentar diferentes estrategias de matching
            let encontrado = false;
            
            // Estrategia 1: Coincidencia exacta
            if (uiWidgetsData[apiHeader]) {
              cy.log(`  ✅ Estrategia 1 (exacta): ENCONTRADO`);
              encontrado = true;
            }
            
            // Estrategia 2: Coincidencia case-insensitive
            if (!encontrado) {
              const uiKeys = Object.keys(uiWidgetsData);
              const matchCaseInsensitive = uiKeys.find(key => 
                key.toLowerCase().trim() === apiHeader.toLowerCase().trim()
              );
              if (matchCaseInsensitive) {
                cy.log(`  ✅ Estrategia 2 (case-insensitive): ENCONTRADO -> "${matchCaseInsensitive}"`);
                encontrado = true;
              }
            }
            
            // Estrategia 3: Contains
            if (!encontrado) {
              const uiKeys = Object.keys(uiWidgetsData);
              const matchContains = uiKeys.find(key => {
                const keyNorm = key.toLowerCase().trim();
                const apiNorm = apiHeader.toLowerCase().trim();
                return keyNorm.includes(apiNorm) || apiNorm.includes(keyNorm);
              });
              if (matchContains) {
                cy.log(`  ✅ Estrategia 3 (contains): ENCONTRADO -> "${matchContains}"`);
                encontrado = true;
              }
            }
            
            // Estrategia 4: Palabras clave
            if (!encontrado) {
              const palabrasClave = ['hoy', 'semana', 'mes'];
              const palabraEnAPI = palabrasClave.find(p => apiHeader.toLowerCase().includes(p));
              
              if (palabraEnAPI) {
                const uiKeys = Object.keys(uiWidgetsData);
                const matchPalabra = uiKeys.find(key => 
                  key.toLowerCase().includes(palabraEnAPI)
                );
                if (matchPalabra) {
                  cy.log(`  ✅ Estrategia 4 (palabra clave "${palabraEnAPI}"): ENCONTRADO -> "${matchPalabra}"`);
                  encontrado = true;
                }
              }
            }
            
            if (!encontrado) {
              cy.log(`  ❌ NO ENCONTRADO`);
              cy.log(`     Headers disponibles en UI:`);
              Object.keys(uiWidgetsData).forEach(key => {
                cy.log(`       - "${key}"`);
              });
            }
            
            cy.log('');
          });
          
          // ============================================================
          // PASO 4: ANALIZAR EL DOM REAL
          // ============================================================
          cy.log('');
          cy.log('═══════════════════════════════════════════════════════');
          cy.log('🔍 PASO 4: ANALIZAR EL DOM REAL');
          cy.log('═══════════════════════════════════════════════════════');
          
          cy.get('body').then(($body) => {
            // Buscar todos los elementos que contengan "Consumo"
            const $elementosConsumo = $body.find('*').filter((i, el) => {
              const $el = Cypress.$(el);
              const text = $el.text().trim();
              return text.includes('Consumo') && $el.is(':visible');
            });
            
            cy.log(`📊 Elementos visibles con "Consumo": ${$elementosConsumo.length}`);
            
            // Mostrar los primeros 10 elementos encontrados
            $elementosConsumo.slice(0, 10).each((i, el) => {
              const $el = Cypress.$(el);
              const text = $el.text().trim().substring(0, 100);
              cy.log(`  ${i + 1}. Texto: "${text}..."`);
              cy.log(`     Tag: ${el.tagName}, Classes: ${el.className}`);
            });
          });
        });
      });
    });
  });
});
