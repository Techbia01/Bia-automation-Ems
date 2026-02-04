# Validación de Gráficas del Home

Este directorio contiene tests para validar que las gráficas del home coincidan con lo que retorna el API.

## Archivos

- `validacion_graficas_home.cy.js` - Test principal que valida las gráficas del home vs API

## Funcionalidades

El test valida:

1. **Existencia de gráficas**: Verifica que las gráficas que retorna el API estén presentes en el frontend
2. **Renderizado**: Verifica que el canvas de las gráficas esté renderizado correctamente
3. **Títulos**: Compara que los títulos de las gráficas coincidan entre API y Frontend
4. **Datos**: Verifica que las gráficas tengan barras/datos renderizados

## Validaciones Críticas

El test **FALLA** si:

- ❌ El API retorna una gráfica pero NO está en el Frontend
- ❌ La gráfica está en el Frontend pero el canvas NO está renderizado
- ❌ Los títulos no coinciden entre API y Frontend
- ❌ La gráfica está en el Frontend pero NO tiene barras/datos renderizados

## Uso

```bash
# Ejecutar el test completo
npm run test -- --spec "cypress/e2e/Home/homegraficas/validacion_graficas_home.cy.js"

# O en modo interactivo
npm run test:open
# Luego selecciona el archivo validacion_graficas_home.cy.js
```

## Estructura del Test

1. **Login y configuración inicial**
2. **Obtener datos del API** - Filtra gráficas del API
3. **Validar gráficas en el Frontend** - Busca gráficas usando `data-graph-widget`
4. **Validar que las gráficas tengan datos** - Verifica que tengan barras renderizadas
5. **Validaciones críticas** - Falla si hay discrepancias

## Notas

- El test se guía por lo que retorna el API (fuente de verdad)
- Usa selectores basados en `data-graph-widget` y `data-graph-title` para mayor robustez
- Compara títulos de forma flexible (coincidencia parcial)
- Verifica que el canvas esté renderizado antes de validar datos
