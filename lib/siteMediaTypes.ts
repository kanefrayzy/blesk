export type SiteMediaItem = {
  src: string | null
  srcMobile: string | null
  alt: string | null
}

/** Ключ места («hero.shuba», «service.korp»…) → заменённое фото. */
export type SiteMedia = Record<string, SiteMediaItem>

export type ResolvedPhoto = {
  src: string
  /** Для мест с отдельным вертикальным кадром. */
  srcMobile: string
  alt: string
}

/**
 * Что показать на месте. Порядок для телефона: свой мобильный кадр, затем
 * свой основной, затем стандартный мобильный — чтобы на телефоне не
 * осталось старое фото, когда на компьютере уже новое.
 */
export function resolvePhoto(
  media: SiteMedia,
  key: string,
  fallback: { src: string; srcMobile?: string; alt: string },
): ResolvedPhoto {
  const item = media[key]
  const src = item?.src ?? fallback.src

  return {
    src,
    srcMobile: item?.srcMobile ?? item?.src ?? fallback.srcMobile ?? src,
    alt: item?.alt ?? fallback.alt,
  }
}
