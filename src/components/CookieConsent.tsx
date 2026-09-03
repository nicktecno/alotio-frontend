'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import AdSense from '@/components/AdSense';
import GoogleAnalytics from '@/components/GoogleAnalytics';

type Consent = 'accepted' | 'rejected' | null;

const CONSENT_KEY = 'alotio-cookie-consent';
const CONSENT_EVENT = 'alotio:cookie-consent-change';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
  };
}

function getConsent(): Consent {
  const storedConsent = window.localStorage.getItem(CONSENT_KEY);
  return storedConsent === 'accepted' || storedConsent === 'rejected' ? storedConsent : null;
}

export default function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getConsent, () => null);

  const chooseConsent = (choice: Exclude<Consent, null>) => {
    window.localStorage.setItem(CONSENT_KEY, choice);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  return (
    <>
      {consent === 'accepted' && (
        <>
          <GoogleAnalytics />
          <AdSense />
        </>
      )}
      {consent === null && (
        <aside
          aria-label="Preferências de cookies"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-5"
        >
          <p className="text-sm leading-6 text-gray-700">
            Usamos cookies opcionais do Google Analytics e do Google AdSense para medir o uso do
            site e exibir anúncios. Você pode aceitar ou recusar. Saiba mais na{' '}
            <Link href="/privacidade" className="font-semibold text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => chooseConsent('rejected')}
              className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => chooseConsent('accepted')}
              className="bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Aceitar
            </button>
          </div>
        </aside>
      )}
    </>
  );
}