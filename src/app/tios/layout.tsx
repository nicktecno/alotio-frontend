import type { Metadata } from 'next';
import { SEO_CORE_KEYWORDS } from '@/lib/seo-keywords';
import { SEO_SEARCH_PAGE_DESCRIPTION, SEO_SEARCH_PAGE_TITLE } from '@/lib/seo-copy';

export const metadata: Metadata = {
  title: SEO_SEARCH_PAGE_TITLE,
  description: SEO_SEARCH_PAGE_DESCRIPTION,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br'}/tios`,
  },
  keywords: [
    ...SEO_CORE_KEYWORDS,
    'transporte escolar por escola',
    'van escolar perto de mim',
    'transporte escolar seguro',
  ],
  openGraph: {
    title: SEO_SEARCH_PAGE_TITLE,
    description: SEO_SEARCH_PAGE_DESCRIPTION,
  },
};

export default function TiosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
