import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Proteção Veicular para Transporte Escolar — Parceria GOL PLUS',
  description:
    'A Alô Tio fechou parceria com a GOL PLUS para oferecer proteção veicular completa com desconto exclusivo para motoristas de transporte escolar.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br'}/seguro`,
  },
};

const COVERAGES = [
  { icon: '💥', title: 'Colisão', desc: 'Reparação ou ressarcimento em caso de colisão.' },
  {
    icon: '🔓',
    title: 'Roubo ou Furto Qualificado',
    desc: 'Cobertura completa do veículo em caso de roubo ou furto qualificado.',
  },
  {
    icon: '🌳',
    title: 'Queda de Objetos',
    desc: 'Ressarcimento por danos de objetos externos como árvores e postes.',
  },
  {
    icon: '⚡',
    title: 'Raios, Vendaval ou Terremoto',
    desc: 'Cobertura de danos causados por raio, vendaval ou terremoto.',
  },
  {
    icon: '🌊',
    title: 'Alagamento ou Inundação',
    desc: 'Proteção para alagamentos, enchentes ou inundações por água doce.',
  },
  {
    icon: '🔥',
    title: 'Incêndio ou Explosão',
    desc: 'Proteção em caso de incêndio ou explosão acidentais.',
  },
  {
    icon: '🔲',
    title: 'Para-brisas',
    desc: 'Danos isolados no para-brisas (exceto teto solar e vidro panorâmico).',
  },
  {
    icon: '🚗',
    title: 'Cobertura de Terceiros',
    desc: 'Indenização a terceiros de até R$70.000 em caso de sinistro.',
  },
  {
    icon: '✅',
    title: 'Ressarcimento Integral',
    desc: 'Pagamento integral em caso de roubo, furto ou perda total.',
  },
  {
    icon: '🏥',
    title: 'Auxílio Funeral',
    desc: 'Cobertura de até R$5.000 para o associado em caso de falecimento.',
  },
];

const ASSISTS = [
  { icon: '🚛', text: 'Guincho em caso de sinistro', sub: 'KM ilimitado' },
  { icon: '🔧', text: 'Guincho por pane elétrica/mecânica', sub: 'Até 400 KM' },
  { icon: '🛠️', text: 'Socorro elétrico e mecânico', sub: 'Socorrista no local' },
  { icon: '⛽', text: 'Guincho por pane seca', sub: 'Até 100 KM' },
  { icon: '🔩', text: 'Troca de pneus', sub: 'Até 100 KM' },
  { icon: '🔑', text: 'Serviço de chaveiro', sub: 'Até 100 KM' },
  { icon: '🏠', text: 'Guarda temporária do veículo', sub: 'Até 1 dia útil' },
  { icon: '🚑', text: 'Remoção hospitalar em acidente', sub: 'Transporte inter-hospitalar' },
  { icon: '👨‍✈️', text: 'Motorista substituto', sub: 'Até 400 KM' },
  { icon: '📨', text: 'Transmissão de mensagens', sub: 'Até 2 contatos' },
  { icon: '🧳', text: 'Envio de acompanhante', sub: 'Hospitalização +10 dias' },
  { icon: '⚰️', text: 'Traslado de corpo', sub: 'Sinistro a +100 KM' },
];

const MARKET_SERVICES = [
  { icon: '🚛', service: 'Reboque até 40 km', price: 'R$ 250,00' },
  { icon: '⛽', service: 'Auxílio em caso de pane seca', price: 'R$ 150,00' },
  { icon: '🔩', service: 'Troca de pneu (até a borracharia)', price: 'R$ 130,00' },
  { icon: '🔋', service: 'Recarga de bateria', price: 'R$ 90,00' },
  { icon: '🔑', service: 'Chaveiro', price: 'R$ 90,00' },
  { icon: '🚕', service: 'Transporte alternativo (táxi e similares)', price: 'R$ 70,00' },
];

export default function SeguroPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0d1b2a] text-white">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2a] via-[#1a2a3a] to-[#0a1520]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 70% 50%, rgba(255,107,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(130,87,229,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center flex flex-col items-center gap-8">
          <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm font-bold tracking-widest uppercase px-5 py-2 rounded-full">
            ✦ Parceria Exclusiva
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Proteja sua van escolar
            <br />
            <span className="text-orange-400">com quem entende de proteção</span>
          </h1>

          <p className="text-xl text-gray-200 max-w-2xl leading-relaxed">
            A Alô Tio fechou uma parceria com a GOL PLUS para oferecer proteção veicular
            completa com condições exclusivas para motoristas de transporte escolar.
          </p>

          {/* Logos */}
          <div className="flex items-center gap-4 sm:gap-6 bg-white/4 border border-white/10 rounded-2xl px-5 py-3 sm:px-8 sm:py-4">
            <span className="text-3xl font-black tracking-tight">
              <span className="text-white">gol</span>
              <span className="text-orange-400">plus</span>
            </span>
            <span className="text-2xl text-gray-500 font-light">×</span>
            <img
              src="/logoAloTioVector.svg"
              alt="Alô Tio"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mt-4">
            {[
              { num: '+100 mil', label: 'veículos assistidos' },
              { num: '+8,5 mil', label: 'prestadores cadastrados' },
              { num: '9,1 NPS', label: 'taxa de satisfação' },
              { num: '24h', label: 'atendimento todo dia' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/4 border border-white/8 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-extrabold text-orange-400">{s.num}</div>
                <div className="text-sm text-gray-300 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          <a
            href="https://golplus.com.br/cotacao/?in=lDGnPPYq"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-orange-500/20"
          >
            🛡️ Quero me proteger agora
          </a>
        </div>
      </section>

      {/* VEÍCULOS ACEITOS */}
      <section className="bg-[#0a1520] border-y border-white/6 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center text-center sm:text-left">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Aceita qualquer veículo
            </p>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {[
                { icon: '🏍️', label: 'Moto' },
                { icon: '🚗', label: 'Carro' },
                { icon: '🚐', label: 'Van / Kombi' },
                { icon: '🚚', label: 'Caminhão' },
              ].map((v) => (
                <span
                  key={v.label}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-base font-semibold text-white"
                >
                  <span className="text-xl">{v.icon}</span>
                  {v.label}
                </span>
              ))}
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <p className="text-sm text-gray-400 max-w-xs">
              O valor da proteção varia conforme o veículo — solicite uma cotação personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* COBERTURAS */}
      <section className="bg-[#0a1520] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-orange-500/15 text-orange-300 text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            O que está coberto
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Cobertura <span className="text-orange-400">completa</span> para sua van
          </h2>
          <p className="text-gray-300 text-xl mb-10 max-w-xl">
            O Plano Comfort cobre desde colisão até fenômenos naturais, com ressarcimento
            integral em caso de perda total.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COVERAGES.map((c) => (
              <div
                key={c.title}
                className="bg-white/3 border border-white/8 hover:border-orange-500/30 hover:bg-orange-500/4 rounded-2xl p-5 flex gap-4 items-start transition"
              >
                <span className="text-3xl leading-none flex-shrink-0">{c.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1 text-base">{c.title}</h3>
                  <p className="text-base text-gray-300 leading-snug">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ASSISTÊNCIAS */}
      <section className="bg-[#0d1b2a] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-orange-500/15 text-orange-300 text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Assistências inclusas
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Na estrada, a GOL PLUS <span className="text-orange-400">resolve</span>
          </h2>
          <p className="text-gray-300 text-xl mb-10 max-w-xl">
            Todas as assistências abaixo estão inclusas no plano — sem custo adicional.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ASSISTS.map((a) => (
              <div
                key={a.text}
                className="bg-orange-500/6 border border-orange-500/15 rounded-xl px-4 py-4 flex items-center gap-4"
              >
                <span className="text-2xl flex-shrink-0">{a.icon}</span>
                <div>
                  <div className="font-semibold text-white text-base leading-snug">{a.text}</div>
                  <div className="text-sm text-gray-300 mt-0.5">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIVO */}
      <section className="bg-[#0a1520] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-orange-500/15 text-orange-300 text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Comparativo de mercado
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Quanto custa sua <span className="text-orange-400">escolha?</span>
          </h2>
          <p className="text-gray-300 text-xl mb-10 max-w-xl">
            Cada serviço avulso no mercado sai caro. Na GOL PLUS, você tem tudo por uma
            única mensalidade — com desconto exclusivo da Alô Tio.
          </p>

          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden mb-8">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-300 uppercase tracking-wider">
                    Preço avulso no mercado*
                  </th>
                </tr>
              </thead>
              <tbody>
                {MARKET_SERVICES.map((s, i) => (
                  <tr
                    key={s.service}
                    className={`border-b border-white/5 hover:bg-white/2 transition ${
                      i === MARKET_SERVICES.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-gray-100">
                      <span className="inline-flex items-center gap-3">
                        <span className="text-xl">{s.icon}</span>
                        {s.service}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-orange-400">{s.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400 italic mb-10">
            *Valores médios por acionamento referentes a um trajeto de aproximadamente 40 km.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/4 border border-white/10 rounded-2xl p-8">
              <div className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-2">
                Custo avulso (1 acionamento de cada)
              </div>
              <div className="text-5xl font-black text-white leading-none">R$ 780</div>
              <div className="text-base text-gray-300 mt-3">
                Sem qualquer proteção para colisão, roubo, terceiros ou perda total
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/12 to-orange-500/4 border border-orange-500/30 rounded-2xl p-8">
              <div className="text-sm font-bold uppercase tracking-widest text-orange-300 mb-2">
                GOL PLUS — Plano Comfort · Desconto Alô Tio
              </div>
              <div className="text-5xl font-black text-orange-400 leading-none">R$ 297,72</div>
              <div className="text-sm text-gray-300 mt-1 italic">
                Exemplo baseado na Citroën Jumper 2.8 — o valor varia conforme o veículo
              </div>
              <div className="text-base text-gray-200 mt-3">
                Proteção completa: colisão, roubo, terceiros, 12 assistências e muito mais
              </div>
              <span className="inline-block mt-4 bg-secondary text-[#0a1520] text-sm font-extrabold px-4 py-1.5 rounded-full">
                Economia real a cada acionamento
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PROPOSTA */}
      <section className="bg-[#0d1b2a] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-orange-500/15 text-orange-300 text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Proposta para seu veículo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Valores com <span className="text-orange-400">desconto exclusivo</span> Alô Tio
          </h2>
          <p className="text-gray-300 text-xl mb-10 max-w-xl">
            Cotação real para uma Citroën Jumper 2.8 2006 — usada como exemplo. O valor final
            varia conforme o modelo, ano e placa do seu veículo.
          </p>

          <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500/15 to-orange-500/5 border-b border-orange-500/20 px-6 sm:px-8 py-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold text-orange-400">
                  Plano Comfort — Citroën Jumper 2.8 16 Lug. Diesel 2006
                </div>
                <div className="text-base text-gray-300 mt-1">
                  Valor protegido: R$&nbsp;41.912,00 · Cotação nº 43347090
                </div>
              </div>
              <span className="bg-orange-500 text-white text-sm font-black tracking-widest uppercase px-4 py-1.5 rounded-full">
                Plano Comfort
              </span>
            </div>

            {/* Details */}
            <div className="px-6 sm:px-8 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { label: 'Cobertura de terceiros', value: 'Até R$ 70.000,00' },
                { label: 'Auxílio funeral', value: 'Até R$ 5.000,00' },
                { label: 'Guincho em caso de sinistro', value: 'KM Ilimitado' },
                { label: 'Guincho por pane', value: 'Até 400 KM' },
                { label: 'Opcional: APP passageiros*', value: '+ R$ 15,70/mês' },
                { label: 'Opcional: Vidros completos', value: '+ R$ 40,70/mês' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {item.label}
                  </div>
                  <div className="font-bold text-white text-base">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="bg-orange-500/6 border-t border-orange-500/15 px-6 sm:px-8 py-6 grid sm:grid-cols-3 gap-6">
              {[
                {
                  label: 'Mensalidade',
                  old: 'R$ 330,80',
                  value: 'R$ 297,72',
                  saving: 'Economia de R$ 33,08/mês',
                },
                {
                  label: 'Taxa de afiliação',
                  old: 'R$ 500,00',
                  value: 'R$ 350,00',
                  saving: 'Desconto de R$ 150,00',
                },
                {
                  label: 'Franquia em sinistro',
                  old: 'R$ 3.000,00',
                  value: 'R$ 2.700,00',
                  saving: 'Desconto de R$ 300,00',
                },
              ].map((p) => (
                <div key={p.label} className="text-center">
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
                    {p.label}
                  </div>
                  <div className="text-base text-gray-400 line-through mb-0.5">{p.old}</div>
                  <div className="text-3xl font-black text-orange-400 leading-none">{p.value}</div>
                  <div className="text-sm text-secondary font-semibold mt-1.5">{p.saving}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-3">
            *APP – Acidentes Pessoais de Passageiros (até 17 passageiros): Morte Acidental R$10.000
            · Invalidez Permanente R$10.000 · Despesas Médicas R$2.000.
          </p>
        </div>
      </section>

      {/* REPUTAÇÃO */}
      <section className="bg-[#0a1520] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-orange-500/15 text-orange-300 text-sm font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Quem é a GOL PLUS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-10">
            Reputação que <span className="text-orange-400">fala por si</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: '🏆',
                value: '9,1',
                label: 'NPS — taxa de satisfação avaliada pelos usuários',
              },
              {
                icon: '⭐',
                value: '#1',
                label: '1ª associação de proteção veicular a ganhar o Prêmio Reclame Aqui 2022',
              },
              {
                icon: '🌐',
                value: '+7 anos',
                label: 'de atuação e destaque nacional no segmento',
              },
            ].map((r) => (
              <div
                key={r.label}
                className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center flex flex-col items-center gap-3"
              >
                <span className="text-4xl">{r.icon}</span>
                <div className="text-4xl font-black text-orange-400 leading-none">{r.value}</div>
                <div className="text-base text-gray-200 leading-snug">{r.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {[
              '🔏 ISO 9001:2015 — Qualidade de Atendimento',
              '🔏 ISO 37001:2016 — Gestão Antissuborno',
              '🔏 ISO 37301:2021 — Gestão de Compliance',
              '📋 SUSEP — Associação Cadastrada',
            ].map((cert) => (
              <span
                key={cert}
                className="flex items-center gap-2 bg-white/4 border border-white/10 rounded-lg px-4 py-2.5 text-base font-semibold text-gray-200"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-[#0d1b2a] to-[#080f18] py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
            Proteja sua van e
            <br />
            <span className="text-orange-400">dirija com tranquilidade</span>
          </h2>
          <p className="text-gray-200 text-xl leading-relaxed mb-10">
            Entre em contato com nosso parceiro GOL PLUS e informe que veio pela Alô Tio
            para garantir os descontos exclusivos.
          </p>

          <a
            href="https://golplus.com.br/cotacao/?in=lDGnPPYq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-orange-500/20"
          >
            🛡️ Fazer minha cotação agora
          </a>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">
              Ou escaneie o QR code
            </p>
            <img
              src="/qrcode-golplus.png"
              alt="QR Code — Cotação GOL PLUS"
              className="w-36 h-36 rounded-2xl border-4 border-orange-500/40 shadow-lg shadow-orange-500/10"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
