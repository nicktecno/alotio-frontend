import type { NextConfig } from "next";

const apiDestination =
  process.env.INTERNAL_BACKEND_URL ||
  'https://api.alotio.com.br';

const nextConfig: NextConfig = {
  // Caching agressivo e imutável para arquivos estáticos públicos (imagens, ícones, fontes)
  // Evita revalidação contínua (max-age=0) na borda e nos navegadores
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redireciona qualquer chamada legada ou de bot em /api/* direto para a API oficial (Cloudflare + Koyeb)
  // usando 307 (Temporary Redirect) para não transferir payloads pesados pelo proxy da Vercel.
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiDestination}/api/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
