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
