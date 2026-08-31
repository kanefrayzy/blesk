import Link from 'next/link'
import { PostCover } from '@/components/blog/PostCover'
import { IconArrow } from '@/components/ui/Icons'
import { formatDate, minutesLabel, type PostSummary } from '@/lib/blog'

/** Первый материал в списке — во всю ширину: свежее заметно сразу. */
export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <article className="group relative grid overflow-hidden rounded-2xl bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(14,26,53,0.10)] lg:grid-cols-2">
      <div className="relative aspect-[16/10] overflow-hidden bg-mist lg:aspect-auto lg:min-h-[22rem]">
        <PostCover
          url={post.cover_url}
          alt={post.cover_alt}
          rubric={post.rubric_label}
          sizes="(min-width: 1024px) 50vw, 92vw"
          priority
        />
      </div>

      <div className="flex flex-col justify-center p-7 lg:p-10">
        <p className="flex items-center gap-2 text-[0.75rem] text-slate-soft">
          <span className="rounded-full bg-teal/10 px-2.5 py-1 font-display font-bold text-teal">
            {post.rubric_label}
          </span>
          {post.published_at && (
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          )}
        </p>

        <h2 className="h2 mt-5 max-w-[22ch] text-[clamp(1.25rem,2vw,1.75rem)] text-navy">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>

        <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-slate">
          {post.excerpt}
        </p>

        <p className="mt-7 flex items-center gap-2 text-[0.8125rem] font-semibold text-teal">
          Читать
          <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          <span className="ml-2 font-normal text-slate-soft">
            {minutesLabel(post.reading_minutes)}
          </span>
        </p>
      </div>
    </article>
  )
}
