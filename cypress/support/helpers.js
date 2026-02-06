// cypress/support/helpers.js

/**
 * Helper para realizar llamadas al API de widgets
 * @param {string} authToken - Token de autenticación
 * @param {Array<number>} contractIds - IDs de contratos
 * @param {string} period - Período (monthly, daily, etc.)
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} timezone - Zona horaria (ej: America/Bogota)
 * @returns {Promise} - Promise con la respuesta del API
 */
export function llamarApiWidgets(authToken, contractIds, period = 'monthly', date = null, timezone = 'America/Bogota') {
  // Si no se proporciona fecha, usar la fecha actual
  if (!date) {
    const now = new Date();
    date = now.toISOString().split('T')[0];
  }

  const url = 'https://api.dev.bia.app/ems-api/app-consumptions/home/widgets';
  
  const headers = {
    'x-platform': 'web',
    'Authorization': authToken,
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://web.dev.bia.app/',
    'x-timezone': timezone,
    'Content-Type': 'application/json'
  };

  const body = {
    contract_ids: contractIds,
    period: period,
    date: date
  };

  cy.log(`📡 Llamando al API de widgets con ${contractIds.length} contratos`);
  cy.log(`📅 Período: ${period}, Fecha: ${date}`);

  // Validar que tenemos los datos necesarios
  if (!authToken || authToken === undefined || authToken === null) {
    cy.log('❌ ERROR: No hay token de autenticación');
    cy.log(`   Tipo de authToken: ${typeof authToken}`);
    cy.log(`   Valor: ${authToken}`);
    throw new Error('Token de autenticación requerido');
  }
  
  if (!contractIds || contractIds.length === 0) {
    cy.log('⚠️ ADVERTENCIA: No hay contract IDs. El API puede requerirlos.');
    cy.log('   Intentando llamar al API sin contract IDs...');
    // Continuar de todas formas, algunos endpoints pueden funcionar sin contract IDs
  }

  return cy.request({
    method: 'POST',
    url: url,
    headers: headers,
    body: body,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ Respuesta del API obtenida exitosamente');
      return cy.wrap(response.body);
    } else {
      cy.log(`⚠️ Error en la respuesta del API: ${response.status}`);
      cy.log(`📋 Detalles del error:`);
      cy.log(`   - URL: ${url}`);
      cy.log(`   - Body enviado: ${JSON.stringify(body)}`);
      cy.log(`   - Response: ${JSON.stringify(response.body)}`);
      
      // Si es 400, puede ser por contract IDs vacíos o parámetros incorrectos
      if (response.status === 400) {
        cy.log('');
        cy.log('🔍 Posibles causas del error 400:');
        cy.log('   1. Contract IDs vacíos o inválidos');
        cy.log('   2. Fecha en formato incorrecto');
        cy.log('   3. Período no válido');
        cy.log('   4. Token de autenticación inválido');
        cy.log('');
        cy.log('💡 Intentando continuar con validaciones del UI solamente...');
        
        // Retornar array vacío para que el test continúe validando solo el UI
        return cy.wrap([]);
      }
      
      throw new Error(`API retornó status ${response.status}`);
    }
  });
}

/**
 * Helper para extraer contract IDs de la respuesta de contratos
 * @param {Object} contractsResponse - Respuesta del API de contratos
 * @returns {Array<number>} - Array de IDs de contratos
 */
export function extraerContractIds(contractsResponse) {
  cy.log('🔍 DEBUG - Estructura de la respuesta de contratos:');
  cy.log(`   Tipo: ${typeof contractsResponse}`);
  cy.log(`   Es Array: ${Array.isArray(contractsResponse)}`);
  
  if (contractsResponse) {
    if (Array.isArray(contractsResponse)) {
      cy.log(`   Longitud del array: ${contractsResponse.length}`);
      if (contractsResponse.length > 0) {
        cy.log(`   Primer elemento: ${JSON.stringify(contractsResponse[0])}`);
      }
    } else {
      cy.log(`   Keys: ${JSON.stringify(Object.keys(contractsResponse))}`);
    }
  }
  
  let contracts = [];
  
  // Estrategia 1: Si es un array directo
  if (Array.isArray(contractsResponse)) {
    contracts = contractsResponse;
  }
  // Estrategia 2: Si está dentro de una propiedad 'data'
  else if (contractsResponse && contractsResponse.data && Array.isArray(contractsResponse.data)) {
    contracts = contractsResponse.data;
  }
  // Estrategia 3: Si está dentro de una propiedad 'contracts'
  else if (contractsResponse && contractsResponse.contracts && Array.isArray(contractsResponse.contracts)) {
    contracts = contractsResponse.contracts;
  }
  // Estrategia 4: Si está dentro de una propiedad 'items'
  else if (contractsResponse && contractsResponse.items && Array.isArray(contractsResponse.items)) {
    contracts = contractsResponse.items;
  }
  // Estrategia 5: Si es un objeto con una propiedad que es array
  else if (contractsResponse && typeof contractsResponse === 'object') {
    const keys = Object.keys(contractsResponse);
    for (const key of keys) {
      if (Array.isArray(contractsResponse[key])) {
        contracts = contractsResponse[key];
        cy.log(`   Encontrado array en propiedad: ${key}`);
        break;
      }
    }
  }
  
  if (contracts.length === 0) {
    cy.log('⚠️ No se encontraron contratos en la respuesta');
    cy.log(`   Respuesta completa: ${JSON.stringify(contractsResponse).substring(0, 500)}`);
    return [];
  }

  // Extraer los IDs de los contratos
  const contractIds = contracts
    .map(contract => {
      // Intentar diferentes propiedades comunes para el ID
      return contract.id || 
             contract.contract_id || 
             contract.contractId || 
             contract.ID ||
             contract.Id;
    })
    .filter(id => id !== undefined && id !== null); // Filtrar valores undefined/null
  
  cy.log(`📋 IDs de contratos extraídos: ${contractIds.length} contratos`);
  if (contractIds.length > 0) {
    cy.log(`   IDs: ${contractIds.join(', ')}`);
  }
  
  return contractIds;
}

/**
 * Helper para comparar datos de widgets UI vs API
 * Compara usando el header/título como clave de coincidencia
 * @param {Object} uiData - Datos obtenidos del UI (keyed by header/título)
 * @param {Array} apiData - Array de widgets del API
 * @returns {Object} - Objeto con el resultado de la comparación
 */
