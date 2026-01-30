'use client'

import { useState, useEffect } from 'react'
import { useRecording } from './recording-provider'
import { usePip } from '@/lib/hooks/use-pip'
import { PipOverlay } from './pip-overlay'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils/format'
import { Video, StopCircle, AlertCircle } from 'lucide-react'

interface RecordingControlsProps {
  instruction?: string
}

export function RecordingControls({ instruction }: RecordingControlsProps = {}) {
  const { isRecording, duration, startRecording, stopRecording, error } = useRecording()
  const { isSupported: isPipSupported, pipWindow, openPip, closePip } = usePip()
  const [pipEnabled, setPipEnabled] = useState(true)

  const handleStart = async () => {
    await startRecording()
    if (pipEnabled && isPipSupported) {
      try {
        await openPip(320, 240)
      } catch (e) {
        // PiP failed, but recording continues
      }
    }
  }

  const handleStop = () => {
    stopRecording()
    closePip()
  }

  useEffect(() => {
    // Close PiP when recording stops
    if (!isRecording && pipWindow) {
      closePip()
    }
  }, [isRecording, pipWindow, closePip])

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-400">Recording Error</p>
            <p className="text-xs text-zinc-400">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isRecording) {
    return (
      <>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <div>
                  <p className="text-sm font-medium text-white">Recording in progress</p>
                  <p className="font-mono text-xs text-zinc-400">{formatDuration(duration)}</p>
                </div>
              </div>
              <Button onClick={handleStop} variant="danger" size="sm">
                <StopCircle className="h-4 w-4" />
                Stop Recording
              </Button>
            </div>
          </CardContent>
        </Card>

        {pipWindow && (
          <PipOverlay
            pipWindow={pipWindow}
            duration={duration}
            instruction={instruction}
            onStop={handleStop}
          />
        )}
      </>
    )
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Video className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Screen Recording</p>
              <p className="text-xs text-zinc-400">
                {isPipSupported ? 'PiP overlay available' : 'Record your screen'}
              </p>
            </div>
          </div>
          <Button onClick={handleStart}>
            <Video className="h-4 w-4" />
            Start Recording
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
