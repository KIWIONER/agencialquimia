/**
 * ==============================================================================
 * Componente: JsonLd.tsx
 * ==============================================================================
 * Descripción:
 *  Inyector de datos estructurados en formato JSON-LD (Schema.org) para la landing page.
 * 
 * Corrección de Auditoría:
 *  Corrige el hallazgo detectado en `audit/AUDIT.md` (donde se utilizaba el número ficticio `+34000000000`),
 *  sustituyéndolo por el teléfono corporativo oficial (`+34604051111`), garantizando la autenticidad
 *  de la ficha de datos enriquecidos para Google Rich Results y SEO Local en Santiago de Compostela.
 * ==============================================================================
 */

export default function JsonLd() {
  // Objeto JSON-LD para marcado estructurado de LocalBusiness en Schema.org
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'AgenciAlquimia',
    image: 'https://agencialquimia.com/assets/images/logo-opt.png',
    '@id': 'https://agencialquimia.com',
    url: 'https://agencialquimia.com',
    telephone: '+34604051111',
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Santiago de Compostela',
      addressLocality: 'Santiago de Compostela',
      addressRegion: 'Galicia',
      postalCode: '15701',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 42.8782,
      longitude: -8.5448,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      'https://www.linkedin.com/company/agencialquimia',
      'https://www.linkedin.com/in/matiasidiart',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