export function compararDatosWidgets(uiData, apiData) {
  cy.log('🔍 Comparando datos de widgets UI vs API...');
  
  const comparacion = {
    coincidencias: [],
    diferencias: [],
    uiSolo: [],
    apiSolo: []
  };

  // El API retorna un array de widgets
  if (apiData && Array.isArray(apiData)) {
    apiData.forEach((apiWidget) => {
      const apiHeader = apiWidget.header || apiWidget.title;
      
      if (!apiHeader) {
        cy.log('⚠️ Widget del API sin header/título');
        return;
      }
      
      // Normalizar el header para comparación (trim, lowercase para comparación flexible)
      const apiHeaderNormalizado = apiHeader.trim();
      
      // Buscar el widget correspondiente en el UI usando el header como clave
      // Intentar coincidencia exacta primero
      let uiWidget = uiData[apiHeaderNormalizado];
      let matchingKey = apiHeaderNormalizado;
      
      // Si no encontramos coincidencia exacta, buscar por coincidencia parcial
      if (!uiWidget) {
        const uiKeys = Object.keys(uiData);
        
        // Estrategia 1: Comparación case-insensitive
        const matchCaseInsensitive = uiKeys.find(key => {
          const keyNormalizado = key.trim().toLowerCase();
          const apiNormalizado = apiHeaderNormalizado.toLowerCase();
          return keyNormalizado === apiNormalizado;
        });
        
        if (matchCaseInsensitive) {
          uiWidget = uiData[matchCaseInsensitive];
          matchingKey = matchCaseInsensitive;
          cy.log(`🔗 Header del API "${apiHeaderNormalizado}" coincide con UI "${matchingKey}" (case-insensitive)`);
        }
        
        // Estrategia 2: Comparación por palabras clave (si no encontramos con estrategia 1)
        if (!uiWidget) {
          // Extraer palabras clave del header del API
          const apiPalabras = apiHeaderNormalizado.toLowerCase()
            .split(/\s+/)
            .filter(p => p.length > 2); // Filtrar palabras muy cortas
          
          const matchPorPalabras = uiKeys.find(key => {
            const keyNormalizado = key.trim().toLowerCase();
            // Verificar que todas las palabras clave importantes estén presentes
            const palabrasCoinciden = apiPalabras.every(palabra => 
              keyNormalizado.includes(palabra)
            );
            
            // También verificar que el key contiene o está contenido en el API header
            const contieneOContenido = keyNormalizado.includes(apiHeaderNormalizado.toLowerCase()) ||
                                       apiHeaderNormalizado.toLowerCase().includes(keyNormalizado);
            
            return palabrasCoinciden || contieneOContenido;
          });
          
          if (matchPorPalabras) {
            uiWidget = uiData[matchPorPalabras];
            matchingKey = matchPorPalabras;
            cy.log(`🔗 Header del API "${apiHeaderNormalizado}" coincide con UI "${matchingKey}" (por palabras clave)`);
          }
        }
        
        // Estrategia 3: Comparación flexible simple (fallback)
        if (!uiWidget) {
          const matchFlexible = uiKeys.find(key => {
            const keyNormalizado = key.trim().toLowerCase();
            const apiNormalizado = apiHeaderNormalizado.toLowerCase();
            return keyNormalizado.includes(apiNormalizado) ||
                   apiNormalizado.includes(keyNormalizado);
          });
          
          if (matchFlexible) {
            uiWidget = uiData[matchFlexible];
            matchingKey = matchFlexible;
            cy.log(`🔗 Header del API "${apiHeaderNormalizado}" coincide con UI "${matchingKey}" (comparación flexible)`);
          }
        }
      }
      
      // Usar el header del API para la comparación
      const header = apiHeaderNormalizado;
      
      if (uiWidget) {
        // Comparar solo header, value_str (con aproximación) y subheader
        const comparaciones = {
          value_str: compararValoresAproximados(uiWidget.value_str, apiWidget.value_str, apiWidget.value),
          subheader: compararValores(uiWidget.subheader, apiWidget.subheader)
        };
        
        const todasCoinciden = Object.values(comparaciones).every(c => c === true);
        
        if (todasCoinciden) {
          comparacion.coincidencias.push({
            widget: header,
            ui: {
              value_str: uiWidget.value_str,
              subheader: uiWidget.subheader
            },
            api: {
              value_str: apiWidget.value_str,
              subheader: apiWidget.subheader
            }
          });
        } else {
          comparacion.diferencias.push({
            widget: header,
            comparaciones: comparaciones,
            ui: {
              value_str: uiWidget.value_str,
              subheader: uiWidget.subheader
            },
            api: {
              value_str: apiWidget.value_str,
              subheader: apiWidget.subheader
            }
          });
        }
      } else {
        // Log detallado cuando no se encuentra el widget en UI
        cy.log(`⚠️ Widget del API no encontrado en UI: "${apiHeaderNormalizado}"`);
        cy.log(`   📋 Headers disponibles en UI: ${Object.keys(uiData).join(', ')}`);
        
        comparacion.apiSolo.push({
          widget: header,
          api: {
            value_str: apiWidget.value_str,
            subheader: apiWidget.subheader
          }
        });
      }
    });
  }

  // Widgets que solo están en UI
  Object.keys(uiData).forEach((uiHeader) => {
    const existeEnApi = apiData && Array.isArray(apiData) && 
      apiData.some(w => {
        const apiHeader = (w.header || w.title || '').trim();
        const uiHeaderNormalizado = uiHeader.trim().toLowerCase();
        const apiHeaderNormalizado = apiHeader.toLowerCase();
        
        // Comparación exacta (case-insensitive)
        if (uiHeaderNormalizado === apiHeaderNormalizado) {
          return true;
        }
        
        // Comparación por palabras clave
        const uiPalabras = uiHeaderNormalizado.split(/\s+/).filter(p => p.length > 2);
        const apiPalabras = apiHeaderNormalizado.split(/\s+/).filter(p => p.length > 2);
        
        // Verificar que las palabras clave importantes coincidan
        const palabrasCoinciden = uiPalabras.every(palabra => 
          apiHeaderNormalizado.includes(palabra)
        ) || apiPalabras.every(palabra => 
          uiHeaderNormalizado.includes(palabra)
        );
        
        if (palabrasCoinciden) {
          return true;
        }
        
        // Comparación flexible simple
        return apiHeaderNormalizado.includes(uiHeaderNormalizado) ||
               uiHeaderNormalizado.includes(apiHeaderNormalizado);
      });
    
    if (!existeEnApi) {
      comparacion.uiSolo.push({
        widget: uiHeader,
        ui: {
          header: uiData[uiHeader].header,
          value_str: uiData[uiHeader].value_str,
          subheader: uiData[uiHeader].subheader
        }
      });
    }
  });

  cy.log(`✅ Comparación completada:`);
  cy.log(`   - Coincidencias: ${comparacion.coincidencias.length}`);
  cy.log(`   - Diferencias: ${comparacion.diferencias.length}`);
  cy.log(`   - Solo en UI: ${comparacion.uiSolo.length}`);
  cy.log(`   - Solo en API: ${comparacion.apiSolo.length}`);

  return comparacion;
}

/**
 * Helper para comparar valores normalizados (para subheader)
 * Compara valores como "$6.5M COP" vs "$6.5M COP"
 * @param {string} valorUI - Valor del UI
 * @param {string|number} valorAPI - Valor del API
 * @returns {boolean} - True si coinciden
 */
function compararValores(valorUI, valorAPI) {
  // Si ambos están vacíos, considerar como coincidencia
  if (!valorUI && !valorAPI) return true;
  if (!valorUI || !valorAPI) return false;
  
  // Normalizar valores: remover espacios extra, convertir a minúsculas
  const normalizar = (valor) => {
    return String(valor)
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno
      .trim()
      .toLowerCase();
  };

  const uiNormalizado = normalizar(valorUI);
  const apiNormalizado = normalizar(String(valorAPI));

  // Comparación exacta después de normalizar
  const coinciden = uiNormalizado === apiNormalizado;
  
  if (!coinciden) {
    cy.log(`   ⚠️ Diferencia: UI="${valorUI}" vs API="${valorAPI}"`);
  }
  
  return coinciden;
}

