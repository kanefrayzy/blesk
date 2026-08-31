import Link from 'next/link'
import { PostCover } from '@/components/blog/PostCover'
import { IconArrow } from '@/components/ui/Icons'
import { formatDate, minutesLabel, type PostSummary } from '@/lib/blog'

export function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(14,26,53,0.10)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        <PostCover
          url={post.cover_url}
          alt={post.cover_alt}
          rubric={post.rubric_label}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          priority={priority}
        />
      </div>

      <div className="flex grow flex-col p-6">
        <p className="flex items-center gap-2 text-[0.75rem] text-slate-soft">
          <span className="rounded-full bg-teal/10 px-2.5 py-1 font-display font-bold text-teal">
            {post.rubric_label}
          </span>
          {post.published_at && (
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          )}
        </p>

        <h3 className="h2 mt-4 text-[1.0625rem] text-navy">
          {/* Ссылка растягивается на карточку: кликать можно куда угодно. */}
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-slate">
          {post.excerpt}
        </p>

        <p className="mt-auto flex items-center gap-2 pt-6 text-[0.75rem] text-slate-soft">
          {minutesLabel(post.reading_minutes)} чтения
          <IconArrow className="h-4 w-4 text-teal transition-transform duration-300 group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  )
}
