/**
 * fetch-instagram.mjs
 * Descarga las fotos de Instagram y las guarda en public/instagram/
 * Genera src/data/instagram.json con rutas locales (sin URLs que expiran).
 *
 * Uso:
 *   node scripts/fetch-instagram.mjs
 *
 * Se ejecuta automáticamente como "prebuild" antes de cada build.
 * Para desarrollo local corre una vez: npm run fetch:instagram
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Leer .env manualmente (sin depender de dotenv) ──────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const ENV_FILES = [join(ROOT, '.env'), join(ROOT, '.env.production')];

// ── Reemplaza INSTAGRAM_ACCESS_TOKEN en los .env locales que existan ────────
function persistToken(newToken) {
  for (const envPath of ENV_FILES) {
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, 'utf-8');
    const updated = content.match(/^INSTAGRAM_ACCESS_TOKEN=.*$/m)
      ? content.replace(/^INSTAGRAM_ACCESS_TOKEN=.*$/m, `INSTAGRAM_ACCESS_TOKEN=${newToken}`)
      : content.trimEnd() + `\nINSTAGRAM_ACCESS_TOKEN=${newToken}\n`;
    writeFileSync(envPath, updated, 'utf-8');
  }
}

// ── Renueva el token de larga duración (válido ~60 días) ────────────────────
// Debe hacerse ANTES de que expire; un token ya vencido no se puede refrescar,
// hay que generar uno nuevo manualmente en Meta for Developers.
async function refreshToken(token) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `HTTP ${res.status}`);
  }
  return json.access_token;
}

let TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!TOKEN) {
  console.warn('[Instagram] ⚠  No se encontró INSTAGRAM_ACCESS_TOKEN. Se omite la descarga.');
  process.exit(0);
}

try {
  const refreshed = await refreshToken(TOKEN);
  if (refreshed && refreshed !== TOKEN) {
    TOKEN = refreshed;
    process.env.INSTAGRAM_ACCESS_TOKEN = refreshed;
    persistToken(refreshed);
    console.log('[Instagram] ✔  Token renovado automáticamente (válido ~60 días más).');
  }
} catch (e) {
  console.warn(`[Instagram] ⚠  No se pudo renovar el token automáticamente: ${e.message}`);
  console.warn('[Instagram] ⚠  Si el token ya expiró, genera uno nuevo en Meta for Developers y actualiza .env / .env.production (y las variables de entorno en Vercel).');
}

// ── Directorios destino ──────────────────────────────────────────────────────
const IMG_DIR   = join(ROOT, 'public', 'instagram');
const DATA_DIR  = join(ROOT, 'src', 'data');
const DATA_FILE = join(DATA_DIR, 'instagram.json');

mkdirSync(IMG_DIR,  { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });

// ── Descarga una imagen y la guarda en disco ─────────────────────────────────
async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  const buffer = await res.arrayBuffer();
  writeFileSync(dest, Buffer.from(buffer));
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('[Instagram] Obteniendo posts de la API...');

  const apiUrl =
    `https://graph.instagram.com/me/media` +
    `?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp` +
    `&limit=16` +
    `&access_token=${TOKEN}`;

  const res  = await fetch(apiUrl);
  const json = await res.json();

  if (json.error) {
    console.error('[Instagram] ✗ Error de API:', json.error.message);
    console.error('[Instagram] ⚠  Se omite la descarga para no bloquear el build. El sitio seguirá compilando sin fotos nuevas de Instagram.');
    process.exit(0);
  }

  const posts = json.data ?? [];
  const saved = [];

  for (const post of posts) {
    // Para VIDEO usamos thumbnail; para IMAGE y CAROUSEL_ALBUM usamos media_url
    const imageUrl =
      post.media_type === 'VIDEO'
        ? (post.thumbnail_url ?? post.media_url)
        : post.media_url;

    const filename  = `${post.id}.jpg`;
    const dest      = join(IMG_DIR, filename);
    const localPath = `/instagram/${filename}`;

    try {
      if (existsSync(dest)) {
        console.log(`[Instagram]   ✓ Ya existe: ${filename}`);
      } else {
        await downloadImage(imageUrl, dest);
        console.log(`[Instagram]   ↓ Descargado: ${filename}`);
      }

      saved.push({
        id:         post.id,
        media_type: post.media_type,
        local_url:  localPath,       // ← ruta local, nunca expira
        permalink:  post.permalink,
        caption:    post.caption ?? '',
        timestamp:  post.timestamp,
      });
    } catch (e) {
      console.error(`[Instagram]   ✗ Error en ${post.id}: ${e.message}`);
      // Si falla la descarga de una imagen, no rompemos el build; la omitimos.
    }
  }

  writeFileSync(DATA_FILE, JSON.stringify(saved, null, 2), 'utf-8');
  console.log(`[Instagram] ✔  ${saved.length} posts guardados en src/data/instagram.json`);
}

main().catch((err) => {
  console.error('[Instagram] Fatal:', err);
  process.exit(1);
});