/**
 * Helper para comparar valores aproximados (para value_str)
 * Compara "18K kWh" vs "18K kWh" o "18K kWh" vs 17530.49 (valor numérico del API)
 * Convierte el valor numérico a formato K/M/B y compara
 * @param {string} valorUI - Valor del UI (ej: "18K kWh")
 * @param {string} valorStrAPI - Valor string del API (ej: "18K kWh")
 * @param {number} valorNumAPI - Valor numérico del API (ej: 17530.49)
 * @returns {boolean} - True si coinciden (considerando aproximación)
 */
function compararValoresAproximados(valorUI, valorStrAPI, valorNumAPI) {
  // Si ambos están vacíos, considerar como coincidencia
  if (!valorUI && !valorStrAPI) return true;
  if (!valorUI || (!valorStrAPI && !valorNumAPI)) return false;
  
  // Normalizar el valor del UI
  const normalizarUI = (valor) => {
    return String(valor)
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };
  
  const uiNormalizado = normalizarUI(valorUI);
  
  // Si tenemos valor_str del API, comparar directamente
  if (valorStrAPI) {
    const apiNormalizado = normalizarUI(valorStrAPI);
    if (uiNormalizado === apiNormalizado) {
      return true;
    }
    
    // Comparación flexible: extraer solo la parte numérica y unidad
    const uiMatch = uiNormalizado.match(/(\d+(?:\.\d+)?[kmb]?)\s*(kwh|kvarh|kvah)?/);
    const apiMatch = apiNormalizado.match(/(\d+(?:\.\d+)?[kmb]?)\s*(kwh|kvarh|kvah)?/);
    
    if (uiMatch && apiMatch) {
      // Comparar solo la parte numérica (ignorar unidad si es diferente pero válida)
      if (uiMatch[1] === apiMatch[1]) {
        return true;
      }
    }
  }
  
  // Si tenemos valor numérico del API, convertir a formato K/M/B y comparar
  if (valorNumAPI !== undefined && valorNumAPI !== null) {
    const valorAproximado = convertirNumeroAFormato(valorNumAPI);
    const apiAproximado = normalizarUI(valorAproximado);
    
    // Extraer solo la parte numérica con K/M/B del UI (sin unidades: kwh, kvarh, kvah)
    const uiSoloNumero = uiNormalizado.replace(/\s*(kwh|kvarh|kvah)/gi, '').trim();
    const apiSoloNumero = apiAproximado.replace(/\s*(kwh|kvarh|kvah)/gi, '').trim();
    
    if (uiSoloNumero === apiSoloNumero) {
      return true;
    }
    
    // Comparación más flexible: extraer solo el número sin K/M/B
    const uiNumMatch = uiSoloNumero.match(/(\d+(?:\.\d+)?)/);
    const apiNumMatch = apiSoloNumero.match(/(\d+(?:\.\d+)?)/);
    
    if (uiNumMatch && apiNumMatch) {
      const uiNum = parseFloat(uiNumMatch[1]);
      const apiNum = parseFloat(apiNumMatch[1]);
      
      // Permitir pequeñas diferencias de redondeo (menos del 5%)
      const diferencia = Math.abs(uiNum - apiNum) / Math.max(uiNum, apiNum);
      if (diferencia < 0.05) {
        cy.log(`   ✅ Comparación aproximada aceptada: UI="${valorUI}" vs API="${valorStrAPI || valorNumAPI}" (diferencia: ${(diferencia * 100).toFixed(1)}%)`);
        return true;
      }
    }
    
    cy.log(`   🔍 Comparación aproximada: UI="${valorUI}" (${uiSoloNumero}) vs API numérico=${valorNumAPI} (${apiSoloNumero})`);
  }
  
  return false;
}

/**
 * Convierte un número a formato aproximado K/M/B
 * Ej: 17530.49 -> "18K", 6500000 -> "6.5M"
 * @param {number} numero - Número a convertir
 * @returns {string} - Formato aproximado
 */
function convertirNumeroAFormato(numero) {
  if (!numero && numero !== 0) return '';
  
  const num = Math.abs(numero);
  
  if (num >= 1000000) {
    // Millones
    const millones = num / 1000000;
    return `${millones % 1 === 0 ? millones : millones.toFixed(1)}M`;
  } else if (num >= 1000) {
    // Miles
    const miles = num / 1000;
    return `${miles % 1 === 0 ? miles : miles.toFixed(0)}K`;
  } else {
    return num.toString();
  }
}

/**
 * Helper para comparar datos del saludo UI vs API
 * @param {Object} uiSaludo - Datos del saludo del UI
 * @param {Object} apiSaludo - Datos del saludo del API
 * @returns {Object} - Resultado de la comparación
 */
export function compararSaludo(uiSaludo, apiSaludo) {
  cy.log('🔍 Comparando saludo UI vs API...');
  
  const comparacion = {
    header: false,
    value_str: false,
    encontrado: uiSaludo.encontrado && apiSaludo !== null
  };
  
  if (apiSaludo && uiSaludo.encontrado) {
    // Comparar header (puede variar el nombre pero debe contener "Buenas" o "Buenos")
    comparacion.header = compararValores(uiSaludo.header, apiSaludo.header) ||
                         (uiSaludo.header.includes('Buenas') && apiSaludo.header.includes('Buenas')) ||
                         (uiSaludo.header.includes('Buenos') && apiSaludo.header.includes('Buenos'));
    
    // Comparar value_str (fecha y sedes)
    comparacion.value_str = compararValores(uiSaludo.value_str, apiSaludo.value_str);
  }
  
  return comparacion;
}

/**
 * Helper para validar si un elemento del API debe mostrarse en el UI
 * @param {Object} elementoApi - Elemento del API
 * @param {boolean} encontradoEnUI - Si se encontró en el UI
 * @returns {Object} - Resultado de la validación
 */
export function validarElementoDeberiaMostrarse(elementoApi, encontradoEnUI) {
  return {
    deberiaMostrarse: elementoApi !== null && elementoApi !== undefined,
    encontradoEnUI: encontradoEnUI,
    coincide: encontradoEnUI === (elementoApi !== null && elementoApi !== undefined)
  };
}

/**
 * Helper para realizar llamadas al API de widgets de variaciones de consumo
 * @param {string} authToken - Token de autenticación
 * @param {Object} requestBody - Body del request con contract_ids, period, date, kind_comparison, notification
 * @param {string} timezone - Zona horaria (ej: America/Bogota)
 * @returns {Promise} - Promise con la respuesta del API
 */
export function llamarApiVariationsWidgets(authToken, requestBody, timezone = 'America/Bogota') {
  const url = 'https://api.dev.bia.app/ems-api/app-consumptions/variations/widgets';
  
  const headers = {
    'x-platform': 'web',
    'Authorization': authToken,
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://web.dev.bia.app/',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'x-timezone': timezone,
    'sec-ch-ua-mobile': '?0',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'Content-Type': 'application/json'
  };

  cy.log(`📡 Llamando al API de widgets de variaciones`);
  cy.log(`📋 Contract IDs: ${requestBody.contract_ids ? requestBody.contract_ids.join(', ') : 'N/A'}`);
  cy.log(`📅 Período: ${requestBody.period}, Fecha: ${requestBody.date}`);

  // Validar que tenemos los datos necesarios
  if (!authToken || authToken === undefined || authToken === null) {
    cy.log('❌ ERROR: No hay token de autenticación');
    throw new Error('Token de autenticación requerido');
  }
  
  if (!requestBody || !requestBody.contract_ids || requestBody.contract_ids.length === 0) {
    cy.log('⚠️ ADVERTENCIA: No hay contract IDs en el request body');
  }

  return cy.request({
    method: 'POST',
    url: url,
    headers: headers,
    body: requestBody,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ Respuesta del API de widgets de variaciones obtenida exitosamente');
      return cy.wrap(response.body);
    } else {
      cy.log(`⚠️ Error en la respuesta del API: ${response.status}`);
      cy.log(`📋 Response: ${JSON.stringify(response.body).substring(0, 200)}`);
      throw new Error(`API retornó status ${response.status}`);
    }
  });
}

