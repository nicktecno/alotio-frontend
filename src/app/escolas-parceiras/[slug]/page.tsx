import type { Metadata } from 'next';
import PartnerSchoolDetailClient from './PartnerSchoolDetailClient';
import { seoFetchInit } from '@/lib/seo-revalidate';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

export const revalidate = 2_592_000;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await fetch(`${apiUrl}/marketplace/stores/${encodeURIComponent(slug)}`, seoFetchInit());
    if (!response.ok) throw new Error('Not found');
    const school = await response.json();
    if (school.type !== 'ESCOLA') throw new Error('Not a partner school');
    const city = school.city?.name ? ` em ${school.city.name}` : '';
    const title = `${school.displayName}${city} | Escola parceira Alô Tio`;
    const description = school.bio || `Conheça benefícios e promoções de ${school.displayName}${city}.`;
    return {
      title,
      description,
      alternates: { canonical: `${siteUrl}/escolas-parceiras/${slug}` },
      openGraph: { title, description, images: school.logoUrl ? [{ url: school.logoUrl }] : undefined },
    };
  } catch {
    return { title: 'Escola parceira | Alô Tio' };
  }
}

export default function PartnerSchoolDetailPage() {
  return <PartnerSchoolDetailClient />;
}