# Configuración de Contact Form 7 con Astro

## 📋 Requisitos

1. **WordPress** con Contact Form 7 instalado y activado
2. **Plugin adicional**: Contact Form 7 REST API Endpoints (opcional pero recomendado)

## 🔧 Configuración en WordPress

### Paso 1: Instalar Contact Form 7

```bash
# Desde el panel de WordPress
Plugins > Añadir nuevo > Buscar "Contact Form 7" > Instalar > Activar
```

### Paso 2: Crear el formulario

1. Ve a **Contacto > Añadir nuevo**
2. Dale un título al formulario (ej: "Contact Tours")
3. Crea un formulario con estos campos:

```html
<div class="contacts border p-3 rounded">
<label>Nombres: </label>
[text* nombres]
<label>Email: </label>
[email* emails]
<label>Telefono: </label>
[text* telefono]
<label>Fecha: </label>
[date fecha]
<label>Mensaje: </label>
[textarea mensaje 3x5]
[submit class:send-ruth "Enviar Mensaje"]
</div>
```

3. **Guarda el formulario** y copia el **shortcode** que aparece
   - Ejemplo: `[contact-form-7 id="b32fc06" title="Contact Tours"]`
   - El hash alfanumérico (ej: `b32fc06`) es el **ID del formulario**

### Paso 3: Obtener el ID del formulario

Hay dos formas de obtener el ID:

**Opción 1: Desde el shortcode**
- El shortcode muestra: `[contact-form-7 id="b32fc06" title="Contact Tours"]`
- El ID es: `b32fc06`

**Opción 2: Desde la lista de formularios**
- Ve a **Contacto > Formularios de contacto**
- Pasa el ratón sobre tu formulario
- En la URL verás: `post=wpcf7-f12345-o1` o el hash
- También aparece en la columna "Shortcode"

### Paso 4: Configurar el endpoint REST API

Contact Form 7 incluye REST API por defecto desde la versión 5.4+.

**Endpoint:**
```
POST https://tudominio.com/wp-json/contact-form-7/v1/contact-forms/{FORM_ID}/feedback
```

**Ejemplos válidos:**
- `contact-forms/b32fc06/feedback` (hash alfanumérico - versiones nuevas)
- `contact-forms/123/feedback` (ID numérico - versiones antiguas)

### Paso 5: Habilitar CORS (si es necesario)

Agrega esto a tu `functions.php` del tema de WordPress:

```php
// Permitir CORS para Contact Form 7 REST API
add_filter('rest_pre_serve_request', function($served, $result, $request) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit;
    }
    
    return $served;
}, 10, 3);
```

## 🚀 Configuración en Astro

### Paso 1: Actualizar el ID del formulario

En el archivo `src/pages/tour/[slug].astro`, busca esta línea:

```javascript
const CF7_FORM_ID = 'b32fc06'; // ⚠️ CAMBIAR ESTE ID/HASH
```

Reemplázalo con el **ID/hash real** de tu formulario Contact Form 7.

**Ejemplos:**
```javascript
// Versión nueva con hash alfanumérico
const CF7_FORM_ID = 'b32fc06';

// Versión antigua con ID numérico
const CF7_FORM_ID = '123';
```

### Paso 2: Actualizar la URL de WordPress

Busca esta línea:

```javascript
const response = await fetch(`http://web.ruth/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`, {
```

Reemplaza `http://web.ruth` con tu URL de WordPress real (ej: `https://tudominio.com`)

## 📝 Campos del formulario

Los nombres de los campos en Astro deben coincidir **exactamente** con los nombres en Contact Form 7:

| Campo en Astro | Campo en CF7 | Tipo |
|----------------|--------------|------|
| `nombres` | `[text* nombres]` | Texto obligatorio |
| `emails` | `[email* emails]` | Email obligatorio |
| `telefono` | `[text* telefono]` | Texto obligatorio |
| `fecha` | `[date fecha]` | Fecha opcional |
| `mensaje` | `[textarea mensaje 3x5]` | Textarea opcional |

## 🧪 Probar el formulario

### 1. Prueba desde WordPress Admin

- Ve a tu formulario en Contact Form 7
- Copia el shortcode `[contact-form-7 id="123"]`
- Crea una página de prueba y pégalo
- Envía el formulario y verifica que llegue el email

### 2. Prueba desde Astro

