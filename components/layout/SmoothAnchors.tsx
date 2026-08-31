'use client'

import { useEffect } from 'react'

/**
 * Плавная прокрутка к разделам своей же страницы.
 *
 * Плавность убрана из `scroll-behavior` документа: она ломала переходы между
 * страницами. Маршрутизатор Next после навигации подтягивает узлы новой
 * страницы в видимую область, и анимация успевала доехать до последнего из
 * них — с блога на главную страницу уносило к подвалу.
 *
 * Слушаем на погружении: Link пропускает свой обработчик, если событие уже
 * отменено, — иначе маршрутизатор перехватит клик первым и прокрутит к якорю
 * мгновенно, он делает это намеренно.
 */
export function SmoothAnchors() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const link = (event.target as Element | null)?.closest?.('a')
      if (!link || link.hasAttribute('download') || link.target === '_blank') return

      const href = link.getAttribute('href') ?? ''
      const path = window.location.pathname
      const hash = href.startsWith('#')
        ? href
        : href.startsWith(`${path}#`)
          ? href.slice(path.length)
          : ''
      if (hash.length < 2) return

      const target = document.querySelector(hash)
      if (!target) return

      event.preventDefault()
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
      window.history.replaceState(null, '', hash)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
