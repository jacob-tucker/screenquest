'use client'

import { useState, useRef, useCallback } from 'react'

interface UseRecordingOptions {
  onStart?: () => void
  onStop?: (blob: Blob) => void
  onError?: (error: Error) => void
}

export function useRecording(options: UseRecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setRecordedBlob(null)
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      })

      streamRef.current = stream

      // Handle user stopping share via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording()
      })

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        options.onStop?.(blob)

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      recorder.onerror = (event) => {
        const err = new Error('Recording failed')
        setError(err)
        options.onError?.(err)
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000) // Collect data every second

      startTimeRef.current = Date.now()
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      setIsRecording(true)
      options.onStart?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start recording')
      setError(error)
      options.onError?.(error)
    }
  }, [options])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
  }, [])

  const resetRecording = useCallback(() => {
    setRecordedBlob(null)
    setDuration(0)
    setError(null)
    chunksRef.current = []
  }, [])

  return {
    isRecording,
    recordedBlob,
    error,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
