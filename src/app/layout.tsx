import type { Metadata } from 'next';
import { Poppins, Rajdhani, Archivo } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { organizationSameAsUrls } from '@/lib/seo-env';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';
import { seoKeywordsFromRegisteredCities } from '@/lib/seo-city-keywords';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-rajdhani',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-archivo',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export async function generateMetadata(): Promise<Metadata> {
  const regionKeywords = await seoKeywordsFromRegisteredCities();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Alô Tio - Transporte Escolar | Encontre o Tio da Van Escolar',
      template: '%s | Alô Tio - Transporte Escolar',
    },
    description:
      'Encontre transporte escolar seguro e verificado. Condutor escolar, van escolar e motoristas por escola, cidade ou bairro. Profissionais cadastrados na sua região.',
    keywords: [
      ...SEO_CORE_KEYWORDS,
      'tio de escola',
      'transporte escolar seguro',
      'transporte de crianças',
      'encontrar van escolar',
      'transporte escolar perto de mim',
      'serviço de transporte escolar',
      'buscar transporte escolar',
      ...regionKeywords,
    ],
    authors: [{ name: 'Alô Tio' }],
    creator: 'Alô Tio',
    publisher: 'Alô Tio',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: siteUrl,
      siteName: 'Alô Tio',
      title: 'Alô Tio - Transporte Escolar | Encontre o Tio da Van Escolar',
      description:
        'Encontre transporte escolar seguro e verificado. Condutor escolar, van escolar e motoristas por escola, cidade ou bairro.',
      images: [
        {
          url: '/bannerAlotio.png',
          width: 1536,
          height: 1024,
          alt: 'Alô Tio - Transporte Escolar',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Alô Tio - Transporte Escolar | Encontre o Tio da Van Escolar',
      description:
        'Encontre transporte escolar seguro e verificado. Pesquise por escola e conecte-se com profissionais de van escolar na sua região.',
      images: ['/bannerAlotio.png'],
    },
    alternates: {
      canonical: siteUrl,
    },
    category: 'transportation',
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? {
          verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
          },
        }
      : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const logoUrl = `${siteUrl}/bannerAlotio.png`;
  const sameAs = organizationSameAsUrls();

  const organizationJsonLd = {
    '@type': 'Organization',
    name: 'Alô Tio',
    url: siteUrl,
    logo: logoUrl,
    description:
      'Plataforma para encontrar transporte escolar seguro e verificado por escola, cidade e bairro.',
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const webAppJsonLd = {
    '@type': 'WebApplication',
    name: 'Alô Tio',
    url: siteUrl,
    description:
      'Plataforma para encontrar transporte escolar seguro e verificado. Pesquise por escola, cidade ou bairro.',
    applicationCategory: 'TransportApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Busca gratuita por transporte escolar',
    },
    provider: { '@id': `${siteUrl}#organization` },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...organizationJsonLd, '@id': `${siteUrl}#organization` },
      webAppJsonLd,
    ],
  };

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${poppins.variable} ${rajdhani.variable} ${archivo.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
