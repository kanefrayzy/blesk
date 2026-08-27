/** Общее поле страницы: одна ширина и одни поля на все секции. */
export function Container({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={`mx-auto max-w-[1280px] px-5 lg:px-8 ${className}`}>{children}</div>
}
