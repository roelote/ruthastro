# Despliegue en Vercel

## 📦 Pasos para desplegar

### 1. Conectar el repositorio con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub: `roelote/ruthastro`
4. Vercel detectará automáticamente que es un proyecto Astro

### 2. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a **Settings → Environment Variables** y añade:

| Variable | Valor | Entorno |
|----------|-------|---------|
| `PUBLIC_WORDPRESS_API_URL` | `https://cms.ruthamazonexpeditions.com/wp-json/wp/v2` | Production |
| `PUBLIC_WORDPRESS_BASE_URL` | `https://cms.ruthamazonexpeditions.com` | Production |

**Nota:** Las variables con prefijo `PUBLIC_` son expuestas al cliente en Astro.

### 3. Configuración del Build

Vercel detectará automáticamente:
- **Framework Preset:** Astro
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** 18.x o superior

### 4. Desplegar

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu sitio automáticamente
3. Cada push a `main` activará un nuevo despliegue automático

## 🔄 Flujo de trabajo

- **Desarrollo local:** `npm run dev` → usa `.env` con `web.ruth`
- **Vista previa:** Cada push a cualquier rama crea un preview deployment
- **Producción:** Push a `main` → despliega a `ruthamazonexpeditions.com`

## 🌐 Configuración de Dominio en Vercel

1. En el dashboard de Vercel, ve a **Settings → Domains**
2. Agrega el dominio: `ruthamazonexpeditions.com`
3. Vercel te dará los registros DNS que debes configurar en tu proveedor de dominio
4. También puedes agregar `www.ruthamazonexpeditions.com` como alias

## 🔗 URLs

- **Desarrollo:** http://localhost:4321
- **WordPress CMS (Backend):** https://cms.ruthamazonexpeditions.com
- **Frontend (Producción):** https://ruthamazonexpeditions.com

## ✅ Verificación

Para verificar que las variables de entorno funcionan correctamente, puedes agregar esto temporalmente en una página:

```astro
---
console.log('API URL:', import.meta.env.PUBLIC_WORDPRESS_API_URL);
---
```

## 🚀 Comandos útiles

```bash
# Desarrollo
npm run dev

# Build de producción local (para probar)
npm run build

# Preview del build
npm run preview
```

## 📝 Notas importantes

1. El archivo `.env` NO se sube a git (es solo para desarrollo local)
2. Las variables de producción se configuran directamente en Vercel
3. Vercel regenera el sitio automáticamente con cada push
4. Los logs de build están disponibles en el dashboard de Vercel