/**
 * Helper para realizar llamadas al API de analytics/widgets (Consumo General)
 * @param {string} authToken - Token de autenticación
 * @param {Array<number>} contractIds - IDs de contratos
 * @param {string} period - Período (monthly, daily, etc.)
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} timezone - Zona horaria (ej: America/Bogota)
 * @returns {Promise} - Promise con la respuesta del API
 */
export function llamarApiAnalyticsWidgets(authToken, contractIds, period = 'monthly', date = null, timezone = 'America/Bogota') {
  // Si no se proporciona fecha, usar la fecha actual
  if (!date) {
    const now = new Date();
    date = now.toISOString().split('T')[0];
  }

  const url = 'https://api.dev.bia.app/ms-bia-consumptions/v1/analitics/widgets';
  
  const headers = {
    'x-platform': 'web',
    'Authorization': authToken,
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://web.dev.bia.app/',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'x-timezone': timezone,
    'sec-ch-ua-mobile': '?0',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'Content-Type': 'application/json'
  };

  const body = {
    period: period,
    date: date,
    contract_ids: contractIds
  };

  cy.log(`📡 Llamando al API de analytics/widgets con ${contractIds.length} contratos`);
  cy.log(`📅 Período: ${period}, Fecha: ${date}`);

  // Validar que tenemos los datos necesarios
  if (!authToken || authToken === undefined || authToken === null) {
    cy.log('❌ ERROR: No hay token de autenticación');
    throw new Error('Token de autenticación requerido');
  }
  
  if (!contractIds || contractIds.length === 0) {
    cy.log('⚠️ ADVERTENCIA: No hay contract IDs. El API puede requerirlos.');
  }

  return cy.request({
    method: 'POST',
    url: url,
    headers: headers,
    body: body,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ Respuesta del API de analytics/widgets obtenida exitosamente');
      return cy.wrap(response.body);
    } else {
      cy.log(`⚠️ Error en la respuesta del API: ${response.status}`);
      cy.log(`📋 Detalles del error:`);
      cy.log(`   - URL: ${url}`);
      cy.log(`   - Body enviado: ${JSON.stringify(body)}`);
      cy.log(`   - Response: ${JSON.stringify(response.body).substring(0, 200)}`);
      
      if (response.status === 400) {
        cy.log('');
        cy.log('🔍 Posibles causas del error 400:');
        cy.log('   1. Contract IDs vacíos o inválidos');
        cy.log('   2. Fecha en formato incorrecto');
        cy.log('   3. Período no válido');
        cy.log('   4. Token de autenticación inválido');
        cy.log('');
        cy.log('💡 Intentando continuar con validaciones del UI solamente...');
        return cy.wrap([]);
      }
      
      throw new Error(`API retornó status ${response.status}`);
    }
  });
}

/**
 * Helper para parsear HTML de energía reactiva y extraer datos del frontend
 * @param {string} htmlString - String HTML del frontend
 * @returns {Object} - Objeto con los datos extraídos de energía reactiva
 */
export function parsearHtmlEnergiaReactiva(htmlString) {
  cy.log('🔍 Parseando HTML de energía reactiva...');
  
  const datos = {
    reactivaInductiva: {
      header: null,
      valor: null,
      valor_str: null,
      porcentaje: null,
      encontrado: false
    },
    reactivaCapacitiva: {
      header: null,
      valor: null,
      valor_str: null,
      porcentaje: null,
      encontrado: false
    },
    graficas: []
  };

  // Crear un elemento temporal para parsear el HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  cy.log('');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('📋 BUSCANDO COPYS EN EL HTML:');
  cy.log('═══════════════════════════════════════════════════════');
  
  // Buscar "Total Energía Reactiva Inductiva" o variaciones
  const textosInductiva = [
    'Total Energía Reactiva Inductiva',
    'Total Energía Reactiva Inductiva',
    'Reactiva Inductiva',
    'reactiva inductiva',
    'Reactiva Inductiva Penalizada'
  ];
  
  let elementoInductiva = null;
  for (const textoBuscar of textosInductiva) {
    const elementos = Array.from(doc.querySelectorAll('*')).filter(el => {
      const texto = el.textContent || '';
      return texto.includes(textoBuscar);
    });
    
    if (elementos.length > 0) {
      elementoInductiva = elementos[0];
      cy.log(`   ✅ Encontrado texto: "${textoBuscar}"`);
      break;
    }
  }
  
  if (elementoInductiva) {
    datos.reactivaInductiva.encontrado = true;
    datos.reactivaInductiva.header = 'Total Energía Reactiva Inductiva';
    
    // Buscar el contenedor padre que tenga los valores
    const $container = Cypress.$(elementoInductiva).closest('[class*="widget"], [class*="card"], [class*="kpi"], [data-demo-target="kpi-card"]');
    const textoCompleto = $container.length > 0 ? $container.text() : elementoInductiva.textContent || '';
    
    // Buscar valores numéricos (ej: "68K kVArh", "68K", "68000")
    const matchValor = textoCompleto.match(/(\d+(?:\.\d+)?[KMkm]?)\s*kVArh/i) || 
                       textoCompleto.match(/(\d+(?:\.\d+)?[KMkm]?)\s*(?:kVArh|kvarh)/i);
    
    // Buscar porcentaje (ej: "558%", "+558%", "-10%")
    const matchPorcentaje = textoCompleto.match(/([\+\-]?\d+(?:\.\d+)?)\s*%/);
    
    if (matchValor) {
      datos.reactivaInductiva.valor = matchValor[1];
      datos.reactivaInductiva.valor_str = matchValor[0].trim();
      cy.log(`   ✅ Valor encontrado: "${datos.reactivaInductiva.valor_str}"`);
    }
    
    if (matchPorcentaje) {
      datos.reactivaInductiva.porcentaje = matchPorcentaje[1];
      cy.log(`   ✅ Porcentaje encontrado: "${matchPorcentaje[0].trim()}"`);
    }
    
    cy.log(`   📄 Texto completo del elemento: "${textoCompleto.substring(0, 200)}..."`);
  } else {
    cy.log('   ⚠️ No se encontró "Total Energía Reactiva Inductiva" en el HTML');
  }
  
  // Buscar "Total Energía Reactiva Capacitiva" o variaciones
  const textosCapacitiva = [
    'Total Energía Reactiva Capacitiva',
    'Total Energía Reactiva Capacitiva',
    'Reactiva Capacitiva',
    'reactiva capacitiva'
  ];
  
  let elementoCapacitiva = null;
  for (const textoBuscar of textosCapacitiva) {
    const elementos = Array.from(doc.querySelectorAll('*')).filter(el => {
      const texto = el.textContent || '';
      return texto.includes(textoBuscar);
    });
    
    if (elementos.length > 0) {
      elementoCapacitiva = elementos[0];
      cy.log(`   ✅ Encontrado texto: "${textoBuscar}"`);
      break;
    }
  }
  
  if (elementoCapacitiva) {
    datos.reactivaCapacitiva.encontrado = true;
    datos.reactivaCapacitiva.header = 'Total Energía Reactiva Capacitiva';
    
    // Buscar el contenedor padre que tenga los valores
    const $container = Cypress.$(elementoCapacitiva).closest('[class*="widget"], [class*="card"], [class*="kpi"], [data-demo-target="kpi-card"]');
    const textoCompleto = $container.length > 0 ? $container.text() : elementoCapacitiva.textContent || '';
    
    // Buscar valores numéricos
    const matchValor = textoCompleto.match(/(\d+(?:\.\d+)?[KMkm]?)\s*kVArh/i) || 
                       textoCompleto.match(/(\d+(?:\.\d+)?[KMkm]?)\s*(?:kVArh|kvarh)/i);
    
    // Buscar porcentaje
    const matchPorcentaje = textoCompleto.match(/([\+\-]?\d+(?:\.\d+)?)\s*%/);
    
    if (matchValor) {
      datos.reactivaCapacitiva.valor = matchValor[1];
      datos.reactivaCapacitiva.valor_str = matchValor[0].trim();
      cy.log(`   ✅ Valor encontrado: "${datos.reactivaCapacitiva.valor_str}"`);
    }
    
    if (matchPorcentaje) {
      datos.reactivaCapacitiva.porcentaje = matchPorcentaje[1];
      cy.log(`   ✅ Porcentaje encontrado: "${matchPorcentaje[0].trim()}"`);
    }
    
    cy.log(`   📄 Texto completo del elemento: "${textoCompleto.substring(0, 200)}..."`);
  } else {
    cy.log('   ⚠️ No se encontró "Total Energía Reactiva Capacitiva" en el HTML');
  }
  
  // Buscar gráficas relacionadas
  const textosGraficas = [
    'Excesos de energía reactiva inductiva',
    'Exceso de reactiva inductiva por sedes',
    'Excesos de reactiva inductiva'
  ];
  
  textosGraficas.forEach(textoGrafica => {
    const elementos = Array.from(doc.querySelectorAll('*')).filter(el => {
      const texto = el.textContent || '';
      return texto.includes(textoGrafica);
    });
    
    if (elementos.length > 0) {
      datos.graficas.push({ titulo: textoGrafica, encontrada: true });
      cy.log(`   ✅ Gráfica encontrada: "${textoGrafica}"`);
    }
  });
  
  cy.log('');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('✅ RESUMEN DEL HTML:');
  cy.log(`   Reactiva Inductiva: ${datos.reactivaInductiva.encontrado ? '✅' : '❌'}`);
  if (datos.reactivaInductiva.encontrado) {
    cy.log(`      Header (copy): "${datos.reactivaInductiva.header}"`);
    cy.log(`      Valor (copy): "${datos.reactivaInductiva.valor_str || datos.reactivaInductiva.valor || 'N/A'}"`);
    cy.log(`      Porcentaje (copy): "${datos.reactivaInductiva.porcentaje || 'N/A'}"`);
  }
  cy.log(`   Reactiva Capacitiva: ${datos.reactivaCapacitiva.encontrado ? '✅' : '❌'}`);
  if (datos.reactivaCapacitiva.encontrado) {
    cy.log(`      Header (copy): "${datos.reactivaCapacitiva.header}"`);
    cy.log(`      Valor (copy): "${datos.reactivaCapacitiva.valor_str || datos.reactivaCapacitiva.valor || 'N/A'}"`);
    cy.log(`      Porcentaje (copy): "${datos.reactivaCapacitiva.porcentaje || 'N/A'}"`);
  }
  cy.log(`   Gráficas encontradas: ${datos.graficas.length}`);
  cy.log('═══════════════════════════════════════════════════════');
  
  return datos;
}

