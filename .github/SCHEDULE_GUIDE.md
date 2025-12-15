# 📅 Guía de Programación de Pruebas Automáticas

Este documento explica cómo configurar los horarios para que las pruebas de Cypress se ejecuten automáticamente.

## ⏰ Configuración de Horarios (Cron)

El archivo `.github/workflows/cypress-tests.yml` usa la sintaxis de cron para programar las ejecuciones.

### Formato de Cron

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── día del mes (1 - 31)
│ │ │ ┌───────────── mes (1 - 12)
│ │ │ │ ┌───────────── día de la semana (0 - 6) (0 = domingo)
│ │ │ │ │
* * * * *
```

### Ejemplos de Configuración

#### Ejecutar todos los días a las 2:00 AM UTC
```yaml
- cron: '0 2 * * *'
```

#### Ejecutar de lunes a viernes a las 9:00 AM UTC
```yaml
- cron: '0 9 * * 1-5'
```

#### Ejecutar dos veces al día (6 AM y 6 PM UTC)
```yaml
- cron: '0 6,18 * * *'
```

#### Ejecutar cada hora
```yaml
- cron: '0 * * * *'
```

#### Ejecutar cada 30 minutos
```yaml
- cron: '*/30 * * * *'
```

#### Ejecutar solo los lunes a las 8:00 AM UTC
```yaml
- cron: '0 8 * * 1'
```

#### Ejecutar el primer día de cada mes a las 12:00 PM UTC
```yaml
- cron: '0 12 1 * *'
```

### ⚠️ Importante: Zona Horaria

**GitHub Actions usa UTC (Coordinated Universal Time)**. 

Para convertir a tu zona horaria:
- **México (CST/CDT)**: UTC-6 / UTC-5
  - Si quieres ejecutar a las 9:00 AM hora de México, usa `15` (9 AM + 6 horas) o `14` según horario de verano
- **Colombia (COT)**: UTC-5
  - Si quieres ejecutar a las 8:00 AM hora de Colombia, usa `13` (8 AM + 5 horas)
- **Argentina (ART)**: UTC-3
  - Si quieres ejecutar a las 10:00 AM hora de Argentina, usa `13` (10 AM + 3 horas)

### Ejemplos por Zona Horaria

#### Para México (UTC-6)
```yaml
# Ejecutar a las 9:00 AM hora de México = 3:00 PM UTC
- cron: '0 15 * * *'

# Ejecutar a las 6:00 AM hora de México = 12:00 PM UTC
- cron: '0 12 * * *'
```

#### Para Colombia (UTC-5)
```yaml
# Ejecutar a las 8:00 AM hora de Colombia = 1:00 PM UTC
- cron: '0 13 * * *'
```

#### Para Argentina (UTC-3)
```yaml
# Ejecutar a las 10:00 AM hora de Argentina = 1:00 PM UTC
- cron: '0 13 * * *'
```

## 🔧 Cómo Modificar el Horario

1. Abre el archivo `.github/workflows/cypress-tests.yml`
2. Busca la sección `schedule:`
3. Modifica o agrega líneas `- cron: '...'` según tus necesidades
4. Haz commit y push a tu repositorio

### Ejemplo de Configuración Múltiple

```yaml
schedule:
  # Ejecutar todos los días a las 6 AM UTC
  - cron: '0 6 * * *'
  
  # Ejecutar de lunes a viernes a las 2 PM UTC
  - cron: '0 14 * * 1-5'
  
  # Ejecutar los domingos a las 10 PM UTC
  - cron: '0 22 * * 0'
```

## 🚀 Ejecución Manual

También puedes ejecutar las pruebas manualmente desde GitHub:

1. Ve a la pestaña **Actions** en tu repositorio
2. Selecciona el workflow "Pruebas E2E con Cypress"
3. Haz clic en **Run workflow**
4. Selecciona la rama y haz clic en **Run workflow**

## 📊 Ver Resultados

Después de cada ejecución:

1. Ve a la pestaña **Actions** en GitHub
2. Haz clic en el workflow que quieres revisar
3. Descarga los artefactos (videos y screenshots) si hay fallos

## 💡 Recomendaciones

- **Horarios de bajo tráfico**: Ejecuta las pruebas en horarios donde haya menos usuarios activos
- **Frecuencia razonable**: No ejecutes cada minuto, consume recursos innecesariamente
- **Días laborables**: Considera ejecutar más frecuentemente en días laborables
- **Notificaciones**: Configura notificaciones por email en GitHub para recibir alertas de fallos

