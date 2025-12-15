# 🚀 Guía Rápida: Configurar Slack en 5 Minutos

## ✅ Checklist de Configuración

- [ ] Paso 1: Crear app en Slack
- [ ] Paso 2: Activar Incoming Webhooks
- [ ] Paso 3: Copiar Webhook URL
- [ ] Paso 4: Agregar secret en GitHub
- [ ] Paso 5: Probar la configuración

---

## 📝 Instrucciones Detalladas

### 🔵 PASO 1: Ir a Slack API

1. Abre tu navegador y ve a: **https://api.slack.com/apps**
2. Inicia sesión con tu cuenta de Slack si es necesario

**¿Qué verás?** Una página con una lista de aplicaciones (probablemente vacía si es tu primera vez)

---

### 🔵 PASO 2: Crear Nueva Aplicación

1. Haz clic en el botón verde **"Create New App"** (arriba a la derecha)
2. Selecciona **"From scratch"**
3. Completa el formulario:
   - **App Name**: `Cypress Tests` (o el nombre que prefieras)
   - **Pick a workspace**: Selecciona tu workspace de la lista
4. Haz clic en **"Create App"**

**¿Qué verás?** Te llevará a la página de configuración de tu nueva app

---

### 🔵 PASO 3: Activar Incoming Webhooks

1. En el menú lateral izquierdo, busca y haz clic en **"Incoming Webhooks"**
   - Si no lo ves, busca en "Features" → "Incoming Webhooks"
2. Verás un toggle que dice **"Activate Incoming Webhooks"**
3. **Actívalo** (debe quedar en color verde/ON)
4. Haz clic en el botón **"Add New Webhook to Workspace"** (aparece después de activar)

**¿Qué verás?** Una página de autorización de Slack

---

### 🔵 PASO 4: Seleccionar Canal

1. Te mostrará una lista de canales de tu workspace
2. **Selecciona el canal** donde quieres recibir las notificaciones
   - Ejemplos: `#qa-tests`, `#dev-notifications`, `#general`
   - También puedes crear un canal nuevo desde aquí
3. Haz clic en **"Allow"**

**¿Qué verás?** Te regresará a la página de Incoming Webhooks

---

### 🔵 PASO 5: Copiar el Webhook URL

1. Ahora verás una sección que dice **"Webhook URLs for Your Workspace"**
2. Verás un URL que comienza con: `https://hooks.slack.com/services/...`
3. **Haz clic en "Copy"** o selecciona y copia todo el URL
4. **¡Guárdalo temporalmente!** Lo necesitarás en el siguiente paso

**Ejemplo de cómo se ve:**
El URL comenzará con `https://hooks.slack.com/services/` seguido de identificadores únicos de Slack.

---

### 🔵 PASO 6: Configurar en GitHub

1. Ve a tu repositorio en GitHub (ej: `https://github.com/tu-usuario/EMS`)
2. Haz clic en **"Settings"** (arriba en el menú del repositorio)
3. En el menú lateral izquierdo, busca **"Secrets and variables"**
4. Haz clic en **"Actions"**
5. Haz clic en el botón **"New repository secret"** (arriba a la derecha)
6. Completa el formulario:
   - **Name**: Escribe exactamente: `SLACK_WEBHOOK_URL`
   - **Secret**: Pega el Webhook URL que copiaste en el Paso 5
7. Haz clic en **"Add secret"**

**¿Qué verás?** Una lista de secrets con `SLACK_WEBHOOK_URL` en ella

---

### 🔵 PASO 7: Probar la Configuración

#### Opción A: Ejecutar Manualmente (Recomendado para probar)

1. Ve a la pestaña **"Actions"** en tu repositorio de GitHub
2. En el menú lateral, selecciona **"Pruebas E2E con Cypress"**
3. Haz clic en **"Run workflow"** (arriba a la derecha)
4. Selecciona la rama (probablemente `main` o `master`)
5. Haz clic en **"Run workflow"** (botón verde)
6. Espera unos minutos a que se ejecute
7. **Revisa tu canal de Slack** - deberías ver una notificación

#### Opción B: Hacer un Push

1. Haz cualquier cambio pequeño en tu código
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "Test: probar notificaciones Slack"
   git push
   ```
3. El workflow se ejecutará automáticamente
4. **Revisa tu canal de Slack** después de unos minutos

---

## ✅ Verificación

### ¿Cómo saber si funcionó?

1. **En GitHub Actions:**
   - Ve a la pestaña "Actions"
   - Abre la ejecución más reciente
   - Busca el paso "Enviar notificación a Slack"
   - Debe aparecer con un ✅ verde

2. **En Slack:**
   - Ve al canal que seleccionaste
   - Deberías ver un mensaje que dice:
     ```
     🧪 Reporte de Pruebas Cypress
     
     Estado: ✅ Todas las pruebas pasaron exitosamente
     ...
     ```

---

## 🐛 Problemas Comunes

### ❌ No recibo notificaciones

**Solución 1:** Verifica que el secret esté configurado
- Ve a Settings → Secrets → Actions
- Confirma que `SLACK_WEBHOOK_URL` existe y tiene el URL correcto

**Solución 2:** Verifica el Webhook URL
- Ve a Slack → Apps → Tu app → Incoming Webhooks
- Confirma que el webhook está activo
- Prueba copiarlo de nuevo y actualizar el secret en GitHub

**Solución 3:** Revisa los logs de GitHub Actions
- Ve a Actions → Abre la ejecución más reciente
- Busca el paso "Enviar notificación a Slack"
- Si hay un error, aparecerá en rojo con detalles

### ❌ El webhook dejó de funcionar

- Ve a Slack → Apps → Tu app → Incoming Webhooks
- Regenera el webhook (haz clic en "Revoke" y crea uno nuevo)
- Copia el nuevo URL y actualiza el secret en GitHub

---

## 🎉 ¡Listo!

Una vez configurado, recibirás notificaciones automáticas:
- ✅ Cuando las pruebas pasen exitosamente
- ❌ Cuando alguna prueba falle
- 📊 Con enlaces directos a los resultados en GitHub

**Las notificaciones se enviarán:**
- Cuando hagas push al repositorio
- Cuando crees un Pull Request
- Según el horario programado (6 AM y 6 PM UTC por defecto)
- Cuando ejecutes el workflow manualmente

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa la sección "Solución de Problemas" arriba
2. Verifica que seguiste todos los pasos correctamente
3. Asegúrate de que tienes permisos en Slack y GitHub

