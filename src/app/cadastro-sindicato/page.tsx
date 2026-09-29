'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { State, City } from '@/types';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function CadastroSindicatoPage() {
  const router = useRouter();
  const { register, login } = useAuth();

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Entity fields
  const [nomeEntidade, setNomeEntidade] = useState('');
  const [sigla, setSigla] = useState('');
  const [tipo, setTipo] = useState<'sindicato' | 'associacao' | 'cooperativa' | 'federacao'>('sindicato');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefoneFixo, setTelefoneFixo] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [cargo, setCargo] = useState('Presidente');
  const [cnpj, setCnpj] = useState('');
  const [bio, setBio] = useState('');

  // Geolocation
  const [states, setStates] = useState<State[]>([]);
  const [selectedStateId, setSelectedStateId] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    api
      .getStates()
      .then((st) => setStates(st as State[]))
      .catch(() => toast.error('Não foi possível carregar os estados.'))
      .finally(() => setLoadingLocations(false));
  }, []);

  useEffect(() => {
    if (!selectedStateId) {
      setCities([]);
      setSelectedCityId('');
      return;
    }
    api
      .getCities(selectedStateId)
      .then((c) => setCities(c as City[]))
      .catch(() => setCities([]));
  }, [selectedStateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não conferem.');
      return;
    }
    if (!nomeEntidade.trim()) {
      toast.error('Informe o nome da entidade.');
      return;
    }
    if (!whatsapp.trim()) {
      toast.error('Informe o WhatsApp de contato da entidade.');
      return;
    }

    setLoading(true);
    try {
      // 1. Cadastra o usuário com papel LOJISTA (gestor de perfil parceiro)
      await register(email.trim(), password, 'LOJISTA');
      await login(email.trim(), password);

      // 2. Prepara displayName completo
      const finalDisplayName = sigla.trim()
        ? `${sigla.trim().toUpperCase()} - ${nomeEntidade.trim()}`
        : nomeEntidade.trim();

      // 3. Monta bio com dados do responsável e CNPJ
      const bioParts: string[] = [];
      if (bio.trim()) bioParts.push(bio.trim());
      if (responsavel.trim()) bioParts.push(`Responsável: ${responsavel.trim()} (${cargo})`);
      if (cnpj.trim()) bioParts.push(`CNPJ: ${cnpj.trim()}`);
      if (telefoneFixo.trim()) bioParts.push(`Tel. Fixo: ${telefoneFixo.trim()}`);

      // 4. Cria a loja/perfil do tipo SINDICATO
      await api.createStore({
        displayName: finalDisplayName,
        type: 'SINDICATO',
        whatsapp: whatsapp.trim(),
        phone: telefoneFixo.trim() || undefined,
        email: email.trim(),
        bio: bioParts.join('\n\n') || undefined,
        cityId: selectedCityId || undefined,
      });

      toast.success('Conta da entidade criada com sucesso! Bem-vindo ao Alô Tio!');
      router.push('/lojista?tipo=SINDICATO');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar entidade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* HEADER SECTION */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 uppercase tracking-wide">
              <span>🏛️</span>
              <span>Parceria Institucional Alô Tio • 100% Gratuito</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-900 font-heading tracking-tight">
              Cadastre seu Sindicato ou Associação
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Junte-se à maior rede de transporte escolar do Brasil. Fortaleça os transportadores
              legalizados da sua cidade, divulgue benefícios aos associados e ajude os pais a encontrarem condutores de confiança.
            </p>
          </div>

          {/* BENEFIT HIGHLIGHTS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
              <span className="text-2xl block">🏛️</span>
              <h3 className="font-bold text-gray-900 text-sm">Página Oficial</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Página exclusiva da entidade com fotos, contatos, cidades atendidas e canal direto no WhatsApp.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
              <span className="text-2xl block">🛡️</span>
              <h3 className="font-bold text-gray-900 text-sm">Selo de Credenciamento</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ajude pais e mães a identificarem os associados da entidade que estão 100% regularizados nos órgãos locais.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
              <span className="text-2xl block">📢</span>
              <h3 className="font-bold text-gray-900 text-sm">Mural de Benefícios</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Publique até 20 comunicados, notícias, convênios de oficinas e calendários de vistorias sem custo algum.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
              <span className="text-2xl block">🤝</span>
              <h3 className="font-bold text-gray-900 text-sm">Isenção de Mensalidade</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Parceria estratégica sem taxas ou mensalidades para apoiar o transporte escolar legalizado no Brasil.
              </p>
            </div>
          </div>

          {/* REGISTRATION FORM */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: ENTIDADE */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-primary">1.</span>
                  <span>Dados da Entidade Representativa</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Nome Oficial da Entidade *
                    </label>
                    <input
                      required
                      value={nomeEntidade}
                      onChange={(e) => setNomeEntidade(e.target.value)}
                      placeholder="Ex: Sindicato dos Transportadores Escolares da Baixada Santista"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Sigla / Abreviação (opcional)
                    </label>
                    <input
                      value={sigla}
                      onChange={(e) => setSigla(e.target.value)}
                      placeholder="Ex: SINDOTEC, ACEBS, ASSOLICAM"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Tipo de Organização *
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="sindicato">Sindicato</option>
                      <option value="associacao">Associação</option>
                      <option value="cooperativa">Cooperativa</option>
                      <option value="federacao">Federação</option>
                    </select>
                  </div>

                  {/* Estado e Cidade */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Estado (UF) Sede
                    </label>
                    <select
                      value={selectedStateId}
                      onChange={(e) => setSelectedStateId(e.target.value)}
                      disabled={loadingLocations}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="">Selecione o Estado…</option>
                      {states.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.uf})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Cidade Sede
                    </label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      disabled={!selectedStateId || cities.length === 0}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="">
                        {!selectedStateId
                          ? 'Selecione o estado primeiro'
                          : cities.length === 0
                            ? 'Nenhuma cidade encontrada'
                            : 'Selecione a cidade…'}
                      </option>
                      {cities.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      CNPJ (opcional)
                    </label>
                    <input
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Telefone Fixo (opcional)
                    </label>
                    <input
                      value={telefoneFixo}
                      onChange={(e) => setTelefoneFixo(e.target.value)}
                      placeholder="(11) 3333-4444"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Apresentação da Entidade / História (opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre a atuação da entidade, anos de fundação e benefícios oferecidos aos associados…"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTATO & DIRETORIA */}
              <div className="pt-4">
                <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-primary">2.</span>
                  <span>Contato Oficial & Diretoria</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      WhatsApp Oficial de Atendimento *
                    </label>
                    <input
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Usado para associados e famílias entrarem em contato com a diretoria.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Nome do(a) Presidente ou Responsável
                    </label>
                    <input
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Cargo / Função
                    </label>
                    <select
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="Presidente">Presidente</option>
                      <option value="Vice-Presidente">Vice-Presidente</option>
                      <option value="Diretor(a)">Diretor(a)</option>
                      <option value="Secretário(a)">Secretário(a)</option>
                      <option value="Coordenador(a)">Coordenador(a)</option>
                      <option value="Assessoria">Assessoria / Comunicação</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ACESSO AO PAINEL */}
              <div className="pt-4">
                <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-primary">3.</span>
                  <span>Acesso ao Painel da Entidade</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      E-mail Institucional (Login de Acesso) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@sindicato.org.br"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Senha de Acesso *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo de 6 caracteres"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-4 pr-11 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 focus:outline-none transition cursor-pointer"
                        aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-4 pr-11 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 focus:outline-none transition cursor-pointer"
                        aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                      >
                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base py-4 rounded-2xl shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? 'Criando perfil da entidade…' : 'Finalizar Cadastro Gratuito da Entidade →'}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Ao criar a conta, você concorda com nossos{' '}
                  <Link href="/termos-de-uso" className="underline hover:text-gray-700">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" className="underline hover:text-gray-700">
                    Política de Privacidade
                  </Link>
                  . Já possui acesso?{' '}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
