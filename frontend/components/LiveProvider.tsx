"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useLiveSocket } from "@/lib/useLiveSocket";
import type { LiveEvent } from "@/lib/types";

interface LiveContextValue {
  connectionState: "connecting" | "open" | "closed";
  events: LiveEvent[];
  latestEvent: LiveEvent | null;
}

const LiveContext = createContext<LiveContextValue>({
  connectionState: "connecting",
  events: [],
  latestEvent: null,
});

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<LiveEvent | null>(null);

  const handleEvent = useCallback((event: LiveEvent) => {
    setLatestEvent(event);
    setEvents((prev) => [event, ...prev].slice(0, 25));
  }, []);

  const connectionState = useLiveSocket(handleEvent);

  return (
    <LiveContext.Provider value={{ connectionState, events, latestEvent }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  return useContext(LiveContext);
}
