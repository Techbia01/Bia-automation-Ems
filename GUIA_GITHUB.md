# 🚀 Guía Completa: Configurar GitHub para Compartir el Proyecto

## Paso 1: Instalar Git

### Opción A: Instalar Git para Windows
1. Ve a: https://git-scm.com/download/win
2. Descarga el instalador (se descargará automáticamente)
3. Ejecuta el instalador `.exe`
4. **Durante la instalación:**
   - Acepta todas las opciones por defecto (Next, Next, Next...)
   - En "Choosing the default editor", puedes dejar "Nano" o elegir otro
   - En "Adjusting your PATH environment", deja "Git from the command line and also from 3rd-party software"
   - Click en "Install"
5. Una vez instalado, **cierra y vuelve a abrir PowerShell/Terminal**

### Verificar instalación:
Abre PowerShell y ejecuta:
```bash
git --version
```
Deberías ver algo como: `git version 2.x.x`

---

## Paso 2: Configurar Git (solo la primera vez)

Abre PowerShell y ejecuta estos comandos (reemplaza con tu información):

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"
```

**Ejemplo:**
```bash
git config --global user.name "Juan Pérez"
git config --global user.email "juan.perez@bia.app"
```

---

## Paso 3: Crear una cuenta en GitHub (si no tienes)

1. Ve a: https://github.com
2. Click en "Sign up"
3. Completa el formulario:
   - Username (ej: juan-perez)
   - Email
   - Contraseña
4. Verifica tu email
5. Completa el setup inicial

---

## Paso 4: Crear un Repositorio en GitHub

1. Inicia sesión en GitHub
2. Click en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Completa:
   - **Repository name:** `ems-cypress` (o el nombre que prefieras)
   - **Description:** "Proyecto de tests Cypress para EMS"
   - **Visibility:** 
     - ✅ **Public** (cualquiera puede verlo)
     - 🔒 **Private** (solo tú y quienes invites pueden verlo)
   - **NO marques** "Add a README file" (ya tenemos archivos)
   - **NO marques** "Add .gitignore" (ya tenemos uno)
   - **NO marques** "Choose a license"
4. Click en **"Create repository"**

---

## Paso 5: Conectar tu Proyecto Local con GitHub

Abre PowerShell en la carpeta del proyecto (`C:\Users\User\OneDrive\Desktop\EMS`) y ejecuta:

### 5.1. Inicializar Git en el proyecto
```bash
git init
```

### 5.2. Agregar todos los archivos
```bash
git add .
```

### 5.3. Hacer el primer commit
```bash
git commit -m "Initial commit - Proyecto Cypress EMS"
```

### 5.4. Conectar con GitHub
**Reemplaza `TU_USUARIO` y `NOMBRE_REPO` con tus datos:**
```bash
git remote add origin https://github.com/TU_USUARIO/NOMBRE_REPO.git
```

**Ejemplo:**
```bash
git remote add origin https://github.com/juan-perez/ems-cypress.git
```

### 5.5. Cambiar la rama principal a "main"
```bash
git branch -M main
```

### 5.6. Subir el código a GitHub
```bash
git push -u origin main
```

**Nota:** Te pedirá autenticarte:
- Si te pide usuario/contraseña, usa un **Personal Access Token** (ver Paso 6)
- O puedes usar GitHub Desktop (más fácil)

---

## Paso 6: Autenticación en GitHub (Personal Access Token)

Si `git push` te pide autenticación:

### Crear un Personal Access Token:
1. En GitHub, click en tu foto de perfil (arriba derecha)
2. Ve a **Settings**
3. En el menú izquierdo, click en **Developer settings**
4. Click en **Personal access tokens** → **Tokens (classic)**
5. Click en **Generate new token** → **Generate new token (classic)**
6. Completa:
   - **Note:** "Token para EMS proyecto"
   - **Expiration:** Elige una fecha (ej: 90 días)
   - **Select scopes:** Marca ✅ **repo** (esto da acceso completo a repositorios)
7. Click en **Generate token**
8. **COPIA EL TOKEN** (solo se muestra una vez, guárdalo bien)

### Usar el token:
Cuando `git push` te pida:
- **Username:** Tu usuario de GitHub
- **Password:** Pega el **Personal Access Token** (NO tu contraseña normal)

---

## Paso 7: Compartir el Repositorio

Una vez subido, puedes compartir el proyecto de dos formas:

### Opción A: Compartir el enlace del repositorio
1. Ve a tu repositorio en GitHub
2. Click en el botón verde **"Code"**
3. Copia la URL (ej: `https://github.com/juan-perez/ems-cypress.git`)
4. Comparte esta URL con tu compañera

### Opción B: Invitar colaboradores (para repositorios privados)
1. En tu repositorio, ve a **Settings**
2. Click en **Collaborators** (menú izquierdo)
3. Click en **Add people**
4. Escribe el username o email de tu compañera
5. Click en **Add [nombre] to this repository**

---

## Comandos Útiles para el Futuro

```bash
# Ver el estado de los archivos
git status

# Agregar archivos modificados
git add .

# Hacer commit de cambios
git commit -m "Descripción de los cambios"

# Subir cambios a GitHub
git push

# Descargar cambios de GitHub
git pull

# Ver el historial de commits
git log
```

---

## ✅ Verificación Final

Para verificar que todo está bien:
```bash
git remote -v
```

Deberías ver la URL de tu repositorio de GitHub.

---

## 🆘 Solución de Problemas

### Si `git push` da error de autenticación:
- Usa un Personal Access Token en lugar de tu contraseña
- O instala GitHub Desktop (más fácil para principiantes)

### Si quieres una alternativa más fácil:
**GitHub Desktop:**
1. Descarga: https://desktop.github.com/
2. Instálalo
3. Inicia sesión con tu cuenta de GitHub
4. File → Add Local Repository → Selecciona tu carpeta EMS
5. Click en "Publish repository"

---

¡Listo! 🎉 Tu proyecto ya está en GitHub y puedes compartirlo fácilmente.

