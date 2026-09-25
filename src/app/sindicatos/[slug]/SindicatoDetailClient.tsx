'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, assetUrl } from '@/lib/api';
import type { Store } from '@/types';
import {
  SINDICATOS_LIST,
  findSindicatoByIdOrSlug,
  type SindicatoContactItem,
} from '@/data/sindicatos-list';

function cleanDigits(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '');
}

export default function SindicatoDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);

  // Local dataset item
  const localItem: SindicatoContactItem | undefined = useMemo(() => {
    return slug ? findSindicatoByIdOrSlug(slug) : undefined;
  }, [slug]);

  // Try to also fetch platform store if registered
  useEffect(() => {
    if (!slug) {
      setLoadingStore(false);
      return;
    }

    api
      .marketplaceGetStore(slug)
      .then((s) => {
        if (s && s.type === 'SINDICATO') {
          setStore(s);
        }
      })
      .catch(() => {
        // Not registered as a dynamic store
      })
      .finally(() => {
        setLoadingStore(false);
      });
  }, [slug]);

  // Merged entity fields
  const nome = store?.displayName || localItem?.nome || 'Entidade de Transporte Escolar';
  const sigla = localItem?.sigla || (store?.displayName ? store.displayName.split(' - ')[0] : '');
  const tipo = localItem?.tipo || 'sindicato';
  const cidade = store?.city?.name || localItem?.cidade || 'Brasil';
  const uf = store?.city?.state?.uf || localItem?.uf || '';
  const telefone = store?.phone || localItem?.telefone || '';
  const telefoneFixo = localItem?.telefoneFixo || '';
  const rawWhatsapp = cleanDigits(store?.whatsapp || localItem?.telefoneRaw || localItem?.telefone);
  const email = store?.email || localItem?.email || '';
  const website = localItem?.website || '';
  const responsavel = localItem?.responsavel || '';
  const endereco = localItem?.endereco || '';
  const observacoes = store?.bio || localItem?.observacoes || '';
  const logoUrl = store?.logoUrl ? assetUrl(store.logoUrl) : null;
  const source = localItem?.source || 'Registro Público / Cadastro Alô Tio';

  // Related entities in the same UF
  const relatedEntities = useMemo(() => {
    if (!uf) return [];
    return SINDICATOS_LIST.filter(
      (s) => s.uf === uf && s.id !== localItem?.id && s.id !== slug,
    ).slice(0, 3);
  }, [uf, localItem, slug]);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `${sigla || nome} - Transporte Escolar`,
          text: `Conheça a ${sigla || nome} no portal Alô Tio`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const handleCopyContacts = () => {
    const text = [
      `🏛️ ${nome}`,
      sigla ? `Sigla: ${sigla}` : '',
      `📍 ${cidade} (${uf})`,
      telefone ? `Telefone / WhatsApp: ${telefone}` : '',
      telefoneFixo ? `Tel. Fixo: ${telefoneFixo}` : '',
      email ? `E-mail: ${email}` : '',
      website ? `Site: ${website}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    toast.success('Contatos copiados para a área de transferência!');
  };

  if (!loadingStore && !localItem && !store) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <span className="text-5xl block">🏛️</span>
          <h1 className="text-2xl font-bold text-gray-800">Entidade não encontrada</h1>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Não localizamos os dados desta associação ou sindicato. Verifique o link ou consulte o
            guia completo.
          </p>
          <div className="pt-4">
            <Link
              href="/sindicatos"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm inline-block"
            >
              ← Voltar ao Guia de Sindicatos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tipoBadgeLabel =
    tipo === 'associacao'
      ? 'Associação de Transporte Escolar'
      : tipo === 'cooperativa'
        ? 'Cooperativa de Transporte Escolar'
        : tipo === 'federacao'
          ? 'Federação Sindical'
          : 'Sindicato Oficial';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 pb-16">
        {/* BREADCRUMB & TOP NAV */}
        <div className="bg-emerald-950 text-emerald-200 border-b border-emerald-900/60 py-3">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
            <nav className="flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-white transition">
                Início
              </Link>
              <span>›</span>
              <Link href="/sindicatos" className="hover:text-white transition">
                Sindicatos & Associações
              </Link>
              <span>›</span>
              <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
                {sigla || nome}
              </span>
            </nav>

            <Link
              href="/sindicatos"
              className="text-emerald-300 hover:text-white font-bold flex items-center gap-1 transition"
            >
              <span>←</span>
              <span className="hidden sm:inline">Todos os Sindicatos</span>
            </Link>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white py-10 sm:py-14 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                  {logoUrl ? (
                    <img src={logoUrl} alt={nome} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl sm:text-5xl">🏛️</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {tipoBadgeLabel}
                    </span>
                    <span className="bg-white/10 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {cidade} - {uf}
                    </span>
                    {store && (
                      <span className="bg-amber-400 text-amber-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>⭐</span>
                        <span>Perfil Oficial Credenciado</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white leading-tight">
                    {nome}
                  </h1>

                  <p className="text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
                    <span>📍 {endereco || `${cidade} (${uf}), Brasil`}</span>
                    {localItem?.cnpj && <span>· CNPJ: {localItem.cnpj}</span>}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS IN HERO */}
              <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2.5 shrink-0 pt-2 md:pt-0">
                {rawWhatsapp && (
                  <a
                    href={`https://wa.me/55${rawWhatsapp}?text=${encodeURIComponent(
                      `Olá! Vi as informações da ${sigla || nome} no portal Alô Tio e gostaria de entrar em contato.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <span>💬</span>
                    <span>Chamar no WhatsApp</span>
                  </a>
                )}

                {telefoneFixo && (
                  <a
                    href={`tel:${cleanDigits(telefoneFixo)}`}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-5 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>📞</span>
                    <span>Ligar ({telefoneFixo})</span>
                  </a>
                )}

                <div className="flex items-center gap-2">
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>🌐</span>
                      <span>Site Oficial</span>
                    </a>
                  )}

                  <button
                    onClick={handleShare}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    title="Compartilhar página"
                  >
                    <span>↗️</span>
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN DOSSIER CONTENT */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
          {/* QUICK SUMMARY CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* CARD 1: CONTATOS OFICIAIS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <span>📞</span>
                  <span>Canais de Atendimento</span>
                </h3>
                <button
                  onClick={handleCopyContacts}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                  title="Copiar todos os contatos"
                >
                  Copiar
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {telefone && (
                  <div>
                    <span className="text-gray-400 block font-medium">WhatsApp / Celular:</span>
                    <a
                      href={
                        rawWhatsapp
                          ? `https://wa.me/55${rawWhatsapp}`
                          : `tel:${cleanDigits(telefone)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-gray-800 hover:text-emerald-700 text-sm flex items-center gap-1 mt-0.5"
                    >
                      <span>{telefone}</span>
                      {rawWhatsapp && (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          WA
                        </span>
                      )}
                    </a>
                  </div>
                )}

                {telefoneFixo && (
                  <div>
                    <span className="text-gray-400 block font-medium">Telefone Fixo / Sede:</span>
                    <a
                      href={`tel:${cleanDigits(telefoneFixo)}`}
                      className="font-bold text-gray-800 hover:text-emerald-700 text-sm mt-0.5 block"
                    >
                      {telefoneFixo}
                    </a>
                  </div>
                )}

                {email && (
                  <div>
                    <span className="text-gray-400 block font-medium">E-mail Institucional:</span>
                    <a
                      href={`mailto:${email}`}
                      className="font-semibold text-emerald-700 hover:underline break-all mt-0.5 block"
                    >
                      {email}
                    </a>
                  </div>
                )}

                {website && (
                  <div>
                    <span className="text-gray-400 block font-medium">Website Oficial:</span>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700 hover:underline break-all mt-0.5 block"
                    >
                      {website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: DADOS CADASTRAIS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <span>📋</span>
                  <span>Dados Cadastrais</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Razão Social / Nome:</span>
                  <span className="font-bold text-gray-800 block mt-0.5">{nome}</span>
                </div>

                {sigla && (
                  <div>
                    <span className="text-gray-400 block font-medium">Sigla Oficial:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                      {sigla}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-400 block font-medium">Tipo de Organização:</span>
                  <span className="font-semibold text-gray-700 capitalize mt-0.5 block">
                    {tipoBadgeLabel}
                  </span>
                </div>

                {responsavel && (
                  <div>
                    <span className="text-gray-400 block font-medium">Representação / Diretoria:</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block">{responsavel}</span>
                  </div>
                )}

                <div>
                  <span className="text-gray-400 block font-medium">Origem do Cadastro:</span>
                  <span className="text-gray-500 mt-0.5 block">{source}</span>
                </div>
              </div>
            </div>

            {/* CARD 3: ÁREA DE ATUAÇÃO E SERVIÇOS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <span>🛡️</span>
                  <span>Atuação & Representatividade</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                  <div>
                    <strong className="text-gray-900">Defesa da Categoria:</strong> Representação dos
                    condutores perante órgãos municipais de transporte, prefeitura e Detran.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                  <div>
                    <strong className="text-gray-900">Vistorias e Normas:</strong> Orientação sobre
                    alvarás, laudos do Inmetro e selos de vistoria semestrais.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                  <div>
                    <strong className="text-gray-900">Segurança das Crianças:</strong> Combate ao
                    transporte clandestino e valorização do serviço legalizado.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                  <div>
                    <strong className="text-gray-900">Capacitação Contínua:</strong> Apoio em cursos
                    obrigatórios de condutores de transporte escolar e primeiros socorros.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED DESCRIPTION & ABOUT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
              <span>📖</span>
              <span>Sobre a {sigla || nome}</span>
            </h2>

            {observacoes ? (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                {observacoes}
              </div>
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed">
                A {nome} atua na defesa, representação institucional e fortalecimento dos
                transportadores de vans e veículos escolares legalizados de {cidade} ({uf}) e
                região. Seu papel é fundamental para garantir um serviço seguro, pontual e regulamentado
                para milhares de famílias e estudantes diariamente.
              </p>
            )}

            <div className="pt-2 text-xs text-gray-500 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <span>Sede: {endereco || `${cidade} - ${uf}`}</span>
              <span>Cadastro verificado para a rede Alô Tio Brasil</span>
            </div>
          </div>

          {/* OFFICIAL NOTICES / PRODUCTS (IF STORE HAS POSTS) */}
          {store?.products && store.products.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
                <span>📢</span>
                <span>Comunicados & Publicações Oficiais</span>
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {store.products.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {post.images?.[0]?.url ? (
                        <div className="aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={assetUrl(post.images[0].url) ?? ''}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-emerald-50 flex items-center justify-center text-3xl">
                          📄
                        </div>
                      )}
                      <div className="p-5 space-y-2">
                        {post.category && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {post.category}
                          </span>
                        )}
                        <h3 className="font-bold text-base text-gray-900 leading-snug">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                            {post.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Comunicado Oficial</span>
                        {rawWhatsapp && (
                          <a
                            href={`https://wa.me/55${rawWhatsapp}?text=${encodeURIComponent(
                              `Olá! Vi o comunicado "${post.title}" no Alô Tio e gostaria de mais informações.`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold hover:underline"
                          >
                            Tirar Dúvida →
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* VANS & DRIVERS IN THIS CITY */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                🚐 Transporte Escolar Legalizado em {cidade}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-amber-950">
                Procurando vans e tios escolares em {cidade} ({uf})?
              </h3>
              <p className="text-amber-900/80 text-xs sm:text-sm leading-relaxed">
                Conheça os condutores escolares credenciados que atendem escolas e bairros de{' '}
                {cidade}. Todos os veículos contam com documentação e vistorias em dia.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href={`/tios?cidade=${encodeURIComponent(cidade)}&uf=${uf}`}
                className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm text-center shadow-md transition"
              >
                Buscar Vans em {cidade}
              </Link>
              <Link
                href="/sindicatos"
                className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm text-center transition"
              >
                Outras Cidades
              </Link>
            </div>
          </div>

          {/* CLAIM PROFILE OR MANAGE CALLOUT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                🏛️ Área da Diretoria & Representantes
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-gray-900">
                Você faz parte da diretoria da {sigla || nome}?
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Gerencie esta página gratuitamente no Alô Tio. Publique comunicados oficiais para os
                condutores associados, divulgue vistorias e mantenha os dados da entidade sempre
                atualizados.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/cadastro-sindicato"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm text-center shadow-md transition"
              >
                Reivindicar ou Criar Conta Gratuita
              </Link>
              <Link
                href="/login"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm text-center transition"
              >
                Já tenho Acesso
              </Link>
            </div>
          </div>

          {/* RELATED ENTITIES IN SAME UF */}
          {relatedEntities.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Outras Entidades e Associações em {uf}</span>
                </h2>
                <Link
                  href="/sindicatos"
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Ver todas ({SINDICATOS_LIST.length}) →
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedEntities.map((ent) => (
                  <Link
                    key={ent.id}
                    href={`/sindicatos/${ent.id}`}
                    className="bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-md rounded-2xl p-5 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {ent.tipo ? ent.tipo.toUpperCase() : 'SINDICATO'}
                        </span>
                        <span className="text-xs font-bold text-gray-500">{ent.cidade}</span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition leading-snug">
                        {ent.nome}
                      </h4>
                      {ent.observacoes && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                          {ent.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform inline-block">
                        Ver página completa →
                      </span>
                      {ent.telefone && (
                        <span className="text-gray-400 text-[11px]">{ent.telefone}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
