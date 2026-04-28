'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function StarsRow({ value }: { value: number }) {
  const r = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <span className="tracking-tight" aria-hidden>
      <span className="text-amber-400">{'★'.repeat(r)}</span>
      <span className="text-gray-300">{'★'.repeat(5 - r)}</span>
    </span>
  );
}

function StarPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-700 w-40 shrink-0">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
              value === n
                ? 'bg-secondary text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

type ReviewRow = {
  id: string;
  reviewerName: string;
  punctuality: number;
  communication: number;
  safety: number;
  comment: string;
  createdAt: string;
};

export default function TioReviewsPanel({
  profileId,
  reviewsApprovedCount,
  reviewAvgOverall,
  reviewAvgPunctuality,
  reviewAvgCommunication,
  reviewAvgSafety,
  onStatsRefresh,
}: {
  profileId: string;
  reviewsApprovedCount?: number;
  reviewAvgOverall?: number | null;
  reviewAvgPunctuality?: number | null;
  reviewAvgCommunication?: number | null;
  reviewAvgSafety?: number | null;
  onStatsRefresh?: () => void;
}) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const pauseCarousel = useRef(false);

  const [step, setStep] = useState<'email' | 'details'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [punctuality, setPunctuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [safety, setSafety] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [codeSending, setCodeSending] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await api.getPublicReviews(profileId, 1, 50);
      setReviews(res.data);
      setCarouselIdx(0);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (reviews.length <= 1) return undefined;
    const t = setInterval(() => {
      if (!pauseCarousel.current) {
        setCarouselIdx((i) => (i + 1) % reviews.length);
      }
    }, 6000);
    return () => clearInterval(t);
  }, [reviews.length]);

  const handleRequestCode = async () => {
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      toast.error('Informe um e-mail válido.');
      return;
    }
    setCodeSending(true);
    try {
      await api.requestReviewCode({ profileId, email: em });
      toast.success('Código enviado! Verifique seu e-mail.');
      setStep('details');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível enviar o código.');
    } finally {
      setCodeSending(false);
    }
  };

  const handleSubmitReview = async () => {
    const em = email.trim();
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error('Informe o código de 6 dígitos recebido por e-mail.');
      return;
    }
    const name = reviewerName.trim();
    if (name.length < 2) {
      toast.error('Informe seu nome.');
      return;
    }
    const c = comment.trim();
    if (!c.length) {
      toast.error('Escreva um comentário breve sobre o serviço.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitReview({
        profileId,
        email: em,
        reviewerName: name,
        code: code.trim(),
        punctuality,
        communication,
        safety,
        comment: c.slice(0, 500),
      });
      toast.success('Avaliação enviada! Após moderação, ela poderá aparecer no perfil.');
      setStep('email');
      setCode('');
      setReviewerName('');
      setComment('');
      onStatsRefresh?.();
      loadReviews();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgOverall =
    reviewAvgOverall != null && (reviewsApprovedCount ?? 0) > 0 ? reviewAvgOverall : null;

  return (
    <div className="space-y-10 border-t border-gray-100 pt-8">
      <div>
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-3">Avaliações</h2>
        {(reviewsApprovedCount ?? 0) > 0 && avgOverall != null ? (
          <div className="flex flex-wrap gap-6 mb-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-amber-800 uppercase tracking-wide">Nota geral</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                <StarsRow value={avgOverall} />
                <span>{avgOverall.toFixed(1)}</span>
              </p>
              <p className="text-xs text-amber-900/80 mt-1">{reviewsApprovedCount} avaliações publicadas</p>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-700">
              <span>Pontualidade: <strong>{reviewAvgPunctuality?.toFixed(1) ?? '—'}</strong></span>
              <span>Comunicação: <strong>{reviewAvgCommunication?.toFixed(1) ?? '—'}</strong></span>
              <span>Segurança: <strong>{reviewAvgSafety?.toFixed(1) ?? '—'}</strong></span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">Ainda não há avaliações publicadas para este transportador.</p>
        )}

        {!loadingReviews && reviews.length > 0 && (
          <div
            className="relative rounded-xl border border-gray-200 bg-gray-50/80 p-4 md:p-6 min-h-[140px]"
            onMouseEnter={() => {
              pauseCarousel.current = true;
            }}
            onMouseLeave={() => {
              pauseCarousel.current = false;
            }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">O que as famílias disseram</p>
            <div className="min-h-[5rem]">
              {reviews[carouselIdx] && (
                <div>
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{reviews[carouselIdx].reviewerName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(reviews[carouselIdx].createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {reviews[carouselIdx].comment}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Notas: pontualidade {reviews[carouselIdx].punctuality} · comunicação {reviews[carouselIdx].communication} · segurança {reviews[carouselIdx].safety}
                  </p>
                </div>
              )}
            </div>
            {reviews.length > 1 && (
              <div className="flex items-center justify-between gap-3 mt-4">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50"
                  onClick={() => setCarouselIdx((i) => (i - 1 + reviews.length) % reviews.length)}
                >
                  Anterior
                </button>
                <div className="flex gap-1.5">
                  {reviews.map((rev, i) => (
                    <button
                      key={rev.id}
                      type="button"
                      aria-label={`Ir para depoimento ${i + 1}`}
                      className={`h-2 w-2 rounded-full transition ${i === carouselIdx ? 'bg-secondary w-4' : 'bg-gray-300'}`}
                      onClick={() => setCarouselIdx(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50"
                  onClick={() => setCarouselIdx((i) => (i + 1) % reviews.length)}
                >
                  Próximo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 md:p-6">
        <h3 className="font-heading text-base font-semibold text-gray-900 mb-1">Deixe sua avaliação</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enviaremos um código de verificação para o seu e-mail. Cada e-mail pode avaliar este transportador
          uma vez.
        </p>

        {step === 'email' && (
          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            <button
              type="button"
              disabled={codeSending}
              onClick={handleRequestCode}
              className="bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-sm"
            >
              {codeSending ? 'Enviando...' : 'Receber código por e-mail'}
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4 max-w-lg">
            <p className="text-sm text-gray-600">
              Código enviado para <strong>{email}</strong>. Preencha abaixo e envie.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código (6 dígitos)</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg tracking-widest font-mono"
                placeholder="000000"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
              <input
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                maxLength={120}
              />
            </div>
            <StarPicker label="Pontualidade" value={punctuality} onChange={setPunctuality} />
            <StarPicker label="Comunicação" value={communication} onChange={setCommunication} />
            <StarPicker label="Segurança" value={safety} onChange={setSafety} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentário (curto)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Conte brevemente sua experiência..."
              />
              <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitReview}
                className="bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                {submitting ? 'Enviando...' : 'Enviar avaliação'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                }}
                className="text-sm text-gray-600 underline"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
