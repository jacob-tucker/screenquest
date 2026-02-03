"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatDuration } from "@/lib/utils/format";
import { StopCircle, ExternalLink } from "lucide-react";

interface PipOverlayProps {
  pipWindow: Window | null;
  duration: number;
  instruction?: string;
  targetUrl?: string;
  onStop: () => void;
}

function PipContent({
  duration,
  instruction,
  targetUrl,
  onStop,
}: Omit<PipOverlayProps, "pipWindow">) {
  return (
    <div className="flex h-full w-full flex-col bg-zinc-950 p-2 overflow-hidden">
      <div className="flex items-center justify-center gap-2 py-1 shrink-0">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-xs font-medium text-white">REC</span>
        <span className="font-mono text-xs font-semibold text-white">
          {formatDuration(duration)}
        </span>
      </div>

      {instruction && (
        <p className="my-2 flex-1 min-h-0 overflow-y-auto text-center text-xs leading-relaxed text-zinc-300 px-1">
          {instruction}
        </p>
      )}

      <div className="space-y-1.5 shrink-0">
        {targetUrl && (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            <ExternalLink className="h-3 w-3" />
            Go to Website
          </a>
        )}

        <button
          onClick={onStop}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500"
        >
          <StopCircle className="h-3 w-3" />
          Stop
        </button>
      </div>
    </div>
  );
}

export function PipOverlay({
  pipWindow,
  duration,
  instruction,
  targetUrl,
  onStop,
}: PipOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pipWindow) return;

    // Create container in PiP window
    const container = pipWindow.document.createElement("div");
    container.id = "pip-root";
    container.style.cssText = "width: 100%; height: 100%;";
    pipWindow.document.body.appendChild(container);
    pipWindow.document.body.style.margin = "0";
    pipWindow.document.body.style.padding = "0";
    pipWindow.document.body.style.overflow = "hidden";
    containerRef.current = container;

    return () => {
      container.remove();
      containerRef.current = null;
    };
  }, [pipWindow]);

  if (!pipWindow || !containerRef.current) {
    return null;
  }

  return createPortal(
    <PipContent
      duration={duration}
      instruction={instruction}
      targetUrl={targetUrl}
      onStop={onStop}
    />,
    containerRef.current
  );
}
