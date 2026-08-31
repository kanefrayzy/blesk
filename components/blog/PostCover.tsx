import Image from 'next/image'

/**
 * Обложка материала. Если редактор её не приложил — фирменная плашка:
 * пустой серый прямоугольник в сетке карточек выглядит недоделкой.
 */
export function PostCover({
  url,
  alt,
  rubric,
  sizes,
  priority = false,
}: {
  url: string | null
  alt: string | null
  rubric: string
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
    <div className="absolute inset-0 flex items-end bg-navy p-5">
      <Image
        src="/brand/mark-white.svg"
        alt=""
        aria-hidden="true"
        width={64}
        height={64}
        className="absolute -right-6 -bottom-8 h-40 w-40 opacity-[0.07]"
      />
      <span className="label relative text-white/60">{rubric}</span>
    </div>
  )
}
