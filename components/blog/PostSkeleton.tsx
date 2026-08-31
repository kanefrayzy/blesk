/**
 * Заглушка карточки на время загрузки. Повторяет пропорции настоящей,
 * чтобы список не подпрыгнул, когда придут материалы.
 */
export function PostSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white ${wide ? 'grid lg:grid-cols-2' : ''}`}
      aria-hidden="true"
    >
      <div className={`animate-pulse bg-mist ${wide ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]' : 'aspect-[16/10]'}`} />

      <div className={`flex flex-col justify-center ${wide ? 'p-7 lg:p-10' : 'p-6'}`}>
        <div className="h-3 w-24 animate-pulse rounded-full bg-mist" />
        <div className={`mt-5 h-4 animate-pulse rounded-full bg-mist ${wide ? 'w-3/4' : 'w-full'}`} />
        <div className="mt-2.5 h-4 w-1/2 animate-pulse rounded-full bg-mist" />
        <div className="mt-6 h-3 w-full animate-pulse rounded-full bg-mist" />
        <div className="mt-2 h-3 w-11/12 animate-pulse rounded-full bg-mist" />
        <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-mist" />
      </div>
    </div>
  )
}
