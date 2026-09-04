'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const CONSENT_KEY = 'blesk:cookie-notice'
const CONSENT_EVENT = 'blesk:analytics-consent'
const counter = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '87221377')

export function YandexMetrika() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const check = () => {
      try {
        setEnabled(localStorage.getItem(CONSENT_KEY) === 'ok')
      } catch {
        setEnabled(false)
      }
    }

    check()
    window.addEventListener(CONSENT_EVENT, check)
    return () => window.removeEventListener(CONSENT_EVENT, check)
  }, [])

  if (!enabled || !Number.isInteger(counter) || counter <= 0) return null

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${counter},'init',{webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`}
    </Script>
  )
}
