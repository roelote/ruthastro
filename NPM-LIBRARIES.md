# Migración de CDN a NPM

## Resumen
Se han migrado todas las librerías JavaScript y CSS desde CDN a instalaciones locales vía npm para mejorar el rendimiento, seguridad y control de versiones.

## Librerías migradas

### 1. **Swiper** (Carrusel)
- **Antes**: `https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css`
- **Ahora**: `npm install swiper` (ya estaba instalado, ahora se usa correctamente)
- **Versión actual**: 12.0.3

### 2. **Fancybox** (Lightbox/Galería)
- **Antes**: `https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.css`
- **Ahora**: `npm install @fancyapps/ui`
- **Versión instalada**: 5.0.36

## Cambios realizados

### `package.json`
```json
{
  "dependencies": {
    "@fancyapps/ui": "^5.0.36",
    "@tailwindcss/vite": "^4.1.17",
    "astro": "^5.16.0",
    "swiper": "^12.0.3",
    "tailwindcss": "^4.1.17"
  }
}
```

### `src/layouts/Layout.astro`
**Imports agregados:**
```astro
---
import '../styles/global.css';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
---
```

**Eliminado del HTML:**
```html
<!-- ❌ Ya no necesario -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0.36/dist/fancybox/fancybox.umd.js"></script>
```

### Archivos actualizados con imports

#### `src/pages/index.astro`
```javascript
<script>
  import Swiper from 'swiper';
  import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

  const swiper = new Swiper('.hero-swiper', {
    modules: [Navigation, Pagination, Autoplay, EffectFade],
    // ... configuración
  });
</script>
```

#### `src/pages/[slug].astro`
```javascript
<script>
  import { Fancybox } from '@fancyapps/ui';

  Fancybox.bind('[data-fancybox="gallery"]', {
    // ... configuración
  });
</script>
```

#### `src/pages/tour/[slug].astro`
```javascript
<script>
  import { Fancybox } from '@fancyapps/ui';
  import Swiper from 'swiper';
  import { Navigation, Pagination, Autoplay } from 'swiper/modules';

  // Código de inicialización...
</script>
```

#### `src/components/TourContent.astro`
```javascript
<script>
  import { Fancybox } from '@fancyapps/ui';
  import Swiper from 'swiper';
  import { Navigation, Pagination, Autoplay } from 'swiper/modules';

  // Código de inicialización...
</script>
```

## Ventajas de usar npm en lugar de CDN

### 1. **Rendimiento mejorado**
- ✅ **Bundling optimizado**: Astro/Vite optimiza y minimiza los archivos
- ✅ **Code splitting**: Solo carga el código necesario por página
- ✅ **Tree shaking**: Elimina código no utilizado
- ✅ **Cache del navegador**: Los archivos locales se cachean mejor

### 2. **Sin dependencia externa**
- ✅ **Funciona offline**: No requiere conexión a CDN
- ✅ **Sin fallos por CDN caído**: jsdelivr.net puede tener downtime
- ✅ **Sin bloqueos regionales**: Algunos países bloquean CDNs

### 3. **Control de versiones**
- ✅ **Versiones fijas**: No hay actualizaciones inesperadas
- ✅ **Reproducibilidad**: `package-lock.json` garantiza mismas versiones
- ✅ **Seguridad**: Auditable con `npm audit`

### 4. **Desarrollo más rápido**
- ✅ **Autocompletado IDE**: TypeScript/IntelliSense funciona mejor
- ✅ **Debugging**: Puedes debuggear el código fuente
- ✅ **Hot Module Replacement**: Cambios instantáneos en desarrollo

### 5. **Menor latencia**
- ✅ **Mismo servidor**: Todo se sirve desde tu dominio
- ✅ **HTTP/2 multiplexing**: Mejor aprovechamiento de conexiones
- ✅ **Sin CORS**: No hay problemas de Cross-Origin

## Módulos de Swiper utilizados

### Navigation
Control de flechas anterior/siguiente en carruseles.

### Pagination
Bullets/indicadores de paginación en carruseles.

### Autoplay
Rotación automática de slides.

### EffectFade
Transición de fundido entre slides (usado en hero y tours destacados).

## Cómo actualizar versiones

### Actualizar Swiper
```bash
npm update swiper
```

### Actualizar Fancybox
```bash
npm update @fancyapps/ui
```

### Ver versiones disponibles
```bash
npm view swiper versions
npm view @fancyapps/ui versions
```

### Instalar versión específica
```bash
npm install swiper@12.1.0
npm install @fancyapps/ui@5.1.0
```

## Testing

Para verificar que todo funciona correctamente:

1. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Verificar en el navegador:**
   - Abrir http://localhost:4321
   - Probar carruseles (hero, testimonios, tours destacados)
   - Probar galerías de imágenes con Fancybox
   - Abrir DevTools → Network → Verificar que no hay requests a CDN

3. **Build de producción:**
   ```bash
   npm run build
   npm run preview
   ```

4. **Verificar bundle size:**
   Los archivos optimizados deben estar en `dist/`

## Estructura de archivos generados

Después de `npm run build`, Astro genera:

```
dist/
├── _astro/
│   ├── swiper.xxxxx.js        # Swiper optimizado
│   ├── fancybox.xxxxx.css     # Fancybox CSS optimizado
│   ├── fancybox.xxxxx.js      # Fancybox JS optimizado
│   └── ...
└── index.html
```

## Compatibilidad de navegadores

### Swiper 12.0.3
- Chrome/Edge: últimas 2 versiones
- Firefox: últimas 2 versiones
- Safari: últimas 2 versiones
- iOS Safari: 12+
- Android Chrome: últimas 2 versiones

### Fancybox 5.0.36
- Chrome/Edge: últimas 2 versiones
- Firefox: últimas 2 versiones
- Safari: 13+
- iOS Safari: 13+

## Troubleshooting

### Error: "Cannot find module 'swiper'"
**Solución:**
```bash
npm install
```

### Error: "Fancybox is not defined"
**Verificar:**
- Que el import esté presente: `import { Fancybox } from '@fancyapps/ui';`
- Que no uses `is:inline` en el script (usa `<script>` normal)

### Carruseles no funcionan
**Verificar:**
- Que los módulos estén importados: `import { Navigation, Pagination, Autoplay } from 'swiper/modules';`
- Que los módulos estén en la configuración: `modules: [Navigation, Pagination, Autoplay]`

### CSS no se aplica correctamente
**Verificar:**
- Que los imports de CSS estén en `Layout.astro`
- Que el orden sea correcto (global.css primero)

## Recursos adicionales

- [Swiper Documentation](https://swiperjs.com/)
- [Fancybox Documentation](https://fancyapps.com/docs/ui/fancybox/)
- [Astro Client Scripts](https://docs.astro.build/en/guides/client-side-scripts/)
- [Vite Asset Handling](https://vitejs.dev/guide/assets.html)

## Comandos útiles

```bash
# Ver dependencias instaladas
npm list --depth=0

# Verificar vulnerabilidades
npm audit

# Limpiar cache npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Build optimizado para producción
npm run build

# Analizar bundle size
npm run build -- --analyze
```

## Próximos pasos recomendados

1. ✅ Configurar preload para assets críticos
2. ✅ Implementar lazy loading de imágenes
3. ✅ Configurar Service Worker para PWA
4. ✅ Optimizar fuentes web (usar variable fonts)
5. ✅ Implementar Critical CSS
