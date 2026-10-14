export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 })
  const { readManifest, reset, versions } = await import('@/lib/photoFitter')
  const { slot } = (await request.json()) as { slot: string }

  try {
    await reset(slot)
    return Response.json({ manifest: await readManifest(), versions: await versions() })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 })
  }
}
