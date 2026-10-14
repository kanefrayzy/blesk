import { cropPositions, type CropPosition } from '@/lib/photoSlots'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 })
  const { assign, readManifest, versions } = await import('@/lib/photoFitter')
  const { slot, file, position } = (await request.json()) as { slot: string; file: string; position: CropPosition }
  if (!cropPositions.some(([value]) => value === position)) return Response.json({ error: 'Неверная обрезка' }, { status: 400 })

  try {
    await assign(slot, file, position)
    return Response.json({ manifest: await readManifest(), versions: await versions() })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 })
  }
}
