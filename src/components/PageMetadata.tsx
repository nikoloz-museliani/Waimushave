import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePreferences } from '../context/usePreferences'
import { api } from '../api'
import type { Job } from '../types'

// Metadata is kept in one place so old titles/canonicals do not leak between
// screens. This improves a client-rendered app; it does not replace server-side
// rendering for social crawlers or guarantee a position in Google results.
export default function PageMetadata() {
  const { pathname, search } = useLocation()
  const { language, t } = usePreferences()
  useEffect(() => {
    let active = true
    const titles: Record<string, string> = {
      '/': 'Browse jobs',
      '/login': 'Log in',
      '/signup': 'Sign up',
      '/post': 'Post a job',
      '/my-jobs': 'My jobs',
      '/accepted-jobs': 'Accepted / finished jobs',
      '/profile': 'Profile',
    }
    const jobPage = /^\/jobs\/[a-f\d]{24}$/i.test(pathname)
    // Only public job pages and the unfiltered homepage should be indexed.
    // Private dashboards are not discovery pages, nor are arbitrary search URLs.
    const publicPage = (pathname === '/' && !search) || jobPage
    function meta(name: string, content: string, property = false) {
      const attribute = property ? 'property' : 'name'
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.content = content
    }
    function apply(title: string, description: string) {
      document.title = `${title} | Waimushave`
      meta('description', description)
      meta('og:title', document.title, true)
      meta('og:description', description, true)
      meta('og:type', 'website', true)
      meta('og:locale', language === 'ka' ? 'ka_GE' : 'en_GB', true)
      meta('robots', publicPage ? 'index, follow' : 'noindex, follow')
    }
    apply(
      t(
        titles[pathname] ??
          (jobPage
            ? 'Job details'
            : pathname.startsWith('/people/')
              ? 'Profile'
              : 'Page not found'),
      ),
      language === 'ka'
        ? 'იპოვე საქმე ან დაამატე განცხადება საქართველოში. დასუფთავება, შეკეთება, გადაზიდვა და სხვა ადგილობრივი საქმეები.'
        : 'Find local work or post a job in Georgia. Browse cleaning, repairs, moving and other opportunities.',
    )
    // Configure a real production URL; never publish localhost as canonical.
    let origin: string | undefined
    try {
      const configured = new URL(import.meta.env.VITE_SITE_URL ?? '')
      if (configured.protocol === 'https:') origin = configured.origin
    } catch {
      // An unset/invalid deployment setting should not crash navigation.
    }
    document.head.querySelector('link[rel="canonical"]')?.remove()
    document.head.querySelector('meta[property="og:url"]')?.remove()
    if (origin && publicPage) {
      const link = document.createElement('link')
      link.rel = 'canonical'
      link.href = new URL(pathname, origin).href
      document.head.appendChild(link)
      meta('og:url', link.href, true)
    }
    if (jobPage) {
      api<{ job: Job }>(`/jobs/${pathname.split('/')[2]}`)
        .then(({ job }) => {
          if (active)
            apply(
              job.title,
              `${job.city} · ${job.price} ${job.currency}. ${job.description}`.slice(0, 160),
            )
        })
        .catch(() => {
          if (active) meta('robots', 'noindex, follow')
        })
    }
    return () => {
      active = false
    }
  }, [pathname, search, language, t])
  return null
}
