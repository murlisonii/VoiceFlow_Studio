"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Status = "idle" | "recording" | "processing" | "speaking";

interface AgentAvatarProps {
  status: Status;
}

const SpeakingIndicator = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <circle className="animate-pulse-slow" cx="12" cy="12" r="10" fill="hsl(var(--primary))" fillOpacity="0.5" />
        <circle className="animate-pulse-medium" cx="12" cy="12" r="6" fill="hsl(var(--primary))" fillOpacity="0.7" />
        <circle cx="12" cy="12" r="2" fill="hsl(var(--primary))" />
    </svg>
)

const ProcessingIndicator = () => (
  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center items-center gap-1">
    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce-short"></div>
    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce-short animation-delay-150"></div>
    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce-short animation-delay-300"></div>
  </div>
);

export function AgentAvatar({ status }: AgentAvatarProps) {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'speaking') {
      interval = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 200);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="relative h-20 w-20">
      <div className={cn("absolute inset-0 transition-opacity duration-300", status === 'speaking' ? 'opacity-100' : 'opacity-0')}>
          <SpeakingIndicator />
      </div>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle
          cx="50"
          cy="50"
          r="45"
          className={cn(
            "fill-card stroke-border transition-all duration-300",
             status === 'recording' ? 'stroke-[3]' : 'stroke-2'
          )}
        />
        
        {/* Eyes */}
        <g className="transition-transform duration-300 ease-in-out" style={{ transformOrigin: 'center center' }}>
          {/* Idle Eyes */}
          <g className={cn("transition-opacity duration-300", status !== 'recording' ? 'opacity-100' : 'opacity-0')}>
            <circle cx="35" cy="45" r="5" className="fill-foreground" />
            <circle cx="65" cy="45" r="5" className="fill-foreground" />
          </g>
          {/* Recording Eyes */}
           <g className={cn("transition-opacity duration-300", status === 'recording' ? 'opacity-100' : 'opacity-0')}>
            <circle cx="35" cy="45" r="7" className="fill-primary" />
            <circle cx="65" cy="45" r="7" className="fill-primary" />
            <circle cx="35" cy="45" r="3" className="fill-primary-foreground" />
            <circle cx="65" cy="45" r="3" className="fill-primary-foreground" />
          </g>
        </g>
        
        {/* Mouth */}
        <g className="transition-all duration-200">
           {/* Idle Mouth */}
           <path d="M 35 70 Q 50 80, 65 70" strokeWidth="3" className={cn("fill-none stroke-foreground transition-opacity", !mouthOpen ? "opacity-100" : "opacity-0")} />
           
           {/* Speaking Mouth */}
           <ellipse cx="50" cy="75" rx="12" ry={mouthOpen ? 8 : 1} className="fill-foreground transition-all" />
        </g>
      </svg>
      {status === 'processing' && <ProcessingIndicator />}
    </div>
  );
}