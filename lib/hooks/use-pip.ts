'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface DocumentPictureInPictureWindow extends Window {
  document: Document
}

interface DocumentPictureInPictureAPI {
  requestWindow(options?: { width?: number; height?: number }): Promise<DocumentPictureInPictureWindow>
  window: DocumentPictureInPictureWindow | null
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPictureAPI
  }
}

export function usePip() {
  const [isSupported, setIsSupported] = useState(false)
  const [pipWindow, setPipWindow] = useState<DocumentPictureInPictureWindow | null>(null)
  const pipRef = useRef<DocumentPictureInPictureWindow | null>(null)

  useEffect(() => {
    setIsSupported('documentPictureInPicture' in window)
  }, [])

  const openPip = useCallback(async (width = 320, height = 180) => {
    if (!window.documentPictureInPicture) {
      throw new Error('Document Picture-in-Picture not supported')
    }

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width,
        height,
      })

      // Copy stylesheets to PiP window
      const styleSheets = document.styleSheets
      for (const sheet of styleSheets) {
        try {
          if (sheet.href) {
            const link = pip.document.createElement('link')
            link.rel = 'stylesheet'
            link.href = sheet.href
            pip.document.head.appendChild(link)
          } else if (sheet.cssRules) {
            const style = pip.document.createElement('style')
            for (const rule of sheet.cssRules) {
              style.appendChild(pip.document.createTextNode(rule.cssText))
            }
            pip.document.head.appendChild(style)
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      }

      pip.addEventListener('pagehide', () => {
        pipRef.current = null
        setPipWindow(null)
      })

      pipRef.current = pip
      setPipWindow(pip)

      return pip
    } catch (err) {
      console.error('Failed to open PiP window:', err)
      throw err
    }
  }, [])

  const closePip = useCallback(() => {
    if (pipRef.current) {
      pipRef.current.close()
      pipRef.current = null
      setPipWindow(null)
    }
  }, [])

  return {
    isSupported,
    pipWindow,
    openPip,
    closePip,
  }
}
