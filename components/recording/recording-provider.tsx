'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useRecording } from '@/lib/hooks/use-recording'

interface RecordingContextType {
  isRecording: boolean
  recordedBlob: Blob | null
  error: Error | null
  duration: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetRecording: () => void
}

const RecordingContext = createContext<RecordingContextType | null>(null)

export function RecordingProvider({ children }: { children: ReactNode }) {
  const recording = useRecording()

  return (
    <RecordingContext.Provider value={recording}>
      {children}
    </RecordingContext.Provider>
  )
}

export function useRecordingContext() {
  const context = useContext(RecordingContext)
  if (!context) {
    throw new Error('useRecordingContext must be used within a RecordingProvider')
  }
  return context
}

export { useRecordingContext as useRecording }
