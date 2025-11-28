# Integración de Yoast SEO con Astro

Este documento explica cómo se ha integrado Yoast SEO de WordPress con el sitio Astro de Ruth Amazon Expeditions.

## ¿Qué se ha implementado?

### 1. Funciones en `wordpress.ts`

Se han agregado las siguientes funciones al archivo `src/utils/wordpress.ts`:

#### `getYoastSEO(slug, type)`
Obtiene todos los metadatos de Yoast SEO para una página o post específico.

**Parámetros:**
- `slug`: El slug de la página/post (ej: 'inicio', 'pacaya-samiria-3-dias')
- `type`: 'pages' o 'posts'

**Retorna:**
```typescript
{
  title: string,              // Meta title
  description: string,        // Meta description
  canonical: string,          // URL canónica
  og_title: string,          // Open Graph title
  og_description: string,    // Open Graph description
  og_image: string,          // Open Graph image URL
  og_type: string,           // Open Graph type (website, article)
  og_url: string,            // Open Graph URL
  twitter_card: string,      // Twitter card type
  twitter_title: string,     // Twitter title
  twitter_description: string,// Twitter description
  twitter_image: string,     // Twitter image URL
  robots: {
    index: string,           // 'index' o 'noindex'
    follow: string           // 'follow' o 'nofollow'
  }
}
```

#### `getSiteInfo()`
Obtiene información general del sitio WordPress incluyendo el favicon.

**Retorna:**
```typescript
{
  name: string,              // Nombre del sitio
  description: string,       // Descripción del sitio
  url: string,              // URL del sitio
  home: string,             // URL de la home
  icon: {
    favicon: string,        // URL del favicon
    icon_192: string,       // Ícono 192x192 para PWA
    icon_512: string        // Ícono 512x512 para PWA
  }
}
```

### 2. Layout actualizado (`Layout.astro`)

El componente Layout ahora acepta las siguientes props:

```typescript
interface Props {
  title?: string;
  description?: string;
  yoastSEO?: YoastSEO | null;
  favicon?: string;
  canonical?: string;
}
```

**Características:**
- Si `yoastSEO` está presente, usa esos datos automáticamente
- Si no, usa los valores por defecto de `title` y `description`
- Genera todas las meta tags necesarias:
  - Meta title y description
  - Canonical URL
  - Open Graph (Facebook)
  - Twitter Cards
  - Robots meta tags
  - Favicon dinámico

### 3. Páginas actualizadas

#### `index.astro` (Página de inicio)
```astro
// Obtener Yoast SEO para la página de inicio
const yoastSEO = await getYoastSEO('inicio', 'pages');

// Obtener favicon
const siteInfo = await getSiteInfo();
const favicon = siteInfo?.icon?.favicon || '/favicon.svg';

// Pasar al Layout
<Layout 
  title="Ruth Amazon Expeditions - Tours en Pacaya Samiria"
  description="..."
  yoastSEO={yoastSEO}
  favicon={favicon}
>
```

#### `[slug].astro` (Páginas y posts dinámicos)
```astro
// Obtener SEO según el tipo
const yoastSEO = await getYoastSEO(
  content.slug, 
  type === 'post' ? 'posts' : 'pages'
);

const siteInfo = await getSiteInfo();
const favicon = siteInfo?.icon?.favicon || '/favicon.svg';

<Layout 
  title={content.title.rendered}
  description={content.excerpt.rendered}
  yoastSEO={yoastSEO}
  favicon={favicon}
>
```

#### `tour/[slug].astro` (Tours individuales)
Similar a `[slug].astro` pero específico para posts de tipo tour.

## Requisitos en WordPress

### 1. Yoast SEO Plugin
Debes tener instalado y activado el plugin **Yoast SEO** en tu WordPress.

### 2. API REST habilitada
Yoast SEO expone automáticamente los metadatos en la API REST de WordPress a través de:
- `yoast_head_json`: Objeto JSON con todos los metadatos (recomendado)
- `yoast_head`: HTML raw con las meta tags

### 3. Configuración del endpoint

Por defecto, la integración usa:
```
http://web.ruth/wp-json/wp/v2/pages?slug=inicio
http://web.ruth/wp-json/wp/v2/posts?slug=pacaya-samiria-3-dias
```

**Ejemplo de respuesta con Yoast SEO:**
```json
{
  "id": 123,
  "title": { "rendered": "Pacaya Samiria 3 Días" },
  "slug": "pacaya-samiria-3-dias",
  "yoast_head_json": {
    "title": "Pacaya Samiria 3 Días | Ruth Amazon Expeditions",
    "description": "Tour de 3 días por la reserva...",
    "robots": {
      "index": "index",
      "follow": "follow"
    },
    "canonical": "https://ruthamazonexpeditions.com/tour/pacaya-samiria-3-dias",
    "og_locale": "es_ES",
    "og_type": "article",
    "og_title": "Pacaya Samiria 3 Días",
    "og_description": "Tour de 3 días...",
    "og_url": "https://ruthamazonexpeditions.com/tour/pacaya-samiria-3-dias",
    "og_site_name": "Ruth Amazon Expeditions",
    "og_image": [
      {
        "url": "https://ruthamazonexpeditions.com/wp-content/uploads/tour.jpg"
      }
    ],
    "twitter_card": "summary_large_image",
    "twitter_title": "Pacaya Samiria 3 Días",
    "twitter_description": "Tour de 3 días...",
    "twitter_image": "https://ruthamazonexpeditions.com/wp-content/uploads/tour.jpg"
  }
}
```

