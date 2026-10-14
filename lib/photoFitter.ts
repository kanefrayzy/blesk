import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { photoSlots, type CropPosition } from '@/lib/photoSlots'

const run = promisify(execFile)

export const SOURCE_DIR = process.env.PHOTO_SOURCE_DIR ?? path.join(os.homedir(), 'Desktop', 'Картинки в сайт')
const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'photo')
const CACHE = path.join(ROOT, '.photo-cache')
const THUMBS = path.join(CACHE, 'thumbs')
const MANIFEST = path.join(CACHE, 'assignments.json')
const DEV_IMAGES = path.join(ROOT, '.next', 'dev', 'cache', 'images')

export type Assignment = { file: string; position: CropPosition; auto?: boolean }
export type Manifest = Record<string, Assignment>

const INPUT = /\.(jpe?g|png|webp|tiff?|avif)$/i

export async function listSources() {
  try {
    const files = await fs.readdir(SOURCE_DIR)
    return files.filter((f) => INPUT.test(f) && !f.startsWith('.')).sort()
  } catch {
    return []
  }
}

async function sourcePath(file: string) {
  if (path.basename(file) !== file || !(await listSources()).includes(file)) throw new Error('Нет такого файла')
  return path.join(SOURCE_DIR, file)
}

export function slotOf(key: string) {
  const slot = photoSlots.find((s) => s.key === key)
  if (!slot) throw new Error('Нет такого места')
  return slot
}

export async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, 'utf8'))
  } catch {
    return {}
  }
}

async function writeManifest(manifest: Manifest) {
  await fs.mkdir(CACHE, { recursive: true })
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2))
}

export async function versions() {
  const result: Record<string, number> = {}
  for (const slot of photoSlots) {
    try {
      result[slot.key] = Math.round((await fs.stat(path.join(OUT, `${slot.key}.jpg`))).mtimeMs)
    } catch {
      result[slot.key] = 0
    }
  }
  return result
}

export async function thumbnail(file: string) {
  const src = await sourcePath(file)
  const { mtimeMs } = await fs.stat(src)
  const cached = path.join(THUMBS, `${file}-${Math.round(mtimeMs)}.jpg`)
  try {
    return await fs.readFile(cached)
  } catch {
    await fs.mkdir(THUMBS, { recursive: true })
    const buffer = await sharp(src, { failOn: 'none' }).rotate().resize(520).jpeg({ quality: 72 }).toBuffer()
    await fs.writeFile(cached, buffer)
    return buffer
  }
}

async function render(file: string, key: string, position: CropPosition) {
  const [width, height] = slotOf(key).size
  await sharp(await sourcePath(file), { failOn: 'none', limitInputPixels: false })
    .rotate()
    .resize(width, height, {
      fit: 'cover',
      position: position === 'auto' ? sharp.strategy.attention : position,
    })
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(path.join(OUT, `${key}.jpg`))
}

export async function assign(key: string, file: string, position: CropPosition) {
  const slot = slotOf(key)
  const manifest = await readManifest()

  await render(file, key, position)
  manifest[key] = { file, position }

  // Телефонный кадр без своего снимка повторяет основной.
  if (slot.mobile && (!manifest[slot.mobile] || manifest[slot.mobile].auto)) {
    await render(file, slot.mobile, position)
    manifest[slot.mobile] = { file, position, auto: true }
  }

  await writeManifest(manifest)
  await fs.rm(DEV_IMAGES, { recursive: true, force: true })
}

export async function reset(key: string) {
  const slot = slotOf(key)
  const manifest = await readManifest()
  const keys = [key]
  if (slot.mobile && manifest[slot.mobile]?.auto) keys.push(slot.mobile)

  for (const k of keys) {
    const { stdout } = await run('git', ['show', `HEAD:public/photo/${k}.jpg`], {
      cwd: ROOT,
      encoding: 'buffer',
      maxBuffer: 64 * 1024 * 1024,
    })
    await fs.writeFile(path.join(OUT, `${k}.jpg`), stdout)
    delete manifest[k]
  }

  await writeManifest(manifest)
  await fs.rm(DEV_IMAGES, { recursive: true, force: true })
}