```bash
# Inicia el servidor de desarrollo
npm run dev
```

- Ve a cualquier página de tour
- Llena el formulario
- Haz clic en "Enviar Solicitud"
- Verifica que aparezca el mensaje de éxito

### 3. Verificar en consola

Abre DevTools (F12) y verifica:
- ✅ No hay errores CORS
- ✅ La respuesta es 200 OK
- ✅ El JSON incluye `status: "mail_sent"`

## 🔍 Troubleshooting

### Error: "No Access-Control-Allow-Origin header"

**Solución:** Agrega el código CORS en `functions.php` (ver Paso 4 arriba)

### Error: "404 Not Found"

**Solución:** 
- Verifica que el ID del formulario sea correcto
- Regenera los permalinks: Ajustes > Enlaces permanentes > Guardar cambios

### Error: "Invalid form ID"

**Solución:** 
- Verifica que el formulario exista y esté publicado
- Asegúrate de usar el ID/hash correcto del shortcode
- Prueba con el endpoint directamente en Postman o curl
- Ejemplo: `[contact-form-7 id="b32fc06"]` → usar `b32fc06`

### El email no llega

**Solución:**
1. Verifica la configuración de email en Contact Form 7
2. Instala un plugin SMTP como "WP Mail SMTP"
3. Revisa el archivo de logs de WordPress

## 📧 Configurar notificaciones por email

En Contact Form 7, ve a la pestaña **"Correo"** del formulario:

**Para (To):**
```
info@ruthamazonexpeditions.com
```

**De (From):**
```
WordPress <wordpress@tudominio.com>
```

**Asunto:**
```
[Solicitud de Tour] [tour-name] - [your-name]
```

**Cuerpo del mensaje:**
```
Nueva solicitud de información para tours

Nombre: [nombres]
Email: [emails]
Teléfono: [telefono]
Fecha preferida: [fecha]

Mensaje:
[mensaje]

--
Este email fue enviado desde el formulario de contacto
```

## 🎨 Personalización

### Cambiar colores del formulario

Edita los estilos en `src/pages/tour/[slug].astro`:

```css
/* Color principal del botón */
.bg-[#15803d] hover:bg-[#166534]

/* Color de focus en inputs */
focus:ring-[#15803d]
```

### Agregar más campos

1. Agrega el campo en Contact Form 7
2. Agrega el input en el HTML del formulario en Astro
3. Los campos se enviarán automáticamente

## 🔐 Seguridad

### Recomendaciones:

1. **Usa reCAPTCHA v3** en Contact Form 7
2. **Limita las peticiones** con un plugin como "Limit Login Attempts"
3. **Usa HTTPS** en producción
4. **No expongas** el ID del formulario si es sensible

## 📚 Recursos

- [Contact Form 7 Docs](https://contactform7.com/docs/)
- [CF7 REST API](https://contactform7.com/rest-api/)
- [Astro Docs](https://docs.astro.build/)

## 🔍 Cómo encontrar el ID del formulario

### Método 1: Desde el shortcode
```
[contact-form-7 id="b32fc06" title="Contact Tours"]
                    ^^^^^^^^
                    Este es el ID
```

### Método 2: Desde la URL del editor
Al editar el formulario, la URL será algo como:
```
/wp-admin/admin.php?page=wpcf7&post=123&action=edit
                                  ^^^
                                  ID numérico (versiones antiguas)
```

### Método 3: Inspeccionar con la API REST
```bash
# Listar todos los formularios
curl https://tudominio.com/wp-json/contact-form-7/v1/contact-forms
```

## ✅ Checklist de implementación

- [ ] Contact Form 7 instalado y activado
- [ ] Formulario creado con los campos correctos
- [ ] Shortcode copiado (contiene el ID/hash)
- [ ] ID/hash extraído del shortcode (ej: `b32fc06`)
- [ ] CORS configurado en functions.php
- [ ] ID/hash actualizado en el código de Astro
- [ ] URL de WordPress actualizada
- [ ] Configuración de email verificada
- [ ] Formulario probado desde WordPress
- [ ] Formulario probado desde Astro
- [ ] Emails llegando correctamente
- [ ] Mensajes de éxito/error funcionando

---

**¿Problemas?** Revisa los logs de WordPress en `wp-content/debug.log` (activar WP_DEBUG en wp-config.php)