## Cómo configurar Yoast SEO en WordPress

### Para la página de inicio:
1. Ve a **Páginas** → Editar la página "Inicio"
2. Desplázate hasta la sección **Yoast SEO**
3. Configura:
   - **Título SEO**: Ruth Amazon Expeditions - Tours en Pacaya Samiria 2026
   - **Meta description**: Descubre la Reserva Nacional Pacaya Samiria...
   - **URL canónica**: https://ruthamazonexpeditions.com
   - **Imagen de compartir en redes sociales**: Sube una imagen destacada

### Para tours (posts):
1. Ve a **Entradas** → Editar el tour
2. En la sección **Yoast SEO**:
   - **Título SEO**: [Nombre del Tour] | Ruth Amazon Expeditions
   - **Meta description**: Descripción atractiva del tour (máx 160 caracteres)
   - **Focus keyphrase**: Ej: "tour pacaya samiria 3 días"
   - **Imagen de compartir**: Imagen destacada del tour

### Configurar favicon:
1. Ve a **Apariencia** → **Personalizar** → **Identidad del sitio**
2. Sube tu favicon (ícono del sitio)
3. WordPress automáticamente lo expondrá en la API REST

## Variables de entorno

Asegúrate de tener configuradas en tu archivo `.env`:

```env
PUBLIC_WORDPRESS_API_URL=http://web.ruth/wp-json/wp/v2
PUBLIC_WORDPRESS_BASE_URL=http://web.ruth
```

Para producción:
```env
PUBLIC_WORDPRESS_API_URL=https://ruthamazonexpeditions.com/wp-json/wp/v2
PUBLIC_WORDPRESS_BASE_URL=https://ruthamazonexpeditions.com
```

## Meta Tags generadas

Con esta integración, cada página genera automáticamente:

```html
<!-- Basic Meta Tags -->
<title>Pacaya Samiria 3 Días | Ruth Amazon Expeditions</title>
<meta name="description" content="Tour de 3 días por la reserva...">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://ruthamazonexpeditions.com/tour/...">

<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="https://ruthamazonexpeditions.com/wp-content/uploads/favicon.ico">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://ruthamazonexpeditions.com/tour/...">
<meta property="og:title" content="Pacaya Samiria 3 Días">
<meta property="og:description" content="Tour de 3 días...">
<meta property="og:image" content="https://ruthamazonexpeditions.com/wp-content/uploads/tour.jpg">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Ruth Amazon Expeditions">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://ruthamazonexpeditions.com/tour/...">
<meta name="twitter:title" content="Pacaya Samiria 3 Días">
<meta name="twitter:description" content="Tour de 3 días...">
<meta name="twitter:image" content="https://ruthamazonexpeditions.com/wp-content/uploads/tour.jpg">
```

## Beneficios

✅ **SEO mejorado**: Todos los metadatos configurados en WordPress se reflejan en Astro
✅ **Open Graph**: Enlaces compartidos en Facebook/LinkedIn muestran preview rico
✅ **Twitter Cards**: Tweets con preview de imagen y descripción
✅ **Favicon dinámico**: El favicon de WordPress se usa automáticamente
✅ **Canonical URLs**: Evita contenido duplicado
✅ **Robots meta tags**: Control sobre indexación por página
✅ **Centralizado**: Todo el SEO se gestiona desde WordPress (CMS)

## Testing

Para verificar que funciona correctamente:

1. **Inspeccionar HTML generado:**
   - Abre una página en el navegador
   - Click derecho → "Ver código fuente de la página"
   - Verifica que las meta tags están presentes

2. **Validar Open Graph:**
   - Usa [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Pega la URL de tu página
   - Verifica que muestra título, descripción e imagen correctos

3. **Validar Twitter Cards:**
   - Usa [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - Pega la URL de tu página
   - Verifica el preview

4. **Validar meta tags generales:**
   - Usa [Meta Tags](https://metatags.io/)
   - Verifica cómo se ve en Google, Facebook, Twitter, LinkedIn

## Troubleshooting

### Las meta tags no aparecen
- Verifica que Yoast SEO esté instalado y activado en WordPress
- Comprueba que el slug en `getYoastSEO()` coincide con el slug de WordPress
- Revisa la consola del navegador por errores de fetch

### El favicon no se muestra
- Ve a WordPress → Apariencia → Personalizar → Identidad del sitio
- Asegúrate de tener un ícono de sitio configurado
- Verifica la URL en la respuesta de `getSiteInfo()`

### Los datos de Yoast no se actualizan
- Limpia la caché de WordPress (si usas plugin de caché)
- Regenera el sitio Astro: `npm run build`
- Verifica que `yoast_head_json` esté en la respuesta de la API REST

## Próximos pasos recomendados

1. **Schema.org / JSON-LD**: Yoast SEO también genera datos estructurados que puedes integrar
2. **Sitemap XML**: Usa el sitemap de Yoast SEO o genera uno en Astro
3. **Breadcrumbs**: Implementar breadcrumbs basados en la estructura de WordPress
4. **Multilingual**: Si usas WPML o Polylang, agregar soporte multiidioma

## Documentación adicional

- [Yoast SEO API Documentation](https://developer.yoast.com/customization/apis/rest-api/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
