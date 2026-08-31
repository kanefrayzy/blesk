import Image from 'next/image'

/**
 * Обложка материала. Если редактор её не приложил — фирменная плашка:
 * пустой серый прямоугольник в сетке карточек выглядит недоделкой.
 */
export function PostCover({
  url,
  alt,
  sizes,
  priority = false,
}: {
  url: string | null
  alt: string | null
  sizes: string
  priority?: boolean
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt={alt ?? ''}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    )
  }

  return (
    <div className="absolute inset-0 bg-navy">
      <Image
        src="/brand/mark-white.svg"
        alt=""
        aria-hidden="true"
        width={64}
        height={64}
        className="absolute -right-6 -bottom-8 h-40 w-40 opacity-[0.07]"
      />
    </div>
  )
}