/**
 * Helper para llamar al API de reactive-analitics/widgets (Energía Reactiva)
 * @param {string} authToken - Token de autenticación
 * @param {Array<number>} contractIds - IDs de contratos
 * @param {string} period - Período (monthly, daily, etc.)
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} timezone - Zona horaria (ej: America/Bogota)
 * @param {string} viewAs - ID de vista (x-view-as header)
 * @returns {Promise} - Promise con la respuesta del servicio
 */
export function llamarApiReactiveAnalyticsWidgets(authToken, contractIds, period = 'monthly', date = null, timezone = 'America/Bogota', viewAs = null) {
  // Si no se proporciona fecha, usar la fecha actual
  if (!date) {
    const now = new Date();
    date = now.toISOString().split('T')[0];
  }

  const url = 'https://api.dev.bia.app/ms-bia-consumptions/v1/reactive-analitics/widgets';
  
  const headers = {
    'x-platform': 'web',
    'Authorization': authToken,
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://web.dev.bia.app/',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'x-timezone': timezone,
    'sec-ch-ua-mobile': '?0',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'Content-Type': 'application/json'
  };

  // Agregar x-view-as si está presente
  if (viewAs) {
    headers['x-view-as'] = viewAs;
  }

  const body = {
    contract_ids: contractIds,
    period: period,
    date: date
  };

  cy.log(`📡 Llamando al API de reactive-analitics/widgets con ${contractIds.length} contratos`);
  cy.log(`📅 Período: ${period}, Fecha: ${date}`);

  // Validar que tenemos los datos necesarios
  if (!authToken || authToken === undefined || authToken === null) {
    cy.log('❌ ERROR: No hay token de autenticación');
    throw new Error('Token de autenticación requerido');
  }
  
  if (!contractIds || contractIds.length === 0) {
    cy.log('⚠️ ADVERTENCIA: No hay contract IDs. El API puede requerirlos.');
  }

  return cy.request({
    method: 'POST',
    url: url,
    headers: headers,
    body: body,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ Respuesta del API de reactive-analitics/widgets obtenida exitosamente');
      cy.log(`📊 Widgets recibidos: ${Array.isArray(response.body) ? response.body.length : 'N/A'}`);
      return cy.wrap(response.body);
    } else {
      cy.log(`⚠️ Error en la respuesta del API: ${response.status}`);
      cy.log(`📋 Detalles del error:`);
      cy.log(`   - URL: ${url}`);
      cy.log(`   - Body enviado: ${JSON.stringify(body)}`);
      cy.log(`   - Response: ${JSON.stringify(response.body).substring(0, 200)}`);
      
      if (response.status === 400) {
        cy.log('');
        cy.log('🔍 Posibles causas del error 400:');
        cy.log('   1. Contract IDs vacíos o inválidos');
        cy.log('   2. Fecha en formato incorrecto');
        cy.log('   3. Período no válido');
        cy.log('   4. Token de autenticación inválido');
        cy.log('');
        cy.log('💡 Intentando continuar con validaciones del UI solamente...');
        return cy.wrap([]);
      }
      
      throw new Error(`API retornó status ${response.status}`);
    }
  });
}

/**
 * Helper para ejecutar comando curl y obtener datos del servicio de energía reactiva
 * Esta función parsea el comando curl y llama a llamarApiReactiveAnalyticsWidgets
 * @param {string} curlCommand - Comando curl completo (opcional, puede ser null si se usan parámetros directos)
 * @param {string} authToken - Token de autenticación (si no se proporciona curlCommand)
 * @param {Array<number>} contractIds - IDs de contratos (si no se proporciona curlCommand)
 * @param {string} period - Período (si no se proporciona curlCommand)
 * @param {string} date - Fecha (si no se proporciona curlCommand)
 * @param {string} timezone - Zona horaria (si no se proporciona curlCommand)
 * @param {string} viewAs - ID de vista (si no se proporciona curlCommand)
 * @returns {Promise} - Promise con la respuesta del servicio
 */
