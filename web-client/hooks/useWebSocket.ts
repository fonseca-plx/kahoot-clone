import { useEffect } from "react";
import { useSocketStore } from "@/store";

export function useWebSocket(url?: string, autoConnect = true) {
  const { socket, isConnected, connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (url && autoConnect && !socket?.connected) {
      connect(url);
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [url, autoConnect]);

  return {
    socket,
    isConnected,
    connect: (wsUrl: string) => connect(wsUrl),
    disconnect
  };
}