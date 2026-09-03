import type { Metadata } from 'next';
import PartnerSchoolsClient from './PartnerSchoolsClient';

export const metadata: Metadata = {
  title: 'Escolas parceiras, benefícios e promoções | Alô Tio',
  description: 'Conheça escolas parceiras, campanhas de matrícula, benefícios e diferenciais divulgados no Alô Tio.',
};

export default function PartnerSchoolsPage() {
  return <PartnerSchoolsClient />;
}