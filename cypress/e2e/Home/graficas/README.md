# Automatización de Tooltips en Gráficas

Este directorio contiene tests para automatizar la interacción con las gráficas y verificar que los tooltips aparecen correctamente al hacer hover sobre las barras.

## Archivos

- `hover_tooltips_graficas.cy.js` - Test principal que automatiza el hover sobre las barras de las gráficas
- `GraficasPage.js` - Página de objeto (Page Object) con métodos para interactuar con las gráficas (ubicada en `cypress/pages/Home/GraficasPage.js`)

## Funcionalidades

### GraficasPage

La clase `GraficasPage` proporciona los siguientes métodos:

1. **`obtenerBarrasDeGraficas()`** - Encuentra todas las barras de gráficas visibles en la página
2. **`hacerHoverSobreBarra(barra, indice)`** - Hace hover sobre una barra específica
3. **`verificarTooltipVisible(timeout)`** - Verifica si un tooltip está visible
4. **`obtenerContenidoTooltip()`** - Extrae el contenido del tooltip visible
5. **`hacerHoverSobreTodasLasBarras(tituloGrafica)`** - Hace hover sobre todas las barras de todas las gráficas
6. **`hacerHoverSobreBarrasDeGrafica(tituloGrafica)`** - Hace hover sobre las barras de una gráfica específica por su título
7. **`esperarGraficasCarguen(timeout)`** - Espera a que las gráficas carguen completamente

## Uso

### Ejecutar el test completo

```bash
npm run test -- --spec "cypress/e2e/Home/graficas/hover_tooltips_graficas.cy.js"
```

### Ejecutar en modo interactivo

```bash
npm run test:open
# Luego seleccionar el archivo hover_tooltips_graficas.cy.js
```

## Ejemplo de uso en otros tests

```javascript
import GraficasPage from '../../../pages/Home/GraficasPage.js';

const graficasPage = new GraficasPage();

// Esperar a que las gráficas carguen
graficasPage.esperarGraficasCarguen();

// Hacer hover sobre todas las barras
graficasPage.hacerHoverSobreTodasLasBarras().then((resultados) => {
  console.log(`Tooltips visibles: ${resultados.filter(r => r.tooltipVisible).length}`);
});

// Hacer hover sobre barras de una gráfica específica
graficasPage.hacerHoverSobreBarrasDeGrafica('Excesos de energía reactiva inductiva')
  .then((resultados) => {
    resultados.forEach((resultado) => {
      if (resultado.tooltipVisible) {
        console.log(`Tooltip: ${resultado.contenido}`);
      }
    });
  });
```

## Notas

- El test busca barras en diferentes formatos: SVG (Recharts, D3), Canvas (Chart.js), y elementos con clases relacionadas
- Los tooltips se detectan usando múltiples selectores para mayor compatibilidad
- El método de hover usa múltiples técnicas (mouseover, mouseenter, mousemove) para asegurar compatibilidad con diferentes librerías de gráficas

## Requisitos

- Credenciales válidas en `cypress/fixtures/credenciales.json`
- Acceso a la aplicación en `https://web.dev.bia.app`
- Las gráficas deben estar cargadas antes de ejecutar los métodos de hover
