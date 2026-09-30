import type { Metadata } from 'next';
import { Poppins, Rajdhani, Archivo } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import CookieConsent from '@/components/CookieConsent';
import { organizationSameAsUrls } from '@/lib/seo-env';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';
import { SEO_SITE_DESCRIPTION, SEO_SITE_TITLE } from '@/lib/seo-copy';

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SEO_SITE_TITLE,
    template: '%s | Alô Tio',
  },
  description: SEO_SITE_DESCRIPTION,
  keywords: [
    ...SEO_CORE_KEYWORDS,
    'tio de escola',
    'transporte escolar seguro',
    'transporte de crianças',
    'encontrar van escolar',
    'transporte escolar perto de mim',
    'serviço de transporte escolar',
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
      title: SEO_SITE_TITLE,
      description: SEO_SITE_DESCRIPTION,
      images: [
        {
          url: '/bannerAlotio.png',
          width: 1536,
          height: 1024,
          alt: 'Alô Tio — encontrar transporte escolar e condutor escolar',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SEO_SITE_TITLE,
      description: SEO_SITE_DESCRIPTION,
      images: ['/bannerAlotio.png'],
    },
    alternates: {
      canonical: siteUrl,
    },
    category: 'transportation',
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION
        ? { google: process.env.GOOGLE_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_ADSENSE_CLIENT
        ? { other: { 'google-adsense-account': process.env.NEXT_PUBLIC_ADSENSE_CLIENT } }
        : {}),
    },
  };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const logoUrl = `${siteUrl}/bannerAlotio.png`;
  const sameAs = organizationSameAsUrls();

  const organizationJsonLd = {
    '@type': 'Organization',
    name: 'Alô Tio',
    url: siteUrl,
    logo: logoUrl,
    description: SEO_SITE_DESCRIPTION,
    knowsAbout: [
      'Transporte escolar',
      'Condutor escolar',
      'Van escolar',
      'Motorista escolar',
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const webSiteJsonLd = {
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    name: 'Alô Tio',
    url: siteUrl,
    description: SEO_SITE_DESCRIPTION,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${siteUrl}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/tios`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const webAppJsonLd = {
    '@type': 'WebApplication',
    name: 'Alô Tio — encontrar transporte escolar',
    url: siteUrl,
    description: SEO_SITE_DESCRIPTION,
    applicationCategory: 'TransportApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Busca gratuita para encontrar transporte escolar e condutor escolar',
    },
    provider: { '@id': `${siteUrl}#organization` },
  };

  const serviceJsonLd = {
    '@type': 'Service',
    name: 'Busca de transporte escolar e condutor escolar',
    description:
      'Serviço gratuito para encontrar transporte escolar, condutor escolar e van escolar por escola, cidade e bairro.',
    serviceType: 'Transporte escolar',
    areaServed: { '@type': 'Country', name: 'Brasil' },
    provider: { '@id': `${siteUrl}#organization` },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...organizationJsonLd, '@id': `${siteUrl}#organization` },
      webSiteJsonLd,
      webAppJsonLd,
      serviceJsonLd,
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
        <CookieConsent />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
