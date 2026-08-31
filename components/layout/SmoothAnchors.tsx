'use client'

import { useEffect } from 'react'

/**
 * Плавная прокрутка к разделам своей же страницы.
 *
 * Раньше это делал `scroll-behavior: smooth` на html — и ломал переходы между
 * страницами: маршрутизатор Next после навигации перебирает узлы новой
 * страницы и подтягивает их в видимую область, а плавная анимация успевала
 * доехать до последнего из них. С блога на главную страница уезжала к подвалу.
 *
 * Поэтому документ прокручивается мгновенно, а плавность включается здесь и
 * только для ссылок вида `#uslugi` и `/#uslugi`, ведущих в текущую страницу.
 */
export function SmoothAnchors() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return

      const link = (event.target as Element | null)?.closest?.('a')
      if (!link) return

      const href = link.getAttribute('href') ?? ''
      const hash = href.startsWith('#')
        ? href
        : href.startsWith(`${window.location.pathname}#`)
          ? href.slice(window.location.pathname.length)
          : ''
      if (hash.length < 2) return

      const target = document.querySelector(hash)
      if (!target) return

      event.preventDefault()
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
      window.history.replaceState(null, '', hash)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
