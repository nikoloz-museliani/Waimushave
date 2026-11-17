import { createContext, useContext } from 'react'

export type Language = 'ka' | 'en'
export type Theme = 'light' | 'dark'
export interface Preferences {
  language: Language
  theme: Theme
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  t: (english: string) => string
  locale: string
}
export const PreferencesContext = createContext<Preferences | null>(null)

// One hook keeps every screen on the same language and theme.
export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('Wrap the application in PreferencesProvider')
  return value
}
