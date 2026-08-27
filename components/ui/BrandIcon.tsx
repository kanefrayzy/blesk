import Image from 'next/image'

/** Иконка из брендбука. Файлы двухцветные — подкрашивать нельзя, только масштабировать. */
export function BrandIcon({ name, className }: { name: string; className?: string }) {
  return (
    <Image
      src={`/icons/${name}`}
      alt=""
      aria-hidden="true"
      width={64}
      height={64}
      className={className}
    />
  )
}
