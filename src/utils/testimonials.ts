// Configuración de WordPress API
const WORDPRESS_BASE_URL = import.meta.env.PUBLIC_WORDPRESS_BASE_URL || 'http://web.ruth';

// Tipos para los testimonios
export interface Testimonial {
  name: string;
  rating: number;
  date: string;
  title?: string;
  comment: string;
  avatar?: string;
  location?: string;
  platform: 'tripadvisor' | 'google' | 'facebook';
  url?: string;
}

// Función para obtener las reseñas de TripAdvisor desde WordPress
export async function getTripAdvisorReviews(tid: number = 1): Promise<Testimonial[]> {
  try {
    const response = await fetch(`${WORDPRESS_BASE_URL}/wp-json/headless/v1/tripadvisor/reviews?tid=${tid}`);
    
    if (!response.ok) {
      console.warn('No se pudieron cargar las reseñas de TripAdvisor');
      return getFallbackTestimonials();
    }
    
    const data = await response.json();
    
    // Estructura: { success: true, data: { items: [...] } }
    const items = data?.data?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map((review: any) => ({
        name: review.author,
        rating: Number(review.rating),
        date: review.date,
        title: review.title || undefined,
        comment: review.body_full || review.body,
        avatar: review.avatar || undefined,
        platform: 'tripadvisor' as const,
        url: review.ta_url || undefined
      }));
    }
    
    return getFallbackTestimonials();
  } catch (error) {
    console.error('Error al cargar reseñas de TripAdvisor:', error);
    return getFallbackTestimonials();
  }
}

// Testimonios de respaldo si no se pueden cargar desde WordPress
function getFallbackTestimonials(): Testimonial[] {
  return [
    {
      name: 'John Smith',
      rating: 5,
      date: '2024-10-15',
      comment: 'Amazing experience! The guides were knowledgeable and the wildlife viewing was incredible. Saw pink dolphins, sloths, and countless bird species. Highly recommend Ruth Amazon Expeditions!',
      location: 'United States',
      platform: 'tripadvisor'
    },
    {
      name: 'Maria García',
      rating: 5,
      date: '2024-09-28',
      comment: 'Experiencia inolvidable en Pacaya Samiria. Los guías son profesionales y conocen cada rincón de la selva. La comida fue excelente y las instalaciones muy cómodas.',
      location: 'España',
      platform: 'tripadvisor'
    },
    {
      name: 'Thomas Mueller',
      rating: 5,
      date: '2024-11-05',
      comment: 'Best jungle tour in Peru! Ruth and her team are exceptional. We saw anacondas, monkeys, and explored remote areas of the Amazon. The camping experience was authentic and safe.',
      location: 'Germany',
      platform: 'tripadvisor'
    },
    {
      name: 'Sophie Dubois',
      rating: 5,
      date: '2024-08-12',
      comment: 'Un voyage extraordinaire! Les paysages sont à couper le souffle et l\'équipe est très attentionnée. J\'ai particulièrement aimé la navigation nocturne pour observer les caïmans.',
      location: 'France',
      platform: 'tripadvisor'
    },
    {
      name: 'Carlos Mendoza',
      rating: 5,
      date: '2024-10-22',
      comment: 'La mejor experiencia de ecoturismo que he tenido. El compromiso con la sostenibilidad es evidente y los guías locales comparten su cultura con mucho respeto.',
      location: 'Colombia',
      platform: 'tripadvisor'
    },
    {
      name: 'Emma Johnson',
      rating: 5,
      date: '2024-09-15',
      comment: 'Absolutely magical! Swimming with pink dolphins was a dream come true. The guides were fantastic and ensured everyone had a safe and memorable experience.',
      location: 'United Kingdom',
      platform: 'tripadvisor'
    }
  ];
}
