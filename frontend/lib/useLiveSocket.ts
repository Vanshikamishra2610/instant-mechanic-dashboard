// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import type { LiveEvent } from "./types";

// const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/live";

// type ConnectionState = "connecting" | "open" | "closed";

// /**
//  * Subscribes to the backend's /ws/live WebSocket and hands each parsed
//  * event to onEvent. Reconnects with backoff on drop, since ops staff
//  * would otherwise lose live updates silently after a network blip.
//  */
// export function useLiveSocket(onEvent: (event: LiveEvent) => void) {
//   const [state, setState] = useState<ConnectionState>("connecting");
//   const onEventRef = useRef(onEvent);
//   onEventRef.current = onEvent;

//   useEffect(() => {
//     let ws: WebSocket | null = null;
//     let retryDelay = 1000;
//     let cancelled = false;
//     let retryTimer: ReturnType<typeof setTimeout>;

//     function connect() {
//       if (cancelled) return;
//       setState("connecting");
//       ws = new WebSocket(WS_URL);

//       ws.onopen = () => {
//         retryDelay = 1000;
//         setState("open");
//       };

//       ws.onmessage = (event) => {
//         try {
//           const data: LiveEvent = JSON.parse(event.data);
//           onEventRef.current(data);
//         } catch {
//           // ignore malformed frames
//         }
//       };

//       ws.onclose = () => {
//         setState("closed");
//         if (!cancelled) {
//           retryTimer = setTimeout(connect, retryDelay);
//           retryDelay = Math.min(retryDelay * 1.5, 15000);
//         }
//       };

//       ws.onerror = () => {
//         ws?.close();
//       };
//     }

//     connect();

//     return () => {
//       cancelled = true;
//       clearTimeout(retryTimer);
//       ws?.close();
//     };
//   }, []);

//   return state;
// }

"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveEvent } from "./types";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/live";

type ConnectionState = "connecting" | "open" | "closed";

/**
 * Connects to the backend live WebSocket, forwards parsed events
 * to the supplied callback, and automatically reconnects with
 * exponential-style backoff when the connection drops.
 */
export function useLiveSocket(onEvent: (event: LiveEvent) => void) {
  const [state, setState] = useState<ConnectionState>("connecting");

  const onEventRef = useRef(onEvent);

  // Always keep the latest callback without recreating the socket.
  onEventRef.current = onEvent;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;
    let cancelled = false;

    const scheduleReconnect = () => {
      if (cancelled || reconnectTimer !== null) {
        return;
      }

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;

        if (!cancelled) {
          connect();
        }

        retryDelay = Math.min(retryDelay * 1.5, 15000);
      }, retryDelay);
    };

    const connect = () => {
      if (cancelled) {
        return;
      }

      setState("connecting");

      try {
        socket = new WebSocket(WS_URL);
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        setState("closed");
        scheduleReconnect();
        return;
      }

      socket.onopen = () => {
        if (cancelled) {
          socket?.close();
          return;
        }

        console.log("WebSocket connected");

        retryDelay = 1000;
        setState("open");
      };

      socket.onmessage = (event) => {
        try {
          const data: LiveEvent = JSON.parse(event.data);
          onEventRef.current(data);
        } catch (error) {
          console.warn("Received invalid WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.warn("WebSocket error:", error);
        // onclose will handle reconnection.
      };

      socket.onclose = () => {
        socket = null;
        setState("closed");

        if (!cancelled) {
          scheduleReconnect();
        }
      };
    };

    connect();

    return () => {
      cancelled = true;

      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      }

      socket = null;
    };
  }, []);

  return state;
}


