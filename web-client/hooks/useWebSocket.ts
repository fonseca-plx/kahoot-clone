import { useEffect, useRef } from "react";
import { useSocketStore } from "@/store";

export function useWebSocket(url?: string, autoConnect = true) {
  const { socket, isConnected, connect, disconnect } = useSocketStore();
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    // Só conectar uma vez quando a URL mudar
    if (url && autoConnect && !hasConnectedRef.current) {
      connect(url);
      hasConnectedRef.current = true;
    }
  }, [url, autoConnect]);

  return {
    socket,
    isConnected,
    connect: (wsUrl: string) => connect(wsUrl),
    disconnect
  };
}