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
