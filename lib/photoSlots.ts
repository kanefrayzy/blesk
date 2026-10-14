export type PhotoSlot = {
  key: string
  label: string
  group: string
  size: [number, number]
  pages: { href: string; name: string }[]
  /** Вертикальный кадр того же места для телефона. */
  mobile?: string
}

const home = { href: '/', name: 'Главная' }
const dealers = { href: '/dileram', name: 'Дилерам' }
const jobs = { href: '/vakansii', name: 'Вакансии' }

const heroes = [
  ['odezhda', 'Одежда', 'odezhda'],
  ['shuba', 'Мех и кожа', 'shuby-i-meh'],
  ['tekstil', 'Домашний текстиль', 'domashniy-tekstil'],
  ['detskie', 'Детские вещи', 'detskie-veshchi'],
  ['pitomcy', 'Вещи питомцев', 'veshchi-pitomcev'],
  ['korp', 'Для бизнеса', 'dlya-biznesa'],
] as const

export const photoSlots: PhotoSlot[] = [
  ...heroes.flatMap(([key, name, slug]): PhotoSlot[] => {
    const service = { href: `/uslugi/${slug}`, name }
    const extra = key === 'korp' || key === 'tekstil' ? [jobs] : []
    return [
      {
        key: `hero-${key}`,
        label: name,
        group: 'Первый экран',
        size: [2048, 1504],
        pages: [home, ...extra],
        mobile: `hero-${key}-m`,
      },
      {
        key: `hero-${key}-m`,
        label: `${name} — телефон`,
        group: 'Первый экран',
        size: [1104, 2048],
        pages: [home],
      },
      {
        key: `usl-${key}`,
        label: `${name} — вверху`,
        group: 'Страницы услуг',
        size: [1800, 1350],
        pages: [service],
      },
      {
        key: `usl-${key}-ceh`,
        label: `${name} — «Что делаем мы»`,
        group: 'Страницы услуг',
        size: [1600, 1728],
        pages: [service],
      },
    ]
  }),
  ...heroes.map(([key, name]): PhotoSlot => ({
    key: `svc-${key}`,
    label: name,
    group: 'Карточки услуг',
    size: [928, 1152],
    pages: [home],
  })),
  { key: 'prod-oborudovanie', label: 'Оборудование', group: 'Производство', size: [2000, 1500], pages: [home, dealers, jobs] },
  { key: 'prod-smena', label: 'Смена', group: 'Производство', size: [2000, 1500], pages: [home, jobs] },
  { key: 'prod-kontrol', label: 'Контроль', group: 'Производство', size: [2000, 1500], pages: [home, jobs] },
  { key: 'prod-upakovka', label: 'Упаковка', group: 'Производство', size: [2000, 1500], pages: [home, jobs] },
  { key: 'dileram-reys', label: 'Первый экран', group: 'Дилерам', size: [2752, 1536], pages: [dealers] },
  { key: 'dileram-punkt', label: 'Пункт приёма', group: 'Дилерам', size: [800, 800], pages: [dealers] },
  { key: 'dileram-brand-vyveska', label: 'Вывеска', group: 'Дилерам', size: [900, 900], pages: [dealers] },
  { key: 'dileram-brand-shtender', label: 'Штендер', group: 'Дилерам', size: [900, 900], pages: [dealers] },
  { key: 'dileram-brand-chehol', label: 'Чехлы для одежды', group: 'Дилерам', size: [900, 900], pages: [dealers] },
  { key: 'dileram-brand-fartuk', label: 'Фартук', group: 'Дилерам', size: [900, 900], pages: [dealers] },
  { key: 'vakansii-ceh', label: 'Первый экран', group: 'Вакансии', size: [2048, 1366], pages: [jobs] },
  { key: 'vak-mehanik', label: 'Механик', group: 'Вакансии', size: [1800, 1200], pages: [jobs] },
  { key: 'vak-vto', label: 'ВТО', group: 'Вакансии', size: [1800, 1200], pages: [jobs] },
  { key: 'vak-restavrator', label: 'Реставратор', group: 'Вакансии', size: [1800, 1200], pages: [jobs] },
  { key: 'cabinet-push', label: 'Вход в кабинет', group: 'Кабинет', size: [1180, 694], pages: [{ href: '/vhod', name: 'Вход' }], mobile: 'cabinet-push-m' },
  { key: 'cabinet-push-m', label: 'Вход в кабинет — телефон', group: 'Кабинет', size: [1152, 800], pages: [{ href: '/vhod', name: 'Вход' }] },
]

export const cropPositions = [
  ['auto', 'Авто'],
  ['centre', 'Центр'],
  ['top', 'Верх'],
  ['bottom', 'Низ'],
  ['left', 'Лево'],
  ['right', 'Право'],
] as const

export type CropPosition = (typeof cropPositions)[number][0]
