'use client'

declare global {
  interface Window {
    ym?: (counter: number, action: 'reachGoal', goal: string) => void
  }
}

const counter = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '87221377')

export function reachGoal(goal: 'online_order_sent' | 'phone_click') {
  if (!Number.isInteger(counter) || counter <= 0) return
  window.ym?.(counter, 'reachGoal', goal)
}
