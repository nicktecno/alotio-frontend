import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/tios?*',
          '/contrato/',
          '/login',
          '/cadastro',
          '/cadastro-pai',
          '/cadastro-lojista',
          '/cadastro-sindicato',
          '/cadastro-associacao',
          '/cadastro-escola-parceira',
          '/esqueci-senha',
          '/redefinir-senha',
          '/lojista/',
        ],
      },
      {
        userAgent: [
          'Bytespider',
          'CCBot',
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Omgilibot',
          'FacebookBot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
