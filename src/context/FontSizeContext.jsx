import { createContext, useContext, useEffect, useState } from 'react'

const FontSizeContext = createContext(null)

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('bc-font-size') || 'default'
  )

  useEffect(() => {
    const html = document.documentElement
    if (fontSize === 'default') html.removeAttribute('data-font-size')
    else html.setAttribute('data-font-size', fontSize)
    localStorage.setItem('bc-font-size', fontSize)
  }, [fontSize])

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => useContext(FontSizeContext)
