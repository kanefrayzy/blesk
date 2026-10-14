'use client'

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react'
import type { Manifest } from '@/lib/photoFitter'
import { cropPositions, photoSlots, type CropPosition } from '@/lib/photoSlots'

type Props = {
  sourceDir: string
  sources: string[]
  initialManifest: Manifest
  initialVersions: Record<string, number>
}

const groups = [...new Set(photoSlots.map((s) => s.group))]
const positionName = Object.fromEntries(cropPositions) as Record<CropPosition, string>

export function PhotoFitter({ sourceDir, sources, initialManifest, initialVersions }: Props) {
  const [manifest, setManifest] = useState(initialManifest)
  const [versions, setVersions] = useState(initialVersions)
  const [selected, setSelected] = useState(photoSlots[0].key)
  const [position, setPosition] = useState<CropPosition>(initialManifest[photoSlots[0].key]?.position ?? 'auto')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const slot = photoSlots.find((s) => s.key === selected)!
  const current = manifest[selected]

  const usage = useMemo(() => {
    const count: Record<string, number> = {}
    for (const a of Object.values(manifest)) if (!a.auto) count[a.file] = (count[a.file] ?? 0) + 1
    return count
  }, [manifest])

  async function call(url: string, body: object) {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Ошибка')
      setManifest(data.manifest)
      setVersions(data.versions)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function select(key: string) {
    setSelected(key)
    setPosition(manifest[key]?.position ?? 'auto')
  }

  function changePosition(value: CropPosition) {
    setPosition(value)
    if (current) void call('/primerka/apply', { slot: selected, file: current.file, position: value })
  }

  const photo = (key: string) => `/photo/${key}.jpg?v=${versions[key] ?? 0}`

  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/95 px-5 py-3 backdrop-blur">
        <div>
          <h1 className="font-display text-lg font-bold">Примерка фото</h1>
          <p className="text-[0.75rem] text-slate">
            {sources.length} снимков из {sourceDir}
          </p>
        </div>
        <p className="text-[0.75rem] text-slate">Выбери место слева, затем снимок справа. Сайт обновится сам после перезагрузки страницы.</p>
      </header>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group}>
              <h2 className="label mb-3 text-slate-soft">{group}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {photoSlots
                  .filter((s) => s.group === group)
                  .map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => select(s.key)}
                      className={`overflow-hidden rounded-xl bg-white text-left ring-2 transition ${
                        s.key === selected ? 'ring-teal' : 'ring-transparent hover:ring-line'
                      }`}
                    >
                      <span className="block aspect-[4/3] bg-mist">
                        <img src={photo(s.key)} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="block px-2.5 py-2">
                        <span className="block truncate text-[0.75rem] font-semibold">{s.label}</span>
                        <span className="block truncate text-[0.6875rem] text-slate-soft">
                          {manifest[s.key] ? manifest[s.key].file.replace(/\.[^.]+$/, '') : 'исходное'}
                        </span>
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.6875rem] text-slate-soft">
                  {slot.group} · {slot.size[0]}×{slot.size[1]}
                </p>
                <h2 className="font-display text-xl font-bold">{slot.label}</h2>
                <p className="mt-1 flex flex-wrap gap-x-3 text-[0.75rem]">
                  {slot.pages.map((p) => (
                    <a key={p.href} href={p.href} target="_blank" rel="noreferrer" className="font-semibold text-teal underline-offset-2 hover:underline">
                      {p.name} ↗
                    </a>
                  ))}
                </p>
              </div>
              {current && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => call('/primerka/reset', { slot: selected })}
                  className="rounded-full border border-line px-3.5 py-1.5 text-[0.75rem] font-semibold text-slate hover:border-navy hover:text-navy disabled:opacity-50"
                >
                  Вернуть исходное
                </button>
              )}
            </div>

            <div className="relative mt-4 overflow-hidden rounded-xl bg-mist" style={{ aspectRatio: `${slot.size[0]} / ${slot.size[1]}`, width: `min(100%, calc(46vh * ${slot.size[0] / slot.size[1]}))`, marginInline: 'auto' }}>
              <img src={photo(selected)} alt="" className="h-full w-full object-cover" />
              {busy && <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-[0.8125rem] font-semibold">Обрабатываю…</span>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[0.75rem] text-slate">Обрезка:</span>
              {cropPositions.map(([value, name]) => (
                <button
                  key={value}
                  type="button"
                  disabled={busy}
                  onClick={() => changePosition(value)}
                  className={`rounded-full px-3 py-1 text-[0.75rem] font-semibold transition ${
                    position === value ? 'bg-navy text-white' : 'bg-mist text-slate hover:text-navy'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            {current?.auto && <p className="mt-2 text-[0.75rem] text-slate-soft">Вырезано из основного кадра. Выбери снимок, чтобы поставить свой.</p>}
            {current && !current.auto && (
              <p className="mt-2 text-[0.75rem] text-slate-soft">
                {current.file} · {positionName[current.position]}
              </p>
            )}
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[0.75rem] text-red-700">{error}</p>}
          </div>

          <div className="mt-4 grid max-h-[calc(100vh-8rem)] grid-cols-3 gap-2 overflow-y-auto rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-4 lg:max-h-[38vh]">
            {sources.length === 0 && <p className="col-span-full p-4 text-[0.8125rem] text-slate">В папке нет снимков.</p>}
            {sources.map((file) => (
              <button
                key={file}
                type="button"
                disabled={busy}
                onClick={() => call('/primerka/apply', { slot: selected, file, position })}
                title={file}
                className={`relative aspect-[3/2] overflow-hidden rounded-lg bg-mist ring-2 transition disabled:opacity-60 ${
                  current?.file === file ? 'ring-teal' : 'ring-transparent hover:ring-navy/30'
                }`}
              >
                <img src={`/primerka/thumb?file=${encodeURIComponent(file)}`} alt={file} loading="lazy" className="h-full w-full object-cover" />
                {usage[file] > 0 && (
                  <span className="absolute top-1 right-1 rounded-full bg-navy px-1.5 text-[0.625rem] font-bold text-white">{usage[file]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
