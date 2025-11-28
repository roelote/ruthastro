const WORDPRESS_API_URL = import.meta.env.PUBLIC_WORDPRESS_API_URL || 'http://web.ruth/wp-json/wp/v2';
const WORDPRESS_BASE_URL = import.meta.env.PUBLIC_WORDPRESS_BASE_URL || 'http://web.ruth';

export interface WPPage {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  slug: string;
  excerpt: {
    rendered: string;
  };
  featured_media?: number;
  date: string;
  modified: string;
  link: string;
}

export interface WPPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  slug: string;
  excerpt: {
    rendered: string;
  };
  featured_media?: number;
  date: string;
  modified: string;
  link: string;
  categories?: number[];
  tags?: number[];
  acf?: {
    precio?: string | number;
    duracion?: string;
    grupo_minimo?: number;
    grupo_maximo?: number;
    [key: string]: any; // Para otros campos ACF personalizados
  };
}

export interface WPMenuItem {
  ID: number;
  title: string;
  url: string;
  slug: string;
  menu_item_parent: string;
  classes: string[];
  target: string;
  object: string;
  object_id: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: {
      [key: string]: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface YoastSEO {
  title?: string;
  description?: string;
  canonical?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  og_url?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  robots?: {
    index?: string;
    follow?: string;
  };
  [key: string]: any;
}

export interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  icon?: {
    favicon: string;
    icon_192: string;
    icon_512: string;
  };
}

/**
 * Obtener todas las páginas de WordPress
 */
export async function getPages(): Promise<WPPage[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/pages?per_page=100`);
    if (!response.ok) {
      throw new Error(`Error fetching pages: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener páginas:', error);
    return [];
  }
}

/**
 * Obtener una página específica por slug
 */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/pages?slug=${slug}`);
    if (!response.ok) {
      throw new Error(`Error fetching page: ${response.status}`);
    }
    const pages = await response.json();
    return pages.length > 0 ? pages[0] : null;
  } catch (error) {
    console.error('Error al obtener página:', error);
    return null;
  }
}

/**
 * Obtener todas las entradas (posts) de WordPress
 */
export async function getPosts(): Promise<WPPost[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?per_page=100`);
    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener posts:', error);
    return [];
  }
}

/**
 * Obtener una entrada específica por slug
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?slug=${slug}`);
    if (!response.ok) {
      throw new Error(`Error fetching post: ${response.status}`);
    }
    const posts = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error al obtener post:', error);
    return null;
  }
}

/**
 * Obtener imagen destacada de WordPress
 */
export async function getFeaturedImage(mediaId: number): Promise<string | null> {
  try {
    if (!mediaId) return null;
    
    const response = await fetch(`${WORDPRESS_API_URL}/media/${mediaId}`);
    if (!response.ok) {
      throw new Error(`Error fetching media: ${response.status}`);
    }
    
    const media: WPMedia = await response.json();
    return media.source_url || null;
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    return null;
  }
}

/**
 * Obtener el menú de WordPress
 * Nota: WordPress no expone los menús por defecto en la API REST.
 * Necesitas el plugin "WP REST API Menus" o agregar un endpoint personalizado.
 */
export async function getMenu(menuSlug: string = 'primary'): Promise<WPMenuItem[]> {
  try {
    // Intenta primero con el endpoint del plugin WP REST API Menus
    const response = await fetch(`${WORDPRESS_BASE_URL}/wp-json/wp-api-menus/v2/menus/${menuSlug}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching menu: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error al obtener menú:', error);
    return [];
  }
}

/**
 * Obtener metadatos de Yoast SEO para una página o post
 * Requiere el plugin Yoast SEO y endpoint personalizado o yoast_head en la respuesta
 */
export async function getYoastSEO(slug: string, type: 'posts' | 'pages' = 'pages'): Promise<YoastSEO | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/${type}?slug=${slug}`);
    if (!response.ok) {
      throw new Error(`Error fetching ${type}: ${response.status}`);
    }
    
    const items = await response.json();
    if (items.length === 0) return null;
    
    const item = items[0];
    
    // Yoast SEO expone yoast_head con todas las meta tags
    if (item.yoast_head_json) {
      return item.yoast_head_json;
    }
    
    // Fallback: parsear yoast_head si existe
    if (item.yoast_head) {
      return parseYoastHead(item.yoast_head);
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener Yoast SEO:', error);
    return null;
  }
}

/**
 * Parsear el HTML de yoast_head para extraer metadatos
 */
function parseYoastHead(yoastHead: string): YoastSEO {
  const seo: YoastSEO = {};
  
  // Extraer title
  const titleMatch = yoastHead.match(/<title>(.*?)<\/title>/);
  if (titleMatch) seo.title = titleMatch[1];
  
  // Extraer meta tags
  const metaRegex = /<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]+)"/g;
  let match;
  
  while ((match = metaRegex.exec(yoastHead)) !== null) {
    const [, name, content] = match;
    
    if (name === 'description') seo.description = content;
    else if (name === 'og:title') seo.og_title = content;
    else if (name === 'og:description') seo.og_description = content;
    else if (name === 'og:image') seo.og_image = content;
    else if (name === 'og:type') seo.og_type = content;
    else if (name === 'og:url') seo.og_url = content;
    else if (name === 'twitter:card') seo.twitter_card = content;
    else if (name === 'twitter:title') seo.twitter_title = content;
    else if (name === 'twitter:description') seo.twitter_description = content;
    else if (name === 'twitter:image') seo.twitter_image = content;
    else if (name === 'robots') {
      const robots = content.split(',').map(r => r.trim());
      seo.robots = {
        index: robots.includes('noindex') ? 'noindex' : 'index',
        follow: robots.includes('nofollow') ? 'nofollow' : 'follow'
      };
    }
  }
  
  // Extraer canonical
  const canonicalMatch = yoastHead.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  if (canonicalMatch) seo.canonical = canonicalMatch[1];
  
  return seo;
}

/**
 * Obtener información del sitio WordPress incluyendo favicon
 */
export async function getSiteInfo(): Promise<WPSiteInfo | null> {
  try {
    const response = await fetch(`${WORDPRESS_BASE_URL}/wp-json`);
    if (!response.ok) {
      throw new Error(`Error fetching site info: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Obtener favicon desde site_icon_url o construir URL
    const siteIcon = data.site_icon_url || `${WORDPRESS_BASE_URL}/wp-content/uploads/fbrfg/favicon.ico`;
    
    return {
      name: data.name || '',
      description: data.description || '',
      url: data.url || WORDPRESS_BASE_URL,
      home: data.home || WORDPRESS_BASE_URL,
      icon: {
        favicon: siteIcon,
        icon_192: data.site_icon_url ? data.site_icon_url.replace(/\.(png|jpg|jpeg)$/i, '-192x192.$1') : '',
        icon_512: data.site_icon_url ? data.site_icon_url.replace(/\.(png|jpg|jpeg)$/i, '-512x512.$1') : ''
      }
    };
  } catch (error) {
    console.error('Error al obtener información del sitio:', error);
    return null;
  }
}
