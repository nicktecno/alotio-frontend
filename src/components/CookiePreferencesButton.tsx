'use client';

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.localStorage.removeItem('alotio-cookie-consent');
        window.dispatchEvent(new Event('alotio:cookie-consent-change'));
      }}
      className="text-primary-200 hover:text-white transition"
    >
      Preferências de cookies
    </button>
  );
}