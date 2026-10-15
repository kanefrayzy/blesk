'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { fallbackContent } from '@/lib/cmsFallback'
import type { SiteContent } from '@/lib/cmsTypes'

/** Контент из панели для клиентских секций. Читает его сервер (lib/cms). */
const ContentContext = createContext<SiteContent>(fallbackContent)

export function ContentProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}

export function useContent(): SiteContent {
  return useContext(ContentContext)
}
