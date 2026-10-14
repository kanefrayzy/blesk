import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PhotoFitter } from '@/components/dev/PhotoFitter'

export const metadata: Metadata = { title: 'Примерка фото', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function PhotoFitterPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  const { SOURCE_DIR, listSources, readManifest, versions } = await import('@/lib/photoFitter')

  return (
    <PhotoFitter
      sourceDir={SOURCE_DIR}
      sources={await listSources()}
      initialManifest={await readManifest()}
      initialVersions={await versions()}
    />
  )
}
