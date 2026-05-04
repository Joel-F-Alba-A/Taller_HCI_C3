# 📤 Instrucciones para Desplegar en GitHub Pages

## Estado Actual
✅ El proyecto ya está configurado para GitHub Pages:
- Vite configurado con `base: '/dashboard/'`
- Script de deploy disponible: `npm run deploy`
- Workflow automatizado de GitHub Actions creado (`.github/workflows/deploy.yml`)

---

## 📋 PASO A PASO EN GITHUB

### **PASO 1: Crear/Configurar el Repositorio en GitHub**

1. Ve a https://github.com/new
2. Crea un repositorio llamado **`dashboard`** (IMPORTANTÍSIMO: debe ser exactamente así)
3. Si es la primera vez:
   - NO selecciones "Initialize this repository with a README"
   - Haz clic en "Create repository"

### **PASO 2: Configurar GitHub Pages (Configuración del Repo)**

1. Ve al repositorio en GitHub
2. Haz clic en **Settings** (engranaje) → **Pages** (en el menú lateral izq)
3. En "Build and deployment":
   - **Source**: Selecciona **"Deploy from a branch"**
   - **Branch**: Selecciona **`gh-pages`** y carpeta **`/ (root)`**
   - Haz clic en **Save**

> La rama `gh-pages` se creará automáticamente cuando hagas el primer deploy

### **PASO 3: Push a GitHub (desde tu máquina)**

En la carpeta del proyecto, ejecuta:

```bash
# Inicializa git si no lo has hecho
git init

# Agrega tu usuario/email de git
git config user.email "tu_email@ejemplo.com"
git config user.name "Tu Nombre"

# Agrega todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit: dashboard setup"

# Agrega el repositorio remoto (reemplaza USERNAME con tu usuario de GitHub)
git remote add origin https://github.com/USERNAME/dashboard.git

# Cambia la rama principal a 'main' (recomendado para nuevos repos)
git branch -M main

# Push al repositorio
git push -u origin main
```

### **PASO 4: Espera a que GitHub Actions Deploy Automáticamente**

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás un workflow "Deploy to GitHub Pages" en ejecución
3. Espera a que termine (colores: 🟡 amarillo = en progreso, ✅ verde = completado)
4. Cuando esté listo, tu sitio estará en: **`https://USERNAME.github.io/dashboard/`**

> ⏳ Puede tomar 1-2 minutos en la primera ejecución

### **PASO 5: Verificar que Funciona**

1. Ve a **https://USERNAME.github.io/dashboard/** (reemplaza USERNAME)
2. Si ves el dashboard, ¡está hecho! 🎉
3. Si ves error 404:
   - Espera 2-3 minutos más (GitHub a veces es lento)
   - Recarga la página (Ctrl+F5 o Cmd+Shift+R para limpiar caché)
   - Verifica que en Settings → Pages diga "Your site is live at..."

---

## 🚀 FUTURAS ACTUALIZACIONES

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

GitHub Actions se ejecutará automáticamente y desplegará los cambios. Listo.

---

## ❌ PROBLEMAS COMUNES

### "Página no carga correctamente"
- Borra caché del navegador (Ctrl+Shift+Delete)
- Espera 5 minutos
- Revisa que la URL sea exactamente: `https://USERNAME.github.io/dashboard/`

### "Veo error 404"
- Verifica en Settings → Pages que la rama sea `gh-pages`
- Revisa los Actions - si hay error, haz clic para ver detalles
- Asegúrate de que `vite.config.ts` tiene `base: '/dashboard/'`

### "GitHub Actions falla"
- Haz clic en el workflow que falló en la pestaña Actions
- Lee los logs rojo para ver qué salió mal
- Usualmente es por falta de npm install o error en build

---

## 💡 MÉTODO ALTERNATIVO (Manual con gh-pages)

Si prefieres no usar GitHub Actions, puedes hacer deploy manual:

```bash
npm run deploy
```

Esto compila y sube automáticamente a la rama `gh-pages` usando tu token de GitHub.
Para que funcione:
1. Ve a GitHub → tu perfil → **Settings** → **Developer settings** → **Personal access tokens**
2. Genera un token con permisos `public_repo` o `repo`
3. Copia el token y en tu terminal ejecuta:
   ```bash
   git remote set-url origin https://TOKEN@github.com/USERNAME/dashboard.git
   ```

---

## ✨ RESUMEN RÁPIDO

1. Crea repo "dashboard" en GitHub ✅
2. Configura Pages para rama `gh-pages` ✅
3. Haz git init, add, commit, push ✅
4. GitHub Actions se ejecuta solo ✅
5. Tu sitio aparece en `https://USERNAME.github.io/dashboard/` ✅

**¿Dudas?** Revisa los logs en GitHub Actions (pestaña Actions del repo)