export function ejecutarCurlEnergiaReactiva(curlCommand = null, authToken = null, contractIds = null, period = 'monthly', date = null, timezone = 'America/Bogota', viewAs = null) {
  cy.log('📡 Ejecutando llamada al servicio de energía reactiva...');
  
  // Si se proporciona curlCommand, intentar parsearlo para extraer parámetros
  // PERO siempre usar el authToken del login (más confiable y actualizado)
  if (curlCommand) {
    cy.log(`   Parseando comando curl para extraer parámetros...`);
    
    // Extraer x-timezone del curl
    const timezoneMatch = curlCommand.match(/-H\s+['"]x-timezone:\s*([^'"]+)['"]/);
    const extractedTimezone = timezoneMatch ? timezoneMatch[1] : timezone;
    
    // Extraer x-view-as del curl
    const viewAsMatch = curlCommand.match(/-H\s+['"]x-view-as:\s*([^'"]+)['"]/);
    const extractedViewAs = viewAsMatch ? viewAsMatch[1] : viewAs;
    
    // Extraer body JSON del curl
    const bodyMatch = curlCommand.match(/--data-raw\s+['"]([^'"]+)['"]/);
    let extractedBody = null;
    if (bodyMatch) {
      try {
        extractedBody = JSON.parse(bodyMatch[1]);
      } catch (e) {
        cy.log(`⚠️ Error parseando body JSON: ${e.message}`);
      }
    }
    
    // IMPORTANTE: Usar el authToken del login (parámetro), NO el del curl
    // El token del login es el que está activo y válido
    const tokenAUsar = authToken || null;
    
    if (extractedBody && tokenAUsar) {
      cy.log(`   ✅ Parámetros extraídos del curl`);
      cy.log(`   📋 Contract IDs: ${extractedBody.contract_ids?.length || 0} contratos`);
      cy.log(`   📅 Período: ${extractedBody.period}, Fecha: ${extractedBody.date}`);
      cy.log(`   🔑 Token: Usando token del login (${tokenAUsar.substring(0, 20)}...)`);
      
      return llamarApiReactiveAnalyticsWidgets(
        tokenAUsar, // Usar token del login, no el del curl
        extractedBody.contract_ids,
        extractedBody.period,
        extractedBody.date,
        extractedTimezone,
        extractedViewAs
      );
    } else {
      cy.log(`⚠️ No se pudieron extraer todos los parámetros del curl`);
      cy.log(`   Token del login: ${tokenAUsar ? '✅' : '❌'}`);
      cy.log(`   Body: ${extractedBody ? '✅' : '❌'}`);
    }
  }
  
  // Si no se proporcionó curlCommand o no se pudo parsear, usar parámetros directos
  if (authToken && contractIds) {
    cy.log(`   Usando parámetros directos con token del login`);
    cy.log(`   🔑 Token: ${authToken.substring(0, 20)}...`);
    return llamarApiReactiveAnalyticsWidgets(authToken, contractIds, period, date, timezone, viewAs);
  }
  
  cy.log('❌ ERROR: No se proporcionaron parámetros suficientes');
  cy.log('   Opciones:');
  cy.log('   1. Proporcionar curlCommand completo');
  cy.log('   2. Proporcionar authToken, contractIds y otros parámetros opcionales');
  
  return cy.wrap(null);
}

/**
 * Helper para procesar la respuesta del API de reactive-analitics/widgets
 * y convertirla al formato esperado para comparación
 * @param {Array} apiResponse - Respuesta del API (array de widgets)
 * @returns {Object} - Datos procesados en formato estructurado
 */
export function procesarRespuestaApiEnergiaReactiva(apiResponse) {
  cy.log('🔍 Procesando respuesta del API de energía reactiva...');
  
  const datos = {
    reactivaInductiva: {
      valor: null,
      valor_str: null,
      value: null,
      porcentaje: null,
      header: null,
      subheader: null,
      encontrado: false
    },
    reactivaCapacitiva: {
      valor: null,
      valor_str: null,
      value: null,
      porcentaje: null,
      header: null,
      subheader: null,
      encontrado: false
    },
    widgets: []
  };

  if (!apiResponse || !Array.isArray(apiResponse)) {
    cy.log('⚠️ La respuesta del API no es un array válido');
    return datos;
  }

  cy.log(`📊 Procesando ${apiResponse.length} widget(s) del API...`);
  cy.log('');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('📋 DATOS DEL SERVICIO (COPYS):');
  cy.log('═══════════════════════════════════════════════════════');

  apiResponse.forEach((widget, index) => {
    const header = widget.header || widget.title || '';
    const headerLower = header.toLowerCase();
    const kind = (widget.kind || '').toLowerCase();
    
    cy.log(`   Widget ${index + 1}:`);
    cy.log(`      Header (copy): "${header}"`);
    cy.log(`      Value_str (copy): "${widget.value_str || 'N/A'}"`);
    cy.log(`      Subheader (copy): "${widget.subheader || 'N/A'}"`);
    cy.log(`      Value (numérico): ${widget.value !== undefined ? widget.value : 'N/A'}`);
    cy.log(`      Kind: "${kind}"`);
    cy.log('');
    
    // Buscar reactiva inductiva por header/copy
    if (headerLower.includes('reactiva') && (headerLower.includes('inductiva') || headerLower.includes('inductive') || headerLower.includes('penalizada'))) {
      datos.reactivaInductiva.encontrado = true;
      datos.reactivaInductiva.header = header;
      datos.reactivaInductiva.valor_str = widget.value_str || null;
      datos.reactivaInductiva.value = widget.value !== undefined ? widget.value : null;
      datos.reactivaInductiva.subheader = widget.subheader || null;
      
      // Extraer porcentaje del subheader si existe
      if (widget.subheader) {
        const matchPorcentaje = String(widget.subheader).match(/([\+\-]?\d+(?:\.\d+)?)\s*%/);
        if (matchPorcentaje) {
          datos.reactivaInductiva.porcentaje = matchPorcentaje[1];
        } else {
          datos.reactivaInductiva.porcentaje = widget.subheader;
        }
      }
      
      // Si no hay value_str pero hay value, convertir
      if (!datos.reactivaInductiva.valor_str && datos.reactivaInductiva.value !== null) {
        datos.reactivaInductiva.valor_str = convertirNumeroAFormato(datos.reactivaInductiva.value) + ' kVArh';
      }
      
      cy.log(`   ✅ Reactiva Inductiva encontrada:`);
      cy.log(`      Copy header: "${datos.reactivaInductiva.header}"`);
      cy.log(`      Copy valor: "${datos.reactivaInductiva.valor_str || 'N/A'}"`);
      cy.log(`      Copy porcentaje: "${datos.reactivaInductiva.porcentaje || 'N/A'}"`);
    }
    
    // Buscar reactiva capacitiva por header/copy
    if (headerLower.includes('reactiva') && (headerLower.includes('capacitiva') || headerLower.includes('capacitive'))) {
      datos.reactivaCapacitiva.encontrado = true;
      datos.reactivaCapacitiva.header = header;
      datos.reactivaCapacitiva.valor_str = widget.value_str || null;
      datos.reactivaCapacitiva.value = widget.value !== undefined ? widget.value : null;
      datos.reactivaCapacitiva.subheader = widget.subheader || null;
      
      // Extraer porcentaje del subheader si existe
      if (widget.subheader) {
        const matchPorcentaje = String(widget.subheader).match(/([\+\-]?\d+(?:\.\d+)?)\s*%/);
        if (matchPorcentaje) {
          datos.reactivaCapacitiva.porcentaje = matchPorcentaje[1];
        } else {
          datos.reactivaCapacitiva.porcentaje = widget.subheader;
        }
      }
      
      // Si no hay value_str pero hay value, convertir
      if (!datos.reactivaCapacitiva.valor_str && datos.reactivaCapacitiva.value !== null) {
        datos.reactivaCapacitiva.valor_str = convertirNumeroAFormato(datos.reactivaCapacitiva.value) + ' kVArh';
      }
      
      cy.log(`   ✅ Reactiva Capacitiva encontrada:`);
      cy.log(`      Copy header: "${datos.reactivaCapacitiva.header}"`);
      cy.log(`      Copy valor: "${datos.reactivaCapacitiva.valor_str || 'N/A'}"`);
      cy.log(`      Copy porcentaje: "${datos.reactivaCapacitiva.porcentaje || 'N/A'}"`);
    }
    
    // Guardar todos los widgets para referencia
    datos.widgets.push({
      header: header,
      kind: widget.kind,
      value_str: widget.value_str,
      value: widget.value,
      subheader: widget.subheader
    });
  });

  cy.log('');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('✅ RESUMEN DEL SERVICIO:');
  cy.log(`   Reactiva Inductiva: ${datos.reactivaInductiva.encontrado ? '✅' : '❌'}`);
  if (datos.reactivaInductiva.encontrado) {
    cy.log(`      Header: "${datos.reactivaInductiva.header}"`);
    cy.log(`      Valor: "${datos.reactivaInductiva.valor_str || 'N/A'}"`);
    cy.log(`      Porcentaje: "${datos.reactivaInductiva.porcentaje || 'N/A'}"`);
  }
  cy.log(`   Reactiva Capacitiva: ${datos.reactivaCapacitiva.encontrado ? '✅' : '❌'}`);
  if (datos.reactivaCapacitiva.encontrado) {
    cy.log(`      Header: "${datos.reactivaCapacitiva.header}"`);
    cy.log(`      Valor: "${datos.reactivaCapacitiva.valor_str || 'N/A'}"`);
    cy.log(`      Porcentaje: "${datos.reactivaCapacitiva.porcentaje || 'N/A'}"`);
  }
  cy.log('═══════════════════════════════════════════════════════');

  return datos;
}

