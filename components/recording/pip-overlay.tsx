'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { formatDuration } from '@/lib/utils/format'
import { StopCircle } from 'lucide-react'

interface PipOverlayProps {
  pipWindow: Window | null
  duration: number
  instruction?: string
  onStop: () => void
}

function PipContent({ duration, instruction, onStop }: Omit<PipOverlayProps, 'pipWindow'>) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-3">
      <div className="w-full rounded-xl bg-zinc-900 p-4">
        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium text-white">Recording</span>
          <span className="text-zinc-600">•</span>
          <p className="font-mono text-sm font-semibold text-white">
            {formatDuration(duration)}
          </p>
        </div>

        {instruction && (
          <p className="mt-3 max-h-20 overflow-y-auto text-center text-sm leading-relaxed text-zinc-400">
            {instruction}
          </p>
        )}

        <button
          onClick={onStop}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
        >
          <StopCircle className="h-4 w-4" />
          Stop
        </button>
      </div>
    </div>
  )
}

export function PipOverlay({ pipWindow, duration, instruction, onStop }: PipOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!pipWindow) return

    // Create container in PiP window
    const container = pipWindow.document.createElement('div')
    container.id = 'pip-root'
    container.style.cssText = 'width: 100%; height: 100%;'
    pipWindow.document.body.appendChild(container)
    pipWindow.document.body.style.margin = '0'
    pipWindow.document.body.style.padding = '0'
    pipWindow.document.body.style.overflow = 'hidden'
    containerRef.current = container

    return () => {
      container.remove()
      containerRef.current = null
    }
  }, [pipWindow])

  if (!pipWindow || !containerRef.current) {
    return null
  }

  return createPortal(
    <PipContent duration={duration} instruction={instruction} onStop={onStop} />,
    containerRef.current
  )
}
