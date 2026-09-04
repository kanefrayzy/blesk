const apiOrigin = process.env.BLESK_API_URL ? new URL(process.env.BLESK_API_URL) : null

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Сборка под свой сервер: .next/standalone запускается без node_modules.
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  images: {
    // С Next 16 качество — закрытый список: значение из prop, которого
    // здесь нет, молча сводится к ближайшему разрешённому, а прямой
    // запрос к оптимизатору отдаёт 400. Кадр первого экрана — плотная
    // фотография с мелкой фактурой, на 75 она замыливается.
    qualities: [75, 90],

    // Обложки материалов лежат в хранилище админки, а не в public. Источник
    // выводим из адреса API: на бою это домен сайта, на машине разработчика —
    // локальный порт, и порт правилу нужен явно, иначе оно не совпадёт.
    // Оптимизатор Next 16 не ходит на приватные адреса — это защита от SSRF.
    // На машине разработчика бэкенд живёт как раз на 127.0.0.1, поэтому
    // послабление включается переменной и только там; на сервере её нет.
    dangerouslyAllowLocalIP: process.env.BLESK_ALLOW_LOCAL_IMAGES === '1',

    remotePatterns: [
      { protocol: 'https', hostname: 'bleskvip.ru', pathname: '/storage/**' },
      ...(apiOrigin
        ? [
            {
              protocol: apiOrigin.protocol.replace(':', ''),
              hostname: apiOrigin.hostname,
              port: apiOrigin.port,
              pathname: '/storage/**',
            },
          ]
        : []),
    ],
  },

  async rewrites() {
    if (!apiOrigin) return []

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiOrigin.origin}/api/v1/:path*`,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}
export default nextConfig
