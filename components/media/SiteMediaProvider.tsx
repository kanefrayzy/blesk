'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SiteMedia } from '@/lib/siteMediaTypes'

/**
 * Фото из админки для клиентских секций главной. Данные читает сервер
 * (lib/siteMedia), сюда они приходят уже проверенными.
 */
const SiteMediaContext = createContext<SiteMedia>({})

export function SiteMediaProvider({ media, children }: { media: SiteMedia; children: ReactNode }) {
  return <SiteMediaContext.Provider value={media}>{children}</SiteMediaContext.Provider>
}

export function useSiteMedia(): SiteMedia {
  return useContext(SiteMediaContext)
}
