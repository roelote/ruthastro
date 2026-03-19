import type { APIRoute } from 'astro';

const pages = [
  { es: '/', en: '/en/' },
  { es: '/sobre-nosotros/', en: '/en/about-us/' },
  { es: '/contactenos/', en: '/en/contact-us/' },
  { es: '/pacaya-samiria-mistico-3-dias-2-noches/', en: '/en/mystical-pacaya-samiria-3-days-tour/' },
  { es: '/pacaya-samiria-selva-autentica-4-dias-3-noches/', en: '/en/pacaya-samiria-authentic-jungle-4-days-tour/' },
  { es: '/selva-pacaya-samiria-5-dias/', en: '/en/pacaya-samiria-5-days-tour/' },
  { es: '/pacaya-samiria-selva-virgen-10-dias-9-noches/', en: '/en/pacaya-samiria-10-days-tour/' },
  { es: '/misterio-amazonico-4-dias/', en: '/en/amazon-mystery-4-days-tour/' },
  { es: '/nacimiento-del-amazonas-2-dias-1-noches/', en: '/en/amazon-river-source-tour-2-days/' },
  { es: '/rio-amazonas-full-day/', en: '/en/amazon-river-full-day-tour-iquitos/' },
  { es: '/selva-encantada-7-dias-6-noches/', en: '/en/enchanted-jungle-7-days-tour/' },
  { es: '/serpiente-dorada-2-dias/', en: '/en/golden-snake-amazon-lodge-2-days/' },
  { es: '/tour-7-maravillas-3-dias-2-noches/', en: '/en/seven-marvels-tour-3-days/' },
  { es: '/metodos-de-pago/', en: '/en/payment-methods/' },
  { es: '/terminos-condiciones/', en: '/en/terms-and-conditions/' },
];

const site = 'https://ruthamazonexpeditions.com';

export const GET: APIRoute = () => {
  const urls = pages.map(({ es, en }) => `
  <url>
    <loc>${site}${es}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${site}${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${site}${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${site}${es}"/>
  </url>
  <url>
    <loc>${site}${en}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${site}${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${site}${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${site}${es}"/>
  </url>`).join('');

  return new Response(
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`,
  { headers: { 'Content-Type': 'application/xml' } }
);
};
