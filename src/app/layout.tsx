import type { Metadata } from 'next';
import { Poppins, Rajdhani, Archivo } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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
    default: 'Alô Tio - Transporte Escolar | Encontre o Tio da Van Escolar',
    template: '%s | Alô Tio - Transporte Escolar',
  },
  description:
    'Encontre transporte escolar seguro e verificado. Pesquise por escola, cidade ou bairro e conecte-se com profissionais de van escolar cadastrados na sua região.',
  keywords: [
    'transporte escolar',
    'van escolar',
    'tio da van',
    'tio de escola',
    'transporte escolar seguro',
    'transporte de crianças',
    'van escolar Santos',
    'van escolar Guarujá',
    'van escolar Cubatão',
    'van escolar Bertioga',
    'transporte escolar SP',
    'encontrar van escolar',
    'transporte escolar perto de mim',
    'motorista escolar',
    'transporte de alunos',
    'van escolar cadastrada',
    'transporte escolar confiável',
    'perua escolar',
    'serviço de transporte escolar',
    'buscar transporte escolar',
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
      'Encontre transporte escolar seguro e verificado. Pesquise por escola, cidade ou bairro e conecte-se com profissionais de van escolar na sua região.',
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
  verification: {},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
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
    provider: {
      '@type': 'Organization',
      name: 'Alô Tio',
      url: siteUrl,
    },
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