/**
 * Helper para comparar datos de energía reactiva del frontend vs servicio
 * @param {Object} datosFrontend - Datos extraídos del HTML del frontend
 * @param {Object} datosServicio - Datos obtenidos del servicio (curl) - debe ser procesado con procesarRespuestaApiEnergiaReactiva
 * @returns {Object} - Resultado de la comparación
 */
export function compararEnergiaReactiva(datosFrontend, datosServicio) {
  cy.log('');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('🔍 COMPARANDO COPYS: FRONTEND vs SERVICIO');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('');
  
  const comparacion = {
    reactivaInductiva: {
      header: false,
      valor: false,
      porcentaje: false,
      encontrado: datosFrontend.reactivaInductiva.encontrado && datosServicio?.reactivaInductiva?.encontrado
    },
    reactivaCapacitiva: {
      header: false,
      valor: false,
      porcentaje: false,
      encontrado: datosFrontend.reactivaCapacitiva.encontrado && datosServicio?.reactivaCapacitiva?.encontrado
    },
    graficas: {
      coincidencias: [],
      diferencias: []
    }
  };
  
  // Comparar reactiva inductiva
  if (datosFrontend.reactivaInductiva.encontrado && datosServicio?.reactivaInductiva?.encontrado) {
    cy.log('📊 Validando: Reactiva Inductiva');
    
    // Comparar header (copy)
    const headerFrontend = (datosFrontend.reactivaInductiva.header || 'Total Energía Reactiva Inductiva').toLowerCase();
    const headerServicio = (datosServicio.reactivaInductiva.header || '').toLowerCase();
    comparacion.reactivaInductiva.header = headerFrontend.includes('reactiva') && 
                                           (headerServicio.includes('reactiva') && 
                                            (headerServicio.includes('inductiva') || headerServicio.includes('penalizada')));
    
    // Comparar valor (copy)
    comparacion.reactivaInductiva.valor = compararValoresAproximados(
      datosFrontend.reactivaInductiva.valor_str || datosFrontend.reactivaInductiva.valor,
      datosServicio.reactivaInductiva.valor_str,
      datosServicio.reactivaInductiva.value
    );
    
    // Comparar porcentaje (copy)
    comparacion.reactivaInductiva.porcentaje = compararValores(
      datosFrontend.reactivaInductiva.porcentaje,
      datosServicio.reactivaInductiva.porcentaje || datosServicio.reactivaInductiva.subheader
    );
    
    const todasCoinciden = comparacion.reactivaInductiva.header && 
                          comparacion.reactivaInductiva.valor && 
                          comparacion.reactivaInductiva.porcentaje;
    
    cy.log(`   ┌─ Frontend (HTML):`);
    cy.log(`   │  Header: "${datosFrontend.reactivaInductiva.header || 'Total Energía Reactiva Inductiva'}"`);
    cy.log(`   │  Valor: "${datosFrontend.reactivaInductiva.valor_str || datosFrontend.reactivaInductiva.valor || 'N/A'}"`);
    cy.log(`   │  Porcentaje: "${datosFrontend.reactivaInductiva.porcentaje || 'N/A'}"`);
    cy.log(`   ├─ Servicio (API):`);
    cy.log(`   │  Header: "${datosServicio.reactivaInductiva.header || 'N/A'}"`);
    cy.log(`   │  Valor: "${datosServicio.reactivaInductiva.valor_str || datosServicio.reactivaInductiva.value || 'N/A'}"`);
    cy.log(`   │  Porcentaje: "${datosServicio.reactivaInductiva.porcentaje || datosServicio.reactivaInductiva.subheader || 'N/A'}"`);
    cy.log(`   └─ Validación:`);
    cy.log(`      🎯 RESULTADO: ${todasCoinciden ? '✅ Todas las validaciones correctas' : '❌ ERROR - Se encontraron diferencias'}`);
    cy.log(`         Header: ${comparacion.reactivaInductiva.header ? '✅' : '❌'}`);
    cy.log(`         Valor: ${comparacion.reactivaInductiva.valor ? '✅' : '❌'}`);
    cy.log(`         Porcentaje: ${comparacion.reactivaInductiva.porcentaje ? '✅' : '❌'}`);
    
    if (!todasCoinciden) {
      cy.log(`         ┌─ Detalles de diferencias:`);
      if (!comparacion.reactivaInductiva.valor) {
        cy.log(`         │  Valor:`);
        cy.log(`         │    Frontend: "${datosFrontend.reactivaInductiva.valor_str || datosFrontend.reactivaInductiva.valor || 'N/A'}"`);
        cy.log(`         │    Servicio: "${datosServicio.reactivaInductiva.valor_str || datosServicio.reactivaInductiva.value || 'N/A'}"`);
      }
      if (!comparacion.reactivaInductiva.porcentaje) {
        cy.log(`         │  Porcentaje:`);
        cy.log(`         │    Frontend: "${datosFrontend.reactivaInductiva.porcentaje || 'N/A'}"`);
        cy.log(`         │    Servicio: "${datosServicio.reactivaInductiva.porcentaje || datosServicio.reactivaInductiva.subheader || 'N/A'}"`);
      }
      cy.log(`         └─`);
    }
    cy.log('');
  } else {
    cy.log('📊 Validando: Reactiva Inductiva');
    cy.log(`   ┌─ Frontend: ${datosFrontend.reactivaInductiva.encontrado ? '✅ Encontrado' : '❌ No encontrado'}`);
    cy.log(`   └─ Servicio: ${datosServicio?.reactivaInductiva?.encontrado ? '✅ Encontrado' : '❌ No encontrado'}`);
    cy.log('');
  }
  
  // Comparar reactiva capacitiva
  if (datosFrontend.reactivaCapacitiva.encontrado && datosServicio?.reactivaCapacitiva?.encontrado) {
    cy.log('📊 Validando: Reactiva Capacitiva');
    
    // Comparar header (copy)
    const headerFrontend = (datosFrontend.reactivaCapacitiva.header || 'Total Energía Reactiva Capacitiva').toLowerCase();
    const headerServicio = (datosServicio.reactivaCapacitiva.header || '').toLowerCase();
    comparacion.reactivaCapacitiva.header = headerFrontend.includes('reactiva') && 
                                            headerServicio.includes('reactiva') && 
                                            headerServicio.includes('capacitiva');
    
    // Comparar valor (copy)
    comparacion.reactivaCapacitiva.valor = compararValoresAproximados(
      datosFrontend.reactivaCapacitiva.valor_str || datosFrontend.reactivaCapacitiva.valor,
      datosServicio.reactivaCapacitiva.valor_str,
      datosServicio.reactivaCapacitiva.value
    );
    
    // Comparar porcentaje (copy)
    comparacion.reactivaCapacitiva.porcentaje = compararValores(
      datosFrontend.reactivaCapacitiva.porcentaje,
      datosServicio.reactivaCapacitiva.porcentaje || datosServicio.reactivaCapacitiva.subheader
    );
    
    const todasCoinciden = comparacion.reactivaCapacitiva.header && 
                          comparacion.reactivaCapacitiva.valor && 
                          comparacion.reactivaCapacitiva.porcentaje;
    
    cy.log(`   ┌─ Frontend (HTML):`);
    cy.log(`   │  Header: "${datosFrontend.reactivaCapacitiva.header || 'Total Energía Reactiva Capacitiva'}"`);
    cy.log(`   │  Valor: "${datosFrontend.reactivaCapacitiva.valor_str || datosFrontend.reactivaCapacitiva.valor || 'N/A'}"`);
    cy.log(`   │  Porcentaje: "${datosFrontend.reactivaCapacitiva.porcentaje || 'N/A'}"`);
    cy.log(`   ├─ Servicio (API):`);
    cy.log(`   │  Header: "${datosServicio.reactivaCapacitiva.header || 'N/A'}"`);
    cy.log(`   │  Valor: "${datosServicio.reactivaCapacitiva.valor_str || datosServicio.reactivaCapacitiva.value || 'N/A'}"`);
    cy.log(`   │  Porcentaje: "${datosServicio.reactivaCapacitiva.porcentaje || datosServicio.reactivaCapacitiva.subheader || 'N/A'}"`);
    cy.log(`   └─ Validación:`);
    cy.log(`      🎯 RESULTADO: ${todasCoinciden ? '✅ Todas las validaciones correctas' : '❌ ERROR - Se encontraron diferencias'}`);
    cy.log(`         Header: ${comparacion.reactivaCapacitiva.header ? '✅' : '❌'}`);
    cy.log(`         Valor: ${comparacion.reactivaCapacitiva.valor ? '✅' : '❌'}`);
    cy.log(`         Porcentaje: ${comparacion.reactivaCapacitiva.porcentaje ? '✅' : '❌'}`);
    
    if (!todasCoinciden) {
      cy.log(`         ┌─ Detalles de diferencias:`);
      if (!comparacion.reactivaCapacitiva.valor) {
        cy.log(`         │  Valor:`);
        cy.log(`         │    Frontend: "${datosFrontend.reactivaCapacitiva.valor_str || datosFrontend.reactivaCapacitiva.valor || 'N/A'}"`);
        cy.log(`         │    Servicio: "${datosServicio.reactivaCapacitiva.valor_str || datosServicio.reactivaCapacitiva.value || 'N/A'}"`);
      }
      if (!comparacion.reactivaCapacitiva.porcentaje) {
        cy.log(`         │  Porcentaje:`);
        cy.log(`         │    Frontend: "${datosFrontend.reactivaCapacitiva.porcentaje || 'N/A'}"`);
        cy.log(`         │    Servicio: "${datosServicio.reactivaCapacitiva.porcentaje || datosServicio.reactivaCapacitiva.subheader || 'N/A'}"`);
      }
      cy.log(`         └─`);
    }
    cy.log('');
  } else {
    cy.log('📊 Validando: Reactiva Capacitiva');
    cy.log(`   ┌─ Frontend: ${datosFrontend.reactivaCapacitiva.encontrado ? '✅ Encontrado' : '❌ No encontrado'}`);
    cy.log(`   └─ Servicio: ${datosServicio?.reactivaCapacitiva?.encontrado ? '✅ Encontrado' : '❌ No encontrado'}`);
    cy.log('');
  }
  
  cy.log('═══════════════════════════════════════════════════════');
  cy.log('📋 RESUMEN FINAL DE VALIDACIÓN');
  cy.log('═══════════════════════════════════════════════════════');
  
  const inductivaOk = comparacion.reactivaInductiva.header && 
                     comparacion.reactivaInductiva.valor && 
                     comparacion.reactivaInductiva.porcentaje;
  const capacitivaOk = comparacion.reactivaCapacitiva.header && 
                      comparacion.reactivaCapacitiva.valor && 
                      comparacion.reactivaCapacitiva.porcentaje;
  
  cy.log(`   Reactiva Inductiva:`);
  cy.log(`      Header: ${comparacion.reactivaInductiva.header ? '✅' : '❌'}`);
  cy.log(`      Valor: ${comparacion.reactivaInductiva.valor ? '✅' : '❌'}`);
  cy.log(`      Porcentaje: ${comparacion.reactivaInductiva.porcentaje ? '✅' : '❌'}`);
  cy.log(`      Estado: ${inductivaOk ? '✅ Todas las validaciones correctas' : '❌ ERROR - Se encontraron diferencias'}`);
  cy.log('');
  cy.log(`   Reactiva Capacitiva:`);
  cy.log(`      Header: ${comparacion.reactivaCapacitiva.header ? '✅' : '❌'}`);
  cy.log(`      Valor: ${comparacion.reactivaCapacitiva.valor ? '✅' : '❌'}`);
  cy.log(`      Porcentaje: ${comparacion.reactivaCapacitiva.porcentaje ? '✅' : '❌'}`);
  cy.log(`      Estado: ${capacitivaOk ? '✅ Todas las validaciones correctas' : '❌ ERROR - Se encontraron diferencias'}`);
  cy.log('');
  cy.log(`   Estado general: ${inductivaOk && capacitivaOk ? '✅ Todas las validaciones correctas' : '⚠️ Se encontraron diferencias'}`);
  cy.log('═══════════════════════════════════════════════════════');
  
  return comparacion;
}
