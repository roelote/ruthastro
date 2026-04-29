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

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!TOKEN) {
  console.warn('[Instagram] ⚠  No se encontró INSTAGRAM_ACCESS_TOKEN. Se omite la descarga.');
  process.exit(0);
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
    process.exit(1);
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
