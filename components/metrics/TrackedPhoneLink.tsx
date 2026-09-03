'use client'

import { reachGoal } from '@/lib/metrics'

type Props = React.ComponentPropsWithoutRef<'a'>

export function TrackedPhoneLink({ onClick, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(event) => {
        reachGoal('phone_click')
        onClick?.(event)
      }}
    />
  )
}
