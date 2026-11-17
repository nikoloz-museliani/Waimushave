import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PreferencesContext } from './usePreferences'
import type { Language, Theme } from './usePreferences'
import { georgian } from '../i18n/georgian'

// Preferences are browser settings, not account credentials. Storage may be
// blocked in private browsing; the app must still work for that visitor.
function readPreference(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function savePreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* Keep the in-memory choice. */
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Georgian is the default even when the browser's own language is English.
  const [language, setLanguage] = useState<Language>(() =>
    readPreference('waimushave.language') === 'en' ? 'en' : 'ka',
  )
  const [theme, setTheme] = useState<Theme>(() =>
    readPreference('waimushave.theme') === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.lang = language
    savePreference('waimushave.language', language)
  }, [language])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    savePreference('waimushave.theme', theme)
  }, [theme])

  // English keys keep JSX readable. Only interface copy is translated;
  // names and job descriptions remain exactly as their authors wrote them.
  const t = useCallback(
    (english: string) => (language === 'en' ? english : (georgian[english] ?? english)),
    [language],
  )
  return (
    <PreferencesContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        t,
        locale: language === 'ka' ? 'ka-GE' : 'en-GB',
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}
